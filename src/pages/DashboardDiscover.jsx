import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Home, DollarSign, Bed, Bath, Map as MapIcon, Grid, List, ChevronLeft, ChevronRight, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProperties } from '../contexts/PropertiesContext';
import { usePropertyFilter } from '../contexts/PropertyFilterContext';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import MapView from '../components/Dashboard/MapView';
import * as postcodeService from '../services/postcodeService';

import DashboardFooter from '../components/Dashboard/DashboardFooter';

const DashboardDiscover = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeTab, getApiType, setActiveTab: setActiveTabFromContext } = usePropertyFilter();
  const {
    properties: contextProperties,
    loading: contextLoading,
    error: contextError,
    filters,
    setFilters,
    pagination,
    setPagination,
    fetchProperties,
    searchProperties,
  } = useProperties();

  // Local state for properties fetched from API
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [beds, setBeds] = useState(null);
  const [baths, setBaths] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [postcodeSuggestions, setPostcodeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionTimer, setSuggestionTimer] = useState(null);
  const [addedToSite, setAddedToSite] = useState('anytime');

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProperties(searchQuery);
      } else {
        fetchProperties(true);
      }
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  // Fetch properties from API based on activeTab and all filters
  const fetchPropertiesFromAPI = useCallback(async (type = 'all', reset = true) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: reset ? '1' : pagination.page.toString(),
        limit: '20',
        country: 'UK',
      });

      // Apply listing type filter
      if (type === 'buy' || type === 'sale') {
        params.append('type', 'sale');
      } else if (type === 'rent') {
        params.append('type', 'rent');
      }
      // 'all' → no type parameter

      // Apply location filter
      if (locationQuery) {
        params.append('postcode', locationQuery);
      }

      // Apply search query
      if (searchQuery) {
        params.append('q', searchQuery);
      }

      // Apply price range filters
      if (priceRange.min !== null) {
        params.append('min_price', priceRange.min.toString());
      }
      if (priceRange.max !== null) {
        params.append('max_price', priceRange.max.toString());
      }

      // Apply beds filter
      if (beds !== null) {
        params.append('bedrooms', beds.toString());
      }

      // Apply baths filter
      if (baths !== null) {
        params.append('bathrooms', baths.toString());
      }

      // Apply added to site filter
      if (addedToSite && addedToSite !== 'anytime') {
        const now = new Date();
        let dateFrom = new Date();

        switch (addedToSite) {
          case '24hours':
            dateFrom.setDate(now.getDate() - 1);
            break;
          case '3days':
            dateFrom.setDate(now.getDate() - 3);
            break;
          case '7days':
            dateFrom.setDate(now.getDate() - 7);
            break;
          case '14days':
            dateFrom.setDate(now.getDate() - 14);
            break;
          default:
            dateFrom = null;
        }

        if (dateFrom) {
          params.append('created_after', dateFrom.toISOString());
        }
      }

      // Use the Vite proxy endpoint (in dev) or direct API (in prod)
      const apiUrl = `/api/properties?${params.toString()}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch properties');
      }

      setProperties(result.data || []);
      setTotalCount(result.pagination?.total || result.count || 0);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching properties from API:', err);
      }
      setError(err.message || 'Failed to fetch properties. Please try again.');
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [locationQuery, searchQuery, priceRange, beds, baths, pagination.page]);

  // Fetch properties when activeTab or filters change
  useEffect(() => {
    fetchPropertiesFromAPI(activeTab, true);
  }, [activeTab, fetchPropertiesFromAPI]);

  // Re-fetch when price range, beds, baths, or addedToSite change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPropertiesFromAPI(activeTab, true);
    }, 500);

    return () => clearTimeout(timer);
  }, [priceRange.min, priceRange.max, beds, baths, addedToSite]);

  // Re-fetch when location changes (with debounce)
  useEffect(() => {
    if (!showSuggestions) {
      const timer = setTimeout(() => {
        fetchPropertiesFromAPI(activeTab, true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [locationQuery, showSuggestions]);

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

  // Handle postcode autocomplete
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (locationQuery.length >= 2) {
        const suggestions = await postcodeService.getPostcodeSuggestions(locationQuery);
        setPostcodeSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setPostcodeSuggestions([]);
        setShowSuggestions(false);
      }
    };

    if (suggestionTimer) {
      clearTimeout(suggestionTimer);
    }

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce for 300ms

    setSuggestionTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [locationQuery]);

  const handlePostcodeSelect = (postcode) => {
    setLocationQuery(postcode);
    setShowSuggestions(false);
    setPostcodeSuggestions([]);
  };

  // Transform properties for display
  const transformPropertyForCard = (property) => {
    const images = property.image_urls
      ? (Array.isArray(property.image_urls) ? property.image_urls : JSON.parse(property.image_urls || '[]'))
      : [];

    return {
      id: property.id,
      title: property.title,
      location: property.address_line_1 || `${property.city || ''} ${property.postcode || ''}`.trim() || 'UK',
      price: property.price,
      type: property.property_type === 'rent' ? 'Rent' : property.property_type === 'sale' ? 'Sale' : 'Property',
      property_type: property.property_type,
      beds: property.bedrooms,
      baths: property.bathrooms,
      image: images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      description: property.description,
      is_saved: property.is_saved || false,
      is_applied: property.is_applied || false,
      application_status: property.application_status || null,
      view_count: property.view_count || 0,
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
    setPropertyType('all');
    setPriceRange({ min: null, max: null });
    setBeds(null);
    setBaths(null);
    setShowSuggestions(false);
    setPostcodeSuggestions([]);
  };

  // Handler for "Added to site" filter change
  const handleAddedToSiteChange = useCallback((value) => {
    setAddedToSite(value);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value === 'anytime') {
      newParams.delete('added');
    } else {
      newParams.set('added', value);
    }
    setSearchParams(newParams);

    // Fetching is handled by useEffect on addedToSite change
  }, [searchParams, setSearchParams]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchProperties(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mock properties for fallback (if Supabase is not configured)
  const mockProperties = [
    {
      id: 1,
      title: 'Modern Apartment',
      location: '123 Main St, Downtown',
      price: 2450,
      type: 'Apartment',
      beds: 2,
      baths: 2,
      area: 1200,
      rating: 4.8,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60',
      description: 'A beautiful modern apartment in the heart of downtown.'
    },
    {
      id: 2,
      title: 'Cozy House',
      location: '456 Oak Ave, Suburbs',
      price: 1800,
      type: 'House',
      beds: 3,
      baths: 2,
      area: 1800,
      rating: 4.5,
      reviews: 12,
      image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60',
      description: 'Perfect family home with a large backyard.'
    },
    {
      id: 3,
      title: 'Luxury Condo',
      location: '789 Pine Ln, Waterfront',
      price: 3200,
      type: 'Condo',
      beds: 2,
      baths: 2,
      area: 1500,
      rating: 4.9,
      reviews: 36,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
      description: 'Stunning waterfront views and luxury amenities.'
    },
    {
      id: 4,
      title: 'Studio Loft',
      location: '101 Maple Dr, Arts District',
      price: 2100,
      type: 'Studio',
      beds: 1,
      baths: 1,
      area: 800,
      rating: 4.6,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=60',
      description: 'Open concept loft in the trendy arts district.'
    },
    {
      id: 5,
      title: 'Family Home',
      location: '202 Cedar Ct, Residential',
      price: 2750,
      type: 'House',
      beds: 4,
      baths: 3,
      area: 2200,
      rating: 4.7,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&auto=format&fit=crop&q=60',
      description: 'Spacious family home in a quiet neighborhood.'
    },
    {
      id: 6,
      title: 'Penthouse',
      location: '303 Birch Blvd, City Center',
      price: 4950,
      type: 'Apartment',
      beds: 3,
      baths: 3,
      area: 3000,
      rating: 5.0,
      reviews: 8,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
      description: 'Exclusive penthouse with panoramic city views.'
    },
  ];

  const displayProperties = properties.length > 0 ? properties : [];
  const totalPages = Math.ceil(pagination.total / pagination.limit);

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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-orange-500 mb-2">Discover Properties</h1>
        <p className="text-gray-600 dark:text-orange-400">Find your perfect UK property</p>
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
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-white border border-gray-300 dark:border-gray-300 text-gray-700 dark:text-gray-800'
              }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'map'
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
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by postcode, street, address, keyword, or property title..."
              className="w-full pl-10 pr-4 py-3 border border-orange-300 dark:border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base bg-white dark:bg-white text-gray-900 dark:text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (locationQuery.length >= 2 && postcodeSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Postcode, street, or address"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              />

              {/* Postcode Suggestions Dropdown */}
              {showSuggestions && postcodeSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-white border border-gray-300 dark:border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {postcodeSuggestions.map((postcode, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePostcodeSelect(postcode)}
                      className="w-full text-left px-4 py-2 hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-2"
                    >
                      <MapPin size={14} className="text-orange-500" />
                      <span className="font-medium">{postcode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={propertyType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setPropertyType(newType);
                  // Update URL query parameter
                  if (newType === 'all') {
                    searchParams.delete('type');
                  } else {
                    searchParams.set('type', newType);
                  }
                  setSearchParams(searchParams, { replace: true });
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              >
                <option value="all">All Types</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="number"
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Min £"
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                />
              </div>
              <span className="text-gray-400 dark:text-gray-500">-</span>
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="number"
                  value={priceRange.max || ''}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Max £"
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Beds & Baths Filter */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Beds</label>
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
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Baths</label>
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

          {/* Added to Site Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-2">Added to site</label>
            <div className="relative">
              <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={addedToSite}
                onChange={(e) => handleAddedToSiteChange(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-gray-300 dark:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
              >
                <option value="anytime">Anytime</option>
                <option value="24hours">Last 24 hours</option>
                <option value="3days">Last 3 days</option>
                <option value="7days">Last 7 days</option>
                <option value="14days">Last 14 days</option>
              </select>
            </div>
          </div>
        </div>
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
                onClick={() => fetchProperties(true)}
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
                No properties found for {activeTab === 'buy' ? 'Buy' : activeTab === 'rent' ? 'Rent' : 'this category'}
              </h3>
              <p className="text-gray-500 dark:text-orange-400 mb-4">
                {activeTab === 'buy'
                  ? "We couldn't find any properties for sale. Try switching to 'Rent' or 'Browse Properties' to see all available listings."
                  : activeTab === 'rent'
                    ? "We couldn't find any rental properties. Try switching to 'Buy' or 'Browse Properties' to see all available listings."
                    : "Try adjusting your search or filters to find what you're looking for."
                }
              </p>
              <div className="flex gap-3 justify-center">
                {activeTab !== 'all' && (
                  <button
                    onClick={() => setActiveTabFromContext('all')}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Browse All Properties
                  </button>
                )}
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {properties.map((property) => {
                  const transformed = transformPropertyForCard(property);
                  return transformed ? (
                    <PropertyCard
                      key={property.id}
                      property={transformed}
                      onViewDetails={(p) => navigate(`/user/dashboard/property/${p.id}`)}
                    />
                  ) : null;
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page {pagination.page} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= totalPages || !pagination.hasMore}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardDiscover;
