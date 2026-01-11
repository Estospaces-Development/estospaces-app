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
    <div className="p-4 lg:p-6 space-y-8 max-w-7xl mx-auto dark:bg-[#0a0a0a] min-h-screen transition-all duration-300">
      {/* Hero Search Section - Modern Polished Design */}
      <div className="relative rounded-2xl shadow-2xl overflow-hidden min-h-[480px] lg:min-h-[520px] flex flex-col items-center justify-center animate-fadeIn">
        {/* Background Image with smooth loading */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2')`,
          }}
        />
        {/* Elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/50 to-orange-900/30" />
        
        {/* Hero Content - Clean & Readable */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight tracking-tight animate-slideUp">
            Find your perfect{' '}
            <span className="text-orange-400">home</span>
          </h1>
          <p className="text-white/90 text-base md:text-lg mb-8 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '0.1s' }}>
            Search thousands of properties for sale and rent across the UK
          </p>

          {/* Search Card - Clean Glass Effect */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 lg:p-6 shadow-2xl max-w-3xl mx-auto animate-slideUp" style={{ animationDelay: '0.2s' }}>
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedPropertyType('buy');
                  setSearchParams({ type: 'buy' }, { replace: true });
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedPropertyType === 'buy'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedPropertyType('rent');
                  setSearchParams({ type: 'rent' }, { replace: true });
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedPropertyType === 'rent'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Rent
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedPropertyType('sold');
                  setSearchParams({ type: 'sold' }, { replace: true });
                }}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedPropertyType === 'sold'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Sold
              </button>
            </div>
            {/* Search Form - Inline */}
            <form onSubmit={handleLocationSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter postcode, city, or area..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px] shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Searching</span>
                  </>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Action CTAs - Enhanced */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveTab('buy');
            navigate('/user/dashboard/discover?tab=buy');
          }}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 text-left"
        >
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
            <Home size={22} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Buy Property</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Find your dream home</p>
          <span className="text-orange-500 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Browse <ArrowRight size={14} />
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('rent');
            navigate('/user/dashboard/discover?tab=rent');
          }}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 text-left"
        >
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
            <MapPin size={22} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Rent Property</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Explore rentals</p>
          <span className="text-blue-500 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Explore <ArrowRight size={14} />
          </span>
        </button>

        <button
          onClick={() => navigate('/user/dashboard/saved')}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 text-left"
        >
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
            <Heart size={22} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Saved</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{savedProperties?.length || 0} properties</p>
          <span className="text-pink-500 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            View All <ArrowRight size={14} />
          </span>
        </button>

        <button
          onClick={() => navigate('/user/dashboard/applications')}
          className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 text-left"
        >
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
            <FileText size={22} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Applications</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Track progress</p>
          <span className="text-emerald-500 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Manage <ArrowRight size={14} />
          </span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-slideDown">
          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
            <AlertCircle className="text-red-600 dark:text-red-400" size={18} />
          </div>
          <p className="flex-1 text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 p-1.5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Location Message (Info/Warning) */}
      {locationMessage && !error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 animate-slideDown">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
            <AlertCircle className="text-amber-600 dark:text-amber-400" size={18} />
          </div>
          <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">{locationMessage}</p>
          <button
            onClick={() => setLocationMessage(null)}
            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 p-1.5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
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

