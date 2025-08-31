-- Just create the test data (skip tables and policies that already exist)

-- Create test team
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

-- Create test profile
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
  '461ea673-f261-4c83-912e-e9efc01d735a'::uuid,
  'test@athleticlabs.com',
  'Test',
  'User',
  'team_admin',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- Create permissions (only if team_permissions table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'team_permissions') THEN
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
      '461ea673-f261-4c83-912e-e9efc01d735a'::uuid,
      true,
      true,
      true,
      true,
      true,
      true
    ) ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;
END $$;