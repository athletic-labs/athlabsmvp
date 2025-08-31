-- First, check what users exist in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'test@athleticlabs.com';

-- Copy the ID from the result above, then run this with the real ID:
-- 
-- INSERT INTO profiles (
--   id,
--   email,
--   first_name,
--   last_name,
--   role,
--   team_id,
--   onboarding_completed,
--   is_active
-- ) VALUES (
--   'PASTE_REAL_UUID_HERE'::uuid,
--   'test@athleticlabs.com',
--   'Test',
--   'User',
--   'team_admin',
--   '550e8400-e29b-41d4-a716-446655440001'::uuid,
--   true,
--   true
-- );