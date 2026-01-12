-- ============================================
-- Create property-videos Storage Bucket
-- Run this in Supabase SQL Editor
-- ============================================

-- Note: Storage buckets are created via the Supabase Dashboard, not SQL
-- However, we can set up the policies here

-- First, create the bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: property-videos
-- 4. Make it Public (checked)
-- 5. Click "Create bucket"

-- Then run the policies below:

-- Policy: Allow authenticated users to upload videos
CREATE POLICY IF NOT EXISTS "Allow authenticated video uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-videos' AND
  auth.role() = 'authenticated'
);

-- Policy: Allow public read access to videos
CREATE POLICY IF NOT EXISTS "Allow public video reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-videos');

-- Policy: Allow authenticated users to update their own videos
CREATE POLICY IF NOT EXISTS "Allow authenticated video updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-videos' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'property-videos' AND
  auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete their own videos
CREATE POLICY IF NOT EXISTS "Allow authenticated video deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-videos' AND
  auth.role() = 'authenticated'
);
