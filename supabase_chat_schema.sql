-- Supabase Realtime Chat Schema

-- Table: conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL UNIQUE,
  visitor_name TEXT,
  visitor_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_visitor_id ON conversations(visitor_id);
CREATE INDEX idx_conversations_status ON conversations(status);

-- Table: messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for visitors (anonymous)
CREATE POLICY "Visitors can view own conversation" ON conversations
  FOR SELECT TO anon
  USING (visitor_id = current_setting('request.jwt.claims', true)::json->>'visitor_id');

CREATE POLICY "Visitors can create conversation" ON conversations
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Visitors can view own messages" ON messages
  FOR SELECT TO anon
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE visitor_id = current_setting('request.jwt.claims', true)::json->>'visitor_id'
    )
  );

CREATE POLICY "Visitors can send messages" ON messages
  FOR INSERT TO anon
  WITH CHECK (sender_type = 'visitor');

-- Policies for admins (authenticated)
CREATE POLICY "Admins can view all conversations" ON conversations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can send messages" ON messages
  FOR INSERT TO authenticated WITH CHECK (sender_type = 'admin');
