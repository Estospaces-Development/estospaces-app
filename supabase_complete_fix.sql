-- Complete fix for Supabase Live Chat
-- This includes BOTH RLS policies AND realtime permissions
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- PART 1: RLS POLICIES (Fixed for Anonymous)
-- ============================================

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Visitors can view conversations" ON conversations;
DROP POLICY IF EXISTS "Visitors can create conversation" ON conversations;
DROP POLICY IF EXISTS "Visitors can view messages" ON messages;
DROP POLICY IF EXISTS "Visitors can send messages" ON messages;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins can send messages" ON messages;

-- FIXED Policies for visitors (anonymous)
-- Allow anonymous users to view all conversations (they'll filter client-side by visitor_id)
CREATE POLICY "Visitors can view conversations" ON conversations
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous users to create conversations
CREATE POLICY "Visitors can create conversation" ON conversations
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to view all messages (they'll filter client-side by conversation_id)
CREATE POLICY "Visitors can view messages" ON messages
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous users to send messages (only as visitor type)
CREATE POLICY "Visitors can send messages" ON messages
  FOR INSERT TO anon
  WITH CHECK (sender_type = 'visitor');

-- Policies for admins (authenticated)
CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Admins can send messages" ON messages
  FOR INSERT TO authenticated 
  WITH CHECK (sender_type = 'admin');

-- ============================================
-- PART 2: REALTIME PERMISSIONS
-- ============================================

-- Grant realtime access to anonymous users
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA realtime TO anon;

-- Grant realtime access to authenticated users
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA realtime TO authenticated;

-- Ensure the messages table is in the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS messages;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS conversations;

-- ============================================
-- PART 3: VERIFICATION
-- ============================================

-- Verify the publication includes our tables
SELECT 
    schemaname, 
    tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Verify RLS policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;
