-- Performance Optimization Migration
-- Addresses P1 audit finding: Database indexes missing for orders and templates queries

-- Additional indexes for orders table performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_team ON orders(status, team_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_by_team ON orders(created_by, team_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_is_rush_order ON orders(is_rush_order);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_team_status_date ON orders(team_id, status, delivery_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_team_created_at ON orders(team_id, created_at DESC);

-- Additional indexes for saved_templates table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_team_created_at ON saved_templates(team_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_created_by_team ON saved_templates(created_by, team_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_times_used ON saved_templates(times_used DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_is_favorite ON saved_templates(is_favorite, team_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_last_used_at ON saved_templates(last_used_at DESC);

-- Text search optimization for templates
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_name_text ON saved_templates USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_description_text ON saved_templates USING gin(to_tsvector('english', description));

-- Profiles table optimization for authentication queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_lower ON profiles(lower(email));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_team_role ON profiles(team_id, role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_failed_attempts ON profiles(failed_login_attempts) WHERE failed_login_attempts > 0;

-- Teams table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);

-- Additional composite indexes for RLS policy optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_permissions_user_team_permissions ON team_permissions(user_id, team_id, can_view_all_orders, can_edit_orders, can_manage_team);

-- Partial indexes for common filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_pending_team ON orders(team_id, delivery_date) WHERE status = 'pending';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_rush_team ON orders(team_id, delivery_date) WHERE is_rush_order = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_active ON user_sessions(user_id, expires_at) WHERE status = 'active';

-- JSONB indexes for metadata queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_delivery_address_gin ON orders USING gin(delivery_address);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_metadata_gin ON audit_logs USING gin(metadata);

-- Function to analyze query performance
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
  query_text TEXT,
  mean_exec_time NUMERIC,
  calls BIGINT,
  total_exec_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_stat_statements.query,
    pg_stat_statements.mean_exec_time,
    pg_stat_statements.calls,
    pg_stat_statements.total_exec_time
  FROM pg_stat_statements
  WHERE pg_stat_statements.mean_exec_time > 100
  ORDER BY pg_stat_statements.mean_exec_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE (
  schemaname NAME,
  tablename NAME,
  n_tup_ins BIGINT,
  n_tup_upd BIGINT,
  n_tup_del BIGINT,
  n_live_tup BIGINT,
  n_dead_tup BIGINT,
  last_vacuum TIMESTAMP WITH TIME ZONE,
  last_autovacuum TIMESTAMP WITH TIME ZONE,
  last_analyze TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_stat_user_tables.schemaname,
    pg_stat_user_tables.relname,
    pg_stat_user_tables.n_tup_ins,
    pg_stat_user_tables.n_tup_upd,
    pg_stat_user_tables.n_tup_del,
    pg_stat_user_tables.n_live_tup,
    pg_stat_user_tables.n_dead_tup,
    pg_stat_user_tables.last_vacuum,
    pg_stat_user_tables.last_autovacuum,
    pg_stat_user_tables.last_analyze
  FROM pg_stat_user_tables
  ORDER BY pg_stat_user_tables.n_live_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Materialized view for dashboard analytics (for heavy aggregations)
CREATE MATERIALIZED VIEW IF NOT EXISTS team_order_analytics AS
SELECT 
  o.team_id,
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE o.status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE o.status = 'confirmed') as confirmed_orders,
  COUNT(*) FILTER (WHERE o.status = 'delivered') as delivered_orders,
  SUM(o.total_amount) as total_revenue,
  AVG(o.total_amount) as avg_order_value,
  COUNT(*) FILTER (WHERE o.is_rush_order = true) as rush_orders,
  MAX(o.created_at) as last_order_date,
  DATE_TRUNC('month', NOW()) as analytics_month
FROM orders o
GROUP BY o.team_id;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_team_analytics_team_id ON team_order_analytics(team_id);

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_team_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY team_order_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_slow_queries() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_team_analytics() TO authenticated;
GRANT SELECT ON team_order_analytics TO authenticated;

-- Comments for documentation
COMMENT ON INDEX idx_orders_delivery_date IS 'Optimizes delivery date filtering and sorting';
COMMENT ON INDEX idx_orders_team_status_date IS 'Composite index for team dashboard queries';
COMMENT ON INDEX idx_templates_name_text IS 'Full-text search on template names';
COMMENT ON MATERIALIZED VIEW team_order_analytics IS 'Pre-computed analytics for dashboard performance';