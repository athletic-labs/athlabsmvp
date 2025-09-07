-- OAuth Enhancement Migration
-- Adds OAuth provider support and session management improvements
-- Created: 2025-09-07

-- Add OAuth provider columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_provider TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_provider_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_linked_at TIMESTAMPTZ;

-- Add OAuth provider columns to user_sessions table for better tracking
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS oauth_provider TEXT;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT;

-- Create index for OAuth provider lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_oauth_provider 
ON profiles(oauth_provider, oauth_provider_id) 
WHERE oauth_provider IS NOT NULL;

-- Create index for OAuth session tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_oauth 
ON user_sessions(oauth_provider, status, user_id) 
WHERE oauth_provider IS NOT NULL;

-- Create table for OAuth provider configurations
CREATE TABLE IF NOT EXISTS oauth_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  client_id TEXT,
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  additional_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default OAuth providers
INSERT INTO oauth_providers (provider_name, display_name, is_enabled, scopes) VALUES
('google', 'Google', true, ARRAY['openid', 'email', 'profile']),
('github', 'GitHub', true, ARRAY['user:email']),
('azure', 'Microsoft Azure', false, ARRAY['openid', 'email', 'profile']),
('apple', 'Apple', false, ARRAY['email', 'name'])
ON CONFLICT (provider_name) DO NOTHING;

-- Create table for linked OAuth accounts (for users with multiple OAuth providers)
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_username TEXT,
  provider_email TEXT,
  access_token_hash TEXT,
  refresh_token_hash TEXT,
  token_expires_at TIMESTAMPTZ,
  account_data JSONB,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(provider_name, provider_user_id),
  UNIQUE(user_id, provider_name)
);

-- Create indexes for OAuth accounts
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider ON oauth_accounts(provider_name, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_last_used ON oauth_accounts(last_used_at DESC);

-- Enable RLS on new tables
ALTER TABLE oauth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for oauth_providers (public read, admin write)
CREATE POLICY "oauth_providers_select_all" ON oauth_providers FOR SELECT 
USING (true);

CREATE POLICY "oauth_providers_manage_admin" ON oauth_providers FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'athletic_labs_admin'
  )
);

-- RLS policies for oauth_accounts (users can only see their own)
CREATE POLICY "oauth_accounts_select_own" ON oauth_accounts FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "oauth_accounts_insert_own" ON oauth_accounts FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "oauth_accounts_update_own" ON oauth_accounts FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "oauth_accounts_delete_own" ON oauth_accounts FOR DELETE 
USING (user_id = auth.uid());

-- Function to handle OAuth account creation/update
CREATE OR REPLACE FUNCTION handle_oauth_account_upsert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_used_at when account is accessed
  NEW.last_used_at = NOW();
  
  -- If this is an update, keep the original linked_at timestamp
  IF TG_OP = 'UPDATE' THEN
    NEW.linked_at = OLD.linked_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for OAuth account updates
CREATE TRIGGER oauth_account_upsert_trigger
  BEFORE INSERT OR UPDATE ON oauth_accounts
  FOR EACH ROW EXECUTE FUNCTION handle_oauth_account_upsert();

-- Function to clean up expired OAuth tokens
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_tokens()
RETURNS void AS $$
BEGIN
  -- Mark tokens as expired and clear sensitive data
  UPDATE oauth_accounts 
  SET 
    access_token_hash = NULL,
    refresh_token_hash = NULL,
    account_data = account_data - 'access_token' - 'refresh_token'
  WHERE 
    token_expires_at < NOW() 
    AND (access_token_hash IS NOT NULL OR refresh_token_hash IS NOT NULL);
    
  -- Clean up old unused OAuth accounts (90+ days unused)
  DELETE FROM oauth_accounts 
  WHERE 
    last_used_at < NOW() - INTERVAL '90 days'
    AND access_token_hash IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's OAuth providers
CREATE OR REPLACE FUNCTION get_user_oauth_providers(target_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  provider_name TEXT,
  provider_username TEXT,
  provider_email TEXT,
  linked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oa.provider_name,
    oa.provider_username,
    oa.provider_email,
    oa.linked_at,
    oa.last_used_at
  FROM oauth_accounts oa
  WHERE oa.user_id = COALESCE(target_user_id, auth.uid())
  ORDER BY oa.last_used_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if OAuth provider is available
CREATE OR REPLACE FUNCTION is_oauth_provider_enabled(provider TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM oauth_providers 
    WHERE provider_name = provider AND is_enabled = true
  );
END;
$$ LANGUAGE plpgsql;

-- Enhanced audit function for OAuth events
CREATE OR REPLACE FUNCTION audit_oauth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id, new_values, metadata
    ) VALUES (
      NEW.user_id, 'create', 'oauth_account', NEW.id, row_to_json(NEW),
      jsonb_build_object(
        'provider', NEW.provider_name,
        'table', TG_TABLE_NAME, 
        'operation', TG_OP
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id, old_values, new_values, metadata
    ) VALUES (
      NEW.user_id, 'update', 'oauth_account', NEW.id, row_to_json(OLD), row_to_json(NEW),
      jsonb_build_object(
        'provider', NEW.provider_name,
        'table', TG_TABLE_NAME, 
        'operation', TG_OP
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id, old_values, metadata
    ) VALUES (
      OLD.user_id, 'delete', 'oauth_account', OLD.id, row_to_json(OLD),
      jsonb_build_object(
        'provider', OLD.provider_name,
        'table', TG_TABLE_NAME, 
        'operation', TG_OP
      )
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger for OAuth accounts
CREATE TRIGGER audit_oauth_accounts AFTER INSERT OR UPDATE OR DELETE ON oauth_accounts
  FOR EACH ROW EXECUTE FUNCTION audit_oauth_event();

-- Add updated_at trigger to oauth_providers
CREATE TRIGGER update_oauth_providers_updated_at BEFORE UPDATE ON oauth_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get OAuth provider statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_oauth_provider_stats()
RETURNS TABLE (
  provider_name TEXT,
  display_name TEXT,
  is_enabled BOOLEAN,
  user_count BIGINT,
  active_users_30d BIGINT,
  last_used TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    op.provider_name,
    op.display_name,
    op.is_enabled,
    COUNT(oa.id) as user_count,
    COUNT(CASE WHEN oa.last_used_at > NOW() - INTERVAL '30 days' THEN 1 END) as active_users_30d,
    MAX(oa.last_used_at) as last_used
  FROM oauth_providers op
  LEFT JOIN oauth_accounts oa ON op.provider_name = oa.provider_name
  GROUP BY op.provider_name, op.display_name, op.is_enabled
  ORDER BY user_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for user authentication methods
CREATE OR REPLACE VIEW user_auth_methods AS
SELECT 
  p.id as user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.team_id,
  -- Password auth info
  CASE WHEN p.email IS NOT NULL THEN true ELSE false END as has_password_auth,
  -- OAuth providers
  COALESCE(
    json_agg(
      json_build_object(
        'provider', oa.provider_name,
        'username', oa.provider_username,
        'email', oa.provider_email,
        'linked_at', oa.linked_at,
        'last_used_at', oa.last_used_at
      )
    ) FILTER (WHERE oa.provider_name IS NOT NULL),
    '[]'::json
  ) as oauth_providers,
  -- Auth method counts
  COALESCE(array_length(array_agg(oa.provider_name) FILTER (WHERE oa.provider_name IS NOT NULL), 1), 0) as oauth_provider_count,
  p.last_login_at,
  p.is_active
FROM profiles p
LEFT JOIN oauth_accounts oa ON p.id = oa.user_id
GROUP BY p.id, p.email, p.first_name, p.last_name, p.role, p.team_id, p.last_login_at, p.is_active;

-- Grant permissions
GRANT SELECT ON oauth_providers TO authenticated;
GRANT ALL ON oauth_accounts TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_oauth_providers(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_oauth_provider_enabled(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_oauth_provider_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_oauth_tokens() TO authenticated;
GRANT SELECT ON user_auth_methods TO authenticated;

-- Comments for documentation
COMMENT ON TABLE oauth_providers IS 'OAuth provider configurations and settings';
COMMENT ON TABLE oauth_accounts IS 'Linked OAuth accounts for users';
COMMENT ON FUNCTION get_user_oauth_providers(UUID) IS 'Get OAuth providers linked to a user account';
COMMENT ON FUNCTION is_oauth_provider_enabled(TEXT) IS 'Check if OAuth provider is enabled and available';
COMMENT ON FUNCTION get_oauth_provider_stats() IS 'Get OAuth provider usage statistics for admin dashboard';
COMMENT ON VIEW user_auth_methods IS 'Comprehensive view of user authentication methods including OAuth providers';

-- Schedule for OAuth token cleanup (requires pg_cron extension)
-- This is optional and should be enabled only if pg_cron is available
-- SELECT cron.schedule('oauth-token-cleanup', '0 2 * * *', 'SELECT cleanup_expired_oauth_tokens();');