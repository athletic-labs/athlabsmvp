import { createSupabaseClient } from '@/lib/supabase/client';
import { RBACService, UserProfile, UserRole, TeamPermissions } from './rbac';

interface SignInResponse {
  user: UserProfile | null;
  session: any;
  error?: string;
}

interface SessionInfo {
  id: string;
  device_info: Record<string, any>;
  ip_address: string;
  user_agent: string;
  last_activity: string;
  expires_at: string;
}

export class AuthService {
  private static supabase = createSupabaseClient();
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  static async signIn(email: string, password: string): Promise<SignInResponse> {
    try {
      // Check for account lockout
      const lockoutCheck = await this.checkAccountLockout(email);
      if (lockoutCheck.isLocked) {
        return {
          user: null,
          session: null,
          error: `Account locked until ${lockoutCheck.lockedUntil}. Too many failed login attempts.`
        };
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await this.handleFailedLogin(email);
        throw error;
      }

      if (data.user) {
        // Reset failed attempts on successful login
        await this.resetFailedAttempts(data.user.id);
        
        // Update last login
        await this.updateLastLogin(data.user.id);
        
        // Create session record
        if (data.session?.access_token && data.session?.expires_at) {
          await this.createSession(data.user.id, {
            access_token: data.session.access_token,
            expires_at: data.session.expires_at
          });
        }
        
        // Log successful login
        await RBACService.logAuditEvent('login', 'auth', data.user.id);

        // Get user profile with permissions
        const profile = await this.getCurrentUser();
        
        return {
          user: profile,
          session: data.session,
        };
      }

      return { user: null, session: null };
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error: error.message || 'Authentication failed'
      };
    }
  }

  static async signOut(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (user) {
        // Revoke all active sessions
        await this.revokeUserSessions(user.id);
        
        // Log logout
        await RBACService.logAuditEvent('logout', 'auth', user.id);
      }

      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  static async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) return null;

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select(`
          *,
          teams:team_id (
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get user permissions if they have a team
      let permissions: TeamPermissions | undefined;
      if (profile.team_id) {
        permissions = await RBACService.getUserPermissions(user.id, profile.team_id) || undefined;
      }

      return {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: profile.role as UserRole,
        team_id: profile.team_id,
        team_name: profile.teams?.name,
        permissions,
        is_active: profile.is_active,
        last_login_at: profile.last_login_at,
        onboarding_completed: profile.onboarding_completed,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async updateProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'phone'>>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      await RBACService.logAuditEvent('update', 'profile', userId, updates);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      await RBACService.logAuditEvent('update', 'password');
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }

  static async getUserSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('last_activity', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  static async revokeSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .update({ status: 'revoked' })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error revoking session:', error);
      return false;
    }
  }

  private static async checkAccountLockout(email: string): Promise<{
    isLocked: boolean;
    lockedUntil?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('failed_login_attempts, locked_until')
        .eq('email', email)
        .single();

      if (error || !data) return { isLocked: false };

      const now = new Date();
      const lockedUntil = data.locked_until ? new Date(data.locked_until) : null;

      if (lockedUntil && now < lockedUntil) {
        return {
          isLocked: true,
          lockedUntil: lockedUntil.toLocaleString(),
        };
      }

      // Clear expired lockout
      if (lockedUntil && now >= lockedUntil) {
        await this.supabase
          .from('profiles')
          .update({ 
            failed_login_attempts: 0, 
            locked_until: null 
          })
          .eq('email', email);
      }

      return { isLocked: false };
    } catch (error) {
      console.error('Error checking account lockout:', error);
      return { isLocked: false };
    }
  }

  private static async handleFailedLogin(email: string): Promise<void> {
    try {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('failed_login_attempts')
        .eq('email', email)
        .single();

      if (profile) {
        const attempts = (profile.failed_login_attempts || 0) + 1;
        const updates: { failed_login_attempts: number; locked_until?: string } = { failed_login_attempts: attempts };

        if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
          updates.locked_until = new Date(Date.now() + this.LOCKOUT_DURATION).toISOString();
        }

        await this.supabase
          .from('profiles')
          .update(updates)
          .eq('email', email);
      }
    } catch (error) {
      console.error('Error handling failed login:', error);
    }
  }

  private static async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('profiles')
        .update({ 
          failed_login_attempts: 0, 
          locked_until: null 
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  }

  private static async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  private static async createSession(userId: string, session: { access_token: string; expires_at: number }): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: session.access_token,
          device_info: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
          },
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
          expires_at: new Date(session.expires_at * 1000).toISOString(),
        });
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }

  private static async revokeUserSessions(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('user_sessions')
        .update({ status: 'revoked' })
        .eq('user_id', userId)
        .eq('status', 'active');
    } catch (error) {
      console.error('Error revoking sessions:', error);
    }
  }

  private static async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }
}