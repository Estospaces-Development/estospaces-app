-- Enhanced Analytics Events Table with Advanced Tracking
-- Run this SQL in your Supabase SQL Editor

-- Add new columns to existing analytics_events table
ALTER TABLE analytics_events 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Create additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics_events(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_browser ON analytics_events(browser);
CREATE INDEX IF NOT EXISTS idx_analytics_referrer ON analytics_events(referrer);

-- Create a materialized view for daily statistics (for faster queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_analytics AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_agent) as unique_users,
    COUNT(DISTINCT page_url) as unique_pages
FROM analytics_events
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);

-- Function to refresh the materialized view (call this periodically)
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_analytics;
END;
$$ LANGUAGE plpgsql;

-- Verification query
SELECT 
    'Enhanced analytics schema updated!' as status,
    COUNT(*) as total_events,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT device_type) as device_types
FROM analytics_events;
