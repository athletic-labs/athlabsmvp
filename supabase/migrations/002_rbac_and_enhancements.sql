-- RBAC Enhancement Migration
-- This migration implements comprehensive role-based access control and additional tables

-- Additional custom types
CREATE TYPE notification_type AS ENUM ('order_update', 'system_alert', 'team_announcement', 'payment_reminder');
CREATE TYPE notification_status AS ENUM ('sent', 'delivered', 'read', 'failed');
CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'access_denied');

-- Enhanced user sessions table for security
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  status session_status DEFAULT 'active',
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team permissions for granular access control
CREATE TABLE team_permissions (
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
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  action audit_action NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification system
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status notification_status DEFAULT 'sent',
  read_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order approval workflow
CREATE TABLE order_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_team_permissions_team_user ON team_permissions(team_id, user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_order_approvals_order_id ON order_approvals(order_id);

-- Enable RLS on new tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_approvals ENABLE ROW LEVEL SECURITY;

-- Drop existing basic RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their team" ON teams;
DROP POLICY IF EXISTS "Users can view their team's orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders for their team" ON orders;

-- Comprehensive RLS Policies

-- Profiles policies
CREATE POLICY "profile_select_own" ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profile_select_team_members" ON profiles FOR SELECT 
  USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid()
    ) AND 
    EXISTS (
      SELECT 1 FROM team_permissions tp 
      WHERE tp.user_id = auth.uid() 
      AND tp.team_id = profiles.team_id 
      AND tp.can_view_analytics = TRUE
    )
  );

CREATE POLICY "profile_update_own" ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "profile_update_team_admin" ON profiles FOR UPDATE 
  USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid()
    ) AND 
    EXISTS (
      SELECT 1 FROM team_permissions tp 
      WHERE tp.user_id = auth.uid() 
      AND tp.team_id = profiles.team_id 
      AND tp.can_manage_team = TRUE
    )
  );

-- Teams policies
CREATE POLICY "team_select_member" ON teams FOR SELECT 
  USING (
    id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "team_update_admin" ON teams FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM team_permissions tp 
      JOIN profiles p ON tp.user_id = p.id
      WHERE p.id = auth.uid() 
      AND tp.team_id = teams.id 
      AND tp.can_manage_team = TRUE
    )
  );

-- Orders policies
CREATE POLICY "order_select_team" ON orders FOR SELECT 
  USING (
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "order_insert_authorized" ON orders FOR INSERT 
  WITH CHECK (
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM team_permissions tp 
      WHERE tp.user_id = auth.uid() 
      AND tp.team_id = orders.team_id 
      AND tp.can_create_orders = TRUE
    )
  );

CREATE POLICY "order_update_authorized" ON orders FOR UPDATE 
  USING (
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid()) AND
    (
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM team_permissions tp 
        WHERE tp.user_id = auth.uid() 
        AND tp.team_id = orders.team_id 
        AND tp.can_edit_orders = TRUE
      )
    )
  );

CREATE POLICY "order_delete_authorized" ON orders FOR DELETE 
  USING (
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM team_permissions tp 
      WHERE tp.user_id = auth.uid() 
      AND tp.team_id = orders.team_id 
      AND tp.can_delete_orders = TRUE
    )
  );

-- User sessions policies
CREATE POLICY "session_select_own" ON user_sessions FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "session_update_own" ON user_sessions FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "session_delete_own" ON user_sessions FOR DELETE 
  USING (user_id = auth.uid());

-- Team permissions policies
CREATE POLICY "permissions_select_own_team" ON team_permissions FOR SELECT 
  USING (
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "permissions_manage_admin" ON team_permissions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('team_admin', 'athletic_labs_admin')
      AND p.team_id = team_permissions.team_id
    )
  );

-- Audit logs policies
CREATE POLICY "audit_select_own_team" ON audit_logs FOR SELECT 
  USING (
    user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "audit_insert_system" ON audit_logs FOR INSERT 
  WITH CHECK (TRUE); -- System can always insert audit logs

-- Notifications policies
CREATE POLICY "notification_select_own" ON notifications FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "notification_update_own" ON notifications FOR UPDATE 
  USING (user_id = auth.uid());

-- Order approvals policies
CREATE POLICY "approval_select_team" ON order_approvals FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_approvals.order_id 
      AND o.team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "approval_insert_authorized" ON order_approvals FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o 
      JOIN team_permissions tp ON o.team_id = tp.team_id
      WHERE o.id = order_approvals.order_id 
      AND tp.user_id = auth.uid()
      AND tp.can_edit_orders = TRUE
    )
  );

-- Saved templates policies (enhance existing)
ALTER TABLE saved_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_select_team" ON saved_templates FOR SELECT 
  USING (
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "template_insert_authorized" ON saved_templates FOR INSERT 
  WITH CHECK (
    team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "template_update_creator_or_admin" ON saved_templates FOR UPDATE 
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_permissions tp 
      WHERE tp.user_id = auth.uid() 
      AND tp.team_id = saved_templates.team_id 
      AND tp.can_manage_team = TRUE
    )
  );

-- Functions for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id, old_values, metadata
    ) VALUES (
      auth.uid(), 'delete', TG_TABLE_NAME, OLD.id, row_to_json(OLD), 
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id, old_values, new_values, metadata
    ) VALUES (
      auth.uid(), 'update', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW),
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id, new_values, metadata
    ) VALUES (
      auth.uid(), 'create', TG_TABLE_NAME, NEW.id, row_to_json(NEW),
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_teams AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions 
  SET status = 'expired' 
  WHERE expires_at < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION has_team_permission(
  user_uuid UUID,
  team_uuid UUID,
  permission_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
  user_role user_role;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM profiles WHERE id = user_uuid;
  
  -- Athletic Labs admins have all permissions
  IF user_role = 'athletic_labs_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check team-specific permissions
  CASE permission_name
    WHEN 'can_create_orders' THEN
      SELECT can_create_orders INTO has_permission 
      FROM team_permissions 
      WHERE user_id = user_uuid AND team_id = team_uuid;
    WHEN 'can_view_all_orders' THEN
      SELECT can_view_all_orders INTO has_permission 
      FROM team_permissions 
      WHERE user_id = user_uuid AND team_id = team_uuid;
    WHEN 'can_edit_orders' THEN
      SELECT can_edit_orders INTO has_permission 
      FROM team_permissions 
      WHERE user_id = user_uuid AND team_id = team_uuid;
    WHEN 'can_delete_orders' THEN
      SELECT can_delete_orders INTO has_permission 
      FROM team_permissions 
      WHERE user_id = user_uuid AND team_id = team_uuid;
    WHEN 'can_manage_team' THEN
      SELECT can_manage_team INTO has_permission 
      FROM team_permissions 
      WHERE user_id = user_uuid AND team_id = team_uuid;
    WHEN 'can_view_analytics' THEN
      SELECT can_view_analytics INTO has_permission 
      FROM team_permissions 
      WHERE user_id = user_uuid AND team_id = team_uuid;
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default permissions when user joins team
CREATE OR REPLACE FUNCTION create_default_team_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create permissions if user has a team and doesn't already have permissions
  IF NEW.team_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM team_permissions WHERE user_id = NEW.id AND team_id = NEW.team_id
  ) THEN
    INSERT INTO team_permissions (
      team_id, user_id, can_create_orders, can_view_all_orders, 
      can_edit_orders, can_delete_orders, can_manage_team, can_view_analytics
    ) VALUES (
      NEW.team_id, NEW.id,
      CASE WHEN NEW.role IN ('team_admin', 'athletic_labs_admin') THEN TRUE ELSE TRUE END,
      CASE WHEN NEW.role IN ('team_admin', 'athletic_labs_admin') THEN TRUE ELSE FALSE END,
      CASE WHEN NEW.role IN ('team_admin', 'athletic_labs_admin') THEN TRUE ELSE FALSE END,
      CASE WHEN NEW.role IN ('team_admin', 'athletic_labs_admin') THEN TRUE ELSE FALSE END,
      CASE WHEN NEW.role IN ('team_admin', 'athletic_labs_admin') THEN TRUE ELSE FALSE END,
      CASE WHEN NEW.role IN ('team_admin', 'athletic_labs_admin') THEN TRUE ELSE FALSE END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_team_permissions_trigger
  AFTER INSERT OR UPDATE OF team_id, role ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_team_permissions();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables that don't have them
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_permissions_updated_at BEFORE UPDATE ON team_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing tables with updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add missing columns to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_person_id UUID REFERENCES profiles(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS payment_method_id TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Create view for user permissions (easier querying)
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT 
  p.id as user_id,
  p.email,
  p.role,
  p.team_id,
  t.name as team_name,
  tp.can_create_orders,
  tp.can_view_all_orders,
  tp.can_edit_orders,
  tp.can_delete_orders,
  tp.can_manage_team,
  tp.can_view_analytics,
  tp.granted_at,
  tp.expires_at
FROM profiles p
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN team_permissions tp ON p.id = tp.user_id AND p.team_id = tp.team_id;

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON user_permissions_view TO authenticated;
GRANT ALL ON user_sessions TO authenticated;
GRANT ALL ON team_permissions TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON order_approvals TO authenticated;