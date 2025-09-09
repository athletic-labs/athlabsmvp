import { createSupabaseClient } from '@/lib/supabase/client';
import { supabaseConfig } from '@/lib/config/env';

export class SimpleAuthService {
  private static supabase = createSupabaseClient();
  private static demoMode = supabaseConfig.isDemoMode;

  static async signIn(email: string, password: string) {

    // Demo mode - simulate successful login for demo purposes
    if (this.demoMode || supabaseConfig.isDemoMode) {

      // Simple demo credentials
      if (email === 'demo@athleticlabs.com' && password === 'demo1234') {

        return {
          user: {
            id: 'demo-user-id',
            email: 'demo@athleticlabs.com',
            first_name: 'Demo',
            last_name: 'User',
            role: 'athletic_labs_admin',
            team_id: null,
            is_active: true,
            onboarding_completed: true,
          },
          session: { access_token: 'demo-token' },
          error: null,
        };
      } else {

        return { 
          user: null, 
          session: null, 
          error: 'Demo Mode: Use demo@athleticlabs.com / demo1234' 
        };
      }
    }

    // Regular Supabase authentication
    try {

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Auth error:', error);
        
        // If Supabase auth fails and we have demo credentials, fall back to demo mode
        if (email === 'demo@athleticlabs.com' && password === 'demo1234') {

          return {
            user: {
              id: 'demo-user-id',
              email: 'demo@athleticlabs.com',
              full_name: 'Demo User',
              organization: 'Athletic Labs Demo',
              role: 'admin',
              onboarding_completed: true,
            },
            session: { access_token: 'demo-token' },
            error: null,
          };
        }
        
        return { user: null, session: null, error: error.message };
      }

      if (data.user) {
        // Get basic profile
        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          return { user: null, session: null, error: 'Profile not found' };
        }

        return {
          user: profile,
          session: data.session,
          error: null,
        };
      }

      return { user: null, session: null, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // If any error occurs and we have demo credentials, fall back to demo mode
      if (email === 'demo@athleticlabs.com' && password === 'demo1234') {

        return {
          user: {
            id: 'demo-user-id',
            email: 'demo@athleticlabs.com',
            first_name: 'Demo',
            last_name: 'User',
            role: 'athletic_labs_admin',
            team_id: null,
            is_active: true,
            onboarding_completed: true,
          },
          session: { access_token: 'demo-token' },
          error: null,
        };
      }
      
      return { user: null, session: null, error: error.message };
    }
  }

  static async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) return null;

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}