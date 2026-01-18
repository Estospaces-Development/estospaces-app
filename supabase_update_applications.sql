-- Add stage and timeline columns to applied_properties
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applied_properties' AND column_name = 'stage') THEN
        ALTER TABLE applied_properties ADD COLUMN stage TEXT DEFAULT 'Application Submitted';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applied_properties' AND column_name = 'timeline') THEN
        ALTER TABLE applied_properties ADD COLUMN timeline JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Create an index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_applied_properties_user_id ON applied_properties(user_id);

-- Update existing records to have a default timeline if empty
UPDATE applied_properties 
SET timeline = json_build_array(
    json_build_object(
        'stage', 'Application Submitted',
        'timestamp', created_at,
        'description', 'Application originally submitted'
    )
)
WHERE timeline IS NULL OR jsonb_array_length(timeline) = 0;
