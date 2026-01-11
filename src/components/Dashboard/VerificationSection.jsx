import React, { useState, useEffect, useRef } from 'react';
import { Shield, Upload, X, CheckCircle, Clock, XCircle, FileText, User, Home, DollarSign, AlertCircle, Loader2, Info, Mail, Phone, CreditCard, MapPin, Building, ArrowRight } from 'lucide-react';

const VerificationSection = ({ userId, currentUser }) => {
  // Simplified state - no external service dependency
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
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

  // Verification step component
  const VerificationStep = ({ step, title, description, icon: Icon, actionLabel, onAction, isLast = false }) => {
    const stepData = verificationSteps[step];
    const isCompleted = stepData?.completed;
    const status = stepData?.status;

    return (
      <div className="relative">
        <div className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
          isCompleted 
            ? 'bg-green-50 border-green-200' 
            : 'bg-white border-gray-200 hover:border-orange-300'
        }`}>
          {/* Step indicator */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {isCompleted ? (
              <CheckCircle size={20} />
            ) : (
              <Icon size={20} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                  {title}
                </h4>
                <p className={`text-sm mt-0.5 ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {isCompleted ? 'Completed' : description}
                </p>
              </div>
              
              {!isCompleted && onAction && (
                <button
                  onClick={onAction}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {actionLabel}
                  <ArrowRight size={16} />
                </button>
              )}
              
              {isCompleted && (
                <span className="flex-shrink-0 flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle size={14} />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Connector line */}
        {!isLast && (
          <div className={`absolute left-7 top-14 w-0.5 h-4 ${
            isCompleted ? 'bg-green-300' : 'bg-gray-200'
          }`} />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account Verification</h2>
              <p className="text-orange-100 text-sm mt-0.5">Complete these steps to verify your account</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completionPercentage}%</div>
            <div className="text-orange-100 text-sm">Complete</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <p className="text-green-700 text-sm">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X size={18} />
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
          onAction={() => setSuccess('Verification email sent! Please check your inbox.')}
        />

        <VerificationStep
          step="phone"
          title="Phone Verification"
          description="Add and verify your phone number"
          icon={Phone}
          actionLabel="Add Phone"
          onAction={() => {}}
        />

        <VerificationStep
          step="identity"
          title="Identity Verification"
          description="Upload a valid government ID (Passport, Driving License, or BRP)"
          icon={CreditCard}
          actionLabel="Upload ID"
          onAction={() => {}}
        />

        <VerificationStep
          step="address"
          title="Address Verification"
          description="Provide proof of address (Utility bill or bank statement)"
          icon={MapPin}
          actionLabel="Upload Proof"
          onAction={() => {}}
          isLast={true}
        />
      </div>

      {/* Benefits Section */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <h3 className="font-medium text-gray-900 mb-3">Benefits of Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="text-orange-600" size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">Trusted Profile</p>
              <p className="text-gray-500 text-xs">Stand out to landlords</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="text-orange-600" size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">Faster Applications</p>
              <p className="text-gray-500 text-xs">Pre-verified for quick processing</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="text-orange-600" size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">Priority Access</p>
              <p className="text-gray-500 text-xs">Get access to exclusive listings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSection;

