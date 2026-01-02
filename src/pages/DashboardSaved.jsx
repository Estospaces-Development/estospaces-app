import React from 'react';
import { Heart } from 'lucide-react';

const DashboardSaved = () => {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Saved Properties</h1>
        <p className="text-gray-600">Your favorite properties</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Heart size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved properties yet</h3>
        <p className="text-gray-600 mb-4">Start saving properties you're interested in</p>
        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
          Browse Properties
        </button>
      </div>
    </div>
  );
};

export default DashboardSaved;

