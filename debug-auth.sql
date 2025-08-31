-- Debug authentication issues

-- 1. Check if the auth user exists and matches the profile
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.role,
  p.team_id,
  p.is_active
FROM auth.users au
FULL OUTER JOIN profiles p ON au.id = p.id
WHERE au.email = 'test@athleticlabs.com' OR p.email = 'test@athleticlabs.com';

-- 2. Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Test direct profile query (this should work if RLS is the issue)
SET role postgres;
SELECT * FROM profiles WHERE email = 'test@athleticlabs.com';
RESET role;

-- 4. Check what user context auth.uid() returns when we're not authenticated
SELECT auth.uid() as current_user_id;