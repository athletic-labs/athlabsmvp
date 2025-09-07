import { createSupabaseClient } from '@/lib/supabase/client';
import { supabaseConfig } from '@/lib/config/env';

export class SimpleAuthService {
  private static supabase = createSupabaseClient();
  private static demoMode = supabaseConfig.isDemoMode;

  static async signIn(email: string, password: string) {
    console.log('🔍 Auth Debug:', {
      demoMode: this.demoMode,
      email,
      supabaseUrl: supabaseConfig.url,
      supabaseKey: supabaseConfig.anonKey?.substring(0, 10) + '...',
      isDemoMode: supabaseConfig.isDemoMode
    });

    // Demo mode - simulate successful login for demo purposes
    if (this.demoMode || supabaseConfig.isDemoMode) {
      console.log('🎭 Demo Mode: Simulating authentication...');
      console.log('📧 Checking credentials:', { email, password: password.length + ' chars' });
      
      // Simple demo credentials
      if (email === 'demo@athleticlabs.com' && password === 'demo1234') {
        console.log('✅ Demo credentials match - logging in');
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
      } else {
        console.log('❌ Demo credentials do not match');
        return { 
          user: null, 
          session: null, 
          error: 'Demo Mode: Use demo@athleticlabs.com / demo1234' 
        };
      }
    }

    // Regular Supabase authentication
    try {
      console.log('🔗 Attempting Supabase authentication...');
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Auth error:', error);
        
        // If Supabase auth fails and we have demo credentials, fall back to demo mode
        if (email === 'demo@athleticlabs.com' && password === 'demo1234') {
          console.log('🎭 Supabase failed, falling back to demo mode');
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
        console.log('🎭 Error occurred, falling back to demo mode');
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