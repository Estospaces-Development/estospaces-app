import React from 'react';

const ApplicationCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:p-6 animate-pulse">
      <div className="flex gap-4">
        {/* Image Skeleton */}
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />

          {/* Address */}
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCardSkeleton;

