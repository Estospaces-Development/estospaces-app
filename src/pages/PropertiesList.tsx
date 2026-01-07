import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties, PropertyStatus, PropertyType, ListingType, FurnishingStatus, SortField, SortOrder } from '../contexts/PropertyContext';
import BackButton from '../components/ui/BackButton';
import { 
  Plus, Edit, Trash2, Eye, Filter, Download, Search, Grid, List, Map,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, Copy, MoreVertical,
  CheckSquare, Square, Star, Verified, TrendingUp, Home, Building, 
  DollarSign, Bed, Bath, Maximize, Calendar, MapPin, Heart, Share2,
  FileText, FileJson, ArrowUpDown, RefreshCw, Settings, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// View modes
type ViewMode = 'grid' | 'list' | 'map';

// Price range presets
const priceRanges = [
  { label: 'Any', min: undefined, max: undefined },
  { label: 'Under $100K', min: 0, max: 100000 },
  { label: '$100K - $250K', min: 100000, max: 250000 },
  { label: '$250K - $500K', min: 250000, max: 500000 },
  { label: '$500K - $1M', min: 500000, max: 1000000 },
  { label: '$1M - $2M', min: 1000000, max: 2000000 },
  { label: '$2M+', min: 2000000, max: undefined },
];

// Bedroom options
const bedroomOptions = [
  { label: 'Any', value: undefined },
  { label: 'Studio', value: 0 },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '5+', value: 5 },
];

// Property types with icons
const propertyTypeOptions: { value: PropertyType; label: string; icon: React.ReactNode }[] = [
  { value: 'apartment', label: 'Apartment', icon: <Building className="w-4 h-4" /> },
  { value: 'house', label: 'House', icon: <Home className="w-4 h-4" /> },
  { value: 'condo', label: 'Condo', icon: <Building className="w-4 h-4" /> },
  { value: 'townhouse', label: 'Townhouse', icon: <Home className="w-4 h-4" /> },
  { value: 'villa', label: 'Villa', icon: <Home className="w-4 h-4" /> },
  { value: 'penthouse', label: 'Penthouse', icon: <Building className="w-4 h-4" /> },
  { value: 'studio', label: 'Studio', icon: <Home className="w-4 h-4" /> },
  { value: 'land', label: 'Land', icon: <Map className="w-4 h-4" /> },
  { value: 'commercial', label: 'Commercial', icon: <Building className="w-4 h-4" /> },
];

// Status options with colors
const statusOptions: { value: PropertyStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'available', label: 'Available', color: 'text-green-700', bgColor: 'bg-green-100' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  { value: 'sold', label: 'Sold', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'rented', label: 'Rented', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { value: 'under_contract', label: 'Under Contract', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { value: 'off_market', label: 'Off Market', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  { value: 'coming_soon', label: 'Coming Soon', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
];

// Listing type options
const listingTypeOptions: { value: ListingType; label: string }[] = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'lease', label: 'For Lease' },
  { value: 'short_term', label: 'Short Term' },
  { value: 'vacation', label: 'Vacation' },
];

// Sort options
const sortOptions: { field: SortField; order: SortOrder; label: string }[] = [
  { field: 'createdAt', order: 'desc', label: 'Newest First' },
  { field: 'createdAt', order: 'asc', label: 'Oldest First' },
  { field: 'price', order: 'asc', label: 'Price: Low to High' },
  { field: 'price', order: 'desc', label: 'Price: High to Low' },
  { field: 'area', order: 'desc', label: 'Area: Large to Small' },
  { field: 'area', order: 'asc', label: 'Area: Small to Large' },
  { field: 'bedrooms', order: 'desc', label: 'Bedrooms: Most First' },
  { field: 'views', order: 'desc', label: 'Most Viewed' },
  { field: 'title', order: 'asc', label: 'Title: A-Z' },
];

const PropertiesList = () => {
  const navigate = useNavigate();
  const { 
    filteredProperties, 
    properties,
    selectedProperties,
    filters,
    sort,
    pagination,
    loading,
    deleteProperty, 
    deleteProperties,
    duplicateProperty,
    selectProperty,
    deselectProperty,
    selectAllProperties,
    clearSelection,
    bulkUpdateStatus,
    setFilters,
    clearFilters,
    setSort,
    setPage,
    setLimit,
    exportProperties,
    formatPrice,
    formatArea,
    getPropertyStats,
  } = useProperties();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activePropertyMenu, setActivePropertyMenu] = useState<string | null>(null);

  // Local filter state
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | undefined>(filters.bedroomsMin);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>(filters.propertyType || []);
  const [selectedStatuses, setSelectedStatuses] = useState<PropertyStatus[]>(filters.status || []);
  const [selectedListingTypes, setSelectedListingTypes] = useState<ListingType[]>(filters.listingType || []);

  const stats = useMemo(() => getPropertyStats(), [properties]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, search: searchQuery || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = (id: string) => {
    deleteProperty(id);
    setShowDeleteConfirm(null);
  };

  const handleBulkDelete = () => {
    deleteProperties(selectedProperties);
    setShowBulkDeleteConfirm(false);
    clearSelection();
  };

  const handleDuplicate = (id: string) => {
    const duplicate = duplicateProperty(id);
    if (duplicate) {
      navigate(`/manager/dashboard/properties/edit/${duplicate.id}`);
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    const ids = selectedProperties.length > 0 ? selectedProperties : undefined;
    exportProperties(format, ids);
    setShowExportMenu(false);
  };

  const handleApplyFilters = () => {
    const priceRange = priceRanges[selectedPriceRange];
    setFilters({
      ...filters,
      search: searchQuery || undefined,
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      bedroomsMin: selectedBedrooms,
      propertyType: selectedPropertyTypes.length > 0 ? selectedPropertyTypes : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      listingType: selectedListingTypes.length > 0 ? selectedListingTypes : undefined,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPriceRange(0);
    setSelectedBedrooms(undefined);
    setSelectedPropertyTypes([]);
    setSelectedStatuses([]);
    setSelectedListingTypes([]);
    clearFilters();
  };

  const handleSelectProperty = (id: string) => {
    if (selectedProperties.includes(id)) {
      deselectProperty(id);
    } else {
      selectProperty(id);
    }
  };

  const handleBulkStatusChange = (status: PropertyStatus) => {
    bulkUpdateStatus(selectedProperties, status);
    clearSelection();
    setShowBulkActions(false);
  };

  const getStatusBadge = (status: PropertyStatus) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig?.bgColor} ${statusConfig?.color}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++;
    if (filters.bedroomsMin !== undefined) count++;
    if (filters.propertyType?.length) count++;
    if (filters.status?.length) count++;
    if (filters.listingType?.length) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Properties</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all your property listings ({pagination.total} total)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Stats Pills */}
          <div className="hidden xl:flex items-center gap-2 mr-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {stats.available} Available
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              {stats.pending} Pending
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {stats.sold} Sold
            </span>
          </div>
          <button
            onClick={() => navigate('/manager/dashboard/properties/add')}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 transition-colors">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, address, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Sort</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50"
                  >
                    {sortOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSort({ field: option.field, order: option.order });
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          sort.field === option.field && sort.order === option.order
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Export</span>
              </button>
              
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50"
                  >
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg"
                    >
                      <FileText className="w-4 h-4" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-b-lg"
                    >
                      <FileJson className="w-4 h-4" />
                      Export as JSON
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {[
                { mode: 'grid' as ViewMode, icon: <Grid className="w-4 h-4" /> },
                { mode: 'list' as ViewMode, icon: <List className="w-4 h-4" /> },
                { mode: 'map' as ViewMode, icon: <Map className="w-4 h-4" /> },
              ].map(({ mode, icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === mode
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Selection Bar */}
        <AnimatePresence>
          {selectedProperties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedProperties.length} selected
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {/* Bulk Status Change */}
                  <div className="relative">
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      Change Status
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {showBulkActions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50"
                        >
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleBulkStatusChange(option.value)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
                            >
                              <span className={`w-2 h-2 rounded-full ${option.bgColor}`} />
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Advanced Filters</h3>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                  >
                    {priceRanges.map((range, index) => (
                      <option key={index} value={index}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bedrooms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {bedroomOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setSelectedBedrooms(option.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedBedrooms === option.value
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypeOptions.slice(0, 5).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          if (selectedPropertyTypes.includes(option.value)) {
                            setSelectedPropertyTypes(selectedPropertyTypes.filter(t => t !== option.value));
                          } else {
                            setSelectedPropertyTypes([...selectedPropertyTypes, option.value]);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedPropertyTypes.includes(option.value)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option.icon}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.slice(0, 4).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          if (selectedStatuses.includes(option.value)) {
                            setSelectedStatuses(selectedStatuses.filter(s => s !== option.value));
                          } else {
                            setSelectedStatuses([...selectedStatuses, option.value]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedStatuses.includes(option.value)
                            ? `${option.bgColor} ${option.color}`
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Properties Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No properties found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {activeFiltersCount > 0 
              ? 'Try adjusting your filters to see more results.'
              : 'Start by adding your first property listing.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => navigate('/manager/dashboard/properties/add')}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </button>
          </div>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectProperty(property.id);
                  }}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                    selectedProperties.includes(property.id)
                      ? 'bg-primary text-white'
                      : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {selectedProperties.includes(property.id) ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Image */}
              <div 
                className="relative h-48 bg-gradient-to-br from-primary/20 via-purple-400/20 to-pink-400/20 cursor-pointer"
                onClick={() => navigate(`/manager/dashboard/properties/${property.id}`)}
              >
                {property.media?.images?.[0]?.url || (property.images && property.images[0]) ? (
                  <img
                    src={property.media?.images?.[0]?.url || (typeof property.images?.[0] === 'string' ? property.images[0] : '')}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {property.featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                  {property.verified && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Verified className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-3 left-3">
                  {getStatusBadge(property.status)}
                </div>

                {/* Quick Actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-gray-800 dark:text-white truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/manager/dashboard/properties/${property.id}`)}
                    >
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {property.location?.city || property.city}, {property.location?.state || property.state}
                    </p>
                  </div>

                  {/* More Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setActivePropertyMenu(activePropertyMenu === property.id ? null : property.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    <AnimatePresence>
                      {activePropertyMenu === property.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50"
                        >
                          <button
                            onClick={() => {
                              navigate(`/manager/dashboard/properties/${property.id}`);
                              setActivePropertyMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/manager/dashboard/properties/edit/${property.id}`);
                              setActivePropertyMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDuplicate(property.id);
                              setActivePropertyMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Copy className="w-4 h-4" /> Duplicate
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(property.id);
                              setActivePropertyMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-xl font-bold text-primary">
                    {property.price?.amount 
                      ? formatPrice(property.price) 
                      : property.priceString || 'Price on Request'}
                  </span>
                  {property.listingType === 'rent' && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
                  )}
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {property.rooms?.bedrooms || property.bedrooms || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {property.rooms?.bathrooms || property.bathrooms || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    {formatArea(
                      property.dimensions?.totalArea || property.area || 0,
                      property.dimensions?.areaUnit || 'sqft'
                    )}
                  </span>
                </div>

                {/* Analytics */}
                {property.analytics && (property.analytics.views > 0 || property.analytics.inquiries > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {property.analytics.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {property.analytics.inquiries} inquiries
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row">
                {/* Selection & Image */}
                <div className="relative md:w-72 h-48 md:h-auto flex-shrink-0">
                  <button
                    onClick={() => handleSelectProperty(property.id)}
                    className={`absolute top-3 left-3 z-10 w-6 h-6 rounded flex items-center justify-center transition-all ${
                      selectedProperties.includes(property.id)
                        ? 'bg-primary text-white'
                        : 'bg-white/90 text-gray-400'
                    }`}
                  >
                    {selectedProperties.includes(property.id) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div 
                    className="h-full bg-gradient-to-br from-primary/20 via-purple-400/20 to-pink-400/20 cursor-pointer"
                    onClick={() => navigate(`/manager/dashboard/properties/${property.id}`)}
                  >
                    {property.media?.images?.[0]?.url || (property.images && property.images[0]) ? (
                      <img
                        src={property.media?.images?.[0]?.url || (typeof property.images?.[0] === 'string' ? property.images[0] : '')}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Home className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 
                            className="text-lg font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate(`/manager/dashboard/properties/${property.id}`)}
                          >
                            {property.title}
                          </h3>
                          {getStatusBadge(property.status)}
                          {property.featured && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {property.location?.addressLine1 || property.address}, {property.location?.city || property.city}, {property.location?.state || property.state}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-primary ml-4">
                        {property.price?.amount 
                          ? formatPrice(property.price) 
                          : property.priceString || 'Price on Request'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                      {property.shortDescription || property.description?.slice(0, 150)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {property.rooms?.bedrooms || property.bedrooms || 0} beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {property.rooms?.bathrooms || property.bathrooms || 0} baths
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        {formatArea(
                          property.dimensions?.totalArea || property.area || 0,
                          property.dimensions?.areaUnit || 'sqft'
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(property.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/manager/dashboard/properties/${property.id}`)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/manager/dashboard/properties/edit/${property.id}`)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(property.id)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(property.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 h-[600px] flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Map view coming soon</p>
            <p className="text-sm">Switch to grid or list view to see your properties</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <select
              value={pagination.limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
              <option value={96}>96 per page</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronLeft className="w-4 h-4 -ml-2" />
            </button>
            <button
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-2">Delete Property</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete Property
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-2">
                Delete {selectedProperties.length} Properties
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete these properties? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertiesList;
