-- Create newsletter_subscribers table for footer email signup
-- Run this in Supabase SQL Editor or via CLI

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'footer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public newsletter signup)
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscribers
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated users to read all subscribers (for admin)
CREATE POLICY "Allow authenticated read" ON newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING (true);

-- Success message
SELECT 'newsletter_subscribers table created successfully!' as status;


