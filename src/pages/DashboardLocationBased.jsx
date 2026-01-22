import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Home, Heart, FileText, Map as MapIcon,
  ArrowRight, MapPin, AlertCircle, TrendingUp, Star,
  Loader2, X, Compass, Clock, Zap, Eye, Bath, Filter, ChevronDown, DollarSign, Sparkles,
  Building2, Key, Bookmark, ClipboardList
} from 'lucide-react';
import { usePropertyFilter } from '../contexts/PropertyFilterContext';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import NearbyPropertiesMap from '../components/Dashboard/NearbyPropertiesMap';
import PropertyDiscoverySection from '../components/Dashboard/PropertyDiscoverySection';
import DashboardFooter from '../components/Dashboard/DashboardFooter';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';
import { useUserLocation } from '../contexts/LocationContext';
import { useProperties } from '../contexts/PropertiesContext';
import * as propertyDataService from '../services/propertyDataService';
import * as propertiesService from '../services/propertiesService';
import { MOCK_PROPERTIES } from '../services/mockDataService';
import BrokerRequestWidget from '../components/Dashboard/BrokerRequestWidget';
import ApplicationTimelineWidget from '../components/Dashboard/ApplicationTimelineWidget';

const DashboardLocationBased = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { savedProperties } = useSavedProperties();
  const { activeLocation, loading: locationLoading, updateLocationFromSearch } = useUserLocation();
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

  // State for selected filter options (array for multiple selections)
  const [selectedFilters, setSelectedFilters] = useState(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      // Split comma-separated filters
      return filterParam.split(',').filter(f => f);
    }
    return []; // Empty array means "All Properties"
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

  // Filtered properties state (for when user applies filters)
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [showFilteredResults, setShowFilteredResults] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);

  // Loading states for each section
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false); // Separate loading state for search button
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

    // Use Mock Data immediately - no artificial delay
    const mockProps = MOCK_PROPERTIES;

    // Distribute mock properties across sections
    setDiscoveryProperties(mockProps);
    setMostViewedProperties(mockProps.slice(0, 4));
    setTrendingProperties(mockProps.slice(2, 6));
    setRecentlyAddedProperties(mockProps.slice(0, 3));
    setHighDemandProperties(mockProps.slice(3, 7));

    setStats(prev => ({
      ...prev,
      totalProperties: mockProps.length,
    }));

    if (showLoading) {
      setLoading(false);
      setLoadingDiscovery(false);
      setLoadingMostViewed(false);
      setLoadingTrending(false);
      setLoadingRecentlyAdded(false);
      setLoadingHighDemand(false);
    }
  }, []);

  // State for filter dropdown
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Sync selectedPropertyType with URL params when they change
  useEffect(() => {
    const urlType = searchParams.get('type');
    if (urlType === 'buy' || urlType === 'rent' || urlType === 'sold') {
      setSelectedPropertyType(urlType);
    } else if (!urlType || window.location.pathname === '/user/dashboard') {
      setSelectedPropertyType('sold');
    }
  }, [searchParams]);

  // Sync selectedFilters with URL params when they change
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter) {
      setSelectedFilters(urlFilter.split(',').filter(f => f));
    } else {
      setSelectedFilters([]);
    }
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

  // Fetch filtered properties directly using REST API
  const fetchFilteredProperties = useCallback(async () => {
    setSearchLoading(true);
    setError(null);
    setShowFilteredResults(true);

    try {
      // For Demo mode, use Mock Data as primary source
      // This ensures a fast and reliable experience for the user
      console.log('[Dashboard] Filtering properties using Mock Data Service');

      let results = [...MOCK_PROPERTIES];

      // Filter by property type (Buy/Rent/Sold)
      if (selectedPropertyType === 'rent') {
        results = results.filter(p => p.property_type === 'rent');
      } else {
        results = results.filter(p => p.property_type === 'sale' || p.listing_type === 'sale');
        if (selectedPropertyType === 'sold') {
          // In real app, we'd filter by status=sold, here we'll just use a subset for demo
          results = results.slice(0, 5);
        }
      }

      // Apply filter options (Multiple filters work as OR or AND depending on logic)
      if (selectedFilters.length > 0) {
        let filteredResults = [];

        if (selectedFilters.includes('recently_added')) {
          // Properties created in last 7 days (for demo)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const recent = results.filter(p => new Date(p.created_at || Date.now()) >= sevenDaysAgo);
          filteredResults = [...filteredResults, ...recent];
        }

        if (selectedFilters.includes('most_viewed')) {
          // Properties with high view count
          const popular = results.filter(p => (p.view_count || 0) > 200);
          filteredResults = [...filteredResults, ...popular];
        }

        if (selectedFilters.includes('high_demand')) {
          // For demo, similar to most viewed or specific ones
          const highDemand = results.filter(p => (p.view_count || 0) > 150);
          filteredResults = [...filteredResults, ...highDemand];
        }

        if (selectedFilters.includes('budget_friendly')) {
          // Under 1M for sale, under 2k for rent
          const budget = results.filter(p => {
            const price = parseFloat(p.price) || 0;
            return selectedPropertyType === 'rent' ? price <= 2000 : price <= 1000000;
          });
          filteredResults = [...filteredResults, ...budget];
        }

        // Remove duplicates if multiple filters are selected
        results = [...new Set(filteredResults)];
      }

      // Apply location filter if text exists
      const locationTerm = searchInput.trim().toLowerCase();
      if (locationTerm) {
        results = results.filter(p =>
          (p.city || '').toLowerCase().includes(locationTerm) ||
          (p.address_line_1 || '').toLowerCase().includes(locationTerm) ||
          (p.postcode || '').toLowerCase().includes(locationTerm)
        );
      }

      // Sort by created_at desc by default
      results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      // Immediate state update - no artificial delay
      setFilteredProperties(results);
      setFilteredCount(results.length);

      if (results.length === 0) {
        setLocationMessage('No properties found matching your filters. Try adjusting your search criteria.');
      }
      setSearchLoading(false);

      return; // Exit early as we're using mock data

      // Real API logic below (commented out or kept as secondary)
      /*
      const supabaseUrl = 'https://yydtsteyknbpfpxjtlxe.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';
      // ... rest of API code ...
      */
    } catch (err) {
      console.error('[Dashboard] Error filtering properties:', err);
      // Fallback already handled by using mock data above
      setSearchLoading(false);
    }
  }, [selectedPropertyType, selectedFilters, searchInput]);

  // Handle location search
  const handleLocationSearch = useCallback((e, searchQuery = null) => {
    e?.preventDefault();

    setError(null);
    setLocationMessage(null);

    // If filters are selected or search input is provided, fetch and show results on this page
    if (selectedFilters.length > 0 || searchInput.trim()) {
      fetchFilteredProperties();
    } else {
      // Navigate to discover page for general browsing
      const params = new URLSearchParams();

      if (selectedPropertyType === 'buy') {
        params.set('tab', 'buy');
      } else if (selectedPropertyType === 'rent') {
        params.set('tab', 'rent');
      } else if (selectedPropertyType === 'sold') {
        params.set('tab', 'buy');
        params.set('status', 'sold');
      }

      navigate(`/user/dashboard/discover?${params.toString()}`);
    }
  }, [searchInput, selectedPropertyType, selectedFilters, navigate, fetchFilteredProperties]);

  // Listen for header search location events
  useEffect(() => {
    const handleHeaderLocationSearch = (event) => {
      const { query } = event.detail;
      if (query) {
        setSearchInput(query);
        // Trigger search after a short delay to ensure state is updated
        setTimeout(() => {
          handleLocationSearch({ preventDefault: () => { } }, query);
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

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get first name from user metadata
  const firstName = currentUser?.user_metadata?.full_name?.split(' ')[0] ||
    currentUser?.user_metadata?.name?.split(' ')[0] ||
    currentUser?.email?.split('@')[0] ||
    'there';

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-[#0a0a0a] min-h-screen transition-all duration-300">

      {/* Simple Welcome Greeting */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
            {getGreeting()}, <span className="text-orange-500 capitalize">{firstName}</span> 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            What would you like to do today?
          </p>
        </div>
      </div>

      {/* Hero Search Section - Modern Polished Design */}
      <div className="relative rounded-3xl shadow-soft-xl overflow-hidden min-h-[500px] lg:min-h-[550px] flex flex-col items-center justify-center animate-fadeIn group">
        {/* Background Image with smooth loading and parallax effect */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2')`,
          }}
        />
        {/* Elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/50 to-orange-900/30" />

        {/* Top decorative gradient for seamless header blend */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/20 to-transparent" />

        {/* Hero Content - Enhanced Contrast for Bright Image */}
        <div className="relative z-10 text-center px-4 md:px-6 max-w-5xl mx-auto w-full">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight animate-slideUp"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)' }}
          >
            Find your <span className="text-orange-400" style={{ textShadow: '0 4px 20px rgba(251,146,60,0.4), 0 2px 8px rgba(0,0,0,0.3)' }}>perfect space</span>
          </h1>
          <p
            className="text-white text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-slideUp font-medium tracking-wide"
            style={{ animationDelay: '0.1s', textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)' }}
          >
            Discover thousands of premium properties for sale and rent across the UK
          </p>

          {/* Search Card - Clean Glass Effect */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 shadow-2xl max-w-4xl mx-auto animate-slideUp border border-white/50 ring-1 ring-black/5" style={{ animationDelay: '0.2s' }}>
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 bg-gray-100/80 p-1.5 rounded-2xl w-fit mx-auto border border-gray-200/50">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedPropertyType('buy');
                  setSearchParams({ type: 'buy' }, { replace: true });
                }}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedPropertyType === 'buy'
                  ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
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
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedPropertyType === 'rent'
                  ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
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
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedPropertyType === 'sold'
                  ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
              >
                Sold
              </button>
            </div>

            {/* Filter Options Row - Multiple Selection */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {[
                { id: 'all', label: 'All Properties', icon: Sparkles },
                { id: 'recently_added', label: 'Recently Added', icon: Clock },
                { id: 'most_viewed', label: 'Most Visited', icon: Eye },
                { id: 'high_demand', label: 'High Demand', icon: TrendingUp },
                { id: 'budget_friendly', label: 'Budget Friendly', icon: DollarSign },
              ].map((filter) => {
                const Icon = filter.icon;
                const isAllSelected = filter.id === 'all' && selectedFilters.length === 0;
                const isSelected = filter.id === 'all' ? isAllSelected : selectedFilters.includes(filter.id);

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      let newFilters;

                      if (filter.id === 'all') {
                        // Clicking "All Properties" clears all other selections
                        newFilters = [];
                      } else {
                        // Toggle the specific filter
                        if (selectedFilters.includes(filter.id)) {
                          // Remove the filter
                          newFilters = selectedFilters.filter(f => f !== filter.id);
                        } else {
                          // Add the filter
                          newFilters = [...selectedFilters, filter.id];
                        }
                      }

                      setSelectedFilters(newFilters);

                      // Update URL params
                      const newParams = new URLSearchParams(searchParams);
                      if (newFilters.length === 0) {
                        newParams.delete('filter');
                      } else {
                        newParams.set('filter', newFilters.join(','));
                      }
                      setSearchParams(newParams, { replace: true });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
                      ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-none'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-orange-500' : 'text-gray-400'} />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Form - Inline */}
            <form onSubmit={handleLocationSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group/input">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-orange-500 transition-colors" size={22} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter postcode, city, or area..."
                  className="w-full pl-14 pr-12 py-4 bg-gray-50 hover:bg-white border-2 border-transparent focus:bg-white focus:border-orange-500 rounded-2xl text-gray-900 placeholder-gray-400 text-lg transition-all duration-300 outline-none shadow-inner"
                  disabled={searchLoading}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 min-w-[160px] shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:-translate-y-1"
              >
                {searchLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
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

      {/* Quick Action CTAs - Property Tech Style (hidden when showing filtered results) */}
      {!showFilteredResults && (
        <>
          {/* PROMINENT: 10-Minute Broker Response - Full Width Banner */}
          <BrokerRequestWidget />

          {/* Quick Action Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setActiveTab('buy');
                navigate('/user/dashboard/discover?tab=buy');
              }}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="p-3.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-violet-500/25">
                <Building2 size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Buy Property</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Find your dream home</p>
              <span className="text-violet-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
              <div className="p-3.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/25">
                <Key size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Rent Property</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Explore rentals</p>
              <span className="text-cyan-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <ArrowRight size={14} />
              </span>
            </button>

            <button
              onClick={() => navigate('/user/dashboard/saved')}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 text-left"
            >
              <div className="p-3.5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/25">
                <Bookmark size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Saved</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{savedProperties?.length || 0} properties</p>
              <span className="text-rose-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                View All <ArrowRight size={14} />
              </span>
            </button>
          </div>

          {/* Real-Time Application Monitoring - Prominent Main Card */}
          <ApplicationTimelineWidget />
        </>
      )}

      {/* Filtered Properties Results */}
      {showFilteredResults && (
        <div className="animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-orange-500">
                {selectedFilters.includes('recently_added') && 'Recently Added Properties'}
                {selectedFilters.includes('most_viewed') && !selectedFilters.includes('recently_added') && 'Most Visited Properties'}
                {selectedFilters.includes('high_demand') && !selectedFilters.includes('recently_added') && !selectedFilters.includes('most_viewed') && 'High Demand Properties'}
                {selectedFilters.includes('budget_friendly') && !selectedFilters.includes('recently_added') && !selectedFilters.includes('most_viewed') && !selectedFilters.includes('high_demand') && 'Budget Friendly Properties'}
                {selectedFilters.length === 0 && searchInput && `Properties in "${searchInput}"`}
                {selectedFilters.length === 0 && !searchInput && 'Search Results'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchLoading ? 'Loading...' : `${filteredCount} ${filteredCount === 1 ? 'property' : 'properties'} found`}
              </p>
            </div>
            <button
              onClick={() => {
                setShowFilteredResults(false);
                setFilteredProperties([]);
                setSelectedFilters([]);
                setSearchInput('');
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              <X size={16} />
              Clear Results
            </button>
          </div>

          {searchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => {
                const transformed = transformPropertyForCard(property);
                if (!transformed) return null;
                return (
                  <PropertyCard
                    key={property.id}
                    property={transformed}
                    onViewDetails={(p) => navigate(`/user/dashboard/property/${p.id}`)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Properties Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or search criteria</p>
              <button
                onClick={() => {
                  setShowFilteredResults(false);
                  setSelectedFilters([]);
                  setSearchInput('');
                  navigate('/user/dashboard/discover');
                }}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Browse All Properties
              </button>
            </div>
          )}

          {/* View More Button */}
          {filteredProperties.length > 0 && filteredCount > 12 && (
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('tab', selectedPropertyType === 'rent' ? 'rent' : 'buy');
                  if (selectedFilters.length > 0) {
                    params.set('filter', selectedFilters.join(','));
                  }
                  if (searchInput) {
                    params.set('location', searchInput);
                  }
                  navigate(`/user/dashboard/discover?${params.toString()}`);
                }}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                View All {filteredCount} Properties
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

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

      {/* Main Map View - Nearby Properties (hidden when showing filtered results) */}
      {!showFilteredResults && (
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
      )}

      {/* Footer Section */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardLocationBased;

