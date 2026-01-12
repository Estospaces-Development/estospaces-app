-- ============================================
-- Add video_urls column to properties table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add the column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN properties.video_urls IS 'Array of video URLs for the property, stored as JSONB';

-- Create an index for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_properties_video_urls ON properties USING GIN (video_urls);
