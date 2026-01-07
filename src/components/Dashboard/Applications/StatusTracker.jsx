import React from 'react';
import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react';
import { APPLICATION_STATUS } from '../../../contexts/ApplicationsContext';

const StatusTracker = ({ status }) => {
  const statuses = [
    {
      key: APPLICATION_STATUS.DRAFT,
      label: 'Draft',
      description: 'Application is being prepared',
    },
    {
      key: APPLICATION_STATUS.SUBMITTED,
      label: 'Submitted',
      description: 'Application has been submitted',
    },
    {
      key: APPLICATION_STATUS.UNDER_REVIEW,
      label: 'Under Review',
      description: 'Application is being reviewed',
    },
    {
      key: APPLICATION_STATUS.DOCUMENTS_REQUESTED,
      label: 'Documents Requested',
      description: 'Additional documents needed',
    },
    {
      key: APPLICATION_STATUS.APPROVED,
      label: 'Approved',
      description: 'Application has been approved',
    },
  ];

  const getStatusIndex = (currentStatus) => {
    const index = statuses.findIndex((s) => s.key === currentStatus);
    if (index === -1) {
      // Handle rejected or withdrawn
      if (currentStatus === APPLICATION_STATUS.REJECTED) {
        return statuses.length; // After all statuses
      }
      if (currentStatus === APPLICATION_STATUS.WITHDRAWN) {
        return statuses.length; // After all statuses
      }
      return 0;
    }
    return index;
  };

  const currentIndex = getStatusIndex(status);
  const isRejected = status === APPLICATION_STATUS.REJECTED;
  const isWithdrawn = status === APPLICATION_STATUS.WITHDRAWN;

  const getStatusState = (index) => {
    if (isRejected || isWithdrawn) {
      return 'error';
    }
    if (index < currentIndex) {
      return 'completed';
    }
    if (index === currentIndex) {
      return 'current';
    }
    return 'pending';
  };

  const getIcon = (state) => {
    switch (state) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'current':
        return <Clock size={20} className="text-orange-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Circle size={20} className="text-gray-300 dark:text-gray-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Application Status
      </h3>

      <div className="relative">
        {/* Status Items */}
        <div className="space-y-6">
          {statuses.map((statusItem, index) => {
            const state = getStatusState(index);
            const isLast = index === statuses.length - 1;

            return (
              <div key={statusItem.key} className="relative">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        state === 'completed'
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                          : state === 'current'
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {getIcon(state)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div
                      className={`font-medium mb-1 ${
                        state === 'completed'
                          ? 'text-green-700 dark:text-green-400'
                          : state === 'current'
                          ? 'text-orange-700 dark:text-orange-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {statusItem.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {statusItem.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`absolute left-5 top-10 w-0.5 h-6 ${
                      state === 'completed'
                        ? 'bg-green-500'
                        : state === 'current'
                        ? 'bg-orange-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Rejected/Withdrawn Status */}
        {(isRejected || isWithdrawn) && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-red-50 dark:bg-red-900/20 border-red-500">
                  <XCircle size={20} className="text-red-500" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="font-medium text-red-700 dark:text-red-400 mb-1">
                  {isRejected ? 'Rejected' : 'Withdrawn'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isRejected
                    ? 'Application has been rejected'
                    : 'Application has been withdrawn'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTracker;

