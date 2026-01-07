-- ============================================
-- UK Property Platform - Complete Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('rent', 'sale')),
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'under_offer', 'sold', 'let')),
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  image_urls JSONB DEFAULT '[]'::jsonb,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  country TEXT DEFAULT 'UK',
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  -- Agent/Contact Information
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_name TEXT,
  agent_email TEXT,
  agent_phone TEXT,
  agent_company TEXT,
  -- Additional Property Details
  property_size_sqft INTEGER,
  property_size_sqm INTEGER,
  year_built INTEGER,
  property_features JSONB DEFAULT '[]'::jsonb, -- e.g., ["garden", "parking", "balcony"]
  -- Viewing Information
  viewing_available BOOLEAN DEFAULT true,
  viewing_instructions TEXT,
  -- Legal/Financial
  deposit_amount NUMERIC(12, 2), -- For rent properties
  council_tax_band TEXT, -- UK specific
  energy_rating TEXT, -- EPC rating
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT false -- For admin verification
);

-- ============================================
-- SAVED PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ============================================
-- APPLIED PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS applied_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'withdrawn')),
  application_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ============================================
-- VIEWED PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS viewed_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 1,
  UNIQUE(user_id, property_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_country ON properties(country);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_postcode ON properties(postcode);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_country_status ON properties(country, status);
CREATE INDEX IF NOT EXISTS idx_properties_type_price ON properties(property_type, price);
CREATE INDEX IF NOT EXISTS idx_properties_city_type ON properties(city, property_type);

-- Saved properties indexes
CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_property ON saved_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_created_at ON saved_properties(created_at DESC);

-- Applied properties indexes
CREATE INDEX IF NOT EXISTS idx_applied_properties_user ON applied_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_applied_properties_property ON applied_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_applied_properties_status ON applied_properties(status);
CREATE INDEX IF NOT EXISTS idx_applied_properties_created_at ON applied_properties(created_at DESC);

-- Viewed properties indexes
CREATE INDEX IF NOT EXISTS idx_viewed_properties_user ON viewed_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_viewed_properties_property ON viewed_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_viewed_properties_viewed_at ON viewed_properties(viewed_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for properties updated_at
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for applied_properties updated_at
DROP TRIGGER IF EXISTS update_applied_properties_updated_at ON applied_properties;
CREATE TRIGGER update_applied_properties_updated_at
  BEFORE UPDATE ON applied_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE applied_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewed_properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Properties can be inserted by authenticated users" ON properties;
DROP POLICY IF EXISTS "Properties can be updated by owner" ON properties;
DROP POLICY IF EXISTS "Users can view their own saved properties" ON saved_properties;
DROP POLICY IF EXISTS "Users can save properties" ON saved_properties;
DROP POLICY IF EXISTS "Users can unsave properties" ON saved_properties;
DROP POLICY IF EXISTS "Users can view their own applications" ON applied_properties;
DROP POLICY IF EXISTS "Users can apply to properties" ON applied_properties;
DROP POLICY IF EXISTS "Users can update their own applications" ON applied_properties;
DROP POLICY IF EXISTS "Users can view their own viewing history" ON viewed_properties;
DROP POLICY IF EXISTS "Users can track viewed properties" ON viewed_properties;

-- Properties policies
CREATE POLICY "Properties are viewable by everyone"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Properties can be inserted by authenticated users"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Properties can be updated by owner"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id);

-- Saved properties policies
CREATE POLICY "Users can view their own saved properties"
  ON saved_properties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save properties"
  ON saved_properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave properties"
  ON saved_properties FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Applied properties policies
CREATE POLICY "Users can view their own applications"
  ON applied_properties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can apply to properties"
  ON applied_properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON applied_properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Viewed properties policies
CREATE POLICY "Users can view their own viewing history"
  ON viewed_properties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can track viewed properties"
  ON viewed_properties FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- NO SAMPLE DATA - Properties must be added via Admin/Agent interface
-- ============================================

-- Note: Real properties should be added through:
-- 1. Admin Dashboard (for verified properties)
-- 2. Agent Portal (for agent-listed properties)
-- 3. API integration (for bulk imports from property portals)
-- 4. CSV import functionality

-- Example structure for adding a real property:
-- INSERT INTO properties (
--   title, description, price, property_type, status,
--   bedrooms, bathrooms, city, postcode, country,
--   address_line_1, latitude, longitude, image_urls,
--   agent_name, agent_email, agent_phone, agent_company,
--   property_size_sqm, year_built, property_features,
--   viewing_available, viewing_instructions, deposit_amount,
--   council_tax_band, energy_rating, verified
-- ) VALUES (
--   'Real Property Title',
--   'Real property description',
--   250000,
--   'sale',
--   'online',
--   3,
--   2,
--   'London',
--   'SW1A 1AA',
--   'UK',
--   'Real Street Address',
--   51.5074,
--   -0.1278,
--   '["https://real-image-url-1.jpg", "https://real-image-url-2.jpg"]'::jsonb,
--   'Agent Name',
--   'agent@email.com',
--   '+44 20 1234 5678',
--   'Real Estate Company',
--   120,
--   2010,
--   '["garden", "parking", "balcony"]'::jsonb,
--   true,
--   'Contact agent to arrange viewing',
--   25000,
--   'C',
--   'B',
--   true
-- );

