# 📋 Copy This SQL to Supabase Dashboard

## Quick Steps:

1. **Open Supabase Dashboard:**
   👉 https://supabase.com/dashboard/project/yydtsteyknbpfpxjtlxe/sql/new

2. **Copy the ENTIRE contents below** (everything between the lines)

3. **Paste into SQL Editor**

4. **Click "Run"**

5. **Refresh your app** - Properties will appear! 🎉

---

## ⬇️ COPY EVERYTHING BELOW THIS LINE ⬇️

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
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'UK',
  address_line_1 TEXT,
  address_line_2 TEXT,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
-- SAMPLE UK PROPERTIES DATA
-- ============================================

-- Insert sample UK properties
INSERT INTO properties (title, description, price, property_type, status, bedrooms, bathrooms, city, postcode, country, address_line_1, latitude, longitude, image_urls) VALUES
(
  'Modern London Apartment',
  'Beautiful 2-bedroom apartment in the heart of London with modern amenities and excellent transport links.',
  2500,
  'rent',
  'online',
  2,
  2,
  'London',
  'SW1A 1AA',
  'UK',
  '123 Westminster Street',
  51.5074,
  -0.1278,
  '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]'::jsonb
),
(
  'Victorian House in Manchester',
  'Stunning 4-bedroom Victorian house with period features, large garden, and parking. Perfect for families.',
  450000,
  'sale',
  'online',
  4,
  3,
  'Manchester',
  'M1 1AA',
  'UK',
  '456 Oxford Road',
  53.4808,
  -2.2426,
  '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"]'::jsonb
),
(
  'Luxury Birmingham Flat',
  'Contemporary 1-bedroom flat in Birmingham city centre with balcony and concierge service.',
  1200,
  'rent',
  'online',
  1,
  1,
  'Birmingham',
  'B1 1AA',
  'UK',
  '789 New Street',
  52.4862,
  -1.8904,
  '["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]'::jsonb
),
(
  'Family Home in Leeds',
  'Spacious 3-bedroom family home in a quiet residential area with excellent schools nearby.',
  320000,
  'sale',
  'online',
  3,
  2,
  'Leeds',
  'LS1 1AA',
  'UK',
  '321 Park Lane',
  53.8008,
  -1.5491,
  '["https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]'::jsonb
),
(
  'Studio Apartment in Edinburgh',
  'Compact and modern studio apartment in Edinburgh Old Town, perfect for professionals.',
  950,
  'rent',
  'online',
  1,
  1,
  'Edinburgh',
  'EH1 1AA',
  'UK',
  '654 Royal Mile',
  55.9533,
  -3.1883,
  '["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800"]'::jsonb
),
(
  'Detached House in Liverpool',
  'Beautiful 5-bedroom detached house with double garage and large garden in Liverpool suburbs.',
  550000,
  'sale',
  'online',
  5,
  4,
  'Liverpool',
  'L1 1AA',
  'UK',
  '987 Mersey Road',
  53.4084,
  -2.9916,
  '["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"]'::jsonb
),
(
  'City Centre Apartment in Bristol',
  'Modern 2-bedroom apartment in Bristol city centre with river views and parking space.',
  1800,
  'rent',
  'online',
  2,
  2,
  'Bristol',
  'BS1 1AA',
  'UK',
  '147 Harbour Side',
  51.4545,
  -2.5879,
  '["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]'::jsonb
),
(
  'Terraced House in Sheffield',
  'Well-maintained 3-bedroom terraced house with modern kitchen and bathroom in Sheffield.',
  180000,
  'sale',
  'online',
  3,
  2,
  'Sheffield',
  'S1 1AA',
  'UK',
  '258 Steel Street',
  53.3811,
  -1.4701,
  '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]'::jsonb
),
(
  'Penthouse in Glasgow',
  'Luxurious 3-bedroom penthouse with panoramic city views and private terrace in Glasgow.',
  2200,
  'rent',
  'online',
  3,
  3,
  'Glasgow',
  'G1 1AA',
  'UK',
  '369 Buchanan Street',
  55.8642,
  -4.2518,
  '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]'::jsonb
),
(
  'Cottage in York',
  'Charming 2-bedroom cottage in historic York with period features and courtyard garden.',
  275000,
  'sale',
  'online',
  2,
  1,
  'York',
  'YO1 1AA',
  'UK',
  '741 Shambles',
  53.9600,
  -1.0873,
  '["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"]'::jsonb
)
ON CONFLICT DO NOTHING;


---

## ⬆️ END OF SQL - STOP COPYING HERE ⬆️
