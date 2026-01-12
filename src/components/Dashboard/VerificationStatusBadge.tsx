/**
 * Verification Status Badge
 * Displays the manager's verification status with appropriate styling
 * Can be used in headers, sidebars, and profile pages
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Shield,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useManagerVerification } from '../../contexts/ManagerVerificationContext';
import type { VerificationStatus } from '../../services/managerVerificationService';

interface VerificationStatusBadgeProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show as a clickable link to verification page */
  clickable?: boolean;
  /** Whether to show just the icon (compact mode) */
  iconOnly?: boolean;
  /** Custom class name */
  className?: string;
  /** Show loading state */
  showLoading?: boolean;
}

const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
  size = 'md',
  clickable = true,
  iconOnly = false,
  className = '',
  showLoading = true,
}) => {
  const navigate = useNavigate();
  const { verificationStatus, isLoading, managerProfile } = useManagerVerification();
  
  // Don't show if no manager profile exists yet
  if (!managerProfile && !isLoading) {
    return null;
  }
  
  // Show loading state
  if (isLoading && showLoading) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <Loader2 className="animate-spin text-gray-400" size={getSizeConfig(size).iconSize} />
        {!iconOnly && (
          <span className="text-gray-400 text-sm">Loading...</span>
        )}
      </div>
    );
  }
  
  const status = verificationStatus || 'incomplete';
  const config = getStatusConfig(status);
  const sizeConfig = getSizeConfig(size);
  
  const content = (
    <div 
      className={`
        inline-flex items-center gap-1.5 
        ${sizeConfig.padding}
        ${config.bgColor} 
        ${config.textColor} 
        ${config.borderColor}
        border rounded-full font-medium
        ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={clickable ? () => navigate('/manager/dashboard/verification') : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate('/manager/dashboard/verification');
        }
      } : undefined}
    >
      <config.icon size={sizeConfig.iconSize} className="flex-shrink-0" />
      {!iconOnly && (
        <>
          <span className={sizeConfig.textSize}>{config.label}</span>
          {clickable && <ChevronRight size={sizeConfig.iconSize - 2} className="opacity-60" />}
        </>
      )}
    </div>
  );
  
  // Add tooltip for icon-only mode
  if (iconOnly) {
    return (
      <div className="relative group">
        {content}
        <div className={`
          absolute z-50 hidden group-hover:block 
          ${size === 'sm' ? 'top-6' : size === 'md' ? 'top-8' : 'top-10'}
          left-1/2 -translate-x-1/2
          px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 
          rounded whitespace-nowrap shadow-lg
        `}>
          {config.label}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
        </div>
      </div>
    );
  }
  
  return content;
};

// ============================================================================
// Configuration
// ============================================================================

interface StatusConfig {
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const getStatusConfig = (status: VerificationStatus | 'incomplete'): StatusConfig => {
  switch (status) {
    case 'approved':
      return {
        label: 'Verified',
        icon: CheckCircle,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800',
      };
    case 'submitted':
    case 'under_review':
      return {
        label: status === 'submitted' ? 'Pending Review' : 'Under Review',
        icon: Clock,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
      };
    case 'verification_required':
      return {
        label: 'Verification Required',
        icon: AlertCircle,
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        textColor: 'text-orange-700 dark:text-orange-400',
        borderColor: 'border-orange-200 dark:border-orange-800',
      };
    case 'incomplete':
    default:
      return {
        label: 'Not Verified',
        icon: Shield,
        bgColor: 'bg-gray-50 dark:bg-gray-800',
        textColor: 'text-gray-600 dark:text-gray-400',
        borderColor: 'border-gray-200 dark:border-gray-700',
      };
  }
};

interface SizeConfig {
  padding: string;
  iconSize: number;
  textSize: string;
}

const getSizeConfig = (size: 'sm' | 'md' | 'lg'): SizeConfig => {
  switch (size) {
    case 'sm':
      return {
        padding: 'px-2 py-0.5',
        iconSize: 12,
        textSize: 'text-xs',
      };
    case 'lg':
      return {
        padding: 'px-4 py-2',
        iconSize: 18,
        textSize: 'text-base',
      };
    case 'md':
    default:
      return {
        padding: 'px-3 py-1',
        iconSize: 14,
        textSize: 'text-sm',
      };
  }
};

// ============================================================================
// Additional Components
// ============================================================================

/**
 * Inline verification status indicator (just icon + text, no styling)
 */
export const VerificationStatusIndicator: React.FC<{
  status: VerificationStatus;
  className?: string;
}> = ({ status, className = '' }) => {
  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center gap-1 ${config.textColor} ${className}`}>
      <config.icon size={14} />
      <span className="text-sm">{config.label}</span>
    </span>
  );
};

/**
 * Verification status banner (full-width, for dashboard headers)
 */
export const VerificationStatusBanner: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { verificationStatus, managerProfile, isLoading } = useManagerVerification();
  
  // Don't show for verified managers or if loading
  if (isLoading || !managerProfile || verificationStatus === 'approved') {
    return null;
  }
  
  const config = getStatusConfig(verificationStatus || 'incomplete');
  
  const getMessage = () => {
    switch (verificationStatus) {
      case 'submitted':
        return 'Your verification documents have been submitted and are awaiting review.';
      case 'under_review':
        return 'Your verification is currently being reviewed by our team.';
      case 'rejected':
        return 'Your verification was rejected. Please review the feedback and resubmit.';
      case 'verification_required':
        return 'Your verification has expired or requires updates. Please resubmit your documents.';
      case 'incomplete':
      default:
        return 'Complete your verification to unlock all features and build trust with clients.';
    }
  };
  
  return (
    <div 
      className={`
        ${config.bgColor} ${config.borderColor} border rounded-lg p-4
        flex items-center justify-between gap-4
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <config.icon size={20} className={config.textColor} />
        <div>
          <p className={`font-medium ${config.textColor}`}>{config.label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{getMessage()}</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/manager/dashboard/verification')}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm
          ${verificationStatus === 'approved' 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-orange-600 text-white hover:bg-orange-700'
          }
          transition-colors whitespace-nowrap
        `}
      >
        {verificationStatus === 'rejected' || verificationStatus === 'verification_required'
          ? 'Resubmit Documents'
          : verificationStatus === 'incomplete'
          ? 'Complete Verification'
          : 'View Status'
        }
      </button>
    </div>
  );
};

export default VerificationStatusBadge;
