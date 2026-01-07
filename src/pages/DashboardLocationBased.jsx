import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Home, Heart, FileText, Map as MapIcon, 
  ArrowRight, MapPin, AlertCircle, TrendingUp, Star,
  Loader2
} from 'lucide-react';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import NearbyPropertiesMap from '../components/Dashboard/NearbyPropertiesMap';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';
import { useLocation } from '../contexts/LocationContext';
import { useProperties } from '../contexts/PropertiesContext';
import * as propertyDataService from '../services/propertyDataService';
import * as propertiesService from '../services/propertiesService';

const DashboardLocationBased = () => {
  const navigate = useNavigate();
  const { savedProperties } = useSavedProperties();
  const { activeLocation, loading: locationLoading, updateLocationFromSearch } = useLocation();
  const { currentUser, fetchProperties: fetchSupabaseProperties } = useProperties();
  
  const [searchInput, setSearchInput] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [mostViewedProperties, setMostViewedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationMessage, setLocationMessage] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    savedCount: 0,
    applicationsCount: 0,
  });

  // Fetch featured and most viewed properties based on location
  useEffect(() => {
    const fetchProperties = async () => {
      // Wait for location to be available
      if (locationLoading) {
        return;
      }

      // Use default location if activeLocation is not available
      const location = activeLocation || {
        type: 'default',
        postcode: 'SW1A 1AA',
        latitude: 51.5074,
        longitude: -0.1278,
        city: 'London',
        source: 'default',
      };

      setLoading(true);
      setError(null);
      setLocationMessage(null);

      try {
        let fetchedFeatured = [];
        let fetchedMostViewed = [];
        let totalFetched = 0;

        // Try Zoopla API first (if configured)
        const zooplaApiKey = import.meta.env.VITE_ZOOPLA_API_KEY;
        
        if (zooplaApiKey) {
          try {
            const featuredResult = await propertyDataService.getFeaturedProperties({
              location: location,
              limit: 6,
              userId: currentUser?.id,
            });

            fetchedFeatured = featuredResult.properties || [];

            const mostViewedResult = await propertyDataService.getMostViewedProperties({
              location: location,
              limit: 3,
              userId: currentUser?.id,
            });

            fetchedMostViewed = mostViewedResult.properties || [];

            // If no properties found, try nearby fallback
            if (fetchedFeatured.length === 0 && fetchedMostViewed.length === 0) {
              const fallbackResult = await propertyDataService.fetchPropertiesWithFallback({
                location: location,
                radius: 5,
                maxRadius: 20,
                listingStatus: 'both',
              });

              if (fallbackResult.properties && fallbackResult.properties.length > 0) {
                fetchedFeatured = fallbackResult.properties.slice(0, 6);
                setLocationMessage(fallbackResult.message);
              }
            }

            totalFetched = fetchedFeatured.length + fetchedMostViewed.length;
          } catch (zooplaError) {
            console.warn('Zoopla API error, falling back to Supabase:', zooplaError);
            // Fall through to Supabase fallback
          }
        }

        // Fallback to Supabase if Zoopla not configured or failed
        if (fetchedFeatured.length === 0 && fetchedMostViewed.length === 0) {
          try {
            const supabaseResult = await propertiesService.getUKProperties({
              country: 'UK',
              status: 'online',
              limit: 20,
              offset: 0,
              userId: currentUser?.id || null,
            });

            if (supabaseResult && supabaseResult.data && supabaseResult.data.length > 0) {
              fetchedFeatured = supabaseResult.data.slice(0, 6);
              fetchedMostViewed = supabaseResult.data.slice(0, 3);
              totalFetched = supabaseResult.data.length;
            }
          } catch (supabaseError) {
            console.error('Supabase fetch error:', supabaseError);
          }
        }

        // Update state with fetched properties
        setFeaturedProperties(fetchedFeatured);
        setMostViewedProperties(fetchedMostViewed);
        setStats(prev => ({
          ...prev,
          totalProperties: totalFetched,
        }));
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err.message || 'Failed to load properties. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if location is not loading
    if (!locationLoading) {
      fetchProperties();
    }
  }, [activeLocation, currentUser, locationLoading]);

  // Update stats
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      savedCount: savedProperties.length,
    }));
  }, [savedProperties]);

  // Handle location search
  const handleLocationSearch = async (e) => {
    e?.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    const location = await updateLocationFromSearch(searchInput);
    if (location) {
      setSearchInput('');
    }
    setLoading(false);
  };

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
      const combined = [...(featuredProperties || []), ...(mostViewedProperties || [])];
      // Remove duplicates by ID
      const unique = combined.filter((p, index, self) => 
        p && p.id && index === self.findIndex(prop => prop && prop.id === p.id)
      );
      return unique;
    } catch (err) {
      console.error('Error combining properties:', err);
      return [];
    }
  }, [featuredProperties, mostViewedProperties]);

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
      {/* Location Info */}
      {mapLocation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600 dark:text-blue-400" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Showing properties near {mapLocation.postcode || mapLocation.city || 'your location'}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Source: {mapLocation.source === 'search_input' ? 'Search' : 
                         mapLocation.source === 'profile' ? 'Profile' : 
                         mapLocation.source === 'browser_geolocation' ? 'Your Location' : 'Default'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/dashboard/discover')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Change Location
          </button>
        </div>
      )}

      {/* Location Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleLocationSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by postcode, street, or address..."
                  className="w-full pl-10 pr-4 py-3 border border-orange-300 dark:border-orange-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchInput.trim()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            Search
          </button>
        </form>
      </div>

      {/* Location Message */}
      {locationMessage && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">{locationMessage}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Featured Properties - Compact Grid Below Map */}
      {featuredProperties.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Star className="text-orange-500" size={20} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Featured Properties</h2>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Handpicked properties in your area
              </p>
            </div>
            <button
              onClick={() => navigate('/user/dashboard/discover')}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={transformPropertyForCard(property)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLocationBased;

