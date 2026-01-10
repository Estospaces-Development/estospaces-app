import React, { useState } from 'react';
import { FileText, AlertCircle, Clock, Plus } from 'lucide-react';
import { useApplications } from '../contexts/ApplicationsContext';
import ApplicationCard from '../components/Dashboard/Applications/ApplicationCard';
import ApplicationDetail from '../components/Dashboard/Applications/ApplicationDetail';
import ApplicationFilters from '../components/Dashboard/Applications/ApplicationFilters';
import ApplicationCardSkeleton from '../components/Dashboard/Applications/ApplicationCardSkeleton';

const DashboardApplications = () => {
  const {
    applications,
    selectedApplicationId,
    setSelectedApplicationId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    propertyTypeFilter,
    setPropertyTypeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    isLoading,
    getApplicationsRequiringAction,
    getApplicationsWithDeadlineWarnings,
  } = useApplications();

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  const applicationsRequiringAction = getApplicationsRequiringAction();
  const deadlineWarnings = getApplicationsWithDeadlineWarnings();

  const handleApplicationClick = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedApplicationId(null);
  };

  // Show detail view if application is selected
  if (viewMode === 'detail' && selectedApplicationId) {
    return (
      <ApplicationDetail
        applicationId={selectedApplicationId}
        onClose={handleBackToList}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 lg:p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-orange-500 mb-2">
              My Applications
            </h1>
            <p className="text-gray-600 dark:text-orange-400">
              Track your property applications
            </p>
          </div>
          <button
            onClick={() => {
              // Navigate to property discovery to create new application
              window.location.href = '/user/dashboard/discover';
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Application</span>
          </button>
        </div>

        {/* Alerts */}
        {applicationsRequiringAction.length > 0 && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
              <AlertCircle size={16} />
              <span>
                {applicationsRequiringAction.length} application{applicationsRequiringAction.length !== 1 ? 's' : ''} require{applicationsRequiringAction.length === 1 ? 's' : ''} your action
              </span>
            </div>
          </div>
        )}

        {deadlineWarnings.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <Clock size={16} />
              <span>
                {deadlineWarnings.length} application{deadlineWarnings.length !== 1 ? 's' : ''} {deadlineWarnings.length === 1 ? 'has' : 'have'} an approaching deadline
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <ApplicationFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          propertyTypeFilter={propertyTypeFilter}
          setPropertyTypeFilter={setPropertyTypeFilter}
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
        />
      </div>

      {/* Applications List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {isLoading ? (
          <div className="max-w-7xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <ApplicationCardSkeleton key={i} />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-orange-500 mb-2">
              No applications found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter !== 'all' || propertyTypeFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'You haven\'t submitted any applications yet. Start by browsing properties and applying for ones you\'re interested in.'}
            </p>
            {!searchQuery && statusFilter === 'all' && propertyTypeFilter === 'all' && (
              <button
                onClick={() => {
                  window.location.href = '/user/dashboard/discover';
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                <span>Browse Properties</span>
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onClick={() => handleApplicationClick(application.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardApplications;

