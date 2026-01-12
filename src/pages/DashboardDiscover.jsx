import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Home, DollarSign, Bed, Bath, Map as MapIcon, Grid, List, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// Using direct REST API calls for reliability
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
  const [selectedFilter, setSelectedFilter] = useState('all'); // recently_added, most_viewed, high_demand, budget_friendly

  // Page title based on filters
  const [pageTitle, setPageTitle] = useState('Discover Properties');
  const [pageSubtitle, setPageSubtitle] = useState('Find your perfect UK property');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Debounce timer ref
  const debounceTimerRef = React.useRef(null);

  // Fetch properties using direct REST API call for reliability
  const fetchPropertiesFromSupabase = useCallback(async (options = {}) => {
    const {
      tab = 'buy',
      category = 'all',
      location = '',
      newOnly = false,
      currentPage = 1,
      filter = 'all',
      search = '',
      minPrice = null,
      maxPrice = null,
      bedsFilter = null,
      bathsFilter = null
    } = options;

    console.log('[DashboardDiscover] Fetching properties...', { tab, category, currentPage, filter, search, minPrice, maxPrice, bedsFilter, bathsFilter });
    setLoading(true);
    setError(null);

    try {
      const listingType = tab === 'rent' ? 'rent' : 'sale';
      const from = (currentPage - 1) * limit;
      
      // Use direct REST API call for reliability
      const supabaseUrl = 'https://yydtsteyknbpfpxjtlxe.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';
      
      // Build query based on filter(s)
      let orderBy = 'created_at.desc';
      let filterParams = [];
      
      // Base filters
      filterParams.push(`listing_type=eq.${listingType}`);
      filterParams.push('status=eq.online');
      
      // Parse multiple filters (comma-separated)
      const filters = filter ? filter.split(',').filter(f => f && f !== 'all') : [];
      
      // Apply special filter options (support multiple)
      if (filters.includes('recently_added')) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filterParams.push(`created_at=gte.${sevenDaysAgo.toISOString()}`);
      }
      
      if (filters.includes('most_viewed')) {
        orderBy = 'view_count.desc.nullslast,created_at.desc';
      }
      
      if (filters.includes('high_demand')) {
        filterParams.push('view_count=gte.5');
        if (!filters.includes('most_viewed')) {
          orderBy = 'view_count.desc.nullslast';
        }
      }
      
      if (filters.includes('budget_friendly')) {
        if (tab === 'rent') {
          filterParams.push('price=lte.1500');
        } else {
          filterParams.push('price=lte.300000');
        }
        if (!filters.includes('most_viewed') && !filters.includes('high_demand')) {
          orderBy = 'price.asc';
        }
      }
      
      // Search filter - search in title, description, address, city, postcode
      const searchTerm = (search || '').trim();
      if (searchTerm) {
        filterParams.push(`or=(title.ilike.*${searchTerm}*,description.ilike.*${searchTerm}*,address_line_1.ilike.*${searchTerm}*,city.ilike.*${searchTerm}*,postcode.ilike.*${searchTerm}*,neighborhood.ilike.*${searchTerm}*)`);
      }
      
      // Location filter
      const locationTerm = (location || '').trim();
      if (locationTerm && !searchTerm) {
        filterParams.push(`or=(city.ilike.*${locationTerm}*,postcode.ilike.*${locationTerm}*,address_line_1.ilike.*${locationTerm}*,state.ilike.*${locationTerm}*)`);
      }
      
      // Price range filter
      if (minPrice && !isNaN(minPrice)) {
        filterParams.push(`price=gte.${minPrice}`);
      }
      if (maxPrice && !isNaN(maxPrice)) {
        filterParams.push(`price=lte.${maxPrice}`);
      }
      
      // Beds filter
      if (bedsFilter && !isNaN(bedsFilter)) {
        filterParams.push(`bedrooms=gte.${bedsFilter}`);
      }
      
      // Baths filter
      if (bathsFilter && !isNaN(bathsFilter)) {
        filterParams.push(`bathrooms=gte.${bathsFilter}`);
      }
      
      // Property category filter (residential vs commercial)
      if (category === 'commercial') {
        filterParams.push(`or=(property_type.ilike.*commercial*,property_type.ilike.*office*,property_type.ilike.*retail*,property_type.ilike.*industrial*)`);
      } else if (category === 'residential') {
        filterParams.push(`or=(property_type.ilike.*apartment*,property_type.ilike.*house*,property_type.ilike.*flat*,property_type.ilike.*villa*)`);
      }
      
      const url = `${supabaseUrl}/rest/v1/properties?select=*&${filterParams.join('&')}&order=${orderBy}&offset=${from}&limit=${limit}`;
      
      console.log('[DashboardDiscover] Fetching URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      });
      
      console.log('[DashboardDiscover] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const countHeader = response.headers.get('content-range');
      const totalCount = countHeader ? parseInt(countHeader.split('/')[1]) : data.length;
      
      console.log('[DashboardDiscover] Data received:', { 
        dataLength: data?.length, 
        totalCount,
        firstProperty: data?.[0]?.title 
      });
      
      setProperties(data || []);
      setTotalCount(totalCount || 0);
      setError(null);
    } catch (err) {
      console.error('[DashboardDiscover] Fetch error:', err);
      setError(err.message || 'Failed to fetch properties');
      setProperties([]);
      setTotalCount(0);
    } finally {
      console.log('[DashboardDiscover] Setting loading to false');
      setLoading(false);
    }
  }, [limit]);

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


  // Fetch on mount and when URL params/page changes
  useEffect(() => {
    console.log('[DashboardDiscover] useEffect triggered');
    
    
    // Parse URL parameters directly
    const tabFromUrl = searchParams.get('tab');
    const typeFromUrl = searchParams.get('type');
    const locationFromUrl = searchParams.get('location');
    const newFromUrl = searchParams.get('new');
    const filterFromUrl = searchParams.get('filter');
    
    // Determine effective tab
    let effectiveTab = 'buy';
    if (tabFromUrl === 'buy' || tabFromUrl === 'rent') {
      effectiveTab = tabFromUrl;
    } else if (typeFromUrl === 'buy' || typeFromUrl === 'rent') {
      effectiveTab = typeFromUrl;
    }
    
    // Determine effective category
    let effectiveCategory = 'all';
    if (typeFromUrl === 'residential' || typeFromUrl === 'commercial') {
      effectiveCategory = typeFromUrl;
    }
    
    const effectiveLocation = locationFromUrl || '';
    const effectiveNewOnly = newFromUrl === 'true';
    const effectiveFilter = filterFromUrl || 'all';
    
    console.log('[DashboardDiscover] Parsed filters:', { effectiveTab, effectiveCategory, effectiveLocation, effectiveFilter });
    
    // Update local states (without triggering re-renders that would cause loops)
    setPropertyType(effectiveTab === 'buy' ? 'sale' : 'rent');
    setPropertyCategory(effectiveCategory);
    setShowNewOnly(effectiveNewOnly);
    setSelectedFilter(effectiveFilter);
    if (effectiveLocation) {
      setLocationQuery(effectiveLocation);
    }
    
    // Update context
    setActiveTabFromContext(effectiveTab);
    
    // Update page title based on filter
    if (effectiveFilter && effectiveFilter !== 'all') {
      const filterTitles = {
        recently_added: { title: 'Recently Added', subtitle: 'Properties listed in the last 7 days' },
        most_viewed: { title: 'Most Visited', subtitle: 'Popular properties with high interest' },
        high_demand: { title: 'High Demand', subtitle: 'Properties with the most views' },
        budget_friendly: { title: 'Budget Friendly', subtitle: effectiveTab === 'rent' ? 'Properties under £1,500/month' : 'Properties under £300,000' }
      };
      const filterInfo = filterTitles[effectiveFilter];
      if (filterInfo) {
        setPageTitle(filterInfo.title);
        setPageSubtitle(filterInfo.subtitle);
      } else {
        updatePageTitle(effectiveTab, effectiveCategory, effectiveLocation, effectiveNewOnly);
      }
    } else {
      updatePageTitle(effectiveTab, effectiveCategory, effectiveLocation, effectiveNewOnly);
    }
    
    // Fetch properties with all current filters
    fetchPropertiesFromSupabase({
      tab: effectiveTab,
      category: effectiveCategory,
      location: effectiveLocation,
      newOnly: effectiveNewOnly,
      currentPage: page,
      filter: effectiveFilter,
      search: searchQuery,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      bedsFilter: beds,
      bathsFilter: baths
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), page]);

  // Debounced search handler - triggers when user types in search box
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer to fetch after 500ms
    debounceTimerRef.current = setTimeout(() => {
      const tabFromUrl = searchParams.get('tab') || searchParams.get('type') || 'buy';
      fetchPropertiesFromSupabase({
        tab: tabFromUrl === 'rent' ? 'rent' : 'buy',
        category: propertyCategory,
        location: locationQuery,
        currentPage: 1,
        filter: selectedFilter,
        search: value,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        bedsFilter: beds,
        bathsFilter: baths
      });
      setPage(1);
    }, 500);
  }, [searchParams, propertyCategory, locationQuery, selectedFilter, priceRange, beds, baths, fetchPropertiesFromSupabase]);

  // Handler for location filter change
  const handleLocationChange = useCallback((value) => {
    setLocationQuery(value);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      const tabFromUrl = searchParams.get('tab') || searchParams.get('type') || 'buy';
      fetchPropertiesFromSupabase({
        tab: tabFromUrl === 'rent' ? 'rent' : 'buy',
        category: propertyCategory,
        location: value,
        currentPage: 1,
        filter: selectedFilter,
        search: searchQuery,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        bedsFilter: beds,
        bathsFilter: baths
      });
      setPage(1);
    }, 500);
  }, [searchParams, propertyCategory, selectedFilter, searchQuery, priceRange, beds, baths, fetchPropertiesFromSupabase]);

  // Handler for price range change
  const handlePriceChange = useCallback((field, value) => {
    const newPriceRange = { ...priceRange, [field]: value ? parseInt(value) : null };
    setPriceRange(newPriceRange);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      const tabFromUrl = searchParams.get('tab') || searchParams.get('type') || 'buy';
      fetchPropertiesFromSupabase({
        tab: tabFromUrl === 'rent' ? 'rent' : 'buy',
        category: propertyCategory,
        location: locationQuery,
        currentPage: 1,
        filter: selectedFilter,
        search: searchQuery,
        minPrice: newPriceRange.min,
        maxPrice: newPriceRange.max,
        bedsFilter: beds,
        bathsFilter: baths
      });
      setPage(1);
    }, 500);
  }, [searchParams, propertyCategory, locationQuery, selectedFilter, searchQuery, priceRange, beds, baths, fetchPropertiesFromSupabase]);

  // Handler for beds filter change
  const handleBedsChange = useCallback((value) => {
    const bedsValue = value ? parseInt(value) : null;
    setBeds(bedsValue);
    
    const tabFromUrl = searchParams.get('tab') || searchParams.get('type') || 'buy';
    fetchPropertiesFromSupabase({
      tab: tabFromUrl === 'rent' ? 'rent' : 'buy',
      category: propertyCategory,
      location: locationQuery,
      currentPage: 1,
      filter: selectedFilter,
      search: searchQuery,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      bedsFilter: bedsValue,
      bathsFilter: baths
    });
    setPage(1);
  }, [searchParams, propertyCategory, locationQuery, selectedFilter, searchQuery, priceRange, baths, fetchPropertiesFromSupabase]);

  // Handler for baths filter change
  const handleBathsChange = useCallback((value) => {
    const bathsValue = value ? parseInt(value) : null;
    setBaths(bathsValue);
    
    const tabFromUrl = searchParams.get('tab') || searchParams.get('type') || 'buy';
    fetchPropertiesFromSupabase({
      tab: tabFromUrl === 'rent' ? 'rent' : 'buy',
      category: propertyCategory,
      location: locationQuery,
      currentPage: 1,
      filter: selectedFilter,
      search: searchQuery,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      bedsFilter: beds,
      bathsFilter: bathsValue
    });
    setPage(1);
  }, [searchParams, propertyCategory, locationQuery, selectedFilter, searchQuery, priceRange, beds, fetchPropertiesFromSupabase]);

  // Note: Debounced search is now handled by the main useEffect
  // since all filter states are included in its dependencies

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

  // Debug render
  console.log('[DashboardDiscover] Render:', { loading, propertiesCount: properties.length, error });

  const handleClearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setPriceRange({ min: null, max: null });
    setBeds(null);
    setBaths(null);
    setPropertyCategory('all');
    setShowNewOnly(false);
    setPage(1);
    
    // Refetch with cleared filters
    const tabFromUrl = searchParams.get('tab') || searchParams.get('type') || 'buy';
    fetchPropertiesFromSupabase({
      tab: tabFromUrl === 'rent' ? 'rent' : 'buy',
      category: 'all',
      location: '',
      currentPage: 1,
      filter: 'all',
      search: '',
      minPrice: null,
      maxPrice: null,
      bedsFilter: null,
      bathsFilter: null
    });
    // Clear URL params except tab
    const currentTab = searchParams.get('tab');
    const newParams = new URLSearchParams();
    if (currentTab) newParams.set('tab', currentTab);
    setSearchParams(newParams);
    updatePageTitle(currentTab || 'buy', 'all', '', false);
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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by postcode, street, address, keyword, or property title..."
            className="w-full pl-10 pr-4 py-3 border border-orange-300 dark:border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base bg-white dark:bg-white text-gray-900 dark:text-gray-900"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
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
                onChange={(e) => handleLocationChange(e.target.value)}
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
                  onChange={(e) => handlePriceChange('min', e.target.value)}
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
                  onChange={(e) => handlePriceChange('max', e.target.value)}
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
                  onChange={(e) => handleBedsChange(e.target.value)}
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
                  onChange={(e) => handleBathsChange(e.target.value)}
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
                  <button onClick={() => handleLocationChange('')} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {priceRange.min && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Min: £{priceRange.min.toLocaleString()}
                  <button onClick={() => handlePriceChange('min', null)} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {priceRange.max && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  Max: £{priceRange.max.toLocaleString()}
                  <button onClick={() => handlePriceChange('max', null)} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {beds && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {beds}+ Beds
                  <button onClick={() => handleBedsChange(null)} className="hover:text-orange-900"><X size={14} /></button>
                </span>
              )}
              {baths && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {baths}+ Baths
                  <button onClick={() => handleBathsChange(null)} className="hover:text-orange-900"><X size={14} /></button>
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
