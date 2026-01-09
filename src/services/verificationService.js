/**
 * Verification Service
 * Handles user verification documents and status
 */

import { supabase } from '../lib/supabase';

/**
 * Upload document to Supabase Storage
 */
export const uploadVerificationDocument = async (file, userId, documentType) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPG, PNG, or PDF files only.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;
    const filePath = `verification-documents/${fileName}`;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload document: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(filePath);

    return { url: publicUrl, path: filePath, error: null };
  } catch (error) {
    console.error('Error uploading verification document:', error);
    return { url: null, path: null, error: error.message };
  }
};

/**
 * Submit verification document
 */
export const submitVerificationDocument = async ({
  userId,
  documentType,
  documentUrl,
  documentName,
  documentNumber = null,
  metadata = {},
}) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('user_verification_documents')
      .upsert({
        user_id: userId,
        document_type: documentType,
        document_url: documentUrl,
        document_name: documentName,
        document_number: documentNumber,
        verification_status: 'pending',
        metadata: metadata,
        submitted_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,document_type',
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error submitting verification document:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get user's verification documents
 */
export const getUserVerificationDocuments = async (userId) => {
  try {
    if (!supabase) {
      return { data: [], error: 'Supabase client not initialized' };
    }

    const { data, error } = await supabase
      .from('user_verification_documents')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) {
      const errorMsg = error.message || error.toString() || '';
      if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
        return { data: [], error: 'Verification documents table not found. Please run the SQL schema in Supabase.' };
      }
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching verification documents:', error);
    const errorMsg = error.message || error.toString() || '';
    if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
      return { data: [], error: 'Verification documents table not found. Please run the SQL schema in Supabase.' };
    }
    return { data: [], error: error.message || 'Failed to fetch verification documents' };
  }
};

/**
 * Get specific verification document
 */
export const getVerificationDocument = async (userId, documentType) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('user_verification_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('document_type', documentType)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error fetching verification document:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Submit guarantor information
 */
export const submitGuarantorInformation = async ({
  userId,
  fullName,
  email,
  phone,
  dateOfBirth,
  relationshipToTenant,
  addressLine1,
  addressLine2,
  city,
  postcode,
  country = 'UK',
  employmentStatus,
  employerName,
  annualIncome,
  idDocumentUrl,
  proofOfAddressUrl,
  proofOfIncomeUrl,
  notes,
}) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('guarantor_information')
      .upsert({
        user_id: userId,
        full_name: fullName,
        email: email,
        phone: phone,
        date_of_birth: dateOfBirth,
        relationship_to_tenant: relationshipToTenant,
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        city: city,
        postcode: postcode,
        country: country,
        employment_status: employmentStatus,
        employer_name: employerName,
        annual_income: annualIncome,
        id_document_url: idDocumentUrl,
        proof_of_address_url: proofOfAddressUrl,
        proof_of_income_url: proofOfIncomeUrl,
        notes: notes,
        verification_status: 'pending',
        submitted_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error submitting guarantor information:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get guarantor information
 */
export const getGuarantorInformation = async (userId) => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    const { data, error } = await supabase
      .from('guarantor_information')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows found - this is okay
      return { data: null, error: null };
    }

    if (error) {
      const errorMsg = error.message || error.toString() || '';
      if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
        return { data: null, error: 'Guarantor information table not found. Please run the SQL schema in Supabase.' };
      }
      throw error;
    }

    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error fetching guarantor information:', error);
    const errorMsg = error.message || error.toString() || '';
    if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
      return { data: null, error: 'Guarantor information table not found. Please run the SQL schema in Supabase.' };
    }
    return { data: null, error: error.message || 'Failed to fetch guarantor information' };
  }
};

/**
 * Get user verification status
 */
export const getUserVerificationStatus = async (userId) => {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not initialized' };
    }

    // Get or create verification status record
    let { data, error } = await supabase
      .from('user_verification_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Record doesn't exist, return default status (don't create it automatically)
      return {
        data: {
          user_id: userId,
          is_verified: false,
          verification_level: 'none',
          brp_verified: false,
          passport_verified: false,
          utility_bill_verified: false,
          guarantor_verified: false,
          documents: [],
          guarantor: null,
        },
        error: null,
      };
    } else if (error) {
      // Check if table doesn't exist
      const errorMsg = error.message || error.toString() || '';
      if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
        return {
          data: {
            user_id: userId,
            is_verified: false,
            verification_level: 'none',
            brp_verified: false,
            passport_verified: false,
            utility_bill_verified: false,
            guarantor_verified: false,
            documents: [],
            guarantor: null,
          },
          error: 'Verification tables not found. Please run the SQL schema in Supabase.',
        };
      }
      throw error;
    }

    // Also fetch document statuses for detailed view (handle errors gracefully)
    let documents = [];
    try {
      const { data: docsData } = await supabase
        .from('user_verification_documents')
        .select('document_type, verification_status, verified_at, rejection_reason')
        .eq('user_id', userId);
      documents = docsData || [];
    } catch (docsError) {
      console.warn('Error fetching documents:', docsError);
      documents = [];
    }

    let guarantor = null;
    try {
      const { data: guarantorData } = await supabase
        .from('guarantor_information')
        .select('verification_status, verified_at, rejection_reason')
        .eq('user_id', userId)
        .single();
      guarantor = guarantorData || null;
    } catch (guarantorError) {
      // It's okay if no guarantor info exists
      if (guarantorError.code !== 'PGRST116') {
        console.warn('Error fetching guarantor info:', guarantorError);
      }
      guarantor = null;
    }

    return {
      data: {
        ...data,
        documents: documents || [],
        guarantor: guarantor || null,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching verification status:', error);
    const errorMsg = error.message || error.toString() || '';
    if (errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
      return {
        data: {
          user_id: userId,
          is_verified: false,
          verification_level: 'none',
          brp_verified: false,
          passport_verified: false,
          utility_bill_verified: false,
          guarantor_verified: false,
          documents: [],
          guarantor: null,
        },
        error: 'Verification tables not found. Please run the SQL schema in Supabase.',
      };
    }
    return { data: null, error: error.message || 'Failed to fetch verification status' };
  }
};

/**
 * Delete verification document
 */
export const deleteVerificationDocument = async (userId, documentType) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Get document to delete file from storage
    const { data: document } = await supabase
      .from('user_verification_documents')
      .select('document_url')
      .eq('user_id', userId)
      .eq('document_type', documentType)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('user_verification_documents')
      .delete()
      .eq('user_id', userId)
      .eq('document_type', documentType);

    if (error) throw error;

    // Delete file from storage if URL exists
    if (document?.document_url) {
      // Extract path from URL and delete
      try {
        const pathMatch = document.document_url.match(/verification-documents\/(.+)$/);
        if (pathMatch) {
          await supabase.storage
            .from('verification-documents')
            .remove([pathMatch[1]]);
        }
      } catch (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Don't throw - database record is deleted
      }
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting verification document:', error);
    return { error: error.message };
  }
};

