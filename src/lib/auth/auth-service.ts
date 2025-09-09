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
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  
  // Get fresh supabase client each time to avoid stale connections
  private static getSupabaseClient() {
    return createSupabaseClient();
  }

  static async signIn(email: string, password: string): Promise<SignInResponse> {
    try {

      // Simplified authentication - just do the core auth first
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        // Try to handle failed login asynchronously to avoid blocking
        this.handleFailedLogin(email).catch(e => console.warn('Failed login tracking error:', e));
        throw error;
      }

      if (data.user) {

        // Do background tasks asynchronously to avoid blocking the login
        Promise.all([
          this.resetFailedAttempts(data.user.id).catch(e => console.warn('Reset failed attempts error:', e)),
          this.updateLastLogin(data.user.id).catch(e => console.warn('Update last login error:', e)),
          RBACService.logAuditEvent('login', 'auth', data.user.id).catch(e => console.warn('Audit log error:', e))
        ]);

        // Get user profile with permissions (this is essential)
        const profile = await this.getCurrentUser();

        // If we can't get the user profile, treat it as a failed login
        if (!profile) {
          return {
            user: null,
            session: null,
            error: 'Unable to load user profile'
          };
        }
        
        return {
          user: profile,
          session: data.session,
        };
      }

      return { user: null, session: null };
    } catch (error: any) {
      console.error('🚨 Authentication failed:', error);
      return {
        user: null,
        session: null,
        error: error.message || 'Authentication failed'
      };
    }
  }

  static async signOut(): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Revoke all active sessions
        await this.revokeUserSessions(user.id);
        
        // Log logout
        await RBACService.logAuditEvent('logout', 'auth', user.id);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  static async getSession() {
    const supabase = this.getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  static async getCurrentUser(): Promise<UserProfile | null> {
    try {

      const supabase = this.getSupabaseClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {

        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        throw profileError;
      }

      // Get team name separately to avoid complex joins that might timeout
      let teamName: string | undefined;
      if (profile.team_id) {

        const { data: team } = await supabase
          .from('teams')
          .select('name')
          .eq('id', profile.team_id)
          .single();
        teamName = team?.name;
      }

      // Skip complex permissions for now to avoid timeout issues
      // We can load permissions lazily when needed

      return {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: profile.role as UserRole,
        team_id: profile.team_id,
        team_name: teamName,
        permissions: undefined, // Load lazily when needed
        is_active: profile.is_active,
        last_login_at: profile.last_login_at,
        onboarding_completed: profile.onboarding_completed,
      };
    } catch (error) {
      console.error('🚨 Error fetching user profile:', error);
      return null;
    }
  }

  static async updateProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'phone'>>
  ): Promise<boolean> {
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase
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
      const supabase = this.getSupabaseClient();
      const { error } = await supabase.auth.updateUser({
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
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
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
      const supabase = this.getSupabaseClient();
      const { error } = await supabase
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
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
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
        await supabase
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
      const supabase = this.getSupabaseClient();
      const { data: profile } = await supabase
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

        await supabase
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
      const supabase = this.getSupabaseClient();
      await supabase
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
      const supabase = this.getSupabaseClient();
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  private static async createSession(userId: string, session: { access_token: string; expires_at: number }): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      await supabase
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
      const supabase = this.getSupabaseClient();
      await supabase
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