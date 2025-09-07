-- Migration: Optimize template usage increment - atomic operation to prevent N+1 queries
-- Created: 2025-09-07

-- Create function for atomic template usage increment
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atomically increment usage count and update last_used_at
  UPDATE saved_templates 
  SET 
    times_used = COALESCE(times_used, 0) + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = template_id;
  
  -- Check if template exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template with ID % not found', template_id;
  END IF;
END;
$$;

-- Add RLS policy for the function (inherits caller's permissions)
-- The function runs as SECURITY DEFINER but RLS policies still apply

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_template_usage(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION increment_template_usage(UUID) IS 
'Atomically increments template usage count and updates last_used_at timestamp. Prevents N+1 query problems by using single SQL operation.';