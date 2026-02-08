-- Add stage and timeline columns to properties table for Seller Tracking
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'stage') THEN
        ALTER TABLE properties ADD COLUMN stage TEXT DEFAULT 'Draft';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'timeline') THEN
        ALTER TABLE properties ADD COLUMN timeline JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Create an index to quickly find user's listings
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);

-- Initialize defaults for existing properties
UPDATE properties 
SET stage = 'Published',
    timeline = json_build_array(
        json_build_object(
            'stage', 'Published',
            'timestamp', created_at,
            'description', 'Property published to marketplace'
        )
    )
WHERE (timeline IS NULL OR jsonb_array_length(timeline) = 0) AND status = 'online';
