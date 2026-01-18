-- Create broker_requests table for 10-Minute Nearest Broker Response feature
-- This table will store all broker request interactions for audit/history

CREATE TABLE IF NOT EXISTS broker_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Request details
    request_type VARCHAR(50) DEFAULT 'nearest_broker' CHECK (request_type IN ('nearest_broker', 'urgent_help')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'searching', 'assigned', 'accepted', 'expired', 'cancelled')),
    
    -- Location information (for geo-based matching)
    user_latitude DECIMAL(10, 8),
    user_longitude DECIMAL(11, 8),
    user_location_text TEXT, -- Human-readable location (e.g., "London, UK")
    user_postcode VARCHAR(20),
    
    -- Assigned broker information
    assigned_broker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    broker_latitude DECIMAL(10, 8),
    broker_longitude DECIMAL(11, 8),
    broker_distance_km DECIMAL(8, 2), -- Distance in kilometers
    
    -- Timing information
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    
    -- Response tracking
    broker_response_time_seconds INTEGER, -- How long broker took to respond
    estimated_response_time_seconds INTEGER DEFAULT 600, -- 10 minutes default
    
    -- Communication details
    broker_phone VARCHAR(20),
    broker_email VARCHAR(255),
    broker_name VARCHAR(255),
    broker_agency VARCHAR(255),
    
    -- Request metadata
    user_message TEXT,
    broker_message TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT broker_requests_user_id_created_at_idx UNIQUE (user_id, created_at)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_broker_requests_user_id ON broker_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_requests_status ON broker_requests(status);
CREATE INDEX IF NOT EXISTS idx_broker_requests_assigned_broker_id ON broker_requests(assigned_broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_requests_requested_at ON broker_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_broker_requests_expired_at ON broker_requests(expired_at);

-- Create spatial index for geo-based queries (if PostGIS is available)
-- This will be used for finding nearest brokers
CREATE INDEX IF NOT EXISTS idx_broker_requests_user_location ON broker_requests(user_latitude, user_longitude);
CREATE INDEX IF NOT EXISTS idx_broker_requests_broker_location ON broker_requests(broker_latitude, broker_longitude);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_broker_requests_updated_at ON broker_requests;
CREATE TRIGGER update_broker_requests_updated_at
    BEFORE UPDATE ON broker_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set expired_at when status changes to expired
CREATE OR REPLACE FUNCTION set_expired_at_on_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'expired' AND OLD.status != 'expired' THEN
        NEW.expired_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expired_at
DROP TRIGGER IF EXISTS set_expired_at_trigger ON broker_requests;
CREATE TRIGGER set_expired_at_trigger
    BEFORE UPDATE ON broker_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_expired_at_on_expiry();

-- Create view for active broker requests (pending, searching, assigned)
CREATE OR REPLACE VIEW active_broker_requests AS
SELECT * FROM broker_requests 
WHERE status IN ('pending', 'searching', 'assigned') 
AND (expired_at IS NULL OR expired_at > NOW());

-- Create view for broker performance metrics
CREATE OR REPLACE VIEW broker_performance_metrics AS
SELECT 
    assigned_broker_id,
    broker_name,
    broker_agency,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_requests,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_requests,
    AVG(broker_response_time_seconds) as avg_response_time_seconds,
    AVG(broker_distance_km) as avg_distance_km,
    MAX(requested_at) as last_request_date
FROM broker_requests 
WHERE assigned_broker_id IS NOT NULL
GROUP BY assigned_broker_id, broker_name, broker_agency;

-- Grant permissions (adjust based on your RLS policies)
-- These will be managed by Supabase RLS policies

-- Add comment for documentation
COMMENT ON TABLE broker_requests IS 'Stores all broker request interactions for the 10-Minute Nearest Broker Response feature. Used for audit/history and real-time broker matching.';