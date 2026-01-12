-- ============================================
-- Manager Verification & Profile Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MANAGER PROFILES TABLE
-- Extended information for managers (brokers/companies)
-- ============================================
CREATE TABLE IF NOT EXISTS manager_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile Type
  profile_type TEXT NOT NULL CHECK (profile_type IN ('broker', 'company')),
  
  -- Broker-specific fields
  license_number TEXT,
  license_expiry_date DATE,
  association_membership_id TEXT,
  
  -- Company-specific fields
  company_registration_number TEXT,
  tax_id TEXT,
  company_address TEXT,
  authorized_representative_name TEXT,
  authorized_representative_email TEXT,
  
  -- Verification Status
  verification_status TEXT NOT NULL DEFAULT 'incomplete' CHECK (
    verification_status IN ('incomplete', 'submitted', 'under_review', 'approved', 'rejected', 'verification_required')
  ),
  rejection_reason TEXT,
  revision_notes TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints for fraud prevention
  CONSTRAINT unique_license_number UNIQUE (license_number),
  CONSTRAINT unique_company_registration UNIQUE (company_registration_number)
);

-- ============================================
-- MANAGER VERIFICATION DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS manager_verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document Information
  document_type TEXT NOT NULL CHECK (document_type IN (
    'government_id',
    'broker_license', 
    'company_registration',
    'business_license',
    'tax_certificate',
    'representative_id',
    'address_proof'
  )),
  document_url TEXT NOT NULL,
  document_name TEXT,
  document_number TEXT,
  expiry_date DATE,
  
  -- Verification Status
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'under_review', 'approved', 'rejected', 'reupload_required')
  ),
  rejection_reason TEXT,
  
  -- Reviewer Information
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Each manager can only have one document of each type
  UNIQUE(manager_id, document_type)
);

-- ============================================
-- MANAGER VERIFICATION AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS manager_verification_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Action Information
  action_type TEXT NOT NULL CHECK (action_type IN (
    'profile_created',
    'profile_updated',
    'document_uploaded',
    'document_deleted',
    'document_replaced',
    'verification_submitted',
    'review_started',
    'document_approved',
    'document_rejected',
    'document_reupload_requested',
    'manager_approved',
    'manager_rejected',
    'status_changed',
    'license_expired',
    'critical_field_edited'
  )),
  
  -- Actor (who performed the action)
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT, -- 'manager', 'admin', 'system'
  
  -- Target
  target_manager_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_document_id UUID REFERENCES manager_verification_documents(id) ON DELETE SET NULL,
  
  -- Details
  previous_status TEXT,
  new_status TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_manager_profiles_type ON manager_profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_manager_profiles_status ON manager_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_manager_profiles_submitted ON manager_profiles(submitted_at);

CREATE INDEX IF NOT EXISTS idx_manager_docs_manager ON manager_verification_documents(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_docs_type ON manager_verification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_manager_docs_status ON manager_verification_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_manager_docs_expiry ON manager_verification_documents(expiry_date);

CREATE INDEX IF NOT EXISTS idx_manager_audit_target ON manager_verification_audit_log(target_manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_audit_action ON manager_verification_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_manager_audit_created ON manager_verification_audit_log(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_manager_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for manager_profiles updated_at
DROP TRIGGER IF EXISTS update_manager_profiles_updated_at ON manager_profiles;
CREATE TRIGGER update_manager_profiles_updated_at
  BEFORE UPDATE ON manager_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_manager_updated_at();

-- Trigger for manager_verification_documents updated_at
DROP TRIGGER IF EXISTS update_manager_docs_updated_at ON manager_verification_documents;
CREATE TRIGGER update_manager_docs_updated_at
  BEFORE UPDATE ON manager_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_manager_updated_at();

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_manager_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    INSERT INTO manager_verification_audit_log (
      action_type,
      actor_id,
      actor_role,
      target_manager_id,
      previous_status,
      new_status,
      details
    ) VALUES (
      'status_changed',
      auth.uid(),
      CASE 
        WHEN auth.uid() = NEW.id THEN 'manager'
        ELSE 'admin'
      END,
      NEW.id,
      OLD.verification_status,
      NEW.verification_status,
      jsonb_build_object(
        'rejection_reason', NEW.rejection_reason,
        'revision_notes', NEW.revision_notes
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log manager profile status changes
DROP TRIGGER IF EXISTS log_manager_profile_status_change ON manager_profiles;
CREATE TRIGGER log_manager_profile_status_change
  AFTER UPDATE ON manager_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_manager_status_change();

-- Function to check license expiry and update status
CREATE OR REPLACE FUNCTION check_license_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- If a license document has an expiry date in the past, trigger verification required
  IF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN
    -- Update the manager profile status
    UPDATE manager_profiles
    SET 
      verification_status = 'verification_required',
      updated_at = NOW()
    WHERE id = NEW.manager_id
    AND verification_status = 'approved';
    
    -- Log the expiry
    IF FOUND THEN
      INSERT INTO manager_verification_audit_log (
        action_type,
        actor_role,
        target_manager_id,
        target_document_id,
        details
      ) VALUES (
        'license_expired',
        'system',
        NEW.manager_id,
        NEW.id,
        jsonb_build_object(
          'document_type', NEW.document_type,
          'expiry_date', NEW.expiry_date
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check license expiry on document update
DROP TRIGGER IF EXISTS check_document_expiry ON manager_verification_documents;
CREATE TRIGGER check_document_expiry
  AFTER INSERT OR UPDATE ON manager_verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION check_license_expiry();

-- Function to handle critical field edits
CREATE OR REPLACE FUNCTION handle_critical_field_edit()
RETURNS TRIGGER AS $$
BEGIN
  -- If license number or company registration changed after approval
  IF NEW.verification_status = 'approved' AND (
    (OLD.license_number IS DISTINCT FROM NEW.license_number AND NEW.license_number IS NOT NULL) OR
    (OLD.company_registration_number IS DISTINCT FROM NEW.company_registration_number AND NEW.company_registration_number IS NOT NULL)
  ) THEN
    NEW.verification_status := 'verification_required';
    NEW.revision_notes := 'Critical field was edited. Please re-upload relevant documents.';
    
    -- Log the edit
    INSERT INTO manager_verification_audit_log (
      action_type,
      actor_id,
      actor_role,
      target_manager_id,
      previous_status,
      new_status,
      details
    ) VALUES (
      'critical_field_edited',
      auth.uid(),
      'manager',
      NEW.id,
      'approved',
      'verification_required',
      jsonb_build_object(
        'license_number_changed', OLD.license_number IS DISTINCT FROM NEW.license_number,
        'company_registration_changed', OLD.company_registration_number IS DISTINCT FROM NEW.company_registration_number
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for critical field edits
DROP TRIGGER IF EXISTS handle_manager_critical_edit ON manager_profiles;
CREATE TRIGGER handle_manager_critical_edit
  BEFORE UPDATE ON manager_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_critical_field_edit();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE manager_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_verification_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Managers can view own profile" ON manager_profiles;
DROP POLICY IF EXISTS "Managers can insert own profile" ON manager_profiles;
DROP POLICY IF EXISTS "Managers can update own profile" ON manager_profiles;
DROP POLICY IF EXISTS "Admins can view all manager profiles" ON manager_profiles;
DROP POLICY IF EXISTS "Admins can update manager profiles" ON manager_profiles;

DROP POLICY IF EXISTS "Managers can view own documents" ON manager_verification_documents;
DROP POLICY IF EXISTS "Managers can insert own documents" ON manager_verification_documents;
DROP POLICY IF EXISTS "Managers can update own documents" ON manager_verification_documents;
DROP POLICY IF EXISTS "Managers can delete own documents" ON manager_verification_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON manager_verification_documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON manager_verification_documents;

DROP POLICY IF EXISTS "Managers can view own audit logs" ON manager_verification_audit_log;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON manager_verification_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON manager_verification_audit_log;

-- ============================================
-- MANAGER PROFILES POLICIES
-- ============================================

-- Managers can view their own profile
CREATE POLICY "Managers can view own profile" ON manager_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Managers can insert their own profile
CREATE POLICY "Managers can insert own profile" ON manager_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Managers can update their own profile (with restrictions handled by trigger)
CREATE POLICY "Managers can update own profile" ON manager_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all manager profiles
CREATE POLICY "Admins can view all manager profiles" ON manager_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update manager profiles (for approval/rejection)
CREATE POLICY "Admins can update manager profiles" ON manager_profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- MANAGER VERIFICATION DOCUMENTS POLICIES
-- ============================================

-- Managers can view their own documents
CREATE POLICY "Managers can view own documents" ON manager_verification_documents
  FOR SELECT TO authenticated
  USING (auth.uid() = manager_id);

-- Managers can insert their own documents
CREATE POLICY "Managers can insert own documents" ON manager_verification_documents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = manager_id);

-- Managers can update their own documents (only if not under review)
CREATE POLICY "Managers can update own documents" ON manager_verification_documents
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = manager_id 
    AND verification_status NOT IN ('under_review', 'approved')
  )
  WITH CHECK (auth.uid() = manager_id);

-- Managers can delete their own documents (only if not under review or approved)
CREATE POLICY "Managers can delete own documents" ON manager_verification_documents
  FOR DELETE TO authenticated
  USING (
    auth.uid() = manager_id 
    AND verification_status NOT IN ('under_review', 'approved')
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents" ON manager_verification_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all documents
CREATE POLICY "Admins can update all documents" ON manager_verification_documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- AUDIT LOG POLICIES
-- ============================================

-- Managers can view their own audit logs
CREATE POLICY "Managers can view own audit logs" ON manager_verification_audit_log
  FOR SELECT TO authenticated
  USING (auth.uid() = target_manager_id);

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON manager_verification_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow inserts for audit logging (any authenticated user can create logs)
CREATE POLICY "System can insert audit logs" ON manager_verification_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- Note: Run these in Supabase Dashboard > Storage

-- Create bucket for manager verification documents (if not exists)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('manager-verification-documents', 'manager-verification-documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies (run in SQL editor):
-- DROP POLICY IF EXISTS "Managers can upload own documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Managers can view own documents" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;

-- CREATE POLICY "Managers can upload own documents" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (
--     bucket_id = 'manager-verification-documents' 
--     AND (storage.foldername(name))[1] = auth.uid()::text
--   );

-- CREATE POLICY "Managers can view own documents" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (
--     bucket_id = 'manager-verification-documents' 
--     AND (storage.foldername(name))[1] = auth.uid()::text
--   );

-- CREATE POLICY "Admins can view all manager documents" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (
--     bucket_id = 'manager-verification-documents'
--     AND EXISTS (
--       SELECT 1 FROM profiles 
--       WHERE profiles.id = auth.uid() 
--       AND profiles.role = 'admin'
--     )
--   );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get required documents based on profile type
CREATE OR REPLACE FUNCTION get_required_documents(profile_type TEXT)
RETURNS TEXT[] AS $$
BEGIN
  IF profile_type = 'broker' THEN
    RETURN ARRAY['government_id', 'broker_license'];
  ELSIF profile_type = 'company' THEN
    RETURN ARRAY['company_registration', 'business_license', 'tax_certificate', 'representative_id'];
  ELSE
    RETURN ARRAY[]::TEXT[];
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if all required documents are uploaded
CREATE OR REPLACE FUNCTION check_documents_complete(manager_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_type TEXT;
  required_docs TEXT[];
  uploaded_count INTEGER;
BEGIN
  -- Get the manager's profile type
  SELECT mp.profile_type INTO profile_type
  FROM manager_profiles mp
  WHERE mp.id = manager_id;
  
  IF profile_type IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get required documents for this profile type
  required_docs := get_required_documents(profile_type);
  
  -- Count how many required documents are uploaded
  SELECT COUNT(*) INTO uploaded_count
  FROM manager_verification_documents mvd
  WHERE mvd.manager_id = check_documents_complete.manager_id
  AND mvd.document_type = ANY(required_docs)
  AND mvd.verification_status != 'rejected';
  
  RETURN uploaded_count >= array_length(required_docs, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON manager_profiles TO authenticated;
GRANT ALL ON manager_verification_documents TO authenticated;
GRANT ALL ON manager_verification_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION get_required_documents(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_documents_complete(UUID) TO authenticated;
