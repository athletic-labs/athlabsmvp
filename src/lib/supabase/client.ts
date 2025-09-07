import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabaseConfig } from '@/lib/config/env';

export const createSupabaseClient = () => {
  // Don't use singleton - create fresh client each time to avoid stale connections
  // This helps with the "failed to fetch" issue after logout/login cycles
  return createClientComponentClient({
    supabaseUrl: supabaseConfig.url,
    supabaseKey: supabaseConfig.anonKey,
  });
};

export function useSupabase() {
  const supabase = createSupabaseClient();
  return { supabase };
}