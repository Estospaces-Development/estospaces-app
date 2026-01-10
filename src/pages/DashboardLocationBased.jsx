import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Home, Heart, FileText, Map as MapIcon, 
  ArrowRight, MapPin, AlertCircle, TrendingUp, Star,
  Loader2, X, Compass, Clock, Zap, Eye, Bath, Filter, ChevronDown, DollarSign, Sparkles
} from 'lucide-react';
import { usePropertyFilter } from '../contexts/PropertyFilterContext';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import NearbyPropertiesMap from '../components/Dashboard/NearbyPropertiesMap';
import PropertyDiscoverySection from '../components/Dashboard/PropertyDiscoverySection';
import DashboardFooter from '../components/Dashboard/DashboardFooter';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';
import { useLocation } from '../contexts/LocationContext';
import { useProperties } from '../contexts/PropertiesContext';
import * as propertyDataService from '../services/propertyDataService';
import * as propertiesService from '../services/propertiesService';

const DashboardLocationBased = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { savedProperties } = useSavedProperties();
  const { activeLocation, loading: locationLoading, updateLocationFromSearch } = useLocation();
  const { currentUser, fetchProperties: fetchSupabaseProperties } = useProperties();
  const { activeTab, setActiveTab } = usePropertyFilter();
  
  // Redirect if URL has invalid path segments
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/user/dashboard/') && currentPath !== '/user/dashboard' && 
        !currentPath.match(/^\/user\/dashboard\/(discover|saved|applications|viewings|messages|reviews|payments|contracts|settings|help|profile|property\/[^/]+)$/)) {
      // Invalid path, redirect to main dashboard
      navigate('/user/dashboard', { replace: true });
    }
  }, [navigate]);
  
  // Initialize search input from URL params if available
  const [searchInput, setSearchInput] = useState(() => {
    return searchParams.get('location') || '';
  });
  
  // State for selected property type tab (Buy/Rent/Sold) - default to 'sold'
  const [selectedPropertyType, setSelectedPropertyType] = useState(() => {
    const urlType = searchParams.get('type');
    if (urlType === 'buy' || urlType === 'rent' || urlType === 'sold') {
      return urlType;
    }
    return 'sold';
  });
  
  // Sync selectedPropertyType with URL params when they change
  useEffect(() => {
    const urlType = searchParams.get('type');
    if (urlType === 'buy' || urlType === 'rent' || urlType === 'sold') {
      setSelectedPropertyType(urlType);
    } else if (!urlType) {
      setSelectedPropertyType('sold');
    }
  }, [searchParams]);
  
  // Discovery sections state
  const [discoveryProperties, setDiscoveryProperties] = useState([]);
  const [mostViewedProperties, setMostViewedProperties] = useState([]);
  const [trendingProperties, setTrendingProperties] = useState([]);
  const [recentlyAddedProperties, setRecentlyAddedProperties] = useState([]);
  const [highDemandProperties, setHighDemandProperties] = useState([]);
  
  // Loading states for each section
  const [loading, setLoading] = useState(true);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [loadingMostViewed, setLoadingMostViewed] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingRecentlyAdded, setLoadingRecentlyAdded] = useState(false);
  const [loadingHighDemand, setLoadingHighDemand] = useState(false);
  
  const [error, setError] = useState(null);
  const [locationMessage, setLocationMessage] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    savedCount: 0,
    applicationsCount: 0,
  });

  // Fetch all discovery sections based on location
  const fetchAllDiscoverySections = useCallback(async (location, showLoading = true) => {
    if (!location) return;

    if (showLoading) {
      setLoading(true);
      setLoadingDiscovery(true);
      setLoadingMostViewed(true);
      setLoadingTrending(true);
      setLoadingRecentlyAdded(true);
      setLoadingHighDemand(true);
    }
    setError(null);
    setLocationMessage(null);

    try {
      // Fetch all sections in parallel for better performance
      const [
        discoveryResult,
        mostViewedResult,
        trendingResult,
        recentlyAddedResult,
        highDemandResult,
      ] = await Promise.all([
        propertyDataService.getPropertyDiscovery({ location, limit: 8, userId: currentUser?.id })
          .catch(err => ({ properties: [], error: err.message })),
        propertyDataService.getMostViewedProperties({ location, limit: 6, userId: currentUser?.id })
          .catch(err => ({ properties: [], error: err.message })),
        propertyDataService.getTrendingProperties({ location, limit: 6, userId: currentUser?.id })
          .catch(err => ({ properties: [], error: err.message })),
        propertyDataService.getRecentlyAddedProperties({ location, limit: 6, userId: currentUser?.id })
          .catch(err => ({ properties: [], error: err.message })),
        propertyDataService.getHighDemandProperties({ location, limit: 6, userId: currentUser?.id })
          .catch(err => ({ properties: [], error: err.message })),
      ]);

      // Update state for each section
      setDiscoveryProperties(discoveryResult.properties || []);
      setMostViewedProperties(mostViewedResult.properties || []);
      setTrendingProperties(trendingResult.properties || []);
      setRecentlyAddedProperties(recentlyAddedResult.properties || []);
      setHighDemandProperties(highDemandResult.properties || []);

      // Calculate total properties count
      const totalCount = 
        (discoveryResult.properties?.length || 0) +
        (mostViewedResult.properties?.length || 0) +
        (trendingResult.properties?.length || 0) +
        (recentlyAddedResult.properties?.length || 0) +
        (highDemandResult.properties?.length || 0);

      setStats(prev => ({
        ...prev,
        totalProperties: totalCount,
      }));

      // If no properties found, try fallback
      if (totalCount === 0) {
        const fallbackResult = await propertyDataService.fetchPropertiesWithFallback({
          location,
          radius: 5,
          maxRadius: 20,
          listingStatus: 'both',
          userId: currentUser?.id,
        });

        if (fallbackResult.properties && fallbackResult.properties.length > 0) {
          // Distribute fallback properties across sections
          const fallbackProps = fallbackResult.properties;
          setDiscoveryProperties(fallbackProps.slice(0, 8));
          setMostViewedProperties(fallbackProps.slice(0, 6));
          setTrendingProperties(fallbackProps.slice(0, 6));
          setRecentlyAddedProperties(fallbackProps.slice(0, 6));
          setHighDemandProperties(fallbackProps.slice(0, 6));
          setLocationMessage(fallbackResult.message || 'Showing similar properties near your search area.');
          setStats(prev => ({
            ...prev,
            totalProperties: fallbackProps.length,
          }));
        } else {
          setLocationMessage('No properties found in this area or nearby. Please try a different location.');
        }
      }
    } catch (err) {
      // Log error (production: use proper error tracking)
      if (import.meta.env.DEV) {
        console.error('Error fetching discovery sections:', err);
      }
      setError(err.message || 'Failed to load properties. Please check your connection and try again.');
    } finally {
      if (showLoading) {
        setLoading(false);
        setLoadingDiscovery(false);
        setLoadingMostViewed(false);
        setLoadingTrending(false);
        setLoadingRecentlyAdded(false);
        setLoadingHighDemand(false);
      }
    }
  }, [currentUser]);

  // State for filter dropdown
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(() => {
    return searchParams.get('filter') || null;
  });
  
  // Sync selectedPropertyType with URL params when they change
  useEffect(() => {
    const urlType = searchParams.get('type');
    if (urlType === 'buy' || urlType === 'rent' || urlType === 'sold') {
      setSelectedPropertyType(urlType);
    } else if (!urlType || window.location.pathname === '/user/dashboard') {
      setSelectedPropertyType('sold');
    }
  }, [searchParams]);
  
  // Sync selectedFilter with URL params when they change
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    setSelectedFilter(urlFilter || null);
  }, [searchParams]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterDropdownOpen && !event.target.closest('.filter-dropdown-container')) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterDropdownOpen]);

  // Initial fetch based on location
  useEffect(() => {
    if (locationLoading) return;

    const urlLocation = searchParams.get('location');
    if (urlLocation && urlLocation.trim()) {
      // URL location will be handled by search function
      return;
    }

    const location = activeLocation || {
      type: 'default',
      postcode: 'SW1A 1AA',
      latitude: 51.5074,
      longitude: -0.1278,
      city: 'London',
      source: 'default',
    };

    fetchAllDiscoverySections(location, true);
  }, [activeLocation, locationLoading, searchParams, fetchAllDiscoverySections]);

  // Update stats
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      savedCount: savedProperties.length,
    }));
  }, [savedProperties]);

  // Handle location search
  const handleLocationSearch = useCallback(async (e, searchQuery = null) => {
    e?.preventDefault();
    const query = (searchQuery || searchInput || '').trim();
    
    // Validate input
    if (!query) {
      setError('Please enter a postcode, street name, or address to search.');
      return;
    }

    setLoading(true);
    setError(null);
    setLocationMessage(null);
    
    try {
      // Update location from search input
      const location = await updateLocationFromSearch(query);
      
      if (location) {
        // Update URL with search query for persistence
        setSearchParams({ location: query });
        
        // Preserve search input (don't clear it)
        if (searchQuery) {
          setSearchInput(searchQuery);
        }
        
        // Fetch all discovery sections for the new location
        await fetchAllDiscoverySections(location, false);
      } else {
        setError('Could not find location. Please check the postcode, street name, or address and try again.');
      }
    } catch (err) {
      console.error('Error searching location:', err);
      setError(err.message || 'Failed to search location. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [searchInput, updateLocationFromSearch, setSearchParams, fetchAllDiscoverySections]);

  // Listen for header search location events
  useEffect(() => {
    const handleHeaderLocationSearch = (event) => {
      const { query } = event.detail;
      if (query) {
        setSearchInput(query);
        // Trigger search after a short delay to ensure state is updated
        setTimeout(() => {
          handleLocationSearch({ preventDefault: () => {} }, query);
        }, 100);
      }
    };

    window.addEventListener('headerLocationSearch', handleHeaderLocationSearch);
    return () => {
      window.removeEventListener('headerLocationSearch', handleHeaderLocationSearch);
    };
  }, [handleLocationSearch]);

  // Transform property for PropertyCard
  const transformPropertyForCard = (property) => {
    if (!property) return null;

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
      featured: property.featured || false,
    };
  };

  // Combine all properties for map view
  const allProperties = useMemo(() => {
    try {
      const combined = [
        ...(discoveryProperties || []),
        ...(mostViewedProperties || []),
        ...(trendingProperties || []),
        ...(recentlyAddedProperties || []),
        ...(highDemandProperties || []),
      ];
      // Remove duplicates by ID
      const unique = combined.filter((p, index, self) => 
        p && p.id && index === self.findIndex(prop => prop && prop.id === p.id)
      );
      return unique;
    } catch (err) {
      console.error('Error combining properties:', err);
      return [];
    }
  }, [discoveryProperties, mostViewedProperties, trendingProperties, recentlyAddedProperties, highDemandProperties]);

  // Map properties for map view (formatted for map component)
  const mapProperties = useMemo(() => {
    try {
      return allProperties
        .filter(p => p && p.latitude && p.longitude)
        .map(p => ({
          id: p.id,
          name: p.title || 'Property',
          lat: parseFloat(p.latitude),
          lng: parseFloat(p.longitude),
          price: `£${((p.price || 0) / 1000).toFixed(0)}k`,
          address: p.address_line_1 || p.city || 'UK',
        }));
    } catch (err) {
      console.error('Error formatting map properties:', err);
      return [];
    }
  }, [allProperties]);

  const handleViewDetails = async (property) => {
    // Track view
    if (currentUser && property.id) {
      await propertyDataService.trackPropertyView(property.id, currentUser.id);
    }
    navigate(`/user/dashboard/property/${property.id}`);
  };

  // Ensure we have a valid location for the map
  const mapLocation = activeLocation || {
    type: 'default',
    postcode: 'SW1A 1AA',
    latitude: 51.5074,
    longitude: -0.1278,
    city: 'London',
    source: 'default',
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-[#0a0a0a] min-h-screen">
      {/* Hero Search Section - Rightmove Style */}
      <div className="relative rounded-xl shadow-2xl overflow-hidden min-h-[500px] lg:min-h-[600px] flex flex-col items-center justify-center mb-8">
        {/* Background Image - Winter Scene */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1549517045-bc93de075e53?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        
        {/* Hero Text Overlay - Centered at top */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center z-10 w-full px-4">
          <p className="text-4xl lg:text-5xl font-bold mb-3 text-orange-500">
            Your complete property journey, simplified.
          </p>
          <p className="text-xl lg:text-2xl text-white font-medium">
            Search, rent, buy, manage properties, and pay bills — all from one intelligent platform.
          </p>
        </div>

        {/* Glass Search Widget - Centered below hero text */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mt-32">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-2xl border border-white/20">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedPropertyType('buy');
                  setSearchParams({ type: 'buy' }, { replace: true });
                }}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  selectedPropertyType === 'buy'
                    ? 'text-white bg-orange-500 border-2 border-orange-600'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedPropertyType('rent');
                  setSearchParams({ type: 'rent' }, { replace: true });
                }}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  selectedPropertyType === 'rent'
                    ? 'text-white bg-orange-500 border-2 border-orange-600'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Rent
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedPropertyType('sold');
                  setSearchParams({ type: 'sold' }, { replace: true });
                }}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  selectedPropertyType === 'sold'
                    ? 'text-white bg-orange-500 border-2 border-orange-600'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Sold
              </button>
              
              {/* Filter Button with Dropdown */}
              <div className="relative ml-auto filter-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsFilterDropdownOpen(!isFilterDropdownOpen);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                    selectedFilter
                      ? 'text-white bg-orange-500 border-2 border-orange-600'
                      : 'text-white hover:bg-white/20 border border-white/30'
                  }`}
                >
                  <Filter size={16} />
                  <span>Filter</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFilter(null);
                          const params = new URLSearchParams(searchParams);
                          params.delete('filter');
                          setSearchParams(params, { replace: true });
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          !selectedFilter
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        All Properties
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFilter('most-viewed');
                          const params = new URLSearchParams(searchParams);
                          params.set('filter', 'most-viewed');
                          setSearchParams(params, { replace: true });
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                          selectedFilter === 'most-viewed'
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Eye size={14} className={selectedFilter === 'most-viewed' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'} />
                        Most Viewed
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFilter('trending');
                          const params = new URLSearchParams(searchParams);
                          params.set('filter', 'trending');
                          setSearchParams(params, { replace: true });
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                          selectedFilter === 'trending'
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <TrendingUp size={14} className={selectedFilter === 'trending' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'} />
                        Trending
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFilter('high-demand');
                          const params = new URLSearchParams(searchParams);
                          params.set('filter', 'high-demand');
                          setSearchParams(params, { replace: true });
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                          selectedFilter === 'high-demand'
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Zap size={14} className={selectedFilter === 'high-demand' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'} />
                        High Demand
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFilter('budget-friendly');
                          const params = new URLSearchParams(searchParams);
                          params.set('filter', 'budget-friendly');
                          setSearchParams(params, { replace: true });
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                          selectedFilter === 'budget-friendly'
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <DollarSign size={14} className={selectedFilter === 'budget-friendly' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'} />
                        Budget Friendly
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Prompt */}
            <p className="text-white text-sm mb-4">
              {selectedPropertyType === 'buy' && 'Search properties for sale'}
              {selectedPropertyType === 'rent' && 'Search properties for rent'}
              {selectedPropertyType === 'sold' && 'Search sold house prices'}
            </p>

            {/* Search Form */}
            <form 
              onSubmit={handleLocationSearch} 
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="School Road, SW4 7DD or York"
                  className="w-full pl-12 pr-4 py-4 text-base bg-white/95 backdrop-blur-sm text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-white/30 placeholder-gray-400"
                  disabled={loading}
                  aria-label="Search for properties by location"
                />
                {searchInput.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearchParams({});
                      setError(null);
                      setLocationMessage(null);
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const query = searchInput.trim();
                  if (query && !loading) {
                    handleLocationSearch(e);
                  } else if (!query) {
                    setError('Please enter a postcode, street name, or address to search.');
                    const input = e.target.closest('form')?.querySelector('input[type="text"]');
                    if (input) {
                      input.focus();
                    }
                  }
                }}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] shadow-lg hover:shadow-xl"
                aria-label="Search for properties"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span className="hidden sm:inline">Searching...</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-white dark:to-white rounded-xl shadow-lg border-2 border-orange-200 dark:border-orange-300 p-6 lg:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Welcome back{currentUser?.email ? `, ${currentUser.email.split('@')[0]}` : ''}!
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm lg:text-base mb-4">
              Discover your perfect property or manage your existing ones. Use the search above to find properties by location, or explore nearby listings on the map.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/user/dashboard/discover?type=buy')}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-orange-50 border border-orange-300 text-orange-600 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              >
                <Home size={16} />
                <span>Browse Properties</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/user/dashboard/saved')}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-orange-50 border border-orange-300 text-orange-600 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              >
                <Heart size={16} />
                <span>Saved ({savedProperties.length || 0})</span>
              </button>
              <button
                onClick={() => navigate('/user/dashboard/applications')}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-orange-50 border border-orange-300 text-orange-600 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              >
                <FileText size={16} />
                <span>My Applications</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:w-auto">
            <div className="bg-white/80 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Home size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{allProperties.length || 0}</p>
                  <p className="text-xs text-gray-600">Properties Available</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {activeLocation?.city || 'London'}
                  </p>
                  <p className="text-xs text-gray-600">Current Location</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Location Message (Info/Warning) */}
      {locationMessage && !error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{locationMessage}</p>
            <button
              onClick={() => setLocationMessage(null)}
              className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Map View - Nearby Properties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapIcon className="text-orange-500" size={20} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-orange-500">Nearby Properties</h2>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Explore properties on the map - click markers to view details
            </p>
          </div>
          <button
            onClick={() => navigate('/user/dashboard/discover')}
            className="flex items-center gap-2 px-4 py-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors"
          >
            <span>Browse All Properties</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {loading || locationLoading ? (
          <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 overflow-hidden">
            <div className="h-[600px] lg:h-[700px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-orange-500" size={48} />
                <p className="text-gray-600 dark:text-gray-300">Loading nearby properties...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600 dark:text-red-400" size={48} />
            <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (allProperties && allProperties.length === 0) ? (
          <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 overflow-hidden">
            <div className="h-[600px] lg:h-[700px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 dark:text-orange-400 mb-4">
                  Try searching for a different location or browse all properties.
                </p>
                <button
                  onClick={() => navigate('/user/dashboard/discover')}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Browse All Properties
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 overflow-hidden">
            <div className="h-[600px] lg:h-[700px]">
              <NearbyPropertiesMap
                properties={mapProperties || []}
                userLocation={mapLocation}
                onPropertyClick={handleViewDetails}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardLocationBased;

