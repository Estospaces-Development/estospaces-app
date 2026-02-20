import React, { useState } from 'react';
import { FileText, AlertCircle, Clock, Plus, Filter, Search, X, ChevronRight, Bell, CheckCircle, XCircle, Inbox, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApplications, APPLICATION_STATUS } from '../contexts/ApplicationsContext';
import { MOCK_APPLICATIONS } from '../services/mockDataService';
import ApplicationCard from '../components/Dashboard/Applications/ApplicationCard';
import ApplicationDetail from '../components/Dashboard/Applications/ApplicationDetail';
import ApplicationCardSkeleton from '../components/Dashboard/Applications/ApplicationCardSkeleton';
import NewApplicationModal from '../components/Dashboard/Applications/NewApplicationModal';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

const DashboardApplications = () => {
  const navigate = useNavigate();
  // Use mock data locally to bypass API context if needed
  // Use mock data locally to bypass API context if needed
  const rawApplications = MOCK_APPLICATIONS;

  // Transform mock data to match ApplicationCard expected format
  const initialApplications = rawApplications.map(app => ({
    ...app,
    propertyImage: app.property?.image_urls?.[0] || null,
    propertyTitle: app.property?.title || 'Unknown Property',
    propertyAddress: app.property?.address_line_1 || 'Address not available',
    propertyPrice: app.property?.price || 0,
    propertyType: app.property?.property_type || 'sale',
    agentName: app.property?.agent_name || 'Estospaces Agent',
    referenceId: app.id,
    lastUpdated: app.updated_at,
    submittedDate: app.created_at, // Map created_at to submittedDate for ApplicationDetail
    requiresAction: [APPLICATION_STATUS.DOCUMENTS_REQUESTED, 'action_required'].includes(app.status),
    hasAppointment: !!app.appointment,
    deadline: app.deadline
  }));

  const [applications, setApplications] = useState(initialApplications);

  const handleUpdateStatus = (applicationId, newStatus) => {
    setApplications(prevApps =>
      prevApps.map(app =>
        app.id === applicationId
          ? { ...app, status: newStatus, lastUpdated: new Date().toISOString() }
          : app
      )
    );
  };

  // Calculate derived values from mock data
  const searchQuery = '';
  const setSearchQuery = () => { };
  const statusFilter = 'all';
  const setStatusFilter = () => { };
  const propertyTypeFilter = 'all';
  const setPropertyTypeFilter = () => { };
  const dateRangeFilter = { start: null, end: null };
  const setDateRangeFilter = () => { };
  const isLoading = false;

  // Helper functions for mock data
  const getApplicationsRequiringAction = () =>
    applications.filter(app => [APPLICATION_STATUS.DOCUMENTS_REQUESTED, 'action_required'].includes(app.status));

  const getApplicationsWithDeadlineWarnings = () => []; // Simplified for mock

  const allApplications = applications;
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  // NOTE: In a real refactor, we would update the ApplicationsContext to use the mock service
  // But for this task, we are overriding local variables to force mock display

  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  // Re-declare state that was from context but now local driven or we need to manage it
  const [localStatusFilter, setLocalStatusFilter] = useState('all');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localPropertyTypeFilter, setLocalPropertyTypeFilter] = useState('all');

  // Filter logic for mock data
  const filteredApplications = applications.filter(app => {
    const matchStatus = localStatusFilter === 'all' || app.status === localStatusFilter;
    const matchSearch = !localSearchQuery ||
      app.property_title?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      app.property_address?.toLowerCase().includes(localSearchQuery.toLowerCase());
    const matchType = localPropertyTypeFilter === 'all' || app.property_type === localPropertyTypeFilter;
    return matchStatus && matchSearch && matchType;
  });

  const applicationsRequiringAction = getApplicationsRequiringAction();
  const deadlineWarnings = getApplicationsWithDeadlineWarnings();

  const hasActiveFilters = localStatusFilter !== 'all' || localPropertyTypeFilter !== 'all' || localSearchQuery.trim();

  // Get status counts
  const getStatusCount = (status) => allApplications?.filter(app => app.status === status).length || 0;
  const totalApplications = allApplications?.length || 0;
  const pendingCount = getStatusCount(APPLICATION_STATUS.SUBMITTED) + getStatusCount(APPLICATION_STATUS.UNDER_REVIEW);
  const approvedCount = getStatusCount(APPLICATION_STATUS.APPROVED);

  const handleApplicationClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedApplicationId(null);
  };

  const clearFilters = () => {
    setLocalSearchQuery('');
    setLocalStatusFilter('all');
    setLocalPropertyTypeFilter('all');
    setDateRangeFilter({ start: null, end: null });
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: APPLICATION_STATUS.DRAFT, label: 'Draft' },
    { value: APPLICATION_STATUS.SUBMITTED, label: 'Submitted' },
    { value: APPLICATION_STATUS.UNDER_REVIEW, label: 'Under Review' },
    { value: APPLICATION_STATUS.DOCUMENTS_REQUESTED, label: 'Documents Requested' },
    { value: APPLICATION_STATUS.APPROVED, label: 'Approved' },
    { value: APPLICATION_STATUS.REJECTED, label: 'Rejected' },
    { value: APPLICATION_STATUS.WITHDRAWN, label: 'Withdrawn' },
  ];

  const propertyTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'house', label: 'House' },
    { value: 'townhouse', label: 'Townhouse' },
  ];

  if (viewMode === 'detail' && selectedApplicationId) {
    const selectedApplication = allApplications.find(app => app.id === selectedApplicationId);
    return (
      <ApplicationDetail
        applicationId={selectedApplicationId}
        application={selectedApplication}
        onClose={handleBackToList}
        onUpdateStatus={handleUpdateStatus}
      />
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/user/dashboard')}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Applications
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Track and manage your property applications
              </p>
            </div>
            <button
              onClick={() => setShowNewApplicationModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              <span>New Application</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Applications</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Bell size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{applicationsRequiringAction.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Action Required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts - Compact inline */}
          {(applicationsRequiringAction.length > 0 || deadlineWarnings.length > 0) && (
            <div className="flex flex-wrap gap-3 mb-6">
              {applicationsRequiringAction.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full text-sm">
                  <AlertCircle size={14} className="text-orange-500" />
                  <span className="text-orange-700 dark:text-orange-400">
                    {applicationsRequiringAction.length} require{applicationsRequiringAction.length === 1 ? 's' : ''} action
                  </span>
                </div>
              )}
              {deadlineWarnings.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full text-sm">
                  <Clock size={14} className="text-red-500" />
                  <span className="text-red-700 dark:text-red-400">
                    {deadlineWarnings.length} deadline{deadlineWarnings.length === 1 ? '' : 's'} approaching
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Search and Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
              {localSearchQuery && (
                <button
                  onClick={() => setLocalSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-2">
              <select
                value={localStatusFilter}
                onChange={(e) => setLocalStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-700 dark:text-gray-300 min-w-[140px]"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={localPropertyTypeFilter}
                onChange={(e) => setLocalPropertyTypeFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-700 dark:text-gray-300 min-w-[120px]"
              >
                {propertyTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2.5 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium whitespace-nowrap"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? 'Loading...' : `${filteredApplications.length} application${filteredApplications.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <ApplicationCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {hasActiveFilters ? 'No matching applications' : 'No applications yet'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Start your property journey by browsing available listings and submitting your first application.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
                <span>Clear Filters</span>
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/user/dashboard/discover'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
              >
                <Search size={18} />
                <span>Browse Properties</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onClick={() => handleApplicationClick(application.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Application Modal */}
      <NewApplicationModal
        isOpen={showNewApplicationModal}
        onClose={() => setShowNewApplicationModal(false)}
      />

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardApplications;
