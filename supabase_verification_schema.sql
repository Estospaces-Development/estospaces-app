-- ============================================
-- User Verification & Document Submission Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER VERIFICATION DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('brp', 'passport', 'utility_bill', 'guarantor_info')),
  document_url TEXT, -- URL to uploaded document in storage
  document_name TEXT,
  document_number TEXT, -- For BRP, Passport numbers
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
  rejection_reason TEXT, -- If rejected, reason for rejection
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin who verified
  verified_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Metadata for different document types
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, document_type)
);

-- ============================================
-- GUARANTOR INFORMATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guarantor_information (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Guarantor Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  relationship_to_tenant TEXT, -- e.g., 'Parent', 'Friend', 'Employer', etc.
  -- Guarantor Address
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  country TEXT DEFAULT 'UK',
  -- Guarantor Financial Information (optional but recommended)
  employment_status TEXT, -- 'employed', 'self_employed', 'retired', 'student', etc.
  employer_name TEXT,
  annual_income NUMERIC(12, 2),
  -- Documents
  id_document_url TEXT, -- Passport or driving license
  proof_of_address_url TEXT, -- Utility bill or bank statement
  proof_of_income_url TEXT, -- Payslip or bank statement
  -- Verification Status
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Additional notes
  notes TEXT,
  UNIQUE(user_id)
);

-- ============================================
-- USER VERIFICATION STATUS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_verification_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Individual document verification status
  brp_verified BOOLEAN DEFAULT FALSE,
  passport_verified BOOLEAN DEFAULT FALSE,
  utility_bill_verified BOOLEAN DEFAULT FALSE,
  guarantor_verified BOOLEAN DEFAULT FALSE,
  -- Overall verification status
  is_verified BOOLEAN DEFAULT FALSE,
  verification_level TEXT DEFAULT 'none' CHECK (verification_level IN ('none', 'basic', 'partial', 'full')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Additional information
  verification_notes TEXT
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_verification_documents_user ON user_verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_documents_type ON user_verification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_user_verification_documents_status ON user_verification_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_guarantor_info_user ON guarantor_information(user_id);
CREATE INDEX IF NOT EXISTS idx_guarantor_info_status ON guarantor_information(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_verification_status_verified ON user_verification_status(is_verified);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update verification status automatically
CREATE OR REPLACE FUNCTION update_user_verification_status()
RETURNS TRIGGER AS $$
DECLARE
  brp_count INTEGER;
  passport_count INTEGER;
  utility_count INTEGER;
  guarantor_count INTEGER;
  all_verified BOOLEAN;
  verification_level TEXT;
BEGIN
  -- Count verified documents
  SELECT COUNT(*) INTO brp_count
  FROM user_verification_documents
  WHERE user_id = NEW.user_id AND document_type = 'brp' AND verification_status = 'verified';

  SELECT COUNT(*) INTO passport_count
  FROM user_verification_documents
  WHERE user_id = NEW.user_id AND document_type = 'passport' AND verification_status = 'verified';

  SELECT COUNT(*) INTO utility_count
  FROM user_verification_documents
  WHERE user_id = NEW.user_id AND document_type = 'utility_bill' AND verification_status = 'verified';

  SELECT COUNT(*) INTO guarantor_count
  FROM guarantor_information
  WHERE user_id = NEW.user_id AND verification_status = 'verified';

  -- Update individual status flags
  UPDATE user_verification_status
  SET
    brp_verified = (brp_count > 0),
    passport_verified = (passport_count > 0),
    utility_bill_verified = (utility_count > 0),
    guarantor_verified = (guarantor_count > 0),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  -- Check if all required documents are verified
  all_verified := (brp_count > 0 OR passport_count > 0) AND utility_count > 0 AND guarantor_count > 0;

  -- Determine verification level
  IF all_verified THEN
    verification_level := 'full';
  ELSIF (brp_count > 0 OR passport_count > 0) AND utility_count > 0 THEN
    verification_level := 'partial';
  ELSIF brp_count > 0 OR passport_count > 0 OR utility_count > 0 THEN
    verification_level := 'basic';
  ELSE
    verification_level := 'none';
  END IF;

  -- Update overall verification status
  UPDATE user_verification_status
  SET
    is_verified = all_verified,
    verification_level = verification_level,
    verified_at = CASE WHEN all_verified AND verified_at IS NULL THEN NOW() ELSE verified_at END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  -- If record doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO user_verification_status (user_id, brp_verified, passport_verified, utility_bill_verified, guarantor_verified, is_verified, verification_level, updated_at)
    VALUES (NEW.user_id, (brp_count > 0), (passport_count > 0), (utility_count > 0), (guarantor_count > 0), all_verified, verification_level, NOW())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on user_verification_documents
DROP TRIGGER IF EXISTS trigger_update_verification_status_docs ON user_verification_documents;
CREATE TRIGGER trigger_update_verification_status_docs
  AFTER INSERT OR UPDATE ON user_verification_documents
  FOR EACH ROW
  WHEN (NEW.verification_status = 'verified')
  EXECUTE FUNCTION update_user_verification_status();

-- Trigger on guarantor_information
DROP TRIGGER IF EXISTS trigger_update_verification_status_guarantor ON guarantor_information;
CREATE TRIGGER trigger_update_verification_status_guarantor
  AFTER INSERT OR UPDATE ON guarantor_information
  FOR EACH ROW
  WHEN (NEW.verification_status = 'verified')
  EXECUTE FUNCTION update_user_verification_status();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_verification_documents updated_at
DROP TRIGGER IF EXISTS update_user_verification_documents_updated_at ON user_verification_documents;
CREATE TRIGGER update_user_verification_documents_updated_at
  BEFORE UPDATE ON user_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for guarantor_information updated_at
DROP TRIGGER IF EXISTS update_guarantor_information_updated_at ON guarantor_information;
CREATE TRIGGER update_guarantor_information_updated_at
  BEFORE UPDATE ON guarantor_information
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_verification_status updated_at
DROP TRIGGER IF EXISTS update_user_verification_status_updated_at ON user_verification_status;
CREATE TRIGGER update_user_verification_status_updated_at
  BEFORE UPDATE ON user_verification_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantor_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own verification documents" ON user_verification_documents;
DROP POLICY IF EXISTS "Users can insert their own verification documents" ON user_verification_documents;
DROP POLICY IF EXISTS "Users can update their own verification documents" ON user_verification_documents;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON user_verification_documents;
DROP POLICY IF EXISTS "Admins can update verification documents" ON user_verification_documents;

DROP POLICY IF EXISTS "Users can view their own guarantor information" ON guarantor_information;
DROP POLICY IF EXISTS "Users can insert their own guarantor information" ON guarantor_information;
DROP POLICY IF EXISTS "Users can update their own guarantor information" ON guarantor_information;
DROP POLICY IF EXISTS "Admins can view all guarantor information" ON guarantor_information;
DROP POLICY IF EXISTS "Admins can update guarantor information" ON guarantor_information;

DROP POLICY IF EXISTS "Users can view their own verification status" ON user_verification_status;
DROP POLICY IF EXISTS "Admins can view all verification status" ON user_verification_status;
DROP POLICY IF EXISTS "Admins can update verification status" ON user_verification_status;

-- User verification documents policies
CREATE POLICY "Users can view their own verification documents"
  ON user_verification_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification documents"
  ON user_verification_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification documents"
  ON user_verification_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and update all (you may want to add an admin role check)
CREATE POLICY "Admins can view all verification documents"
  ON user_verification_documents FOR SELECT
  TO authenticated
  USING (true); -- Adjust based on your admin role logic

CREATE POLICY "Admins can update verification documents"
  ON user_verification_documents FOR UPDATE
  TO authenticated
  USING (true) -- Adjust based on your admin role logic
  WITH CHECK (true);

-- Guarantor information policies
CREATE POLICY "Users can view their own guarantor information"
  ON guarantor_information FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guarantor information"
  ON guarantor_information FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own guarantor information"
  ON guarantor_information FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all guarantor information"
  ON guarantor_information FOR SELECT
  TO authenticated
  USING (true); -- Adjust based on your admin role logic

CREATE POLICY "Admins can update guarantor information"
  ON guarantor_information FOR UPDATE
  TO authenticated
  USING (true) -- Adjust based on your admin role logic
  WITH CHECK (true);

-- User verification status policies
CREATE POLICY "Users can view their own verification status"
  ON user_verification_status FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification status"
  ON user_verification_status FOR SELECT
  TO authenticated
  USING (true); -- Adjust based on your admin role logic

CREATE POLICY "Admins can update verification status"
  ON user_verification_status FOR UPDATE
  TO authenticated
  USING (true) -- Adjust based on your admin role logic
  WITH CHECK (true);

