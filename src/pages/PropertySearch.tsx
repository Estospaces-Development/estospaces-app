import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Map as MapIcon, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Home,
  Loader2,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';
import SearchBar, { SearchFilters } from '../components/ui/SearchBar';
import { supabase } from '../lib/supabase';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  listing_type: string;
  property_type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  image_urls: string[] | string;
  latitude: number;
  longitude: number;
  city: string;
  postcode: string;
  country: string;
  address_line_1: string;
  address_line_2: string;
  area: number;
  area_unit: string;
  created_at: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

type SortOption = 'newest' | 'price_low' | 'price_high' | 'beds_high' | 'beds_low';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'beds_high', label: 'Bedrooms: High to Low' },
  { value: 'beds_low', label: 'Bedrooms: Low to High' },
];

const PropertySearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
    total: 0,
  });

  // Parse filters from URL
  const getFiltersFromUrl = useCallback((): Partial<SearchFilters> => {
    const filters: Partial<SearchFilters> = {};
    
    const keyword = searchParams.get('q') || searchParams.get('keyword');
    if (keyword) filters.keyword = keyword;
    
    const location = searchParams.get('location');
    if (location) filters.location = location;
    
    const listingType = searchParams.get('type') as 'all' | 'rent' | 'sale';
    if (listingType && ['all', 'rent', 'sale'].includes(listingType)) {
      filters.listingType = listingType;
    }
    
    const propertyType = searchParams.get('propertyType');
    if (propertyType) filters.propertyType = propertyType;
    
    const minPrice = searchParams.get('minPrice');
    if (minPrice) filters.minPrice = parseInt(minPrice);
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    
    const beds = searchParams.get('beds');
    if (beds) filters.minBedrooms = parseInt(beds);
    
    const baths = searchParams.get('baths');
    if (baths) filters.minBathrooms = parseInt(baths);
    
    return filters;
  }, [searchParams]);

  // Fetch properties from Supabase
  const fetchProperties = useCallback(async () => {
    if (!supabase) {
      setError('Database connection not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filters = getFiltersFromUrl();
      const offset = (pagination.page - 1) * pagination.limit;

      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .or('status.eq.online,status.eq.active');

      // Apply keyword search
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        query = query.or(
          `title.ilike.%${keyword}%,description.ilike.%${keyword}%,city.ilike.%${keyword}%,postcode.ilike.%${keyword}%,address_line_1.ilike.%${keyword}%`
        );
      }

      // Apply location filter
      if (filters.location) {
        const location = filters.location.toLowerCase();
        query = query.or(
          `city.ilike.%${location}%,postcode.ilike.%${location}%,address_line_1.ilike.%${location}%`
        );
      }

      // Apply listing type filter
      if (filters.listingType && filters.listingType !== 'all') {
        query = query.eq('listing_type', filters.listingType);
      }

      // Apply property type filter
      if (filters.propertyType) {
        query = query.ilike('property_type', `%${filters.propertyType}%`);
      }

      // Apply price filters
      if (filters.minPrice !== null && filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Apply bedroom filter
      if (filters.minBedrooms !== null && filters.minBedrooms !== undefined) {
        query = query.gte('bedrooms', filters.minBedrooms);
      }

      // Apply bathroom filter
      if (filters.minBathrooms !== null && filters.minBathrooms !== undefined) {
        query = query.gte('bathrooms', filters.minBathrooms);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'beds_high':
          query = query.order('bedrooms', { ascending: false });
          break;
        case 'beds_low':
          query = query.order('bedrooms', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      query = query.range(offset, offset + pagination.limit - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProperties(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [getFiltersFromUrl, pagination.page, pagination.limit, sortBy]);

  // Fetch when URL params or sort changes
  useEffect(() => {
    fetchProperties();
  }, [searchParams, sortBy, pagination.page]);

  // Handle search from SearchBar
  const handleSearch = (filters: SearchFilters) => {
    // Reset to page 1 on new search
    setPagination(prev => ({ ...prev, page: 1 }));
    // URL will be updated by SearchBar component, which triggers fetchProperties
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get image URL from property
  const getImageUrl = (property: Property): string => {
    let images: string[] = [];
    
    if (property.image_urls) {
      if (typeof property.image_urls === 'string') {
        try {
          images = JSON.parse(property.image_urls);
        } catch {
          images = [property.image_urls];
        }
      } else if (Array.isArray(property.image_urls)) {
        images = property.image_urls;
      }
    }
    
    return images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60';
  };

  // Format price
  const formatPrice = (price: number, listingType: string): string => {
    if (listingType === 'rent') {
      return `£${price.toLocaleString()}/mo`;
    }
    return `£${price.toLocaleString()}`;
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const filters = getFiltersFromUrl();
  const hasFilters = Object.keys(filters).length > 0;

  // Build search summary
  const getSearchSummary = (): string => {
    const parts: string[] = [];
    
    if (filters.keyword) parts.push(`"${filters.keyword}"`);
    if (filters.location) parts.push(`in ${filters.location}`);
    if (filters.listingType === 'rent') parts.push('for rent');
    if (filters.listingType === 'sale') parts.push('for sale');
    if (filters.propertyType) parts.push(filters.propertyType);
    if (filters.minBedrooms) parts.push(`${filters.minBedrooms}+ beds`);
    if (filters.minPrice || filters.maxPrice) {
      const priceStr = filters.minPrice && filters.maxPrice 
        ? `£${filters.minPrice.toLocaleString()} - £${filters.maxPrice.toLocaleString()}`
        : filters.minPrice 
          ? `from £${filters.minPrice.toLocaleString()}`
          : `up to £${filters.maxPrice?.toLocaleString()}`;
      parts.push(priceStr);
    }
    
    return parts.length > 0 ? parts.join(' ') : 'All Properties';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <SearchBar 
            variant="full"
            initialFilters={filters}
            onSearch={handleSearch}
            navigateOnSearch={true}
            searchPath="/properties/search"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Property Search Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <span className="font-medium">{pagination.total.toLocaleString()}</span> properties found
                  {hasFilters && <span className="text-gray-500"> for {getSearchSummary()}</span>}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Error Loading Properties</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchProperties}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find any properties matching your search criteria. Try adjusting your filters or search for a different location.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImageUrl(property)}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          property.listing_type === 'rent'
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}>
                          {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white font-bold text-lg">
                          {formatPrice(property.price, property.listing_type)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                        {property.address_line_1 || property.city}, {property.postcode}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{property.bedrooms}</span> beds
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{property.bathrooms}</span> baths
                        </span>
                        {property.area && (
                          <span>{property.area} {property.area_unit || 'sqft'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row"
                  >
                    {/* Image */}
                    <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={getImageUrl(property)}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          property.listing_type === 'rent'
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}>
                          {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white hover:text-primary transition-colors">
                            {property.title}
                          </h3>
                          <p className="text-xl font-bold text-primary ml-4">
                            {formatPrice(property.price, property.listing_type)}
                          </p>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                          {property.address_line_1 || property.city}, {property.postcode}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                          {property.description || 'No description available'}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{property.bedrooms}</span> bedrooms
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{property.bathrooms}</span> bathrooms
                        </span>
                        {property.area && (
                          <span>{property.area} {property.area_unit || 'sqft'}</span>
                        )}
                        <span className="text-gray-400">
                          {new Date(property.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total.toLocaleString()} properties
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            pagination.page === pageNum
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <span className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {pagination.page} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;
