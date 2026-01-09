import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Home, Heart, FileText, Map as MapIcon, 
  ArrowRight, MapPin, AlertCircle, TrendingUp, Star,
  Loader2, X, Compass, Clock, Zap, Eye
} from 'lucide-react';
import { usePropertyFilter } from '../contexts/PropertyFilterContext';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import NearbyPropertiesMap from '../components/Dashboard/NearbyPropertiesMap';
import PropertyDiscoverySection from '../components/Dashboard/PropertyDiscoverySection';
import NearestBrokerWidget from '../components/Dashboard/NearestBrokerWidget';
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
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-gray-900 min-h-screen">
      {/* Location Search - Rebuilt with Modern Design */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-lg border-2 border-orange-200 dark:border-orange-800 p-6 lg:p-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Find Your Perfect Property
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Search by postcode, street name, or full address
          </p>
        </div>
        <form 
          onSubmit={handleLocationSearch} 
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <MapPin 
                className={`transition-colors ${
                  searchInput.trim() 
                    ? 'text-orange-500 dark:text-orange-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} 
                size={22} 
              />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                // Support Enter key submission
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (searchInput.trim() && !loading) {
                    handleLocationSearch(e);
                  }
                }
              }}
              onClick={(e) => e.target.focus()}
              placeholder="e.g., SW1A 1AA, Oxford Street, or 123 Main Street, London"
              className="w-full pl-12 pr-4 py-4 text-base border-2 border-orange-300 dark:border-orange-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 focus:border-orange-500 dark:focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 cursor-text transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                // Show validation message if input is empty
                setError('Please enter a postcode, street name, or address to search.');
                // Focus the input field
                const input = e.target.closest('form')?.querySelector('input[type="text"]');
                if (input) {
                  input.focus();
                }
              }
            }}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl active:shadow-md transform hover:scale-[1.02] active:scale-[0.98] min-w-[140px] z-10 relative"
            aria-label="Search for properties"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span className="hidden sm:inline">Searching...</span>
                <span className="sm:hidden">Search...</span>
              </>
            ) : (
              <>
                <Search size={20} className="flex-shrink-0" />
                <span>Search</span>
              </>
            )}
          </button>
        </form>
        {searchInput.trim() && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">
              Enter
            </kbd>
            <span>to search</span>
          </p>
        )}
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

      {/* Stats and Nearest Broker */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Home className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.totalProperties}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Properties Available</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Heart className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.savedCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Saved Favorites</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.applicationsCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Applications</p>
            </div>
          </div>
        </div>
        
        {/* Nearest Broker Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <NearestBrokerWidget />
        </div>
      </div>

      {/* Main Map View - Nearby Properties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapIcon className="text-orange-500" size={20} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Nearby Properties</h2>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-[600px] lg:h-[700px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-orange-500" size={48} />
                <p className="text-gray-600 dark:text-gray-400">Loading nearby properties...</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-[600px] lg:h-[700px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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

      {/* Property Discovery Sections */}
      <div className="space-y-8 lg:space-y-12">
        {/* 1. Property Discovery (Core) */}
        <PropertyDiscoverySection
          title="Property Discovery"
          description="Curated properties based on your location and preferences"
          icon={Compass}
          properties={discoveryProperties}
          loading={loadingDiscovery || loading}
          error={null}
          badge={{ type: 'featured' }}
          viewAllLink="/user/dashboard/discover"
          emptyMessage="No properties found in this area. Try searching for a different location."
          limit={8}
        />

        {/* 2. Most Viewed Properties */}
        <PropertyDiscoverySection
          title="Most Viewed Properties"
          description="Properties that are getting the most attention from other users"
          icon={Eye}
          properties={mostViewedProperties}
          loading={loadingMostViewed || loading}
          error={null}
          badge={{ type: 'most-viewed' }}
          viewAllLink="/user/dashboard/discover?filter=most-viewed"
          emptyMessage="No most viewed properties found yet."
          limit={6}
        />

        {/* 3. Trending Properties */}
        <PropertyDiscoverySection
          title="Trending Properties"
          description="Properties with rapidly increasing engagement and interest"
          icon={TrendingUp}
          properties={trendingProperties}
          loading={loadingTrending || loading}
          error={null}
          badge={{ type: 'trending' }}
          viewAllLink="/user/dashboard/discover?filter=trending"
          emptyMessage="No trending properties found at the moment."
          limit={6}
        />

        {/* 4. Recently Added Properties */}
        <PropertyDiscoverySection
          title="Recently Added Properties"
          description="Fresh listings just added to the platform"
          icon={Clock}
          properties={recentlyAddedProperties}
          loading={loadingRecentlyAdded || loading}
          error={null}
          badge={{ type: 'new' }}
          viewAllLink="/user/dashboard/discover?filter=recent"
          emptyMessage="No recently added properties found."
          limit={6}
        />

        {/* 5. High Demand Properties */}
        <PropertyDiscoverySection
          title="High Demand Properties"
          description="Properties with high application rates and strong interest"
          icon={Zap}
          properties={highDemandProperties}
          loading={loadingHighDemand || loading}
          error={null}
          badge={{ type: 'high-demand' }}
          viewAllLink="/user/dashboard/discover?filter=high-demand"
          emptyMessage="No high demand properties found at the moment."
          limit={6}
        />
      </div>
    </div>
  );
};

export default DashboardLocationBased;

