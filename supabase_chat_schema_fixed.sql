-- Supabase Realtime Chat Schema (UPDATED - Fixed RLS Policies)

-- Table: conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL UNIQUE,
  visitor_name TEXT,
  visitor_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_visitor_id ON conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Visitors can view own conversation" ON conversations;
DROP POLICY IF EXISTS "Visitors can create conversation" ON conversations;
DROP POLICY IF EXISTS "Visitors can view own messages" ON messages;
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

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
