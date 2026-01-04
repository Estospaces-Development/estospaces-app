import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import PropertyCard from '../components/Dashboard/PropertyCard';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';

const DashboardSaved = () => {
  const { savedProperties, removeProperty } = useSavedProperties();
  const navigate = useNavigate();

  const handleViewDetails = (property) => {
    navigate(`/user/dashboard/property/${property.id}`);
  };

  if (savedProperties.length === 0) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Heart size={48} className="text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Saved Properties</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            Start exploring properties and save your favorites to see them here.
          </p>
          <a
            href="/user/dashboard/discover"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Browse Properties
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Saved Properties</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardSaved;
