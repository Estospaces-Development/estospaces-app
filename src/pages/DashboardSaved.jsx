import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import PropertyCard from '../components/Dashboard/PropertyCard';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';
import DashboardFooter from '../components/Dashboard/DashboardFooter';
import EmptyState from '../components/ui/EmptyState';

import { MOCK_SAVED_PROPERTIES } from '../services/mockDataService';

const DashboardSaved = () => {
  const { savedProperties: contextSavedProperties, removeProperty } = useSavedProperties();
  const navigate = useNavigate();

  // Use properties directly from the new local context
  const savedProperties = contextSavedProperties;

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

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <EmptyState
            variant="no-saved"
            action={
              <Link
                to="/user/dashboard/discover"
                className="btn-primary"
              >
                <Search size={18} />
                Browse Properties
              </Link>
            }
          />
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
