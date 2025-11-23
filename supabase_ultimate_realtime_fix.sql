-- ULTIMATE FIX for Supabase Realtime with Anonymous Users
-- This is the most comprehensive fix for realtime permissions
-- Run this ENTIRE script in your Supabase SQL Editor

-- ============================================
-- PART 1: Enable Realtime on Tables
-- ============================================

-- First, make sure realtime is enabled on the tables
-- Safely add tables to publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'conversations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;
END $$;

-- ============================================
-- PART 2: Grant Realtime Permissions
-- ============================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT on the tables (required for realtime)
GRANT SELECT ON public.messages TO anon;
GRANT SELECT ON public.conversations TO anon;
GRANT SELECT ON public.messages TO authenticated;
GRANT SELECT ON public.conversations TO authenticated;

-- Grant INSERT permissions (for sending messages)
GRANT INSERT ON public.messages TO anon;
GRANT INSERT ON public.conversations TO anon;
GRANT INSERT ON public.messages TO authenticated;
GRANT INSERT ON public.conversations TO authenticated;

-- ============================================
-- PART 3: RLS Policies (Re-apply to be safe)
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Visitors can view conversations" ON conversations;
DROP POLICY IF EXISTS "Visitors can create conversation" ON conversations;
DROP POLICY IF EXISTS "Visitors can view messages" ON messages;
DROP POLICY IF EXISTS "Visitors can send messages" ON messages;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can create conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins can send messages" ON messages;

-- Policies for anonymous users (visitors)
CREATE POLICY "Visitors can view conversations" ON conversations
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Visitors can create conversation" ON conversations
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Visitors can view messages" ON messages
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Visitors can send messages" ON messages
  FOR INSERT TO anon
  WITH CHECK (sender_type = 'visitor');

-- Policies for authenticated users (admins)
CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Admins can create conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Admins can send messages" ON messages
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- ============================================
-- PART 4: Verify Everything
-- ============================================

-- Check if tables are in realtime publication
SELECT 
    schemaname, 
    tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'conversations')
ORDER BY tablename;

-- Check table permissions for anon role
SELECT 
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon'
  AND table_name IN ('messages', 'conversations')
ORDER BY table_name, privilege_type;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, policyname;

-- ============================================
-- EXPECTED OUTPUT
-- ============================================
-- After running this script, you should see:
-- 1. Both 'messages' and 'conversations' in the realtime publication
-- 2. 'anon' role has SELECT and INSERT privileges on both tables
-- 3. All 7 RLS policies are created (4 for anon, 3 for authenticated)
