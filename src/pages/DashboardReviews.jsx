import React from 'react';
import { Star } from 'lucide-react';

const DashboardReviews = () => {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-orange-500 mb-2">Reviews</h1>
        <p className="text-gray-600 dark:text-orange-400">Share your experience with properties</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Star size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-2">No reviews yet</h3>
        <p className="text-gray-600 dark:text-orange-400 mb-4">Review properties you've visited or rented</p>
        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
          View Properties
        </button>
      </div>
    </div>
  );
};

export default DashboardReviews;


