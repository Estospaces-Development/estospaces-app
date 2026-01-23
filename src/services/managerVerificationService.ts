/**
 * Manager Verification Service
 * Handles manager profile verification, document uploads, and admin review
 */

import { supabase } from '../lib/supabase';

// ============================================================================
// Types
// ============================================================================

export type ManagerProfileType = 'broker' | 'company';

export type VerificationStatus =
  | 'incomplete'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'verification_required';

export type DocumentStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'reupload_required';

export type DocumentType =
  | 'government_id'
  | 'broker_license'
  | 'company_registration'
  | 'business_license'
  | 'tax_certificate'
  | 'representative_id'
  | 'address_proof';

export interface ManagerProfile {
  id: string;
  profile_type: ManagerProfileType;
  license_number?: string;
  license_expiry_date?: string;
  association_membership_id?: string;
  company_registration_number?: string;
  tax_id?: string;
  company_address?: string;
  authorized_representative_name?: string;
  authorized_representative_email?: string;
  verification_status: VerificationStatus;
  rejection_reason?: string;
  revision_notes?: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ManagerDocument {
  id: string;
  manager_id: string;
  document_type: DocumentType;
  document_url: string;
  document_name?: string;
  document_number?: string;
  expiry_date?: string;
  verification_status: DocumentStatus;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry {
  id: string;
  action_type: string;
  actor_id?: string;
  actor_role?: string;
  target_manager_id: string;
  target_document_id?: string;
  previous_status?: string;
  new_status?: string;
  details?: Record<string, unknown>;
  notes?: string;
  created_at: string;
}

export interface ManagerVerificationSummary {
  profile: ManagerProfile | null;
  documents: ManagerDocument[];
  requiredDocuments: DocumentType[];
  isComplete: boolean;
  missingDocuments: DocumentType[];
}

// ============================================================================
// Constants
// ============================================================================

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const REQUIRED_DOCUMENTS: Record<ManagerProfileType, DocumentType[]> = {
  broker: ['government_id', 'broker_license'],
  company: ['company_registration', 'business_license', 'tax_certificate', 'representative_id'],
};

const OPTIONAL_DOCUMENTS: Record<ManagerProfileType, DocumentType[]> = {
  broker: ['address_proof'],
  company: ['address_proof'],
};

// ============================================================================
// Manager Profile Functions
// ============================================================================

/**
 * Get manager profile with verification status
 */
export const getManagerProfile = async (userId: string): Promise<{ data: ManagerProfile | null; error: string | null }> => {
  try {
    // Check for mock user
    if (userId.startsWith('mock-')) {
      return {
        data: {
          id: userId,
          profile_type: 'broker',
          verification_status: 'approved',
          license_number: 'RERA-2024-DEMO-001',
          license_expiry_date: '2025-12-31',
          association_membership_id: 'REAL-ESTATE-ASSOC-001',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as ManagerProfile,
        error: null
      };
    }

    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    const { data, error } = await supabase
      .from('manager_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No profile found
      return { data: null, error: null };
    }

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching manager profile:', error);
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Create or update manager profile
 */
export const createOrUpdateManagerProfile = async (
  userId: string,
  profileData: Partial<ManagerProfile>
): Promise<{ data: ManagerProfile | null; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    // Sanitize the data - convert empty strings to null for database compatibility
    const sanitizedData: Record<string, unknown> = { ...profileData };

    // Fields that are dates and need special handling
    const dateFields = ['license_expiry_date', 'submitted_at', 'approved_at'];

    // Convert empty strings to null for all fields, especially date fields
    Object.keys(sanitizedData).forEach(key => {
      const value = sanitizedData[key];
      if (value === '' || value === undefined) {
        sanitizedData[key] = null;
      }
      // Extra check for date fields
      if (dateFields.includes(key) && typeof value === 'string' && value.trim() === '') {
        sanitizedData[key] = null;
      }
    });

    const { data, error } = await supabase
      .from('manager_profiles')
      .upsert({
        id: userId,
        ...sanitizedData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating/updating manager profile:', error);
    return { data: null, error: (error as Error).message };
  }
};

// ============================================================================
// Document Upload Functions
// ============================================================================

/**
 * Upload document to Supabase Storage
 */
export const uploadManagerDocument = async (
  file: File,
  managerId: string,
  documentType: DocumentType
): Promise<{ url: string | null; path: string | null; error: string | null }> => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPG, PNG, or PDF files only.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 10MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${managerId}/${documentType}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('manager-verification-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload document: ${uploadError.message}`);
    }

    // Get signed URL (expires in 1 year for display purposes)
    const { data: signedUrlData } = await supabase.storage
      .from('manager-verification-documents')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    const url = signedUrlData?.signedUrl || null;

    return { url, path: filePath, error: null };
  } catch (error) {
    console.error('Error uploading manager document:', error);
    return { url: null, path: null, error: (error as Error).message };
  }
};

/**
 * Submit document record to database
 */
export const submitManagerDocument = async (data: {
  managerId: string;
  documentType: DocumentType;
  documentUrl: string;
  documentName?: string;
  documentNumber?: string;
  expiryDate?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ data: ManagerDocument | null; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    const { data: doc, error } = await supabase
      .from('manager_verification_documents')
      .upsert({
        manager_id: data.managerId,
        document_type: data.documentType,
        document_url: data.documentUrl,
        document_name: data.documentName || null,
        document_number: data.documentNumber || null,
        // Convert empty string to null for date field (PostgreSQL requires valid date or null)
        expiry_date: data.expiryDate && data.expiryDate.trim() !== '' ? data.expiryDate : null,
        verification_status: 'pending',
        metadata: data.metadata || {},
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'manager_id,document_type' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the upload
    await logAuditEvent({
      actionType: 'document_uploaded',
      targetManagerId: data.managerId,
      targetDocumentId: doc.id,
      details: { document_type: data.documentType },
    });

    return { data: doc, error: null };
  } catch (error) {
    console.error('Error submitting manager document:', error);
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Get all documents for a manager
 */
export const getManagerDocuments = async (
  managerId: string
): Promise<{ data: ManagerDocument[]; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: [], error: 'Supabase client not initialized' };
    }

    const { data, error } = await supabase
      .from('manager_verification_documents')
      .select('*')
      .eq('manager_id', managerId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching manager documents:', error);
    return { data: [], error: (error as Error).message };
  }
};

/**
 * Delete a manager document
 */
export const deleteManagerDocument = async (
  managerId: string,
  documentType: DocumentType
): Promise<{ error: string | null }> => {
  try {
    if (!supabase) {
      return { error: 'Supabase client not initialized' };
    }

    // Get document to find storage path
    const { data: doc } = await supabase
      .from('manager_verification_documents')
      .select('id, document_url')
      .eq('manager_id', managerId)
      .eq('document_type', documentType)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('manager_verification_documents')
      .delete()
      .eq('manager_id', managerId)
      .eq('document_type', documentType);

    if (error) {
      throw error;
    }

    // Log the deletion
    if (doc) {
      await logAuditEvent({
        actionType: 'document_deleted',
        targetManagerId: managerId,
        targetDocumentId: doc.id,
        details: { document_type: documentType },
      });
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting manager document:', error);
    return { error: (error as Error).message };
  }
};

// ============================================================================
// Verification Submission Functions
// ============================================================================

/**
 * Submit profile for verification
 */
export const submitForVerification = async (
  managerId: string
): Promise<{ data: ManagerProfile | null; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    // Check if all required documents are uploaded
    const { data: profile } = await getManagerProfile(managerId);
    if (!profile) {
      return { data: null, error: 'Manager profile not found' };
    }

    const requiredDocs = REQUIRED_DOCUMENTS[profile.profile_type];
    const { data: documents } = await getManagerDocuments(managerId);

    const uploadedTypes = documents.map(d => d.document_type);
    const missingDocs = requiredDocs.filter(d => !uploadedTypes.includes(d));

    if (missingDocs.length > 0) {
      return {
        data: null,
        error: `Missing required documents: ${missingDocs.join(', ')}`
      };
    }

    // Update status to submitted
    const { data, error } = await supabase
      .from('manager_profiles')
      .update({
        verification_status: 'submitted',
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
        revision_notes: null,
      })
      .eq('id', managerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the submission
    await logAuditEvent({
      actionType: 'verification_submitted',
      targetManagerId: managerId,
      newStatus: 'submitted',
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error submitting for verification:', error);
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Get complete verification summary for a manager
 */
export const getManagerVerificationSummary = async (
  managerId: string
): Promise<{ data: ManagerVerificationSummary | null; error: string | null }> => {
  try {
    const [profileResult, documentsResult] = await Promise.all([
      getManagerProfile(managerId),
      getManagerDocuments(managerId),
    ]);

    if (profileResult.error && !profileResult.error.includes('not found')) {
      return { data: null, error: profileResult.error };
    }

    const profile = profileResult.data;
    const documents = documentsResult.data;

    const requiredDocuments = profile
      ? REQUIRED_DOCUMENTS[profile.profile_type]
      : [];

    const uploadedTypes = documents.map(d => d.document_type);
    const missingDocuments = requiredDocuments.filter(
      d => !uploadedTypes.includes(d)
    ) as DocumentType[];

    return {
      data: {
        profile,
        documents,
        requiredDocuments,
        isComplete: missingDocuments.length === 0,
        missingDocuments,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting verification summary:', error);
    return { data: null, error: (error as Error).message };
  }
};

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Get all pending verifications (admin only)
 * @param status - specific status to filter, or undefined/null for all statuses
 * @param allStatuses - if true, fetch all statuses regardless of status param
 */
export const getPendingVerifications = async (
  status?: VerificationStatus,
  allStatuses: boolean = false
): Promise<{ data: (ManagerProfile & { user_email?: string; user_name?: string })[]; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: [], error: 'Supabase client not initialized' };
    }

    // First get the manager profiles
    let query = supabase
      .from('manager_profiles')
      .select('*')
      .order('submitted_at', { ascending: true, nullsFirst: false });

    if (status) {
      // Filter by specific status
      query = query.eq('verification_status', status);
    } else if (!allStatuses) {
      // Default: show only pending verifications (submitted and under_review)
      query = query.in('verification_status', ['submitted', 'under_review']);
    }
    // If allStatuses is true and no specific status, don't apply any filter (show all)

    const { data: managerProfiles, error: profilesError } = await query;

    if (profilesError) {
      throw profilesError;
    }

    if (!managerProfiles || managerProfiles.length === 0) {
      return { data: [], error: null };
    }

    // Get the user info from profiles table
    const userIds = managerProfiles.map(mp => mp.id);
    console.log('Fetching user profiles for manager IDs:', userIds);

    const { data: userProfiles, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching user profiles:', usersError);
      // Continue without user info rather than failing
    } else {
      console.log('Fetched user profiles:', userProfiles?.length || 0, 'profiles found');
    }

    // Create a map for quick lookup
    const userMap = new Map<string, { email?: string; full_name?: string }>();
    (userProfiles || []).forEach(up => {
      // If full_name is empty/null, try to create a name from email
      let displayName = up.full_name;
      if (!displayName && up.email) {
        // Extract name from email: "john.doe@example.com" -> "John Doe"
        const emailPart = up.email.split('@')[0];
        displayName = emailPart
          .replace(/[._-]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }

      userMap.set(up.id, {
        email: up.email || null,
        full_name: displayName || null
      });
    });

    // Log missing profiles
    const missingProfiles = userIds.filter(id => !userMap.has(id));
    if (missingProfiles.length > 0) {
      console.warn('Managers without profiles found:', missingProfiles.length);
    }

    // Transform the data to include user info
    const transformed = managerProfiles.map(item => {
      const userInfo = userMap.get(item.id);
      return {
        ...item,
        user_email: userInfo?.email || null,
        user_name: userInfo?.full_name || null,
      };
    });

    return { data: transformed, error: null };
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return { data: [], error: (error as Error).message };
  }
};

/**
 * Get detailed verification info for admin review
 */
export const getManagerVerificationDetails = async (
  managerId: string
): Promise<{
  data: {
    profile: ManagerProfile | null;
    documents: ManagerDocument[];
    auditLog: AuditLogEntry[];
    userInfo: { email?: string; full_name?: string } | null;
  } | null;
  error: string | null
}> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    const [profileResult, documentsResult, auditResult, userResult] = await Promise.all([
      supabase.from('manager_profiles').select('*').eq('id', managerId).single(),
      supabase.from('manager_verification_documents').select('*').eq('manager_id', managerId),
      supabase.from('manager_verification_audit_log')
        .select('*')
        .eq('target_manager_id', managerId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('profiles').select('email, full_name').eq('id', managerId).single(),
    ]);

    // Process user info - extract name from email if full_name is missing
    let processedUserInfo = userResult.data;
    if (processedUserInfo && !processedUserInfo.full_name && processedUserInfo.email) {
      const emailPart = processedUserInfo.email.split('@')[0];
      processedUserInfo = {
        ...processedUserInfo,
        full_name: emailPart
          .replace(/[._-]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      };
    }

    return {
      data: {
        profile: profileResult.data,
        documents: documentsResult.data || [],
        auditLog: auditResult.data || [],
        userInfo: processedUserInfo,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching manager verification details:', error);
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Start reviewing a manager's verification (sets status to under_review)
 */
export const startReview = async (
  managerId: string,
  adminId: string
): Promise<{ error: string | null }> => {
  try {
    if (!supabase) {
      return { error: 'Supabase client not initialized' };
    }

    const { error } = await supabase
      .from('manager_profiles')
      .update({ verification_status: 'under_review' })
      .eq('id', managerId)
      .eq('verification_status', 'submitted');

    if (error) {
      throw error;
    }

    await logAuditEvent({
      actionType: 'review_started',
      actorId: adminId,
      actorRole: 'admin',
      targetManagerId: managerId,
      newStatus: 'under_review',
    });

    return { error: null };
  } catch (error) {
    console.error('Error starting review:', error);
    return { error: (error as Error).message };
  }
};

/**
 * Approve a manager's verification
 */
export const approveManager = async (
  managerId: string,
  adminId: string,
  notes?: string
): Promise<{ data: ManagerProfile | null; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    // Update manager profile
    const { data, error } = await supabase
      .from('manager_profiles')
      .update({
        verification_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId,
        rejection_reason: null,
        revision_notes: null,
      })
      .eq('id', managerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Approve all pending documents
    await supabase
      .from('manager_verification_documents')
      .update({
        verification_status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('manager_id', managerId)
      .in('verification_status', ['pending', 'under_review']);

    // Update the main profiles table is_verified flag
    await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', managerId);

    // Log the approval
    await logAuditEvent({
      actionType: 'manager_approved',
      actorId: adminId,
      actorRole: 'admin',
      targetManagerId: managerId,
      newStatus: 'approved',
      notes,
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error approving manager:', error);
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Reject a manager's verification
 */
export const rejectManager = async (
  managerId: string,
  adminId: string,
  reason: string
): Promise<{ data: ManagerProfile | null; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    if (!reason || reason.trim().length === 0) {
      return { data: null, error: 'Rejection reason is required' };
    }

    const { data, error } = await supabase
      .from('manager_profiles')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', managerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the rejection
    await logAuditEvent({
      actionType: 'manager_rejected',
      actorId: adminId,
      actorRole: 'admin',
      targetManagerId: managerId,
      newStatus: 'rejected',
      details: { reason },
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error rejecting manager:', error);
    return { data: null, error: (error as Error).message };
  }
};

/**
 * Revoke manager approval (reject an approved manager)
 */
export const revokeManagerApproval = async (
  managerId: string,
  adminId: string,
  reason: string
): Promise<{ data: ManagerProfile | null; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    if (!reason || reason.trim().length === 0) {
      return { data: null, error: 'Revocation reason is required' };
    }

    console.log('Attempting to revoke manager approval:', {
      managerId,
      adminId,
      reasonLength: reason.length
    });

    // Update manager profile to rejected status
    const { data, error } = await supabase
      .from('manager_profiles')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason,
        approved_at: null,
        approved_by: null,
      })
      .eq('id', managerId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      // Provide more detailed error message
      const errorMessage = error.message || error.code || 'Unknown database error';
      const detailedError = error.code === '42501'
        ? 'Permission denied. Please ensure you are logged in as an admin.'
        : error.code === 'PGRST116'
          ? 'No rows found to update. The manager profile may not exist.'
          : `Database error: ${errorMessage}`;
      return { data: null, error: detailedError };
    }

    if (!data) {
      return { data: null, error: 'No data returned from update. The manager profile may not exist.' };
    }

    console.log('Manager profile updated successfully:', data);

    // Update profiles table to mark as not verified
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_verified: false })
      .eq('id', managerId);

    if (profileError) {
      console.warn('Warning: Failed to update profiles table:', profileError);
      // Don't fail the whole operation if this fails, but log it
    }

    // Log the revocation
    const auditError = await logAuditEvent({
      actionType: 'approval_revoked',
      actorId: adminId,
      actorRole: 'admin',
      targetManagerId: managerId,
      previousStatus: 'approved',
      newStatus: 'rejected',
      details: { reason, action: 'approval_revoked' },
    });

    if (auditError) {
      console.warn('Warning: Failed to log audit event:', auditError);
      // Don't fail the whole operation if audit logging fails
    }

    console.log('Revocation completed successfully');
    return { data, error: null };
  } catch (error) {
    console.error('Error revoking manager approval:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred while revoking approval';
    return { data: null, error: errorMessage };
  }
};

/**
 * Request document re-upload
 */
export const requestDocumentReupload = async (
  managerId: string,
  adminId: string,
  documentType: DocumentType,
  reason: string
): Promise<{ error: string | null }> => {
  try {
    if (!supabase) {
      return { error: 'Supabase client not initialized' };
    }

    // Update document status
    const { data: doc, error } = await supabase
      .from('manager_verification_documents')
      .update({
        verification_status: 'reupload_required',
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('manager_id', managerId)
      .eq('document_type', documentType)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update manager profile to need revision
    await supabase
      .from('manager_profiles')
      .update({
        verification_status: 'rejected',
        revision_notes: `Document "${documentType}" requires re-upload: ${reason}`,
      })
      .eq('id', managerId);

    // Log the action
    await logAuditEvent({
      actionType: 'document_reupload_requested',
      actorId: adminId,
      actorRole: 'admin',
      targetManagerId: managerId,
      targetDocumentId: doc?.id,
      details: { document_type: documentType, reason },
    });

    return { error: null };
  } catch (error) {
    console.error('Error requesting document reupload:', error);
    return { error: (error as Error).message };
  }
};

// ============================================================================
// Audit Log Functions
// ============================================================================

/**
 * Log an audit event
 */
const logAuditEvent = async (event: {
  actionType: string;
  actorId?: string;
  actorRole?: string;
  targetManagerId: string;
  targetDocumentId?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: Record<string, unknown>;
  notes?: string;
}): Promise<void> => {
  try {
    if (!supabase) return;

    await supabase.from('manager_verification_audit_log').insert({
      action_type: event.actionType,
      actor_id: event.actorId,
      actor_role: event.actorRole || 'manager',
      target_manager_id: event.targetManagerId,
      target_document_id: event.targetDocumentId,
      previous_status: event.previousStatus,
      new_status: event.newStatus,
      details: event.details || {},
      notes: event.notes,
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw - audit logging shouldn't break the main operation
  }
};

/**
 * Get audit log for a manager
 */
export const getManagerAuditLog = async (
  managerId: string
): Promise<{ data: AuditLogEntry[]; error: string | null }> => {
  try {
    if (!supabase) {
      return { data: [], error: 'Supabase client not initialized' };
    }

    const { data, error } = await supabase
      .from('manager_verification_audit_log')
      .select('*')
      .eq('target_manager_id', managerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return { data: [], error: (error as Error).message };
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get required documents for a profile type
 */
export const getRequiredDocuments = (profileType: ManagerProfileType): DocumentType[] => {
  return REQUIRED_DOCUMENTS[profileType] || [];
};

/**
 * Get optional documents for a profile type
 */
export const getOptionalDocuments = (profileType: ManagerProfileType): DocumentType[] => {
  return OPTIONAL_DOCUMENTS[profileType] || [];
};

/**
 * Get human-readable document type name
 */
export const getDocumentTypeName = (documentType: DocumentType): string => {
  const names: Record<DocumentType, string> = {
    government_id: 'Government ID',
    broker_license: 'Broker License',
    company_registration: 'Company Registration Certificate',
    business_license: 'Business License',
    tax_certificate: 'Tax Certificate',
    representative_id: 'Representative ID',
    address_proof: 'Proof of Address',
  };
  return names[documentType] || documentType;
};

/**
 * Get human-readable status name
 */
export const getStatusDisplayName = (status: VerificationStatus | DocumentStatus): string => {
  const names: Record<string, string> = {
    incomplete: 'Incomplete',
    submitted: 'Submitted',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    verification_required: 'Verification Required',
    pending: 'Pending',
    reupload_required: 'Re-upload Required',
  };
  return names[status] || status;
};
