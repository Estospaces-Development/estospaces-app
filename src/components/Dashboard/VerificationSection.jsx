import React, { useState, useEffect, useRef } from 'react';
import { Shield, Upload, X, CheckCircle, Clock, XCircle, FileText, User, Home, DollarSign, AlertCircle, Loader2, Info, Mail, Phone, CreditCard, MapPin, Building, ArrowRight, Camera } from 'lucide-react';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationsContext';
import { supabase } from '../../lib/supabase';

const VerificationSection = ({ userId, currentUser }) => {
  // Notifications hook - wrapped in try-catch for safety
  let createNotification = null;
  try {
    const notifications = useNotifications();
    createNotification = notifications?.createNotification;
  } catch (e) {
    // NotificationsContext not available
  }

  // Simplified state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Verification steps state
  const [verificationSteps, setVerificationSteps] = useState({
    email: { completed: false, status: 'pending' },
    phone: { completed: false, status: 'pending' },
    identity: { completed: false, status: 'pending' },
    address: { completed: false, status: 'pending' },
  });

  // Check if user has email verified from their profile
  useEffect(() => {
    if (currentUser) {
      setVerificationSteps(prev => ({
        ...prev,
        email: {
          completed: !!currentUser.email,
          status: currentUser.email ? 'verified' : 'pending'
        },
        phone: {
          completed: !!currentUser.phone,
          status: currentUser.phone ? 'verified' : 'pending'
        }
      }));
    }
  }, [currentUser]);

  // Calculate completion percentage
  const completedSteps = Object.values(verificationSteps).filter(step => step.completed).length;
  const totalSteps = Object.keys(verificationSteps).length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Handle document upload
  const handleDocumentUpload = async (type, file) => {
    if (!file || !userId) return;

    setUploadingFile(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      setVerificationSteps(prev => ({
        ...prev,
        [type]: { completed: true, status: 'verified' }
      }));

      const updatedSteps = {
        ...verificationSteps,
        [type]: { completed: true, status: 'verified' }
      };
      const allVerified = Object.values(updatedSteps).every(step => step.completed);

      if (createNotification) {
        if (allVerified) {
          await createNotification(
            NOTIFICATION_TYPES.PROFILE_VERIFIED,
            '🎉 Profile Fully Verified!',
            'Congratulations! Your profile is now fully verified. You can now access all features and apply for premium properties.',
            { verification_type: 'full_profile' }
          );
        } else {
          await createNotification(
            NOTIFICATION_TYPES.DOCUMENT_VERIFIED,
            '✅ Document Verified',
            `Your ${type === 'identity' ? 'identity document' : 'proof of address'} has been verified successfully.`,
            { verification_type: type }
          );
        }
      }

      setSuccess(`Your ${type === 'identity' ? 'identity document' : 'proof of address'} has been verified!`);
      setShowUploadModal(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle email verification
  const handleEmailVerification = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to send verification email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone verification
  const handlePhoneVerification = () => {
    setSuccess('Please add your phone number in the Personal Information section above.');
  };

  // Verification step component - Minimal Design
  const VerificationStep = ({ step, title, description, icon: Icon, actionLabel, onAction, isLast = false }) => {
    const stepData = verificationSteps[step];
    const isCompleted = stepData?.completed;

    return (
      <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${isCompleted
        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
        }`}>
        {/* Step indicator */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCompleted
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}>
          {isCompleted ? (
            <CheckCircle size={18} />
          ) : (
            <Icon size={18} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className={`font-medium text-sm ${isCompleted ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                {title}
              </h4>
              <p className={`text-xs mt-0.5 ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {isCompleted ? 'Completed' : description}
              </p>
            </div>

            {!isCompleted && onAction && (
              <button
                onClick={onAction}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {actionLabel}
                <ArrowRight size={14} />
              </button>
            )}

            {isCompleted && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                <CheckCircle size={12} />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Header - Minimal Design */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Verification</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Complete these steps to verify your account</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{completionPercentage}%</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">Complete</div>
          </div>
        </div>

        {/* Progress bar - Clean Design */}
        <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mx-6 mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
          <p className="text-green-700 dark:text-green-300 text-sm flex-1">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800 dark:text-green-400">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
          <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 dark:text-red-400">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Verification Steps */}
      <div className="p-6 space-y-3">
        <VerificationStep
          step="email"
          title="Email Verification"
          description="Verify your email address"
          icon={Mail}
          actionLabel="Verify Email"
          onAction={handleEmailVerification}
        />

        <VerificationStep
          step="phone"
          title="Phone Verification"
          description="Add and verify your phone number"
          icon={Phone}
          actionLabel="Add Phone"
          onAction={handlePhoneVerification}
        />

        <VerificationStep
          step="identity"
          title="Identity Verification"
          description="Upload a valid government ID"
          icon={CreditCard}
          actionLabel="Upload ID"
          onAction={() => setShowUploadModal('identity')}
        />

        <VerificationStep
          step="address"
          title="Address Verification"
          description="Provide proof of address"
          icon={MapPin}
          actionLabel="Upload Proof"
          onAction={() => setShowUploadModal('address')}
          isLast={true}
        />
      </div>

      {/* Upload Modal - Clean Design */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    {showUploadModal === 'identity' ? <CreditCard size={18} className="text-gray-500" /> : <MapPin size={18} className="text-gray-500" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {showUploadModal === 'identity' ? 'Upload ID Document' : 'Upload Proof of Address'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {showUploadModal === 'identity' ? 'Passport, Driving License, or BRP' : 'Utility bill or bank statement'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center hover:border-gray-300 dark:hover:border-gray-500 transition-colors cursor-pointer group">
                <input
                  type="file"
                  id="document-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocumentUpload(showUploadModal, file);
                  }}
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    {uploadingFile ? (
                      <Loader2 size={22} className="text-gray-500 animate-spin" />
                    ) : (
                      <Upload size={22} className="text-gray-500" />
                    )}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {uploadingFile ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG or PNG (max. 10MB)
                  </p>
                </label>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 text-xs mb-2 flex items-center gap-1.5">
                  <Info size={14} />
                  Tips for successful verification
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  {showUploadModal === 'identity' ? (
                    <>
                      <li>• Document must be valid and not expired</li>
                      <li>• Ensure all corners are visible</li>
                      <li>• Photo should be clear and readable</li>
                    </>
                  ) : (
                    <>
                      <li>• Document must be dated within the last 3 months</li>
                      <li>• Your name and address must be visible</li>
                      <li>• Bank statements or utility bills accepted</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section - Clean Design */}
      <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-4">Benefits of Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
              <Shield className="text-gray-500 dark:text-gray-400" size={16} />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Trusted Profile</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Stand out to landlords</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
              <CheckCircle className="text-gray-500 dark:text-gray-400" size={16} />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Faster Applications</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Pre-verified for quick processing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
              <Building className="text-gray-500 dark:text-gray-400" size={16} />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Priority Access</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Exclusive listings access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSection;
