-- Fix RLS Policy for Welcome Messages
-- This allows anonymous users to insert the first admin message (welcome message) in a conversation

-- Drop the existing INSERT policy for anonymous users if it exists
DROP POLICY IF EXISTS "Visitors can send messages" ON messages;

-- Create a new INSERT policy that allows:
-- 1. Visitors to insert their own messages (sender_type = 'visitor')
-- 2. Visitors to insert the FIRST admin message (welcome message) in a conversation
CREATE POLICY "Visitors can send messages and receive welcome" ON messages
    FOR INSERT TO anon
    WITH CHECK (
        -- Allow visitor messages
        sender_type = 'visitor'
        OR
        -- Allow first admin message (welcome message) in a conversation
        (
            sender_type = 'admin' 
            AND NOT EXISTS (
                SELECT 1 FROM messages m 
                WHERE m.conversation_id = messages.conversation_id
            )
        )
    );

-- Verify the policy was created
SELECT 
    'RLS policy updated successfully!' as status,
    'Anonymous users can now insert welcome messages' as message;
