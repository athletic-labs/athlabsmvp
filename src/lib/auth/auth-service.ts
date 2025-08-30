import { createSupabaseClient } from '@/lib/supabase/client';

export class AuthService {
  private static supabase = createSupabaseClient();

  static async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*, team:teams(*)')
      .eq('id', data.user.id)
      .single();

    return {
      user: data.user,
      session: data.session,
      profile,
      needsOnboarding: !profile?.onboarding_completed
    };
  }

  static async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  static async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }
}