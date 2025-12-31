-- Analytics Events Table for Cookie Tracking
-- Run this SQL in your Supabase SQL Editor

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    user_agent TEXT,
    language TEXT,
    screen_resolution TEXT,
    referrer TEXT,
    timezone TEXT,
    platform TEXT,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_url ON analytics_events(page_url);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics" ON analytics_events;

-- Allow anonymous users to insert analytics data
CREATE POLICY "Allow anonymous inserts" ON analytics_events
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users (admins) to view all analytics
CREATE POLICY "Admins can view all analytics" ON analytics_events
    FOR SELECT TO authenticated
    USING (true);

-- Grant permissions
GRANT INSERT ON analytics_events TO anon;
GRANT SELECT ON analytics_events TO authenticated;

-- Verification query
SELECT 
    'Analytics table created successfully!' as status,
    COUNT(*) as total_events
FROM analytics_events;
