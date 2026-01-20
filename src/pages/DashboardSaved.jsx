import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import PropertyCard from '../components/Dashboard/PropertyCard';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

import { MOCK_SAVED_PROPERTIES } from '../services/mockDataService';

const DashboardSaved = () => {
  const { savedProperties: contextSavedProperties, removeProperty } = useSavedProperties();
  const navigate = useNavigate();

  // Use mock properties if context is empty (or force use for this task)
  // For the purpose of "making it work with mock data", we'll combine them or prioritize mock
  const savedProperties = contextSavedProperties.length > 0 ? contextSavedProperties : MOCK_SAVED_PROPERTIES;

  const handleViewDetails = (property) => {
    navigate(`/user/dashboard/property/${property.id}`);
  };

  if (savedProperties.length === 0) {
    return (
      <div className="p-4 lg:p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/user/dashboard')}
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Heart size={48} className="text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-orange-500 mb-2">No Saved Properties</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
            Start exploring properties and save your favorites to see them here.
          </p>
          <Link
            to="/user/dashboard/discover"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Browse Properties
          </Link>
        </div>

        {/* Footer */}
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/user/dashboard')}
        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-orange-500 mb-2">Saved Properties</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
        </p>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {savedProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardSaved;
