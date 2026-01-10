-- ============================================
-- User Properties API - Schema Updates
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. UPDATE PROPERTIES TABLE STATUS CONSTRAINT
-- ============================================
-- Add 'draft' and 'published' to status enum
-- Note: PostgreSQL doesn't support ALTER TYPE for CHECK constraints easily
-- We'll drop and recreate the constraint

-- Drop existing constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- Add new constraint with draft and published
ALTER TABLE properties 
  ADD CONSTRAINT properties_status_check 
  CHECK (status IN ('online', 'offline', 'under_offer', 'sold', 'let', 'draft', 'published'));

-- ============================================
-- 2. ADD USER_ID COLUMN (if not exists)
-- ============================================
-- For properties created by users (not just agents)
-- This allows users to own properties directly

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
    
    -- Migrate existing agent_id to user_id for consistency
    -- (Optional: only if you want to migrate existing data)
    -- UPDATE properties SET user_id = agent_id WHERE agent_id IS NOT NULL AND user_id IS NULL;
  END IF;
END $$;

-- ============================================
-- 3. UPDATE RLS POLICIES FOR USER PROPERTIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;

-- Policy: Users can view their own properties (via user_id OR agent_id)
CREATE POLICY "Users can view their own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = agent_id
  );

-- Policy: Users can insert properties they own
CREATE POLICY "Users can insert their own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() = agent_id
  );

-- Policy: Users can update their own properties
CREATE POLICY "Users can update their own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = agent_id
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() = agent_id
  );

-- Policy: Users can delete their own properties
CREATE POLICY "Users can delete their own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = agent_id
  );

-- ============================================
-- 4. ADD COMPOSITE INDEX FOR USER PROPERTIES QUERIES
-- ============================================
-- Optimize queries filtering by user_id and status

CREATE INDEX IF NOT EXISTS idx_properties_user_status 
  ON properties(user_id, status) 
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_agent_status 
  ON properties(agent_id, status) 
  WHERE agent_id IS NOT NULL;

-- ============================================
-- 5. FUNCTION TO ENSURE USER_ID IS SET ON INSERT
-- ============================================
-- Auto-set user_id from agent_id if not provided

CREATE OR REPLACE FUNCTION set_property_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is not set but agent_id is, use agent_id
  IF NEW.user_id IS NULL AND NEW.agent_id IS NOT NULL THEN
    NEW.user_id := NEW.agent_id;
  END IF;
  
  -- If agent_id is not set but user_id is, use user_id
  IF NEW.agent_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.agent_id := NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_property_user_id ON properties;
CREATE TRIGGER trigger_set_property_user_id
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_property_user_id();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup:

-- Check if user_id column exists
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'properties' 
-- AND column_name IN ('user_id', 'agent_id', 'status');

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'properties';

-- Test query (replace with actual user ID)
-- SELECT id, title, status, user_id, agent_id 
-- FROM properties 
-- WHERE user_id = auth.uid() OR agent_id = auth.uid();

