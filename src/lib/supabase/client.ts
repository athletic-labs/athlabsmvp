import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabaseConfig } from '@/lib/config/env';

let client: ReturnType<typeof createClientComponentClient> | null = null;

export const createSupabaseClient = () => {
  if (!client) {
    client = createClientComponentClient({
      supabaseUrl: supabaseConfig.url,
      supabaseKey: supabaseConfig.anonKey,
    });
  }
  return client;
};

export function useSupabase() {
  const supabase = createSupabaseClient();
  return { supabase };
}