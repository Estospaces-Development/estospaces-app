import React, { useState, useEffect, useRef } from 'react';
import { Shield, Upload, X, CheckCircle, Clock, XCircle, FileText, User, Home, DollarSign, AlertCircle, Loader2, Info } from 'lucide-react';
import * as verificationService from '../../services/verificationService';

const VerificationSection = ({ userId, currentUser }) => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [guarantorInfo, setGuarantorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [activeTab, setActiveTab] = useState('status');
  const [showGuarantorForm, setShowGuarantorForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // File refs
  const brpRef = useRef(null);
  const passportRef = useRef(null);
  const utilityBillRef = useRef(null);
  const guarantorIdRef = useRef(null);
  const guarantorAddressRef = useRef(null);
  const guarantorIncomeRef = useRef(null);

  // Guarantor form state
  const [guarantorForm, setGuarantorForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    relationshipToTenant: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: 'UK',
    employmentStatus: '',
    employerName: '',
    annualIncome: '',
    notes: '',
  });

  // Load verification status
  useEffect(() => {
    if (userId) {
      loadVerificationStatus();
    }
  }, [userId]);

  const loadVerificationStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch data with error handling - continue even if some fail
      const [statusResult, documentsResult, guarantorResult] = await Promise.allSettled([
        verificationService.getUserVerificationStatus(userId),
        verificationService.getUserVerificationDocuments(userId),
        verificationService.getGuarantorInformation(userId),
      ]);

      // Handle status result
      if (statusResult.status === 'fulfilled' && !statusResult.value.error) {
        setVerificationStatus(statusResult.value.data);
      } else if (statusResult.status === 'fulfilled' && statusResult.value.error) {
        // If tables don't exist, create empty status
        if (statusResult.value.error.includes('relation') || statusResult.value.error.includes('does not exist')) {
          setVerificationStatus({
            user_id: userId,
            is_verified: false,
            verification_level: 'none',
            brp_verified: false,
            passport_verified: false,
            utility_bill_verified: false,
            guarantor_verified: false,
          });
          console.warn('Verification tables not found. Please run the SQL schema in Supabase.');
        } else {
          setError(statusResult.value.error);
        }
      } else {
        console.error('Error loading verification status:', statusResult.reason);
        // Set default status on error
        setVerificationStatus({
          user_id: userId,
          is_verified: false,
          verification_level: 'none',
          brp_verified: false,
          passport_verified: false,
          utility_bill_verified: false,
          guarantor_verified: false,
        });
      }

      // Handle documents result
      if (documentsResult.status === 'fulfilled' && !documentsResult.value.error) {
        setDocuments(documentsResult.value.data || []);
      } else if (documentsResult.status === 'fulfilled' && documentsResult.value.error) {
        if (!documentsResult.value.error.includes('relation') && !documentsResult.value.error.includes('does not exist')) {
          console.warn('Error loading documents:', documentsResult.value.error);
        }
        setDocuments([]);
      } else {
        setDocuments([]);
      }

      // Handle guarantor result
      if (guarantorResult.status === 'fulfilled' && !guarantorResult.value.error && guarantorResult.value.data) {
        setGuarantorInfo(guarantorResult.value.data);
        // Populate form with guarantor data
        setGuarantorForm(prev => ({
          ...prev,
          fullName: guarantorResult.value.data.full_name || '',
          email: guarantorResult.value.data.email || '',
          phone: guarantorResult.value.data.phone || '',
          dateOfBirth: guarantorResult.value.data.date_of_birth || '',
          relationshipToTenant: guarantorResult.value.data.relationship_to_tenant || '',
          addressLine1: guarantorResult.value.data.address_line_1 || '',
          addressLine2: guarantorResult.value.data.address_line_2 || '',
          city: guarantorResult.value.data.city || '',
          postcode: guarantorResult.value.data.postcode || '',
          country: guarantorResult.value.data.country || 'UK',
          employmentStatus: guarantorResult.value.data.employment_status || '',
          employerName: guarantorResult.value.data.employer_name || '',
          annualIncome: guarantorResult.value.data.annual_income || '',
          notes: guarantorResult.value.data.notes || '',
        }));
      } else {
        setGuarantorInfo(null);
      }
    } catch (err) {
      console.error('Error loading verification status:', err);
      // Set default values on error to prevent infinite loading
      setVerificationStatus({
        user_id: userId,
        is_verified: false,
        verification_level: 'none',
        brp_verified: false,
        passport_verified: false,
        utility_bill_verified: false,
        guarantor_verified: false,
      });
      setDocuments([]);
      setGuarantorInfo(null);
      // Only show error if it's not a table-not-found error
      if (!err.message || (!err.message.includes('relation') && !err.message.includes('does not exist'))) {
        setError(err.message || 'Failed to load verification status');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentType, file, documentNumber = null) => {
    if (!file || !userId) return;

    setUploading(prev => ({ ...prev, [documentType]: true }));
    setError(null);
    setSuccess(null);

    try {
      // Upload file
      const uploadResult = await verificationService.uploadVerificationDocument(file, userId, documentType);
      if (uploadResult.error) throw new Error(uploadResult.error);

      // Submit document
      const submitResult = await verificationService.submitVerificationDocument({
        userId,
        documentType,
        documentUrl: uploadResult.url,
        documentName: file.name,
        documentNumber,
        metadata: {},
      });

      if (submitResult.error) throw new Error(submitResult.error);

      setSuccess(`${documentType === 'brp' ? 'BRP' : documentType === 'passport' ? 'Passport' : 'Utility Bill'} uploaded successfully!`);
      await loadVerificationStatus();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleGuarantorSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setUploading(prev => ({ ...prev, guarantor: true }));
    setError(null);
    setSuccess(null);

    try {
      // Upload documents if selected
      let idDocumentUrl = null;
      let proofOfAddressUrl = null;
      let proofOfIncomeUrl = null;

      if (guarantorIdRef.current?.files?.[0]) {
        const uploadResult = await verificationService.uploadVerificationDocument(
          guarantorIdRef.current.files[0],
          userId,
          'guarantor_id'
        );
        if (uploadResult.error) throw new Error(uploadResult.error);
        idDocumentUrl = uploadResult.url;
      }

      if (guarantorAddressRef.current?.files?.[0]) {
        const uploadResult = await verificationService.uploadVerificationDocument(
          guarantorAddressRef.current.files[0],
          userId,
          'guarantor_address'
        );
        if (uploadResult.error) throw new Error(uploadResult.error);
        proofOfAddressUrl = uploadResult.url;
      }

      if (guarantorIncomeRef.current?.files?.[0]) {
        const uploadResult = await verificationService.uploadVerificationDocument(
          guarantorIncomeRef.current.files[0],
          userId,
          'guarantor_income'
        );
        if (uploadResult.error) throw new Error(uploadResult.error);
        proofOfIncomeUrl = uploadResult.url;
      }

      // Submit guarantor information
      const submitResult = await verificationService.submitGuarantorInformation({
        userId,
        fullName: guarantorForm.fullName,
        email: guarantorForm.email,
        phone: guarantorForm.phone,
        dateOfBirth: guarantorForm.dateOfBirth || null,
        relationshipToTenant: guarantorForm.relationshipToTenant,
        addressLine1: guarantorForm.addressLine1,
        addressLine2: guarantorForm.addressLine2 || null,
        city: guarantorForm.city,
        postcode: guarantorForm.postcode,
        country: guarantorForm.country,
        employmentStatus: guarantorForm.employmentStatus || null,
        employerName: guarantorForm.employerName || null,
        annualIncome: guarantorForm.annualIncome ? parseFloat(guarantorForm.annualIncome) : null,
        idDocumentUrl,
        proofOfAddressUrl,
        proofOfIncomeUrl,
        notes: guarantorForm.notes || null,
      });

      if (submitResult.error) throw new Error(submitResult.error);

      setSuccess('Guarantor information submitted successfully!');
      setShowGuarantorForm(false);
      await loadVerificationStatus();
    } catch (err) {
      console.error('Error submitting guarantor information:', err);
      setError(err.message || 'Failed to submit guarantor information');
    } finally {
      setUploading(prev => ({ ...prev, guarantor: false }));
    }
  };

  const getDocumentStatus = (documentType) => {
    const doc = documents.find(d => d.document_type === documentType);
    if (!doc) return { status: 'not_submitted', icon: Clock, color: 'gray' };
    
    switch (doc.verification_status) {
      case 'verified':
        return { status: 'verified', icon: CheckCircle, color: 'green', verifiedAt: doc.verified_at };
      case 'under_review':
        return { status: 'under_review', icon: Clock, color: 'yellow', submittedAt: doc.submitted_at };
      case 'rejected':
        return { status: 'rejected', icon: XCircle, color: 'red', rejectionReason: doc.rejection_reason };
      default:
        return { status: 'pending', icon: Clock, color: 'gray', submittedAt: doc.submitted_at };
    }
  };

  const getGuarantorStatus = () => {
    if (!guarantorInfo) return { status: 'not_submitted', icon: Clock, color: 'gray' };
    
    switch (guarantorInfo.verification_status) {
      case 'verified':
        return { status: 'verified', icon: CheckCircle, color: 'green', verifiedAt: guarantorInfo.verified_at };
      case 'under_review':
        return { status: 'under_review', icon: Clock, color: 'yellow', submittedAt: guarantorInfo.submitted_at };
      case 'rejected':
        return { status: 'rejected', icon: XCircle, color: 'red', rejectionReason: guarantorInfo.rejection_reason };
      default:
        return { status: 'pending', icon: Clock, color: 'gray', submittedAt: guarantorInfo.submitted_at };
    }
  };

  const DocumentUploadCard = ({ title, description, documentType, icon: Icon, documentNumberLabel = null }) => {
    const docStatus = getDocumentStatus(documentType);
    const StatusIcon = docStatus.icon;
    const statusColors = {
      green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      gray: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    };

    const [docNumber, setDocNumber] = useState('');

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Icon className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[docStatus.color]}`}>
            <StatusIcon size={14} />
            <span className="capitalize">{docStatus.status.replace('_', ' ')}</span>
          </div>
        </div>

        {docStatus.status === 'rejected' && docStatus.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Rejection Reason:</strong> {docStatus.rejectionReason}
            </p>
          </div>
        )}

        {docStatus.status === 'verified' && docStatus.verifiedAt && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">
              Verified on {new Date(docStatus.verifiedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {docStatus.status !== 'verified' && (
          <div className="space-y-4">
            {documentNumberLabel && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {documentNumberLabel}
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder={`Enter ${documentNumberLabel.toLowerCase()}`}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
            <input
              ref={documentType === 'brp' ? brpRef : documentType === 'passport' ? passportRef : utilityBillRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleDocumentUpload(documentType, file, docNumber || null);
                }
              }}
              id={`${documentType}-upload`}
            />
            <label
              htmlFor={`${documentType}-upload`}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                uploading[documentType]
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {uploading[documentType] ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>{docStatus.status === 'not_submitted' ? 'Upload Document' : 'Replace Document'}</span>
                </>
              )}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Accepted formats: JPG, PNG, PDF (Max 10MB)
            </p>
          </div>
        )}
      </div>
    );
  };

  // Show loading only on initial load, then show content even if there are errors
  if (loading && !verificationStatus) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading verification status...</span>
        </div>
      </div>
    );
  }

  // Set default verification status if not loaded
  const displayVerificationStatus = verificationStatus || {
    user_id: userId,
    is_verified: false,
    verification_level: 'none',
    brp_verified: false,
    passport_verified: false,
    utility_bill_verified: false,
    guarantor_verified: false,
  };

  const guarantorStatus = getGuarantorStatus();
  const StatusIcon = guarantorStatus.icon;
  const statusColors = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    gray: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  };

  const isFullyVerified = displayVerificationStatus?.is_verified || false;
  const verificationLevel = displayVerificationStatus?.verification_level || 'none';

  return (
    <div className="space-y-6">
      {/* Overall Verification Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="text-orange-600 dark:text-orange-400" size={24} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Verification Status</h2>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            isFullyVerified
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
          }`}>
            {isFullyVerified ? 'Fully Verified' : verificationLevel === 'partial' ? 'Partially Verified' : verificationLevel === 'basic' ? 'Basic Verification' : 'Not Verified'}
          </div>
        </div>

        {isFullyVerified ? (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle size={24} className="flex-shrink-0" />
            <div>
              <p className="font-medium">All verification documents have been approved!</p>
              {displayVerificationStatus?.verified_at && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Verified on {new Date(displayVerificationStatus.verified_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Complete all required documents to become verified:
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                  <li>BRP or Passport (Identity Document)</li>
                  <li>Utility Bill (Proof of Address)</li>
                  <li>Guarantor Information & Documents</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
            <span>Verification Progress</span>
            <span>
              {[
                displayVerificationStatus?.brp_verified || displayVerificationStatus?.passport_verified,
                displayVerificationStatus?.utility_bill_verified,
                displayVerificationStatus?.guarantor_verified,
              ].filter(Boolean).length} / 3 Required Documents
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isFullyVerified ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{
                width: `${([displayVerificationStatus?.brp_verified || displayVerificationStatus?.passport_verified, displayVerificationStatus?.utility_bill_verified, displayVerificationStatus?.guarantor_verified].filter(Boolean).length / 3) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Document Uploads */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Required Documents</h3>
        
        {/* BRP Upload */}
        <DocumentUploadCard
          title="BRP (Biometric Residence Permit)"
          description="Upload a clear photo or scan of your BRP card"
          documentType="brp"
          icon={FileText}
          documentNumberLabel="BRP Number"
        />

        {/* Passport Upload */}
        <DocumentUploadCard
          title="Passport"
          description="Upload a clear photo or scan of your passport (if you don't have a BRP)"
          documentType="passport"
          icon={FileText}
          documentNumberLabel="Passport Number"
        />

        {/* Utility Bill Upload */}
        <DocumentUploadCard
          title="Utility Bill (Proof of Address)"
          description="Upload a recent utility bill (gas, electricity, water) dated within the last 3 months"
          documentType="utility_bill"
          icon={Home}
        />
      </div>

      {/* Guarantor Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <User className="text-orange-600 dark:text-orange-400" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Guarantor Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Provide details of your guarantor who can vouch for you
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[guarantorStatus.color]}`}>
            <StatusIcon size={14} />
            <span className="capitalize">{guarantorStatus.status.replace('_', ' ')}</span>
          </div>
        </div>

        {guarantorStatus.status === 'rejected' && guarantorStatus.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">
              <strong>Rejection Reason:</strong> {guarantorStatus.rejectionReason}
            </p>
          </div>
        )}

        {guarantorStatus.status === 'verified' && guarantorStatus.verifiedAt && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">
              Verified on {new Date(guarantorStatus.verifiedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {guarantorInfo && !showGuarantorForm && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Full Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{guarantorInfo.full_name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{guarantorInfo.email}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{guarantorInfo.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Relationship</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{guarantorInfo.relationship_to_tenant || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-600 dark:text-gray-400">Address</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {guarantorInfo.address_line_1}, {guarantorInfo.city}, {guarantorInfo.postcode}
                </p>
              </div>
            </div>
            {guarantorStatus.status !== 'verified' && (
              <button
                onClick={() => setShowGuarantorForm(true)}
                className="mt-4 text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                Update Information
              </button>
            )}
          </div>
        )}

        {(showGuarantorForm || !guarantorInfo) && guarantorStatus.status !== 'verified' && (
          <form onSubmit={handleGuarantorSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={guarantorForm.fullName}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={guarantorForm.email}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={guarantorForm.phone}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={guarantorForm.dateOfBirth}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relationship to Tenant *
                </label>
                <select
                  required
                  value={guarantorForm.relationshipToTenant}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, relationshipToTenant: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Employer">Employer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employment Status
                </label>
                <select
                  value={guarantorForm.employmentStatus}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, employmentStatus: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self-Employed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employer Name
                </label>
                <input
                  type="text"
                  value={guarantorForm.employerName}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, employerName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Income (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={guarantorForm.annualIncome}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, annualIncome: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={guarantorForm.addressLine1}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={guarantorForm.addressLine2}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={guarantorForm.city}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={guarantorForm.postcode}
                  onChange={(e) => setGuarantorForm(prev => ({ ...prev, postcode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Guarantor Documents */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Supporting Documents</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID Document (Passport or Driving License)
                </label>
                <input
                  ref={guarantorIdRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proof of Address (Utility Bill or Bank Statement)
                </label>
                <input
                  ref={guarantorAddressRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proof of Income (Payslip or Bank Statement)
                </label>
                <input
                  ref={guarantorIncomeRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={uploading.guarantor}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading.guarantor ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Submit Guarantor Information</span>
                  </>
                )}
              </button>
              {showGuarantorForm && (
                <button
                  type="button"
                  onClick={() => setShowGuarantorForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerificationSection;

