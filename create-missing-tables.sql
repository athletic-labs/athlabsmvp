-- Create only the missing tables (skip types that already exist)

-- Enhanced user sessions table for security
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'active',
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team permissions for granular access control
CREATE TABLE IF NOT EXISTS team_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_create_orders BOOLEAN DEFAULT TRUE,
  can_view_all_orders BOOLEAN DEFAULT FALSE,
  can_edit_orders BOOLEAN DEFAULT FALSE,
  can_delete_orders BOOLEAN DEFAULT FALSE,
  can_manage_team BOOLEAN DEFAULT FALSE,
  can_view_analytics BOOLEAN DEFAULT FALSE,
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(team_id, user_id)
);

-- Audit log for tracking all actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Enable RLS on new tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for new tables
CREATE POLICY "session_select_own" ON user_sessions FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "permissions_select_own_team" ON team_permissions FOR SELECT 
  USING (
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "audit_select_own_team" ON audit_logs FOR SELECT 
  USING (
    user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
  );

-- Grant permissions
GRANT ALL ON user_sessions TO authenticated;
GRANT ALL ON team_permissions TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;