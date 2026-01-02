import React from 'react';

const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-56 bg-gray-300"></div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>

        {/* Location */}
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>

        {/* Specs */}
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Rating */}
        <div className="h-4 bg-gray-200 rounded w-24"></div>

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-18"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
          <div className="h-10 bg-gray-200 rounded w-10"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;

