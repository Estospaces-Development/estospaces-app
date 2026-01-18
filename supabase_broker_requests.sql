-- Create a table for broker requests
CREATE TABLE IF NOT EXISTS broker_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'active', 'completed', 'expired', 'cancelled')),
    user_latitude FLOAT,
    user_longitude FLOAT,
    user_address TEXT,
    broker_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE broker_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own requests" ON broker_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON broker_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Brokers (managers) can view pending requests" ON broker_requests
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
    );

CREATE POLICY "Brokers can update requests (accept)" ON broker_requests
    FOR UPDATE USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'admin')
    );

-- Add location columns to profiles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'latitude') THEN
        ALTER TABLE profiles ADD COLUMN latitude FLOAT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'longitude') THEN
        ALTER TABLE profiles ADD COLUMN longitude FLOAT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_online') THEN
        ALTER TABLE profiles ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Index for location search (simple lat/long index would be good, PostGIS is better but let's stick to simple first)
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_broker_requests_status ON broker_requests(status);
