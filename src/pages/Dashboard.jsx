import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Home, Heart, FileText, Map as MapIcon, User, ArrowRight } from 'lucide-react';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import MapView from '../components/Dashboard/MapView';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';
import { useProperties } from '../contexts/PropertiesContext';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { savedProperties } = useSavedProperties();
  const {
    properties,
    loading,
    error,
    fetchProperties,
    pagination,
  } = useProperties();

  // Fetch UK properties on mount
  useEffect(() => {
    fetchProperties(true);
  }, [fetchProperties]);

  // Transform properties for map view
  const mapProperties = properties
    .filter(p => p.latitude && p.longitude)
    .map((p, idx) => ({
      id: p.id,
      name: p.title,
      lat: parseFloat(p.latitude) || (51.5074 + idx * 0.01), // Default to London if missing
      lng: parseFloat(p.longitude) || (-0.1278 + idx * 0.01),
      price: `£${(p.price / 1000).toFixed(0)}k`,
      address: p.address_line_1 || p.city || p.location || 'UK',
    }));

  // Get latest UK properties (first 6)
  const latestProperties = properties.slice(0, 6);
  
  // Get most viewed (sorted by view_count if available)
  const mostViewedProperties = [...properties]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 3);

  const stats = [
    { label: 'UK Properties Available', value: pagination.total.toString() || '0', color: 'bg-green-500', icon: Home },
    { label: 'Saved Favorites', value: savedProperties.length.toString(), color: 'bg-blue-500', icon: Heart },
    { label: 'Active Applications', value: '2', color: 'bg-purple-500', icon: FileText },
  ];

  // Transform Supabase property to PropertyCard format
  const transformPropertyForCard = (property) => {
    if (!property) return null;
    
    // Handle image_urls - can be JSONB array or string
    let images = [];
    if (property.image_urls) {
      if (Array.isArray(property.image_urls)) {
        images = property.image_urls;
      } else if (typeof property.image_urls === 'string') {
        try {
          images = JSON.parse(property.image_urls);
        } catch (e) {
          images = [];
        }
      }
    }
    
    // Build location string from available fields
    const locationParts = [
      property.address_line_1,
      property.city,
      property.postcode
    ].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'UK';
    
    return {
      id: property.id,
      title: property.title || 'Property',
      location: location,
      price: property.price || 0,
      type: property.property_type === 'rent' ? 'Rent' : property.property_type === 'sale' ? 'Sale' : 'Property',
      property_type: property.property_type,
      beds: property.bedrooms || 0,
      baths: property.bathrooms || 0,
      area: null, // Not in schema, can be added later
      image: images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      description: property.description || '',
      is_saved: property.is_saved || false,
      is_applied: property.is_applied || false,
      application_status: property.application_status || null,
      view_count: property.view_count || 0,
      latitude: property.latitude,
      longitude: property.longitude,
      listedDate: property.created_at ? new Date(property.created_at) : new Date(),
    };
  };

  const handleViewDetails = (property) => {
    navigate(`/user/dashboard/property/${property.id}`);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) return;

    // Navigation mapping for search
    const navigationMap = {
      'payments': '/user/dashboard/payments',
      'payment': '/user/dashboard/payments',
      'pay': '/user/dashboard/payments',
      'messages': '/user/dashboard/messages',
      'message': '/user/dashboard/messages',
      'chat': '/user/dashboard/messages',
      'contracts': '/user/dashboard/contracts',
      'contract': '/user/dashboard/contracts',
      'applications': '/user/dashboard/applications',
      'application': '/user/dashboard/applications',
      'apply': '/user/dashboard/applications',
      'viewings': '/user/dashboard/viewings',
      'viewing': '/user/dashboard/viewings',
      'schedule': '/user/dashboard/viewings',
      'saved': '/user/dashboard/saved',
      'favorites': '/user/dashboard/saved',
      'favorite': '/user/dashboard/saved',
      'discover': '/user/dashboard/discover',
      'browse': '/user/dashboard/discover',
      'properties': '/user/dashboard/discover',
      'property': '/user/dashboard/discover',
      'search': '/user/dashboard/discover',
      'reviews': '/user/dashboard/reviews',
      'review': '/user/dashboard/reviews',
      'settings': '/user/dashboard/settings',
      'setting': '/user/dashboard/settings',
      'profile': '/user/dashboard/profile',
      'help': '/user/dashboard/help',
      'support': '/user/dashboard/help',
    };

    // Check if query matches any navigation keyword
    for (const [key, path] of Object.entries(navigationMap)) {
      if (query.includes(key)) {
        navigate(path);
        setSearchQuery('');
        return;
      }
    }
  };

  // Mock user data - In production, fetch from authentication context/API
  const userData = {
    name: 'Prajol Annamudu',
    email: 'viewer@estospaces.com',
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-gray-900">
      

      {/* AI-Powered Property Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Search size={32} className="text-orange-600" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">AI-Powered Property Search</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Tell us what you're looking for and let AI find your perfect match
            </p>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Try: payments, messages, contracts, discover..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
                Search
              </button>
              <button type="button" className="px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2">
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map View Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-bold text-gray-900 dark:text-gray-100">Nearby Properties & Agencies</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Explore properties and agencies on the map</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="h-96 lg:h-[500px]">
            {mapProperties.length > 0 ? (
              <MapView houses={mapProperties} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No properties with location data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Most Viewed Properties */}
      {mostViewedProperties.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Most Viewed Properties</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Properties that are getting the most attention</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mostViewedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={transformPropertyForCard(property)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}

      {/* Latest UK Properties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Latest UK Properties</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Newly listed properties across the UK</p>
          </div>
          <button
            onClick={() => navigate('/user/dashboard/discover')}
            className="flex items-center gap-2 px-4 py-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors"
          >
            <span>View All Properties</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="text-center mb-4">
              <p className="text-red-700 dark:text-red-400 font-medium mb-2">{error}</p>
              {error.includes('table not found') && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Quick Fix:</strong>
                  </p>
                  <ol className="text-sm text-left text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside mb-4">
                    <li>Open Supabase Dashboard</li>
                    <li>Go to SQL Editor</li>
                    <li>Copy contents of <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">supabase_setup_properties.sql</code></li>
                    <li>Paste and Run the SQL</li>
                    <li>Refresh this page</li>
                  </ol>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    See <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">SETUP_INSTRUCTIONS.md</code> for detailed steps
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => fetchProperties(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
              {error.includes('table not found') && (
                <button
                  onClick={() => window.open('https://supabase.com/dashboard/project/yydtsteyknbpfpxjtlxe/sql/new', '_blank')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Open Supabase SQL Editor
                </button>
              )}
            </div>
          </div>
        ) : latestProperties.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
            <Home size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No UK properties found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error ? 'There was an error loading properties.' : 'There are no UK properties available at the moment. Properties will appear here once they are added to the database.'}
            </p>
            {!error && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                  <strong>Tip:</strong> Properties are automatically fetched from Supabase where <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">country = 'UK'</code> and <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">status = 'online'</code>
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => navigate('/user/dashboard/discover')}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Browse All Properties
              </button>
              <button
                onClick={() => fetchProperties(true)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={transformPropertyForCard(property)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
