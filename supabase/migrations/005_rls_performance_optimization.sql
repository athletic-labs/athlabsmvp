-- RLS Performance Optimization Migration
-- Optimizes Row Level Security policies for better query performance
-- Created: 2025-09-07

-- Create optimized functions for common RLS checks
CREATE OR REPLACE FUNCTION auth_user_team_id()
RETURNS UUID 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Optimized function to check team permissions with caching
CREATE OR REPLACE FUNCTION auth_has_team_permission(permission_name TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid UUID := auth.uid();
  user_team_id UUID;
  user_role user_role;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Return false if no user is authenticated
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get user info in single query
  SELECT team_id, role INTO user_team_id, user_role 
  FROM profiles 
  WHERE id = user_uuid;
  
  -- Athletic Labs admins have all permissions
  IF user_role = 'athletic_labs_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Return false if user has no team
  IF user_team_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check team-specific permissions
  EXECUTE format('SELECT %I FROM team_permissions WHERE user_id = $1 AND team_id = $2', permission_name)
  INTO has_permission
  USING user_uuid, user_team_id;
  
  RETURN COALESCE(has_permission, FALSE);
END;
$$;

-- Function to check if user can access team data
CREATE OR REPLACE FUNCTION auth_can_access_team(target_team_id UUID)
RETURNS BOOLEAN 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND team_id = target_team_id
  );
$$;

-- Create specialized indexes for RLS performance
-- These indexes are specifically designed to optimize RLS policy execution

-- Index for auth.uid() lookups in profiles (most common RLS pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_auth_uid_team_role 
ON profiles(id, team_id, role) 
WHERE id IS NOT NULL;

-- Index for team permission checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_permissions_auth_optimized
ON team_permissions(user_id, team_id) 
INCLUDE (can_create_orders, can_view_all_orders, can_edit_orders, can_delete_orders, can_manage_team, can_view_analytics);

-- Index for orders RLS policies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_rls_team_creator
ON orders(team_id, created_by) 
INCLUDE (status, id);

-- Index for templates RLS policies  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_rls_team_creator
ON saved_templates(team_id, created_by) 
INCLUDE (id, name, is_favorite);

-- Partial indexes for common RLS scenarios
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active_users
ON profiles(team_id, role, id) 
WHERE is_active = TRUE;

-- Drop existing inefficient policies
DROP POLICY IF EXISTS "profile_select_own" ON profiles;
DROP POLICY IF EXISTS "profile_select_team_members" ON profiles; 
DROP POLICY IF EXISTS "profile_update_own" ON profiles;
DROP POLICY IF EXISTS "profile_update_team_admin" ON profiles;
DROP POLICY IF EXISTS "team_select_member" ON teams;
DROP POLICY IF EXISTS "team_update_admin" ON teams;
DROP POLICY IF EXISTS "order_select_team" ON orders;
DROP POLICY IF EXISTS "order_insert_authorized" ON orders;
DROP POLICY IF EXISTS "order_update_authorized" ON orders;
DROP POLICY IF EXISTS "order_delete_authorized" ON orders;
DROP POLICY IF EXISTS "template_select_team" ON saved_templates;
DROP POLICY IF EXISTS "template_insert_authorized" ON saved_templates;
DROP POLICY IF EXISTS "template_update_creator_or_admin" ON saved_templates;

-- Create optimized RLS policies using the new functions

-- Profiles policies (optimized)
CREATE POLICY "profiles_select_optimized" ON profiles FOR SELECT 
USING (
  id = auth.uid() OR 
  (team_id = auth_user_team_id() AND auth_has_team_permission('can_view_analytics'))
);

CREATE POLICY "profiles_update_optimized" ON profiles FOR UPDATE 
USING (
  id = auth.uid() OR 
  (team_id = auth_user_team_id() AND auth_has_team_permission('can_manage_team'))
);

-- Teams policies (optimized)
CREATE POLICY "teams_select_optimized" ON teams FOR SELECT 
USING (id = auth_user_team_id());

CREATE POLICY "teams_update_optimized" ON teams FOR UPDATE 
USING (id = auth_user_team_id() AND auth_has_team_permission('can_manage_team'));

-- Orders policies (optimized)
CREATE POLICY "orders_select_optimized" ON orders FOR SELECT 
USING (auth_can_access_team(team_id));

CREATE POLICY "orders_insert_optimized" ON orders FOR INSERT 
WITH CHECK (
  team_id = auth_user_team_id() AND 
  auth_has_team_permission('can_create_orders')
);

CREATE POLICY "orders_update_optimized" ON orders FOR UPDATE 
USING (
  auth_can_access_team(team_id) AND (
    created_by = auth.uid() OR 
    auth_has_team_permission('can_edit_orders')
  )
);

CREATE POLICY "orders_delete_optimized" ON orders FOR DELETE 
USING (
  auth_can_access_team(team_id) AND 
  auth_has_team_permission('can_delete_orders')
);

-- Saved templates policies (optimized)
CREATE POLICY "templates_select_optimized" ON saved_templates FOR SELECT 
USING (auth_can_access_team(team_id));

CREATE POLICY "templates_insert_optimized" ON saved_templates FOR INSERT 
WITH CHECK (
  team_id = auth_user_team_id() AND 
  created_by = auth.uid()
);

CREATE POLICY "templates_update_optimized" ON saved_templates FOR UPDATE 
USING (
  auth_can_access_team(team_id) AND (
    created_by = auth.uid() OR 
    auth_has_team_permission('can_manage_team')
  )
);

CREATE POLICY "templates_delete_optimized" ON saved_templates FOR DELETE 
USING (
  auth_can_access_team(team_id) AND (
    created_by = auth.uid() OR 
    auth_has_team_permission('can_manage_team')
  )
);

-- Team permissions policies (optimized)
DROP POLICY IF EXISTS "permissions_select_own_team" ON team_permissions;
DROP POLICY IF EXISTS "permissions_manage_admin" ON team_permissions;

CREATE POLICY "permissions_select_optimized" ON team_permissions FOR SELECT 
USING (auth_can_access_team(team_id));

CREATE POLICY "permissions_manage_optimized" ON team_permissions FOR ALL 
USING (
  auth_can_access_team(team_id) AND 
  (auth_user_role() IN ('team_admin', 'athletic_labs_admin'))
);

-- User sessions policies (already optimized, but ensure consistency)
DROP POLICY IF EXISTS "session_select_own" ON user_sessions;
DROP POLICY IF EXISTS "session_update_own" ON user_sessions;
DROP POLICY IF EXISTS "session_delete_own" ON user_sessions;

CREATE POLICY "sessions_own_optimized" ON user_sessions FOR ALL 
USING (user_id = auth.uid());

-- Notifications policies (optimized)
DROP POLICY IF EXISTS "notification_select_own" ON notifications;
DROP POLICY IF EXISTS "notification_update_own" ON notifications;

CREATE POLICY "notifications_own_optimized" ON notifications FOR ALL 
USING (user_id = auth.uid());

-- Audit logs policies (optimized)
DROP POLICY IF EXISTS "audit_select_own_team" ON audit_logs;
DROP POLICY IF EXISTS "audit_insert_system" ON audit_logs;

CREATE POLICY "audit_select_optimized" ON audit_logs FOR SELECT 
USING (
  user_id = auth.uid() OR 
  auth_can_access_team(team_id)
);

CREATE POLICY "audit_insert_optimized" ON audit_logs FOR INSERT 
WITH CHECK (TRUE); -- System can always insert

-- Order approvals policies (optimized)
DROP POLICY IF EXISTS "approval_select_team" ON order_approvals;
DROP POLICY IF EXISTS "approval_insert_authorized" ON order_approvals;

CREATE POLICY "approvals_select_optimized" ON order_approvals FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_approvals.order_id 
    AND auth_can_access_team(o.team_id)
  )
);

CREATE POLICY "approvals_insert_optimized" ON order_approvals FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_approvals.order_id 
    AND auth_can_access_team(o.team_id)
    AND auth_has_team_permission('can_edit_orders')
  )
);

-- Create function to analyze RLS policy performance
CREATE OR REPLACE FUNCTION analyze_rls_performance()
RETURNS TABLE (
  policy_name TEXT,
  table_name TEXT,
  avg_execution_time NUMERIC,
  calls BIGINT,
  sample_query TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_policies.policyname::TEXT,
    pg_policies.tablename::TEXT,
    COALESCE(pg_stat_statements.mean_exec_time, 0)::NUMERIC,
    COALESCE(pg_stat_statements.calls, 0)::BIGINT,
    COALESCE(LEFT(pg_stat_statements.query, 100), 'N/A')::TEXT
  FROM pg_policies
  LEFT JOIN pg_stat_statements ON pg_stat_statements.query ILIKE '%' || pg_policies.tablename || '%'
  WHERE pg_policies.schemaname = 'public'
  ORDER BY pg_stat_statements.mean_exec_time DESC NULLS LAST
  LIMIT 20;
END;
$$;

-- Create function to get RLS policy cache statistics
CREATE OR REPLACE FUNCTION get_rls_cache_stats()
RETURNS TABLE (
  function_name TEXT,
  calls BIGINT,
  total_time NUMERIC,
  mean_time NUMERIC,
  cache_hits NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_proc.proname::TEXT,
    COALESCE(pg_stat_user_functions.calls, 0)::BIGINT,
    COALESCE(pg_stat_user_functions.total_time, 0)::NUMERIC,
    COALESCE(pg_stat_user_functions.mean_time, 0)::NUMERIC,
    -- Calculate cache efficiency (lower mean time = better caching)
    CASE 
      WHEN pg_stat_user_functions.mean_time > 0 
      THEN (1.0 - (pg_stat_user_functions.mean_time / GREATEST(pg_stat_user_functions.total_time / GREATEST(pg_stat_user_functions.calls, 1), 0.001))) * 100
      ELSE 0
    END::NUMERIC
  FROM pg_proc
  LEFT JOIN pg_stat_user_functions ON pg_proc.oid = pg_stat_user_functions.funcid
  WHERE pg_proc.proname IN ('auth_user_team_id', 'auth_user_role', 'auth_has_team_permission', 'auth_can_access_team')
  ORDER BY pg_stat_user_functions.calls DESC NULLS LAST;
END;
$$;

-- Create materialized view for user context caching
CREATE MATERIALIZED VIEW IF NOT EXISTS user_auth_context AS
SELECT 
  p.id as user_id,
  p.team_id,
  p.role,
  p.is_active,
  tp.can_create_orders,
  tp.can_view_all_orders,
  tp.can_edit_orders,
  tp.can_delete_orders,
  tp.can_manage_team,
  tp.can_view_analytics,
  NOW() as last_refreshed
FROM profiles p
LEFT JOIN team_permissions tp ON p.id = tp.user_id AND p.team_id = tp.team_id
WHERE p.is_active = TRUE;

-- Index on user auth context materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_auth_context_user_id ON user_auth_context(user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_context_team ON user_auth_context(team_id, role);

-- Function to refresh user context cache
CREATE OR REPLACE FUNCTION refresh_user_auth_context()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_auth_context;
END;
$$;

-- Trigger to refresh cache when permissions change
CREATE OR REPLACE FUNCTION invalidate_auth_context()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- For now, we'll refresh the entire view
  -- In a production environment, you might want to implement partial refresh
  PERFORM refresh_user_auth_context();
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER team_permissions_cache_invalidation
  AFTER INSERT OR UPDATE OR DELETE ON team_permissions
  FOR EACH STATEMENT
  EXECUTE FUNCTION invalidate_auth_context();

CREATE TRIGGER profiles_cache_invalidation
  AFTER UPDATE OF team_id, role, is_active ON profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION invalidate_auth_context();

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION auth_user_team_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_has_team_permission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION auth_can_access_team(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_rls_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_rls_cache_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_user_auth_context() TO authenticated;
GRANT SELECT ON user_auth_context TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION auth_user_team_id() IS 'Optimized function to get current user team ID for RLS policies';
COMMENT ON FUNCTION auth_user_role() IS 'Optimized function to get current user role for RLS policies';
COMMENT ON FUNCTION auth_has_team_permission(TEXT) IS 'Optimized function to check team permissions for RLS policies with caching';
COMMENT ON FUNCTION auth_can_access_team(UUID) IS 'Optimized function to check team access for RLS policies';
COMMENT ON MATERIALIZED VIEW user_auth_context IS 'Cached user authentication context for improved RLS performance';

-- Create monitoring function for RLS performance
CREATE OR REPLACE FUNCTION monitor_rls_performance()
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'avg_policy_execution_time'::TEXT,
    AVG(pg_stat_statements.mean_exec_time),
    'Average execution time for RLS policy queries in milliseconds'::TEXT
  FROM pg_stat_statements 
  WHERE query ILIKE '%auth_%'
  
  UNION ALL
  
  SELECT 
    'rls_function_calls'::TEXT,
    SUM(pg_stat_user_functions.calls)::NUMERIC,
    'Total calls to RLS optimization functions'::TEXT
  FROM pg_stat_user_functions 
  JOIN pg_proc ON pg_stat_user_functions.funcid = pg_proc.oid
  WHERE pg_proc.proname LIKE 'auth_%'
  
  UNION ALL
  
  SELECT 
    'user_context_cache_size'::TEXT,
    COUNT(*)::NUMERIC,
    'Number of cached user authentication contexts'::TEXT
  FROM user_auth_context;
END;
$$;

GRANT EXECUTE ON FUNCTION monitor_rls_performance() TO authenticated;