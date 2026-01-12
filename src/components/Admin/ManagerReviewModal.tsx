/**
 * Manager Review Modal
 * Admin modal for reviewing manager verification documents
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building2,
  FileText,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar,
  Hash,
  Mail,
  ChevronDown,
  ChevronUp,
  History,
  MessageSquare
} from 'lucide-react';
import * as managerVerificationService from '../../services/managerVerificationService';
import { useAuth } from '../../contexts/AuthContext';
import type { 
  ManagerProfile, 
  ManagerDocument, 
  AuditLogEntry,
  DocumentType 
} from '../../services/managerVerificationService';

// ============================================================================
// Types
// ============================================================================

interface ManagerReviewModalProps {
  managerId: string;
  onClose: () => void;
}

interface ReviewDetails {
  profile: ManagerProfile | null;
  documents: ManagerDocument[];
  auditLog: AuditLogEntry[];
  userInfo: { email?: string; full_name?: string } | null;
}

// ============================================================================
// Main Component
// ============================================================================

const ManagerReviewModal: React.FC<ManagerReviewModalProps> = ({ managerId, onClose }) => {
  const { user } = useAuth();
  const [details, setDetails] = useState<ReviewDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showReuploadForm, setShowReuploadForm] = useState<DocumentType | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reuploadReason, setReuploadReason] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);

  // ========================================================================
  // Data Fetching
  // ========================================================================

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await managerVerificationService.getManagerVerificationDetails(managerId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDetails(result.data);

        // Auto-start review if status is 'submitted'
        if (result.data.profile?.verification_status === 'submitted' && user?.id) {
          await managerVerificationService.startReview(managerId, user.id);
          // Refetch to get updated status
          const updatedResult = await managerVerificationService.getManagerVerificationDetails(managerId);
          if (updatedResult.data) {
            setDetails(updatedResult.data);
          }
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [managerId, user?.id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // ========================================================================
  // Actions
  // ========================================================================

  const handleApprove = async () => {
    if (!user?.id) {
      setError('You must be logged in to approve');
      return;
    }

    setActionLoading('approve');
    setError(null);
    try {
      console.log('Approving manager:', managerId, 'by admin:', user.id);
      const result = await managerVerificationService.approveManager(managerId, user.id, approveNotes);
      console.log('Approval result:', result);
      if (result.error) {
        setError(result.error);
        setShowApproveConfirm(false);
      } else {
        // Success - close the modal
        onClose();
      }
    } catch (err) {
      console.error('Approval error:', err);
      setError((err as Error).message);
      setShowApproveConfirm(false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!user?.id || !rejectReason.trim()) return;

    setActionLoading('reject');
    try {
      const result = await managerVerificationService.rejectManager(managerId, user.id, rejectReason);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
      setShowRejectForm(false);
    }
  };

  const handleRevokeApproval = async () => {
    if (!user?.id || !revokeReason.trim()) return;

    setActionLoading('revoke');
    setError(null);
    try {
      console.log('Revoking approval for manager:', managerId);
      const result = await managerVerificationService.revokeManagerApproval(managerId, user.id, revokeReason);
      console.log('Revoke result:', result);
      if (result.error) {
        setError(result.error);
        setShowRevokeConfirm(false);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Revoke error:', err);
      setError((err as Error).message);
      setShowRevokeConfirm(false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestReupload = async (documentType: DocumentType) => {
    if (!user?.id || !reuploadReason.trim()) return;

    setActionLoading(`reupload-${documentType}`);
    try {
      const result = await managerVerificationService.requestDocumentReupload(
        managerId,
        user.id,
        documentType,
        reuploadReason
      );
      if (result.error) {
        setError(result.error);
      } else {
        await fetchDetails();
        setShowReuploadForm(null);
        setReuploadReason('');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================================================
  // Render
  // ========================================================================

  if (loading) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading verification details...</span>
        </div>
      </ModalWrapper>
    );
  }

  if (!details || !details.profile) {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Manager Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Unable to load verification details'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
          >
            Close
          </button>
        </div>
      </ModalWrapper>
    );
  }

  const { profile, documents, auditLog, userInfo } = details;
  const isBroker = profile.profile_type === 'broker';
  const statusConfig = getStatusConfig(profile.verification_status);

  return (
    <ModalWrapper onClose={onClose}>
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className={`
            w-14 h-14 rounded-full flex items-center justify-center
            ${isBroker ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}
          `}>
            {isBroker ? (
              <User className="text-orange-600 dark:text-orange-400" size={28} />
            ) : (
              <Building2 className="text-blue-600 dark:text-blue-400" size={28} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {userInfo?.full_name || 'Unknown Manager'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Mail size={14} />
              <span>{userInfo?.email || managerId.slice(0, 8)}</span>
              <span className={`
                ml-2 px-2 py-0.5 rounded text-xs font-medium
                ${isBroker
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}
              `}>
                {isBroker ? 'Broker' : 'Company'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            ${statusConfig.bgColor} ${statusConfig.textColor}
          `}>
            <statusConfig.icon size={14} />
            {statusConfig.label}
          </span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {/* Profile Information */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <FileText size={16} />
            Profile Information
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 grid grid-cols-2 gap-4">
            {isBroker ? (
              <>
                <InfoItem icon={Hash} label="License Number" value={profile.license_number} />
                <InfoItem icon={Calendar} label="License Expiry" value={profile.license_expiry_date} />
                <InfoItem icon={FileText} label="Association ID" value={profile.association_membership_id} />
              </>
            ) : (
              <>
                <InfoItem icon={Hash} label="Registration Number" value={profile.company_registration_number} />
                <InfoItem icon={Hash} label="Tax ID" value={profile.tax_id} />
                <InfoItem icon={User} label="Representative" value={profile.authorized_representative_name} />
                <InfoItem icon={Mail} label="Representative Email" value={profile.authorized_representative_email} />
              </>
            )}
            <InfoItem 
              icon={Calendar} 
              label="Submitted" 
              value={profile.submitted_at ? new Date(profile.submitted_at).toLocaleString() : undefined} 
            />
          </div>
        </div>

        {/* Documents */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <FileText size={16} />
            Uploaded Documents ({documents.length})
          </h3>
          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No documents uploaded</p>
            ) : (
              documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onRequestReupload={() => setShowReuploadForm(doc.document_type)}
                  showReuploadForm={showReuploadForm === doc.document_type}
                  reuploadReason={reuploadReason}
                  setReuploadReason={setReuploadReason}
                  onSubmitReupload={() => handleRequestReupload(doc.document_type)}
                  onCancelReupload={() => {
                    setShowReuploadForm(null);
                    setReuploadReason('');
                  }}
                  actionLoading={actionLoading === `reupload-${doc.document_type}`}
                  disabled={profile.verification_status === 'approved'}
                />
              ))
            )}
          </div>
        </div>

        {/* Audit Log */}
        <div>
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
          >
            <span className="flex items-center gap-2">
              <History size={16} />
              Audit Log ({auditLog.length})
            </span>
            {showAuditLog ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAuditLog && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-48 overflow-y-auto">
              {auditLog.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No audit entries</p>
              ) : (
                <div className="space-y-2">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="text-sm border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatActionType(entry.action_type)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.created_at).toLocaleString()}
                        {entry.actor_role && ` · ${entry.actor_role}`}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {profile.verification_status === 'approved' ? (
          // Revoke approval option for approved managers
          showRevokeConfirm ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Revocation Reason *
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Explain why this approval is being revoked..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRevokeApproval}
                  disabled={!revokeReason.trim() || actionLoading === 'revoke'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === 'revoke' && <Loader2 className="animate-spin" size={16} />}
                  Confirm Revocation
                </button>
                <button
                  onClick={() => {
                    setShowRevokeConfirm(false);
                    setRevokeReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">This manager is approved</span>
              </div>
              <button
                onClick={() => setShowRevokeConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <XCircle size={18} />
                Revoke Approval
              </button>
            </div>
          )
        ) : showRejectForm ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Rejection Reason *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this verification is being rejected..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === 'reject'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === 'reject' && <Loader2 className="animate-spin" size={16} />}
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : showApproveConfirm ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Approval Notes (Optional)
            </label>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="Add any notes for this approval..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={actionLoading === 'approve'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === 'approve' && <Loader2 className="animate-spin" size={16} />}
                Confirm Approval
              </button>
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setShowApproveConfirm(true)}
              disabled={documents.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Approve
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <XCircle size={18} />
              Reject
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

// ============================================================================
// Modal Wrapper
// ============================================================================

const ModalWrapper: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ 
  children, 
  onClose 
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// Info Item Component
// ============================================================================

const InfoItem: React.FC<{
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value?: string | null;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon size={14} className="text-gray-400 mt-0.5" />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </p>
    </div>
  </div>
);

// ============================================================================
// Document Card Component
// ============================================================================

const DocumentCard: React.FC<{
  document: ManagerDocument;
  onRequestReupload: () => void;
  showReuploadForm: boolean;
  reuploadReason: string;
  setReuploadReason: (value: string) => void;
  onSubmitReupload: () => void;
  onCancelReupload: () => void;
  actionLoading: boolean;
  disabled: boolean;
}> = ({
  document,
  onRequestReupload,
  showReuploadForm,
  reuploadReason,
  setReuploadReason,
  onSubmitReupload,
  onCancelReupload,
  actionLoading,
  disabled,
}) => {
  const docStatusConfig = getDocStatusConfig(document.verification_status);
  const DocStatusIcon = docStatusConfig.icon;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${docStatusConfig.bgColor}`}>
            <DocStatusIcon className={docStatusConfig.textColor} size={18} />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {managerVerificationService.getDocumentTypeName(document.document_type)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {document.document_name || 'Document'}
              {document.expiry_date && ` · Expires: ${new Date(document.expiry_date).toLocaleDateString()}`}
            </p>
            {document.document_number && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Number: {document.document_number}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`
            px-2 py-0.5 rounded text-xs font-medium
            ${docStatusConfig.bgColor} ${docStatusConfig.textColor}
          `}>
            {docStatusConfig.label}
          </span>
        </div>
      </div>

      {document.rejection_reason && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
          <strong>Rejection reason:</strong> {document.rejection_reason}
        </div>
      )}

      {showReuploadForm ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={reuploadReason}
            onChange={(e) => setReuploadReason(e.target.value)}
            placeholder="Explain what's wrong with this document..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={onSubmitReupload}
              disabled={!reuploadReason.trim() || actionLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="animate-spin" size={12} />}
              Request Re-upload
            </button>
            <button
              onClick={onCancelReupload}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <a
            href={document.document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Eye size={12} />
            View
          </a>
          <a
            href={document.document_url}
            download
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Download size={12} />
            Download
          </a>
          {!disabled && document.verification_status !== 'rejected' && document.verification_status !== 'reupload_required' && (
            <button
              onClick={onRequestReupload}
              className="flex items-center gap-1 px-3 py-1.5 border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <RefreshCw size={12} />
              Request Re-upload
            </button>
          )}
        </div>
      )}
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
        textColor: 'text-green-700 dark:text-green-400',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        icon: XCircle,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-400',
      };
    case 'under_review':
      return {
        label: 'Under Review',
        icon: Eye,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-700 dark:text-blue-400',
      };
    case 'submitted':
      return {
        label: 'Pending',
        icon: Clock,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-400',
      };
    default:
      return {
        label: 'Incomplete',
        icon: FileText,
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        textColor: 'text-gray-700 dark:text-gray-400',
      };
  }
};

const getDocStatusConfig = (status: string) => {
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
    case 'under_review':
      return {
        label: 'Reviewing',
        icon: Eye,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-600 dark:text-blue-400',
      };
    default:
      return {
        label: 'Pending',
        icon: Clock,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-600 dark:text-yellow-400',
      };
  }
};

const formatActionType = (actionType: string): string => {
  const map: Record<string, string> = {
    'profile_created': 'Profile Created',
    'profile_updated': 'Profile Updated',
    'document_uploaded': 'Document Uploaded',
    'document_deleted': 'Document Deleted',
    'document_replaced': 'Document Replaced',
    'verification_submitted': 'Submitted for Verification',
    'review_started': 'Review Started',
    'document_approved': 'Document Approved',
    'document_rejected': 'Document Rejected',
    'document_reupload_requested': 'Re-upload Requested',
    'manager_approved': 'Manager Approved',
    'manager_rejected': 'Manager Rejected',
    'status_changed': 'Status Changed',
    'license_expired': 'License Expired',
    'critical_field_edited': 'Critical Field Edited',
  };
  return map[actionType] || actionType;
};

export default ManagerReviewModal;
