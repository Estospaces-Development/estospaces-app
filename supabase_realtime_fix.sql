-- Fix for Supabase Realtime not working for anonymous users
-- Run this SQL in your Supabase SQL Editor

-- Grant realtime access to anonymous users
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA realtime TO anon;

-- Ensure the messages table is in the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS messages;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS conversations;

-- Verify the publication includes our tables
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
