import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createSupabaseClient = () => {
  return createClientComponentClient();
};

export function useSupabase() {
  const supabase = createSupabaseClient();
  return { supabase };
}