import { createSupabaseClient } from '@/lib/supabase/client';

export class SimpleAuthService {
  private static supabase = createSupabaseClient();

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Auth error:', error);
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