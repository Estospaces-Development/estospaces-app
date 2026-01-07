-- ============================================
-- UK Property Platform - Supabase SQL Schema
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
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST (point(longitude, latitude));

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
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for applied_properties updated_at
CREATE TRIGGER update_applied_properties_updated_at
  BEFORE UPDATE ON applied_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO viewed_properties (user_id, property_id, viewed_at, view_count)
  VALUES (NEW.user_id, NEW.property_id, NOW(), 1)
  ON CONFLICT (user_id, property_id)
  DO UPDATE SET
    viewed_at = NOW(),
    view_count = viewed_properties.view_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE applied_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewed_properties ENABLE ROW LEVEL SECURITY;

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
-- HELPER FUNCTIONS
-- ============================================

-- Function to get properties with user interaction status
CREATE OR REPLACE FUNCTION get_properties_with_status(
  p_user_id UUID,
  p_country TEXT DEFAULT 'UK',
  p_status TEXT DEFAULT 'online',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  property_type TEXT,
  status TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  image_urls JSONB,
  latitude NUMERIC,
  longitude NUMERIC,
  city TEXT,
  postcode TEXT,
  address_line_1 TEXT,
  agent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_saved BOOLEAN,
  is_applied BOOLEAN,
  application_status TEXT,
  view_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.property_type,
    p.status,
    p.bedrooms,
    p.bathrooms,
    p.image_urls,
    p.latitude,
    p.longitude,
    p.city,
    p.postcode,
    p.address_line_1,
    p.agent_id,
    p.created_at,
    p.updated_at,
    COALESCE(sp.id IS NOT NULL, false) as is_saved,
    COALESCE(ap.id IS NOT NULL, false) as is_applied,
    ap.status as application_status,
    COALESCE(vp.view_count, 0) as view_count
  FROM properties p
  LEFT JOIN saved_properties sp ON sp.property_id = p.id AND sp.user_id = p_user_id
  LEFT JOIN applied_properties ap ON ap.property_id = p.id AND ap.user_id = p_user_id
  LEFT JOIN viewed_properties vp ON vp.property_id = p.id AND vp.user_id = p_user_id
  WHERE p.country = p_country AND p.status = p_status
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

