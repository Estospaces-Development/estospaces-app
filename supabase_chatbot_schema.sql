-- Dynamic AI Chatbot Schema
-- Run this SQL in your Supabase SQL Editor

-- Add bot_mode column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS bot_mode TEXT DEFAULT 'bot' CHECK (bot_mode IN ('bot', 'human', 'escalated'));

-- Add is_bot column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;

-- Create chatbot_responses table for predefined Q&A
CREATE TABLE IF NOT EXISTS chatbot_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keywords TEXT[] NOT NULL,
    response TEXT NOT NULL,
    category TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create conversation_escalations table to track escalations
CREATE TABLE IF NOT EXISTS conversation_escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    escalated_at TIMESTAMP DEFAULT NOW(),
    reason TEXT,
    escalated_by TEXT DEFAULT 'user'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_bot_mode ON conversations(bot_mode);
CREATE INDEX IF NOT EXISTS idx_messages_is_bot ON messages(is_bot);
CREATE INDEX IF NOT EXISTS idx_escalations_conversation ON conversation_escalations(conversation_id);

-- Enable RLS on new tables
ALTER TABLE chatbot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_escalations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chatbot_responses
CREATE POLICY "Anyone can read chatbot responses" ON chatbot_responses
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Only admins can manage chatbot responses" ON chatbot_responses
    FOR ALL TO authenticated
    USING (true);

-- RLS Policies for conversation_escalations
CREATE POLICY "Users can create escalations" ON conversation_escalations
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Admins can view all escalations" ON conversation_escalations
    FOR SELECT TO authenticated
    USING (true);

-- Insert default chatbot responses
INSERT INTO chatbot_responses (keywords, response, category, priority) VALUES
    (ARRAY['hello', 'hi', 'hey', 'greetings'], 
     '👋 Hello! I''m the Estospaces AI assistant. How can I help you today?', 
     'greeting', 10),
    
    (ARRAY['price', 'pricing', 'cost', 'how much', 'fee'],
     'Our pricing is transparent and competitive! We offer:\n• No hidden fees\n• Commission-based model for brokers\n• Free property browsing for buyers/renters\n\nWould you like to speak with our team for detailed pricing?',
     'pricing', 8),
    
    (ARRAY['feature', 'features', 'what can', 'capabilities'],
     'Estospaces offers:\n✨ 3D Virtual Property Tours\n🔍 Verified Listings\n🤖 AI-Powered Search\n💬 Live Chat Support\n📱 Mobile-Friendly Platform\n\nWhat would you like to know more about?',
     'features', 8),
    
    (ARRAY['contact', 'email', 'phone', 'reach'],
     '📧 Email: contact@estospaces.com\n\nYou can also click "Talk to Human" to chat with our team right now!',
     'contact', 7),
    
    (ARRAY['property', 'search', 'find', 'looking for'],
     'Looking for a property? Great! 🏠\n\nOur platform offers:\n• Advanced search filters\n• 3D virtual tours\n• Verified listings\n• Direct broker contact\n\nWould you like me to connect you with our team to help with your search?',
     'property_search', 9),
    
    (ARRAY['account', 'signup', 'register', 'create account'],
     'Creating an account is easy!\n\n1. Click "Sign Up" in the top right\n2. Enter your details\n3. Verify your email\n4. Start browsing!\n\nNeed help with the process?',
     'account', 6),
    
    (ARRAY['broker', 'agent', 'list property'],
     'Are you a broker looking to list properties? 🏢\n\nWe offer:\n• Free listing tools\n• 3D tour creation\n• Lead management\n• Analytics dashboard\n\nLet me connect you with our broker onboarding team!',
     'broker', 8),
    
    (ARRAY['help', 'support', 'issue', 'problem'],
     'I''m here to help! 💪\n\nFor immediate assistance, click "Talk to Human" to chat with our support team.\n\nWhat issue are you experiencing?',
     'support', 10);

-- Verification query
SELECT 
    'Chatbot schema created successfully!' as status,
    COUNT(*) as total_responses
FROM chatbot_responses;
