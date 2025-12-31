-- Admin Chat Features Migration Script
-- Run this script in your Supabase SQL Editor

-- 1. Update conversations table status check constraint
-- We need to drop the existing constraint first, then add the new one
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_status_check;
ALTER TABLE conversations ADD CONSTRAINT conversations_status_check 
  CHECK (status IN ('active', 'closed', 'archived'));

-- 2. Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_conversation_id ON tickets(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- 4. Enable RLS on tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for tickets

-- Admins have full access to tickets
CREATE POLICY "Admins can view all tickets" ON tickets
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can create tickets" ON tickets
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update tickets" ON tickets
  FOR UPDATE TO authenticated
  USING (true);

-- Visitors should NOT access tickets (internal use only)
-- No policies for 'anon' role means they have no access by default.

-- 6. Enable Realtime for tickets table
-- Safely add table to publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tickets') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
  END IF;
END $$;

-- 7. Verify changes
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets';
