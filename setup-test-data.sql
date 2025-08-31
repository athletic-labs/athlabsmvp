-- Test Data Setup for Athletic Labs
-- Run this in your Supabase SQL Editor

-- Insert test team
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
LIMIT 1;

-- Create test user in auth.users (you'll need to do this manually in Supabase Auth)
-- Email: test@athleticlabs.com
-- Password: TestPass123!

-- Then run this to create the profile:
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
  -- Replace this UUID with the actual UUID from the auth.users table after creating the user
  '00000000-0000-0000-0000-000000000000'::uuid,
  'test@athleticlabs.com',
  'Test',
  'User',
  'team_admin',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  true,
  true
);

-- Create default permissions for the test user
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
  '00000000-0000-0000-0000-000000000000'::uuid,
  true,
  true,
  true,
  true,
  true,
  true
);

-- Add some sample menu items
INSERT INTO menu_items (name, description, category, price_per_person, price_half_pan, price_full_pan) VALUES
  ('Grilled Chicken Breast', 'Lean protein option', 'Protein', 8.50, 102.00, 204.00),
  ('Brown Rice', 'Healthy carbohydrate', 'Starch', 3.25, 39.00, 78.00),
  ('Steamed Broccoli', 'Fresh vegetables', 'Vegetables', 4.00, 48.00, 96.00);

-- Add a sample menu template
INSERT INTO menu_templates (name, description, cuisine_type, bundle_price, serves_count) VALUES
  ('Performance Meal Bundle', 'Complete nutrition for athletes', 'American', 750.00, 60);