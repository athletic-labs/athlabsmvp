-- Complete test user setup
-- This creates both the auth user and profile in one go

-- Step 1: Create the team first
INSERT INTO teams (id, league_id, name, city, roster_size, protein_target, carbs_target, fats_target, billing_email)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  l.id,
  'Test Team',
  'Test City',
  60,
  30,
  50,
  20,
  'team@test.com'
FROM leagues l 
WHERE l.abbreviation = 'NFL'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Step 2: You must create the user in Supabase Auth UI first with:
-- Email: test@athleticlabs.com
-- Password: TestPass123!

-- Step 3: Then get the user ID and replace UUID_FROM_AUTH_USERS below:
-- SELECT id FROM auth.users WHERE email = 'test@athleticlabs.com';

-- Step 4: Run this with the real UUID:
INSERT INTO profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  team_id,
  onboarding_completed,
  is_active
) VALUES (
  'UUID_FROM_AUTH_USERS'::uuid, -- Replace with actual UUID
  'test@athleticlabs.com',
  'Test',
  'User',
  'team_admin',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  true,
  true
);

-- Step 5: Create permissions
INSERT INTO team_permissions (
  team_id,
  user_id,
  can_create_orders,
  can_view_all_orders,
  can_edit_orders,
  can_delete_orders,
  can_manage_team,
  can_view_analytics
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'UUID_FROM_AUTH_USERS'::uuid, -- Replace with actual UUID
  true,
  true,
  true,
  true,
  true,
  true
);

-- Sample data
INSERT INTO menu_items (name, description, category, price_per_person, price_half_pan, price_full_pan) VALUES
  ('Grilled Chicken Breast', 'Lean protein option', 'Protein', 8.50, 102.00, 204.00),
  ('Brown Rice', 'Healthy carbohydrate', 'Starch', 3.25, 39.00, 78.00),
  ('Steamed Broccoli', 'Fresh vegetables', 'Vegetables', 4.00, 48.00, 96.00)
ON CONFLICT DO NOTHING;