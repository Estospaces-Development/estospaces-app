import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, MapPin, MessageSquare, Edit, Upload, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApplications, APPLICATION_STATUS } from '../../../contexts/ApplicationsContext';
import StatusTracker from './StatusTracker';
import DocumentUpload from './DocumentUpload';

const ApplicationDetail = ({ applicationId, onClose }) => {
  const navigate = useNavigate();
  const {
    getApplication,
    updateApplication,
    submitApplication,
    withdrawApplication,
    addDocument,
    updateDocument,
    deleteDocument,
  } = useApplications();
  const { createConversation } = useMessages();

  const application = getApplication(applicationId);
  const [isEditing, setIsEditing] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  if (!application) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Application not found</p>
      </div>
    );
  }

  const canEdit = application.status === APPLICATION_STATUS.DRAFT || 
                  application.status === APPLICATION_STATUS.DOCUMENTS_REQUESTED;

  const handleMessageAgent = () => {
    if (application.conversationId) {
      navigate(`/user/dashboard/messages`);
    } else {
      createConversation(
        {
          id: application.agentId,
          name: application.agentName,
          agency: application.agentAgency,
          email: application.agentEmail,
        },
        {
          id: application.propertyId,
          title: application.propertyTitle,
          address: application.propertyAddress,
          image: application.propertyImage,
          price: application.propertyPrice,
        }
      );
      navigate(`/user/dashboard/messages`);
    }
  };

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit this application? You won\'t be able to edit it after submission.')) {
      submitApplication(applicationId);
      setIsEditing(false);
    }
  };

  const handleWithdraw = () => {
    withdrawApplication(applicationId);
    setShowWithdrawConfirm(false);
    onClose?.();
  };

  const handleDocumentUpload = (document) => {
    addDocument(applicationId, document);
  };

  const handleDocumentDelete = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(applicationId, documentId);
    }
  };

  const handleDocumentReplace = (documentId) => {
    // For now, just delete and let user upload new one
    // In production, you'd have a replace flow
    deleteDocument(applicationId, documentId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `$${price.toLocaleString()}`;
  };

  const getNextSteps = () => {
    switch (application.status) {
      case APPLICATION_STATUS.DRAFT:
        return [
          'Complete all required information',
          'Upload required documents',
          'Review and submit your application',
        ];
      case APPLICATION_STATUS.DOCUMENTS_REQUESTED:
        return [
          'Upload the requested documents',
          'Ensure documents are clear and readable',
          'Wait for document review',
        ];
      case APPLICATION_STATUS.UNDER_REVIEW:
        return [
          'Your application is being reviewed',
          'You will be notified of any updates',
          'Check back regularly for status changes',
        ];
      case APPLICATION_STATUS.APPROVED:
        return [
          'Congratulations! Your application has been approved',
          'Contact the agent to proceed with next steps',
          'Review and sign any required documents',
        ];
      default:
        return [];
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Applications</span>
          </button>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit size={16} className="inline mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
            )}
            {application.status !== APPLICATION_STATUS.WITHDRAWN &&
              application.status !== APPLICATION_STATUS.APPROVED &&
              application.status !== APPLICATION_STATUS.REJECTED && (
                <button
                  onClick={() => setShowWithdrawConfirm(true)}
                  className="px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <XCircle size={16} className="inline mr-2" />
                  Withdraw
                </button>
              )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {application.propertyTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Reference: {application.referenceId}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Status Tracker */}
          <StatusTracker status={application.status} />

          {/* Property Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Property Details
              </h2>
              <button
                onClick={() => navigate(`/user/dashboard/property/${application.propertyId}`)}
                className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium"
              >
                <span>View Property</span>
                <ExternalLink size={16} />
              </button>
            </div>
            <div className="flex gap-4">
              <img
                src={application.propertyImage}
                alt={application.propertyTitle}
                className="w-24 h-24 rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200';
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {application.propertyTitle}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin size={14} />
                  <span>{application.propertyAddress}</span>
                </div>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {formatPrice(application.propertyPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Application Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Application Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Personal Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Full Name:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {application.personalInfo?.fullName || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {application.personalInfo?.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {application.personalInfo?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Financial Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Annual Income:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {application.financialInfo?.annualIncome
                        ? `$${application.financialInfo.annualIncome.toLocaleString()}`
                        : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Employment Status:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {application.financialInfo?.employmentStatus || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Employer:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {application.financialInfo?.employer || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {application.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{application.notes}</p>
              </div>
            )}
          </div>

          {/* Documents Section */}
          {(canEdit || application.documents.length > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <DocumentUpload
                documents={application.documents}
                onUpload={handleDocumentUpload}
                onDelete={handleDocumentDelete}
                onReplace={handleDocumentReplace}
              />
            </div>
          )}

          {/* Agent Communication */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Agent Information
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {application.agentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {application.agentName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {application.agentAgency}
                  </p>
                </div>
              </div>
              <button
                onClick={handleMessageAgent}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                <MessageSquare size={16} />
                <span>Message Agent</span>
              </button>
            </div>
          </div>

          {/* Next Steps */}
          {getNextSteps().length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Next Steps
              </h2>
              <ul className="space-y-2">
                {getNextSteps().map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button (for draft applications) */}
          {application.status === APPLICATION_STATUS.DRAFT && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <button
                onClick={handleSubmit}
                className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
              >
                Submit Application
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Withdraw Application
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to withdraw this application? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Withdraw Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;

