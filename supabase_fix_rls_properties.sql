-- ============================================
-- Fix RLS Policies for Public Property Access
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. UPDATE STATUS CONSTRAINT (if needed)
-- ============================================
-- First, update any invalid status values to 'online'
UPDATE properties 
SET status = 'online' 
WHERE status NOT IN ('online', 'offline', 'under_offer', 'sold', 'let', 'draft', 'published', 'active');

-- Now update the constraint to include 'active'
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE properties 
  ADD CONSTRAINT properties_status_check 
  CHECK (status IN ('online', 'offline', 'under_offer', 'sold', 'let', 'draft', 'published', 'active'));

-- ============================================
-- 2. FIX RLS POLICIES FOR PUBLIC ACCESS
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Users can view their own properties" ON properties;

-- Create policy for public read access (for API)
-- This allows anyone to read properties with status 'online' or 'active'
CREATE POLICY "Public can view online/active properties"
  ON properties FOR SELECT
  TO anon, authenticated
  USING (
    status = 'online' OR 
    status = 'active'
  );

-- Optional: Allow authenticated users to view all properties
-- (Uncomment if you want authenticated users to see drafts too)
-- CREATE POLICY "Authenticated users can view all properties"
--   ON properties FOR SELECT
--   TO authenticated
--   USING (true);

-- ============================================
-- 3. VERIFY TABLE EXISTS AND HAS DATA
-- ============================================

-- Check if table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'properties'
  ) THEN
    RAISE EXCEPTION 'Properties table does not exist! Run supabase_setup_properties.sql first.';
  END IF;
END $$;

-- Check if there's any data
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count FROM properties;
  IF row_count = 0 THEN
    RAISE NOTICE '⚠️ Properties table is empty. Add some properties to test the API.';
  ELSE
    RAISE NOTICE '✅ Properties table has % rows', row_count;
  END IF;
END $$;

-- ============================================
-- 4. TEST QUERY (for verification)
-- ============================================
-- Run this to verify the query works:

-- SELECT 
--   id, 
--   title, 
--   status, 
--   price, 
--   city, 
--   postcode,
--   property_type
-- FROM properties 
-- WHERE (status = 'online' OR status = 'active')
-- LIMIT 10;

-- ============================================
-- 5. VERIFY RLS IS ENABLED
-- ============================================
-- RLS should be enabled (it was in the original schema)
-- This is just a verification

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'properties' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS enabled on properties table';
  ELSE
    RAISE NOTICE '✅ RLS already enabled on properties table';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'properties';

-- Count properties by status
SELECT 
  status, 
  COUNT(*) as count 
FROM properties 
GROUP BY status 
ORDER BY count DESC;

