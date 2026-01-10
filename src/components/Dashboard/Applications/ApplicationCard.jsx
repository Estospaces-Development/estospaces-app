import React from 'react';
import { 
  FileText, 
  MapPin, 
  User, 
  Clock, 
  AlertCircle,
  ChevronRight,
  CheckCircle,
  XCircle,
  Edit,
  Upload,
  MessageSquare
} from 'lucide-react';
import { APPLICATION_STATUS } from '../../../contexts/ApplicationsContext';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '../../../contexts/MessagesContext';

const ApplicationCard = ({ application, onClick }) => {
  const navigate = useNavigate();
  const { createConversation } = useMessages();

  const getStatusConfig = (status) => {
    switch (status) {
      case APPLICATION_STATUS.DRAFT:
        return {
          label: 'Draft',
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          icon: Edit,
        };
      case APPLICATION_STATUS.SUBMITTED:
        return {
          label: 'Submitted',
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          icon: FileText,
        };
      case APPLICATION_STATUS.UNDER_REVIEW:
        return {
          label: 'Under Review',
          color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
          icon: Clock,
        };
      case APPLICATION_STATUS.DOCUMENTS_REQUESTED:
        return {
          label: 'Documents Requested',
          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
          icon: Upload,
        };
      case APPLICATION_STATUS.APPROVED:
        return {
          label: 'Approved',
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          icon: CheckCircle,
        };
      case APPLICATION_STATUS.REJECTED:
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          icon: XCircle,
        };
      case APPLICATION_STATUS.WITHDRAWN:
        return {
          label: 'Withdrawn',
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
          icon: FileText,
        };
    }
  };

  const getPrimaryAction = () => {
    switch (application.status) {
      case APPLICATION_STATUS.DRAFT:
        return { label: 'Complete Application', action: 'edit' };
      case APPLICATION_STATUS.DOCUMENTS_REQUESTED:
        return { label: 'Upload Documents', action: 'upload' };
      case APPLICATION_STATUS.UNDER_REVIEW:
        return { label: 'View Details', action: 'view' };
      default:
        return { label: 'View Details', action: 'view' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return formatDate(dateString);
  };

  const isDeadlineWarning = () => {
    if (!application.deadline) return false;
    const deadline = new Date(application.deadline);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return deadline <= threeDaysFromNow && deadline > now;
  };

  const statusConfig = getStatusConfig(application.status);
  const primaryAction = getPrimaryAction();
  const StatusIcon = statusConfig.icon;

  const handleMessageAgent = (e) => {
    e.stopPropagation();
    if (application.conversationId) {
      navigate(`/user/dashboard/messages`);
      // In a real app, you'd navigate to the specific conversation
    } else {
      // Create a new conversation
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

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg border ${
        application.requiresAction
          ? 'border-orange-300 dark:border-orange-700 shadow-md'
          : 'border-gray-200 dark:border-gray-700'
      } hover:shadow-lg transition-all cursor-pointer ${
        application.requiresAction ? 'ring-2 ring-orange-200 dark:ring-orange-900/50' : ''
      }`}
    >
      <div className="p-4 lg:p-6">
        <div className="flex gap-4">
          {/* Property Image */}
          <div className="flex-shrink-0">
            <img
              src={application.propertyImage}
              alt={application.propertyTitle}
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200';
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1 truncate">
                  {application.propertyTitle}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin size={14} />
                  <span className="truncate">{application.propertyAddress}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {application.requiresAction && (
                  <div className="relative">
                    <AlertCircle
                      size={18}
                      className="text-orange-500 dark:text-orange-400"
                      title="Action Required"
                    />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  </div>
                )}
                {isDeadlineWarning() && (
                  <div className="relative">
                    <Clock
                      size={18}
                      className="text-red-500 dark:text-red-400"
                      title="Deadline Approaching"
                    />
                  </div>
                )}
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>

            {/* Agent Info */}
            <div className="flex items-center gap-2 mb-3 text-sm">
              <User size={14} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {application.agentName}
                {application.agentAgency && ` • ${application.agentAgency}`}
              </span>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Reference ID:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {application.referenceId}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatRelativeTime(application.lastUpdated)}
                </p>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon size={16} />
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {application.conversationId && (
                  <button
                    onClick={handleMessageAgent}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Message Agent"
                  >
                    <MessageSquare size={16} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {primaryAction.label}
                </button>
              </div>
            </div>

            {/* Deadline Warning */}
            {isDeadlineWarning() && (
              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs text-red-700 dark:text-red-400">
                  <Clock size={12} className="inline mr-1" />
                  Deadline: {formatDate(application.deadline)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;

