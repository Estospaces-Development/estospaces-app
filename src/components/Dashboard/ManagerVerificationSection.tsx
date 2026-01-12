/**
 * Manager Verification Section
 * Complete verification form for managers (Brokers and Companies)
 */

import React, { useState, useRef } from 'react';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Building2, 
  User,
  AlertCircle, 
  Loader2,
  Eye,
  Trash2,
  Calendar,
  Hash,
  Info,
  ChevronRight
} from 'lucide-react';
import { useManagerVerification } from '../../contexts/ManagerVerificationContext';
import { 
  getDocumentTypeName, 
  getStatusDisplayName,
  type DocumentType,
  type ManagerProfileType,
  type VerificationStatus
} from '../../services/managerVerificationService';

// ============================================================================
// Main Component
// ============================================================================

const ManagerVerificationSection: React.FC = () => {
  const {
    managerProfile,
    documents,
    verificationStatus,
    isLoading,
    error,
    requiredDocuments,
    missingDocuments,
    isComplete,
    canSubmit,
    createProfile,
    updateProfile,
    uploadDocument,
    deleteDocument,
    submitForVerification,
    getDocumentByType,
    getDocumentStatus,
  } = useManagerVerification();
  
  const [activeStep, setActiveStep] = useState<'type' | 'info' | 'documents' | 'review'>('type');
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  
  // Determine current step based on profile state
  React.useEffect(() => {
    if (!managerProfile) {
      setActiveStep('type');
    } else if (verificationStatus === 'incomplete' && missingDocuments.length > 0) {
      setActiveStep('documents');
    } else if (verificationStatus === 'incomplete' && isComplete) {
      setActiveStep('review');
    } else {
      setActiveStep('review');
    }
  }, [managerProfile, verificationStatus, missingDocuments, isComplete]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading verification status...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-orange-600 dark:text-orange-400" size={28} />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Profile Verification
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete your verification to build trust with clients
            </p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <ProgressSteps 
          currentStep={activeStep} 
          profileType={managerProfile?.profile_type}
          status={verificationStatus}
        />
      </div>
      
      {/* Error/Success Messages */}
      {(error || submitError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-400">{error || submitError}</p>
          </div>
        </div>
      )}
      
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm text-green-700 dark:text-green-400">{submitSuccess}</p>
          </div>
        </div>
      )}
      
      {/* Rejection Notice */}
      {verificationStatus === 'rejected' && managerProfile?.rejection_reason && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">Verification Rejected</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                {managerProfile.rejection_reason}
              </p>
              {managerProfile.revision_notes && (
                <p className="text-sm text-red-600 dark:text-red-300 mt-2">
                  <strong>Notes:</strong> {managerProfile.revision_notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Step Content */}
      {!managerProfile ? (
        <ProfileTypeSelection 
          onSelect={async (type) => {
            const result = await createProfile(type);
            if (result.error) {
              setSubmitError(result.error);
            }
          }}
        />
      ) : (
        <>
          {/* Profile Info Section */}
          <ProfileInfoSection 
            profile={managerProfile}
            onUpdate={updateProfile}
            disabled={verificationStatus === 'under_review' || verificationStatus === 'approved'}
          />
          
          {/* Documents Section */}
          <DocumentsSection
            profileType={managerProfile.profile_type}
            documents={documents}
            requiredDocuments={requiredDocuments}
            onUpload={async (file, type, metadata) => {
              setUploading(prev => ({ ...prev, [type]: true }));
              setSubmitError(null);
              try {
                const result = await uploadDocument(file, type, metadata);
                if (result.error) {
                  setSubmitError(result.error);
                } else {
                  setSubmitSuccess(`${getDocumentTypeName(type)} uploaded successfully!`);
                  setTimeout(() => setSubmitSuccess(null), 3000);
                }
              } finally {
                setUploading(prev => ({ ...prev, [type]: false }));
              }
            }}
            onDelete={async (type) => {
              setUploading(prev => ({ ...prev, [type]: true }));
              try {
                const result = await deleteDocument(type);
                if (result.error) {
                  setSubmitError(result.error);
                }
              } finally {
                setUploading(prev => ({ ...prev, [type]: false }));
              }
            }}
            uploading={uploading}
            disabled={verificationStatus === 'under_review' || verificationStatus === 'approved'}
            getDocumentByType={getDocumentByType}
            getDocumentStatus={getDocumentStatus}
          />
          
          {/* Submit Section */}
          <SubmitSection
            status={verificationStatus}
            canSubmit={canSubmit}
            isComplete={isComplete}
            missingDocuments={missingDocuments}
            onSubmit={async () => {
              setSubmitError(null);
              const result = await submitForVerification();
              if (result.error) {
                setSubmitError(result.error);
              } else {
                setSubmitSuccess('Verification submitted successfully! We will review your documents shortly.');
              }
            }}
          />
        </>
      )}
    </div>
  );
};

// ============================================================================
// Progress Steps Component
// ============================================================================

const ProgressSteps: React.FC<{
  currentStep: string;
  profileType?: ManagerProfileType;
  status?: VerificationStatus | null;
}> = ({ currentStep, profileType, status }) => {
  const steps = [
    { id: 'type', label: 'Profile Type', icon: User },
    { id: 'info', label: 'Information', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'review', label: 'Review', icon: CheckCircle },
  ];
  
  const getStepStatus = (stepId: string) => {
    if (status === 'approved') return 'completed';
    if (status === 'submitted' || status === 'under_review') {
      return stepId === 'review' ? 'current' : 'completed';
    }
    
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };
  
  return (
    <div className="flex items-center justify-between mt-6">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(step.id);
        const Icon = step.icon;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${stepStatus === 'completed' ? 'bg-green-500 text-white' : ''}
                ${stepStatus === 'current' ? 'bg-orange-500 text-white' : ''}
                ${stepStatus === 'upcoming' ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : ''}
              `}>
                {stepStatus === 'completed' ? (
                  <CheckCircle size={16} />
                ) : (
                  <Icon size={16} />
                )}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                stepStatus === 'current' ? 'text-orange-600 dark:text-orange-400' : 
                stepStatus === 'completed' ? 'text-green-600 dark:text-green-400' :
                'text-gray-500 dark:text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                getStepStatus(steps[index + 1].id) === 'upcoming' 
                  ? 'bg-gray-200 dark:bg-gray-700' 
                  : 'bg-green-500'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================================
// Profile Type Selection
// ============================================================================

const ProfileTypeSelection: React.FC<{
  onSelect: (type: ManagerProfileType) => void;
}> = ({ onSelect }) => {
  const [loading, setLoading] = useState<ManagerProfileType | null>(null);
  
  const handleSelect = async (type: ManagerProfileType) => {
    setLoading(type);
    await onSelect(type);
    setLoading(null);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Select Your Profile Type
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Choose the type of manager profile that best describes you. This determines what documents you'll need to provide.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Broker Option */}
        <button
          onClick={() => handleSelect('broker')}
          disabled={loading !== null}
          className={`
            p-6 rounded-lg border-2 text-left transition-all
            ${loading === 'broker' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 
              'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <User className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Broker / Agent
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Individual real estate professional with a valid broker license.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">Required Documents:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Government-issued ID</li>
                  <li>Broker/Real Estate License</li>
                </ul>
              </div>
            </div>
            {loading === 'broker' ? (
              <Loader2 className="animate-spin text-orange-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-400" size={20} />
            )}
          </div>
        </button>
        
        {/* Company Option */}
        <button
          onClick={() => handleSelect('company')}
          disabled={loading !== null}
          className={`
            p-6 rounded-lg border-2 text-left transition-all
            ${loading === 'company' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 
              'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Company / Organization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Property management firm or real estate company.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">Required Documents:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Company Registration Certificate</li>
                  <li>Business License</li>
                  <li>Tax Certificate</li>
                  <li>Representative ID</li>
                </ul>
              </div>
            </div>
            {loading === 'company' ? (
              <Loader2 className="animate-spin text-orange-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-400" size={20} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Profile Info Section
// ============================================================================

const ProfileInfoSection: React.FC<{
  profile: NonNullable<ReturnType<typeof useManagerVerification>['managerProfile']>;
  onUpdate: (data: Record<string, unknown>) => Promise<{ error: string | null }>;
  disabled: boolean;
}> = ({ profile, onUpdate, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    license_number: profile.license_number || '',
    license_expiry_date: profile.license_expiry_date || '',
    association_membership_id: profile.association_membership_id || '',
    company_registration_number: profile.company_registration_number || '',
    tax_id: profile.tax_id || '',
    company_address: profile.company_address || '',
    authorized_representative_name: profile.authorized_representative_name || '',
    authorized_representative_email: profile.authorized_representative_email || '',
  });
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    
    // Convert empty strings to null for database compatibility
    const cleanedData: Record<string, unknown> = {};
    Object.entries(formData).forEach(([key, value]) => {
      // Convert empty strings to null, especially for date fields
      cleanedData[key] = value === '' ? null : value;
    });
    
    const result = await onUpdate(cleanedData);
    setSaving(false);
    if (!result.error) {
      setIsEditing(false);
    }
  };
  
  const isBroker = profile.profile_type === 'broker';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isBroker ? (
            <User className="text-orange-600 dark:text-orange-400" size={24} />
          ) : (
            <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isBroker ? 'Broker Information' : 'Company Information'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isBroker ? 'Your professional license details' : 'Your company registration details'}
            </p>
          </div>
        </div>
        {!disabled && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          {isBroker ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Number *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter license number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Expiry Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="date"
                      value={formData.license_expiry_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, license_expiry_date: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Association Membership ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.association_membership_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, association_membership_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., ARLA, RICS membership"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.company_registration_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_registration_number: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., 12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tax ID / VAT Number *
                  </label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., GB123456789"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Address
                </label>
                <input
                  type="text"
                  value={formData.company_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Full company address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Authorized Representative Name *
                  </label>
                  <input
                    type="text"
                    value={formData.authorized_representative_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorized_representative_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Representative Email *
                  </label>
                  <input
                    type="email"
                    value={formData.authorized_representative_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, authorized_representative_email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="email@company.com"
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isBroker ? (
            <>
              <InfoField label="License Number" value={profile.license_number} />
              <InfoField label="License Expiry" value={profile.license_expiry_date} />
              <InfoField label="Association Membership" value={profile.association_membership_id} />
            </>
          ) : (
            <>
              <InfoField label="Registration Number" value={profile.company_registration_number} />
              <InfoField label="Tax ID" value={profile.tax_id} />
              <InfoField label="Company Address" value={profile.company_address} fullWidth />
              <InfoField label="Representative" value={profile.authorized_representative_name} />
              <InfoField label="Representative Email" value={profile.authorized_representative_email} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

const InfoField: React.FC<{ label: string; value?: string | null; fullWidth?: boolean }> = ({ 
  label, 
  value,
  fullWidth 
}) => (
  <div className={fullWidth ? 'md:col-span-2' : ''}>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="font-medium text-gray-900 dark:text-gray-100">
      {value || <span className="text-gray-400 italic">Not provided</span>}
    </p>
  </div>
);

// ============================================================================
// Documents Section
// ============================================================================

const DocumentsSection: React.FC<{
  profileType: ManagerProfileType;
  documents: ReturnType<typeof useManagerVerification>['documents'];
  requiredDocuments: DocumentType[];
  onUpload: (file: File, type: DocumentType, metadata?: { documentNumber?: string; expiryDate?: string }) => Promise<void>;
  onDelete: (type: DocumentType) => Promise<void>;
  uploading: Record<string, boolean>;
  disabled: boolean;
  getDocumentByType: (type: DocumentType) => ReturnType<typeof useManagerVerification>['documents'][0] | undefined;
  getDocumentStatus: (type: DocumentType) => string;
}> = ({ 
  profileType, 
  requiredDocuments, 
  onUpload, 
  onDelete, 
  uploading, 
  disabled,
  getDocumentByType,
  getDocumentStatus,
}) => {
  const optionalDocuments: DocumentType[] = ['address_proof'];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="text-orange-600 dark:text-orange-400" size={24} />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Required Documents
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload clear, legible copies of the following documents
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {requiredDocuments.map(docType => (
          <DocumentUploadCard
            key={docType}
            documentType={docType}
            document={getDocumentByType(docType)}
            status={getDocumentStatus(docType)}
            onUpload={onUpload}
            onDelete={onDelete}
            uploading={uploading[docType]}
            disabled={disabled}
            required
          />
        ))}
        
        {optionalDocuments.length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Optional Documents
              </p>
            </div>
            {optionalDocuments.map(docType => (
              <DocumentUploadCard
                key={docType}
                documentType={docType}
                document={getDocumentByType(docType)}
                status={getDocumentStatus(docType)}
                onUpload={onUpload}
                onDelete={onDelete}
                uploading={uploading[docType]}
                disabled={disabled}
                required={false}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Document Upload Card
// ============================================================================

const DocumentUploadCard: React.FC<{
  documentType: DocumentType;
  document?: ReturnType<typeof useManagerVerification>['documents'][0];
  status: string;
  onUpload: (file: File, type: DocumentType, metadata?: { documentNumber?: string; expiryDate?: string }) => Promise<void>;
  onDelete: (type: DocumentType) => Promise<void>;
  uploading?: boolean;
  disabled: boolean;
  required: boolean;
}> = ({ 
  documentType, 
  document, 
  status, 
  onUpload, 
  onDelete, 
  uploading, 
  disabled,
  required 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState({ documentNumber: '', expiryDate: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const statusConfig = getStatusConfig(status);
  const needsExpiry = ['broker_license', 'business_license'].includes(documentType);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Store the file in state to persist across re-renders
    setSelectedFile(file);
    
    if (needsExpiry && !metadata.expiryDate) {
      setShowMetadata(true);
      return;
    }
    
    // If no metadata needed, upload directly
    await onUpload(file, documentType, metadata);
    setSelectedFile(null);
    setMetadata({ documentNumber: '', expiryDate: '' });
    setShowMetadata(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleUploadWithMetadata = async () => {
    // Use the stored file from state instead of file input
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }
    
    await onUpload(selectedFile, documentType, metadata);
    setSelectedFile(null);
    setMetadata({ documentNumber: '', expiryDate: '' });
    setShowMetadata(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
            <statusConfig.icon className={statusConfig.textColor} size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {getDocumentTypeName(documentType)}
              </h3>
              {required && (
                <span className="text-xs text-red-500">*Required</span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getDocumentDescription(documentType)}
            </p>
            {document && (
              <p className="text-xs text-gray-400 mt-1">
                Uploaded: {new Date(document.submitted_at).toLocaleDateString()}
                {document.expiry_date && ` · Expires: ${new Date(document.expiry_date).toLocaleDateString()}`}
              </p>
            )}
            {document?.rejection_reason && (
              <p className="text-xs text-red-500 mt-1">
                Reason: {document.rejection_reason}
              </p>
            )}
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
          {statusConfig.label}
        </div>
      </div>
      
      {/* Metadata form for documents that need expiry dates */}
      {showMetadata && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
          {/* Show selected file name */}
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText size={16} />
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-gray-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
          {needsExpiry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                value={metadata.expiryDate}
                onChange={(e) => setMetadata(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Number (Optional)
            </label>
            <input
              type="text"
              value={metadata.documentNumber}
              onChange={(e) => setMetadata(prev => ({ ...prev, documentNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Enter document number"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUploadWithMetadata}
              disabled={(needsExpiry && !metadata.expiryDate) || !selectedFile || uploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowMetadata(false);
                setSelectedFile(null);
                setMetadata({ documentNumber: '', expiryDate: '' });
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={uploading}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Actions */}
      {!disabled && status !== 'approved' && !showMetadata && (
        <div className="mt-3 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={14} />
                {document ? 'Replace' : 'Upload'}
              </>
            )}
          </button>
          
          {document && (
            <>
              <a
                href={document.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Eye size={14} />
                View
              </a>
              {status !== 'under_review' && (
                <button
                  onClick={() => onDelete(documentType)}
                  disabled={uploading}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )}
      
      {status === 'approved' && document && (
        <div className="mt-3">
          <a
            href={document.document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:underline"
          >
            <Eye size={14} />
            View Document
          </a>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Submit Section
// ============================================================================

const SubmitSection: React.FC<{
  status: VerificationStatus | null;
  canSubmit: boolean;
  isComplete: boolean;
  missingDocuments: DocumentType[];
  onSubmit: () => Promise<void>;
}> = ({ status, canSubmit, isComplete, missingDocuments, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit();
    setSubmitting(false);
  };
  
  // Already submitted or approved
  if (status === 'submitted' || status === 'under_review') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              {status === 'submitted' ? 'Verification Submitted' : 'Under Review'}
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your documents are being reviewed. We'll notify you once the review is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (status === 'approved') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-200">
              Verification Approved
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your profile has been verified. You have full access to all features.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Submit for Verification
      </h2>
      
      {!isComplete && missingDocuments.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Missing Documents
              </p>
              <ul className="text-sm text-orange-700 dark:text-orange-300 mt-1 list-disc list-inside">
                {missingDocuments.map(doc => (
                  <li key={doc}>{getDocumentTypeName(doc)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Once you submit, your documents will be reviewed by our team. You won't be able to edit your documents during the review process.
      </p>
      
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Submitting...
          </>
        ) : (
          <>
            <Shield size={18} />
            Submit for Verification
          </>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'approved':
      return {
        label: 'Approved',
        icon: CheckCircle,
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-600 dark:text-green-400',
      };
    case 'rejected':
    case 'reupload_required':
      return {
        label: status === 'rejected' ? 'Rejected' : 'Re-upload Required',
        icon: XCircle,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-600 dark:text-red-400',
      };
    case 'pending':
    case 'under_review':
      return {
        label: status === 'pending' ? 'Pending' : 'Under Review',
        icon: Clock,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-600 dark:text-yellow-400',
      };
    default:
      return {
        label: 'Not Uploaded',
        icon: Upload,
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        textColor: 'text-gray-500 dark:text-gray-400',
      };
  }
};

const getDocumentDescription = (type: DocumentType): string => {
  const descriptions: Record<DocumentType, string> = {
    government_id: 'Passport, National ID, or Driver License',
    broker_license: 'Valid real estate broker/agent license',
    company_registration: 'Certificate of Incorporation or Registration',
    business_license: 'Business operating license',
    tax_certificate: 'Tax registration certificate or VAT certificate',
    representative_id: 'ID of the authorized company representative',
    address_proof: 'Utility bill or bank statement (within 3 months)',
  };
  return descriptions[type] || '';
};

export default ManagerVerificationSection;
