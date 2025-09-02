import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

let client: ReturnType<typeof createClientComponentClient> | null = null;

export const createSupabaseClient = () => {
  if (!client) {
    client = createClientComponentClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }
  return client;
};

export function useSupabase() {
  const supabase = createSupabaseClient();
  return { supabase };
}