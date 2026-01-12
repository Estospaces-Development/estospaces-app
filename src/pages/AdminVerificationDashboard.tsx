/**
 * Admin Verification Dashboard
 * Admin panel for reviewing and approving manager verifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Building2,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Calendar,
  FileText,
  Eye,
  Loader2,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as managerVerificationService from '../services/managerVerificationService';
import type { ManagerProfile, VerificationStatus } from '../services/managerVerificationService';
import ManagerReviewModal from '../components/Admin/ManagerReviewModal';

// ============================================================================
// Types
// ============================================================================

type TabType = 'pending' | 'under_review' | 'approved' | 'rejected' | 'all';

interface ManagerWithUser extends ManagerProfile {
  user_email?: string;
  user_name?: string;
}

// ============================================================================
// Main Component
// ============================================================================

const AdminVerificationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [managers, setManagers] = useState<ManagerWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileTypeFilter, setProfileTypeFilter] = useState<'all' | 'broker' | 'company'>('all');
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('managerVerified');
      localStorage.removeItem('leads');
      navigate('/admin/login');
    } catch (error) {
      localStorage.removeItem('managerVerified');
      localStorage.removeItem('leads');
      navigate('/admin/login');
    }
  };

  // Counts for tabs
  const [counts, setCounts] = useState({
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  // ========================================================================
  // Data Fetching
  // ========================================================================

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch managers based on active tab
      const statusMap: Record<TabType, VerificationStatus | undefined> = {
        pending: 'submitted',
        under_review: 'under_review',
        approved: 'approved',
        rejected: 'rejected',
        all: undefined,
      };

      const status = statusMap[activeTab];
      const result = await managerVerificationService.getPendingVerifications(status);

      if (result.error) {
        setError(result.error);
      } else {
        setManagers(result.data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchCounts = useCallback(async () => {
    try {
      // Fetch counts for each status
      const [pending, underReview, approved, rejected, all] = await Promise.all([
        managerVerificationService.getPendingVerifications('submitted'),
        managerVerificationService.getPendingVerifications('under_review'),
        managerVerificationService.getPendingVerifications('approved'),
        managerVerificationService.getPendingVerifications('rejected'),
        managerVerificationService.getPendingVerifications(),
      ]);

      setCounts({
        pending: pending.data.length,
        under_review: underReview.data.length,
        approved: approved.data.length,
        rejected: rejected.data.length,
        all: all.data.length,
      });
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchManagers(), fetchCounts()]);
    setRefreshing(false);
  };

  // ========================================================================
  // Filtering
  // ========================================================================

  const filteredManagers = managers.filter(manager => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = manager.user_name?.toLowerCase().includes(query);
      const matchesEmail = manager.user_email?.toLowerCase().includes(query);
      const matchesLicense = manager.license_number?.toLowerCase().includes(query);
      const matchesCompany = manager.company_registration_number?.toLowerCase().includes(query);
      if (!matchesName && !matchesEmail && !matchesLicense && !matchesCompany) {
        return false;
      }
    }

    // Profile type filter
    if (profileTypeFilter !== 'all' && manager.profile_type !== profileTypeFilter) {
      return false;
    }

    return true;
  });

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-orange-600 dark:text-orange-400" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Manager Verification
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review and approve manager verification requests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/chat')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                <MessageSquare size={18} />
                <span>Chat</span>
              </button>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                <TrendingUp size={18} />
                <span>Analytics</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={18} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Pending"
            count={counts.pending}
            icon={Clock}
            color="yellow"
            active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
          />
          <StatCard
            label="Under Review"
            count={counts.under_review}
            icon={Eye}
            color="blue"
            active={activeTab === 'under_review'}
            onClick={() => setActiveTab('under_review')}
          />
          <StatCard
            label="Approved"
            count={counts.approved}
            icon={CheckCircle}
            color="green"
            active={activeTab === 'approved'}
            onClick={() => setActiveTab('approved')}
          />
          <StatCard
            label="Rejected"
            count={counts.rejected}
            icon={XCircle}
            color="red"
            active={activeTab === 'rejected'}
            onClick={() => setActiveTab('rejected')}
          />
          <StatCard
            label="All"
            count={counts.all}
            icon={FileText}
            color="gray"
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, license, or registration number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={18} />
              <select
                value={profileTypeFilter}
                onChange={(e) => setProfileTypeFilter(e.target.value as 'all' | 'broker' | 'company')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Types</option>
                <option value="broker">Brokers</option>
                <option value="company">Companies</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-red-600 dark:text-red-400 hover:underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading verifications...</span>
            </div>
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Shield className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No verifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || profileTypeFilter !== 'all'
                ? 'Try adjusting your filters'
                : `No ${activeTab === 'all' ? '' : activeTab} verifications at this time`}
            </p>
          </div>
        ) : (
          /* Manager List */
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredManagers.map((manager) => (
                    <ManagerRow
                      key={manager.id}
                      manager={manager}
                      onReview={() => setSelectedManagerId(manager.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedManagerId && (
        <ManagerReviewModal
          managerId={selectedManagerId}
          onClose={() => {
            setSelectedManagerId(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// Stat Card Component
// ============================================================================

const StatCard: React.FC<{
  label: string;
  count: number;
  icon: React.FC<{ size?: number; className?: string }>;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'gray';
  active: boolean;
  onClick: () => void;
}> = ({ label, count, icon: Icon, color, active, onClick }) => {
  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      activeBorder: 'border-yellow-500',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-700 dark:text-yellow-400',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      activeBorder: 'border-blue-500',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-700 dark:text-blue-400',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      activeBorder: 'border-green-500',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-700 dark:text-green-400',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      activeBorder: 'border-red-500',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-700 dark:text-red-400',
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      activeBorder: 'border-gray-500',
      icon: 'text-gray-600 dark:text-gray-400',
      text: 'text-gray-700 dark:text-gray-400',
    },
  };

  const classes = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 transition-all text-left
        ${classes.bg}
        ${active ? classes.activeBorder : classes.border}
        hover:shadow-md
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={24} className={classes.icon} />
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
          <p className={`text-sm ${classes.text}`}>{label}</p>
        </div>
      </div>
    </button>
  );
};

// ============================================================================
// Manager Row Component
// ============================================================================

const ManagerRow: React.FC<{
  manager: ManagerWithUser;
  onReview: () => void;
}> = ({ manager, onReview }) => {
  const statusConfig = getStatusConfig(manager.verification_status);
  const StatusIcon = statusConfig.icon;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${manager.profile_type === 'broker' 
              ? 'bg-orange-100 dark:bg-orange-900/30' 
              : 'bg-blue-100 dark:bg-blue-900/30'}
          `}>
            {manager.profile_type === 'broker' ? (
              <User className="text-orange-600 dark:text-orange-400" size={20} />
            ) : (
              <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {manager.user_name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {manager.user_email || manager.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`
          inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
          ${manager.profile_type === 'broker'
            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}
        `}>
          {manager.profile_type === 'broker' ? 'Broker' : 'Company'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          ${statusConfig.bgColor} ${statusConfig.textColor}
        `}>
          <StatusIcon size={12} />
          {statusConfig.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={14} />
          {manager.submitted_at 
            ? new Date(manager.submitted_at).toLocaleDateString()
            : 'Not submitted'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button
          onClick={onReview}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
        >
          Review
          <ChevronRight size={14} />
        </button>
      </td>
    </tr>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

const getStatusConfig = (status: VerificationStatus) => {
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
    case 'verification_required':
      return {
        label: 'Needs Update',
        icon: AlertCircle,
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-400',
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

export default AdminVerificationDashboard;
