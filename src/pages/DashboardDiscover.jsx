import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Home, DollarSign, Bed, Bath, Map as MapIcon, Grid, List, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { usePropertyFilter } from '../contexts/PropertyFilterContext';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import MapView from '../components/Dashboard/MapView';

const DashboardDiscover = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeTab, setActiveTab: setActiveTabFromContext } = usePropertyFilter();

  // State for properties and loading
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [propertyType, setPropertyType] = useState('sale');
  const [propertyCategory, setPropertyCategory] = useState('all'); // residential, commercial
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [beds, setBeds] = useState(null);
  const [baths, setBaths] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Page title based on filters
  const [pageTitle, setPageTitle] = useState('Discover Properties');
  const [pageSubtitle, setPageSubtitle] = useState('Find your perfect UK property');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Debounce timer ref
  const debounceTimerRef = React.useRef(null);

  // Fetch properties from Supabase
  const fetchPropertiesFromSupabase = async (options = {}) => {
    const {
      tab = activeTab,
      category = propertyCategory,
      location = locationQuery,
      newOnly = showNewOnly
    } = options;

    setLoading(true);
    setError(null);

    try {
      // Build query
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' });

      // Determine the listing type to filter based on tab
      let listingTypeFilter = null;
      if (tab === 'buy') {
        listingTypeFilter = 'sale';
      } else if (tab === 'rent') {
        listingTypeFilter = 'rent';
      } else if (propertyType && propertyType !== 'all') {
        listingTypeFilter = propertyType;
      }

      // Apply listing type filter
      if (listingTypeFilter) {
        query = query.eq('listing_type', listingTypeFilter);
      }

      // Property category filter (residential vs commercial)
      if (category && category !== 'all') {
        if (category === 'commercial') {
          // Commercial properties - filter by property_type containing 'commercial' or specific commercial types
          query = query.or('property_type.ilike.%commercial%,property_type.ilike.%office%,property_type.ilike.%retail%,property_type.ilike.%industrial%,property_type.ilike.%warehouse%');
        } else if (category === 'residential') {
          // Residential properties
          query = query.or('property_type.ilike.%apartment%,property_type.ilike.%house%,property_type.ilike.%flat%,property_type.ilike.%townhouse%,property_type.ilike.%villa%,property_type.ilike.%cottage%');
        }
      }

      // New homes filter - properties listed in the last 30 days
      if (newOnly) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      }

      // Search query
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address_line_1.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,postcode.ilike.%${searchTerm}%`);
      }

      // Location filter from input or URL
      const locationTerm = location?.trim() || locationQuery.trim();
      if (locationTerm) {
        // Check for specific location keywords
        const locationLower = locationTerm.toLowerCase();
        if (locationLower === 'uk') {
          // No additional filter needed - show all UK properties
        } else {
          query = query.or(`city.ilike.%${locationTerm}%,postcode.ilike.%${locationTerm}%,address_line_1.ilike.%${locationTerm}%,state.ilike.%${locationTerm}%,neighborhood.ilike.%${locationTerm}%`);
        }
      }

      // Price range filter
      if (priceRange.min) {
        query = query.gte('price', priceRange.min);
      }
      if (priceRange.max) {
        query = query.lte('price', priceRange.max);
      }

      // Beds filter
      if (beds) {
        query = query.gte('bedrooms', parseInt(beds));
      }

      // Baths filter
      if (baths) {
        query = query.gte('bathrooms', parseInt(baths));
      }

      // Only show online properties
      query = query.eq('status', 'online');

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by created_at descending (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProperties(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Failed to fetch properties');
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update page title based on filters
  const updatePageTitle = (tab, category, location, newOnly) => {
    let title = 'Discover Properties';
    let subtitle = 'Find your perfect UK property';

    if (newOnly) {
      title = 'New Homes';
      subtitle = 'Recently listed properties in the UK';
    } else if (category === 'commercial') {
      if (tab === 'buy') {
        title = 'Commercial Properties for Sale';
        subtitle = 'Find commercial spaces to buy';
      } else if (tab === 'rent') {
        title = 'Commercial Properties to Rent';
        subtitle = 'Find commercial spaces to rent';
    } else {
        title = 'Commercial Properties';
        subtitle = 'Browse commercial real estate';
      }
    } else if (tab === 'buy') {
      title = 'Homes for Sale';
      subtitle = 'Find your dream home to buy';
    } else if (tab === 'rent') {
      title = 'Homes for Rent';
      subtitle = 'Find your perfect rental property';
    }

    // Add location to subtitle if specified
    if (location && location !== 'uk') {
      const locationCapitalized = location.charAt(0).toUpperCase() + location.slice(1);
      subtitle = `Properties in ${locationCapitalized}`;
    }

    setPageTitle(title);
    setPageSubtitle(subtitle);
  };

  // Track last fetched params to prevent duplicate fetches
  const lastFetchParams = React.useRef('');

  // Get effective filter values from URL or state
  const getEffectiveFilters = () => {
    const tabFromUrl = searchParams.get('tab');
    const typeFromUrl = searchParams.get('type');
    const locationFromUrl = searchParams.get('location');
    const newFromUrl = searchParams.get('new');
    
    return {
      tab: tabFromUrl || activeTab || 'buy',
      category: typeFromUrl || propertyCategory || 'all',
      location: locationFromUrl || locationQuery || '',
      newOnly: newFromUrl === 'true' || showNewOnly
    };
  };

  // Fetch on mount and when URL params change
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const typeFromUrl = searchParams.get('type');
    const locationFromUrl = searchParams.get('location');
    const newFromUrl = searchParams.get('new');
    
    // Handle both URL formats: ?tab=rent OR ?type=rent (legacy)
    let effectiveTab = 'buy';
    let effectiveCategory = 'all';
    
    // Determine effective tab
    if (tabFromUrl === 'buy' || tabFromUrl === 'rent') {
      effectiveTab = tabFromUrl;
    } else if (typeFromUrl === 'buy' || typeFromUrl === 'rent') {
      // Legacy URL format: ?type=buy or ?type=rent
      effectiveTab = typeFromUrl;
    } else if (activeTab === 'buy' || activeTab === 'rent') {
      effectiveTab = activeTab;
    }
    
    // Determine effective category
    if (typeFromUrl === 'residential' || typeFromUrl === 'commercial') {
      effectiveCategory = typeFromUrl;
    }
    
    const effectiveLocation = locationFromUrl || '';
    const effectiveNewOnly = newFromUrl === 'true';
    
    // Update context
    if (effectiveTab !== activeTab) {
      setActiveTabFromContext(effectiveTab);
    }
    
    // Set states
    setPropertyType(effectiveTab === 'buy' ? 'sale' : 'rent');
    setPropertyCategory(effectiveCategory);
    setShowNewOnly(effectiveNewOnly);
    if (effectiveLocation) {
      setLocationQuery(effectiveLocation);
    }
    
    updatePageTitle(effectiveTab, effectiveCategory, effectiveLocation, effectiveNewOnly);
    
    // Fetch properties
    fetchPropertiesFromSupabase({
      tab: effectiveTab,
      category: effectiveCategory,
      location: effectiveLocation,
      newOnly: effectiveNewOnly
    });
  }, [searchParams, page]);

  // Debounced search - only for user typing in search/filter fields
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't debounce if there's no search query yet (initial state)
    if (!searchQuery && !priceRange.min && !priceRange.max && !beds && !baths) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      const { tab, category, location, newOnly } = getEffectiveFilters();
      lastFetchParams.current = ''; // Reset to force fetch
      setPage(1);
      fetchPropertiesFromSupabase({ tab, category, location, newOnly });
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, priceRange.min, priceRange.max, beds, baths]);

  // Transform property for card display
  const transformPropertyForCard = (property) => {
    let images = [];
    try {
      if (property.image_urls) {
        images = Array.isArray(property.image_urls) 
          ? property.image_urls 
          : JSON.parse(property.image_urls || '[]');
      }
    } catch (e) {
      images = [];
    }
    
    return {
      id: property.id,
      title: property.title,
      location: property.address_line_1 || `${property.city || ''} ${property.postcode || ''}`.trim() || 'UK',
      price: property.price,
      type: property.listing_type === 'rent' ? 'Rent' : property.listing_type === 'sale' ? 'Sale' : 'Property',
      property_type: property.property_type,
      listing_type: property.listing_type,
      beds: property.bedrooms,
      baths: property.bathrooms,
      area: property.area,
      image: images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      description: property.description,
      is_saved: false,
      is_applied: false,
      latitude: property.latitude,
      longitude: property.longitude,
      listedDate: property.created_at ? new Date(property.created_at) : new Date(),
    };
  };

  // Transform for map
  const mapProperties = properties
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id,
      name: p.title,
      lat: parseFloat(p.latitude),
      lng: parseFloat(p.longitude),
      price: `£${(p.price / 1000).toFixed(0)}k`,
      address: p.address_line_1 || p.city || 'UK',
    }));

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setPriceRange({ min: null, max: null });
    setBeds(null);
    setBaths(null);
    setPropertyCategory('all');
    setShowNewOnly(false);
    setPage(1);
    // Clear URL params except tab
    const tabFromUrl = searchParams.get('tab');
    const newParams = new URLSearchParams();
    if (tabFromUrl) newParams.set('tab', tabFromUrl);
    setSearchParams(newParams);
    updatePageTitle(tabFromUrl || 'buy', 'all', '', false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchPropertiesFromSupabase();
  };

  const totalPages = Math.ceil(totalCount / limit);
  const hasActiveFilters = searchQuery || locationQuery || priceRange.min || priceRange.max || beds || baths || showNewOnly || propertyCategory !== 'all';

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-orange-500 mb-2">{pageTitle}</h1>
        <p className="text-gray-600 dark:text-orange-400">{pageSubtitle}</p>
        
        {/* Active filter indicators */}
        {(showNewOnly || propertyCategory !== 'all') && (
          <div className="flex gap-2 mt-3">
            {showNewOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                🏠 New Listings
                <button 
                  onClick={() => {
                    setShowNewOnly(false);
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('new');
                    setSearchParams(newParams);
                  }} 
                  className="hover:text-green-900"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {propertyCategory === 'commercial' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                🏢 Commercial
                <button 
                  onClick={() => {
                    setPropertyCategory('all');
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('type');
                    setSearchParams(newParams);
                  }} 
                  className="hover:text-blue-900"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'property' : 'properties'} found`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-white border border-gray-300 dark:border-gray-300 text-gray-700 dark:text-gray-800'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'map'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-white border border-gray-300 dark:border-gray-300 text-gray-700 dark:text-gray-800'
            }`}
          >
            <MapIcon size={20} />
          </button>
        </div>
      </div>

      {/* Smart Search and Filters */}
      <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 p-4 lg:p-6 mb-6">
        {/* Main Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by postcode, street, address, keyword, or property title..."
            className="w-full pl-10 pr-4 py-3 border border-orange-300 dark:border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base bg-white dark:bg-white text-gray-900 dark:text-gray-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Postcode, street, or address"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              />
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Type</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select 
                value={propertyType}
                onChange={(e) => {
                  setPropertyType(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Price Range</label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">£</span>
                <input
                  type="number"
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Min"
                  className="w-full pl-6 pr-2 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">£</span>
                <input
                  type="number"
                  value={priceRange.max || ''}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Max"
                  className="w-full pl-6 pr-2 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Beds Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Beds</label>
              <div className="relative">
                <Bed className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  value={beds || ''}
                  onChange={(e) => setBeds(e.target.value ? e.target.value : null)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>

          {/* Baths Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Baths</label>
              <div className="relative">
                <Bath className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  value={baths || ''}
                  onChange={(e) => setBaths(e.target.value ? e.target.value : null)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
          </div>

        {/* Active Filters & Clear Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {locationQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Location: {locationQuery}
                  <button onClick={() => setLocationQuery('')} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {priceRange.min && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Min: £{priceRange.min.toLocaleString()}
                  <button onClick={() => setPriceRange({ ...priceRange, min: null })} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {priceRange.max && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Max: £{priceRange.max.toLocaleString()}
                  <button onClick={() => setPriceRange({ ...priceRange, max: null })} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {beds && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {beds}+ Beds
                  <button onClick={() => setBeds(null)} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {baths && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {baths}+ Baths
                  <button onClick={() => setBaths(null)} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear All Filters
            </button>
        </div>
        )}
      </div>

      {/* Properties Display */}
      {viewMode === 'map' ? (
        <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 overflow-hidden">
          <div className="h-[600px] lg:h-[700px]">
            {mapProperties.length > 0 ? (
              <MapView houses={mapProperties} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-100">
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
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchPropertiesFromSupabase}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-100 mb-4">
                <AlertCircle className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-orange-500 mb-2">
                No properties found
              </h3>
              <p className="text-gray-500 dark:text-orange-400 mb-4">
                Try adjusting your search or filters to find what you're looking for.
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
                {properties.map((property) => {
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
                <div className="flex items-center justify-between bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-600">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} properties
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-2 border border-gray-300 dark:border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className="p-2 border border-gray-300 dark:border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700"
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
    </div>
  );
};

export default DashboardDiscover;
