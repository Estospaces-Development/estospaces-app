import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, MapPin, Home, DollarSign, Bed, Bath, Map as MapIcon, Grid, List, ChevronLeft, ChevronRight, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePropertyFilter } from '../contexts/PropertyFilterContext';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import MapView from '../components/Dashboard/MapView';
import DashboardFooter from '../components/Dashboard/DashboardFooter';
import { getProperties, MOCK_PROPERTIES } from '../services/mockDataService';

const DashboardDiscover = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeTab, setActiveTab: setActiveTabFromContext } = usePropertyFilter();

  // Local state
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [beds, setBeds] = useState(null);
  const [baths, setBaths] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [addedToSite, setAddedToSite] = useState('anytime');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Get filtered properties from mock data
  const filteredProperties = useMemo(() => {
    let properties = [...MOCK_PROPERTIES];

    // Filter by type (buy/rent)
    if (activeTab === 'buy') {
      properties = properties.filter(p => p.property_type === 'sale');
    } else if (activeTab === 'rent') {
      properties = properties.filter(p => p.property_type === 'rent');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      properties = properties.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.address_line_1.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.postcode.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (locationQuery.trim()) {
      const loc = locationQuery.toLowerCase();
      properties = properties.filter(p =>
        p.city.toLowerCase().includes(loc) ||
        p.postcode.toLowerCase().includes(loc) ||
        p.address_line_1.toLowerCase().includes(loc)
      );
    }

    // Filter by price range
    if (priceRange.min !== null) {
      properties = properties.filter(p => p.price >= priceRange.min);
    }
    if (priceRange.max !== null) {
      properties = properties.filter(p => p.price <= priceRange.max);
    }

    // Filter by bedrooms
    if (beds !== null) {
      properties = properties.filter(p => p.bedrooms >= parseInt(beds));
    }

    // Filter by bathrooms
    if (baths !== null) {
      properties = properties.filter(p => p.bathrooms >= parseInt(baths));
    }

    return properties;
  }, [activeTab, searchQuery, locationQuery, priceRange, beds, baths]);

  // Paginated properties
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  // Simulate loading when filters change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, locationQuery, priceRange, beds, baths]);

  // Update propertyType when activeTab changes
  useEffect(() => {
    if (activeTab === 'buy') {
      setPropertyType('sale');
    } else if (activeTab === 'rent') {
      setPropertyType('rent');
    } else {
      setPropertyType('all');
    }
  }, [activeTab]);

  // Transform property for display
  const transformPropertyForCard = (property) => {
    const images = property.image_urls || [];
    return {
      id: property.id,
      title: property.title,
      location: `${property.address_line_1}, ${property.city}`,
      price: property.price,
      type: property.property_type === 'rent' ? 'Rent' : 'Sale',
      property_type: property.property_type,
      beds: property.bedrooms,
      baths: property.bathrooms,
      image: images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      images: images,
      description: property.description,
      view_count: property.view_count || 0,
      latitude: property.latitude,
      longitude: property.longitude,
      listedDate: new Date(property.created_at),
      has_virtual_tour: property.has_virtual_tour,
      virtual_tour_url: property.virtual_tour_url
    };
  };

  // Map properties for map view
  const mapProperties = filteredProperties
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id,
      name: p.title,
      lat: parseFloat(p.latitude),
      lng: parseFloat(p.longitude),
      price: p.property_type === 'rent' ? `£${p.price}/mo` : `£${(p.price / 1000).toFixed(0)}k`,
      address: p.address_line_1 || p.city
    }));

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setPropertyType('all');
    setPriceRange({ min: null, max: null });
    setBeds(null);
    setBaths(null);
    setCurrentPage(1);
  };

  // Handler for "Added to site" filter change (commented out - requires additional state and functions)
  // const handleAddedToSiteChange = useCallback((value) => {
  //   setAddedToSite(value);
  //   
  //   // Update URL params
  //   const newParams = new URLSearchParams(searchParams);
  //   if (value === 'anytime') {
  //     newParams.delete('added');
  //   } else {
  //     newParams.set('added', value);
  //   }
  //   setSearchParams(newParams);
  //   
  //   // Fetch with new filter
  //   fetchPropertiesFromAPI(activeTab, true);
  // }, [searchParams, setSearchParams, activeTab, locationQuery, searchQuery, priceRange, beds, baths, fetchPropertiesFromAPI]);
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Discover Properties</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {activeTab === 'buy' ? 'Properties for Sale' : activeTab === 'rent' ? 'Properties for Rent' : 'Find your perfect UK property'}
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
              ? 'bg-orange-500 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'map'
              ? 'bg-orange-500 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
          >
            <MapIcon size={20} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-6">
        {/* Main Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by postcode, street, address, or property title..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="City or postcode"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={propertyType}
                onChange={(e) => {
                  setPropertyType(e.target.value);
                  if (e.target.value === 'sale') setActiveTabFromContext('buy');
                  else if (e.target.value === 'rent') setActiveTabFromContext('rent');
                  else setActiveTabFromContext('all');
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
              >
                <option value="all">All Types</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceRange.min || ''}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Min £"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={priceRange.max || ''}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Max £"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Beds & Baths */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Beds</label>
              <select
                value={beds || ''}
                onChange={(e) => setBeds(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm appearance-none"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Baths</label>
              <select
                value={baths || ''}
                onChange={(e) => setBaths(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm appearance-none"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || locationQuery || priceRange.min || priceRange.max || beds || baths) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Properties Display */}
      {viewMode === 'map' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="h-[600px] lg:h-[700px]">
            {mapProperties.length > 0 ? (
              <MapView houses={mapProperties} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">No properties with location data available</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedProperties.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No properties found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Try adjusting your filters to find what you're looking for.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {paginatedProperties.map((property) => {
                  const transformed = transformPropertyForCard(property);
                  return (
                    <PropertyCard
                      key={property.id}
                      property={transformed}
                      onViewDetails={(p) => navigate(`/user/dashboard/property/${p.id}`)}
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length} properties
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <DashboardFooter />
    </div>
  );
};

export default DashboardDiscover;
