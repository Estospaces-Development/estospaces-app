import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// International currency codes (ISO 4217)
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'SGD';

// Area unit types
export type AreaUnit = 'sqft' | 'sqm' | 'acres' | 'hectares';

// Property status types
export type PropertyStatus = 'available' | 'pending' | 'sold' | 'rented' | 'under_contract' | 'off_market' | 'coming_soon';

// Property types
export type PropertyType = 
  | 'apartment' | 'house' | 'condo' | 'townhouse' | 'villa' | 'penthouse' 
  | 'studio' | 'duplex' | 'triplex' | 'land' | 'commercial' | 'industrial' | 'office';

// Listing types
export type ListingType = 'sale' | 'rent' | 'lease' | 'short_term' | 'vacation';

// Furnishing status
export type FurnishingStatus = 'furnished' | 'semi_furnished' | 'unfurnished';

// Property condition
export type PropertyCondition = 'new' | 'excellent' | 'good' | 'fair' | 'needs_renovation';

// Facing direction
export type FacingDirection = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

// International location structure
export interface PropertyLocation {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  landmark?: string;
}

// Price information with international support
export interface PriceInfo {
  amount: number;
  currency: CurrencyCode;
  pricePerUnit?: number; // Price per sqft/sqm
  negotiable: boolean;
  priceHistory?: { date: string; amount: number }[];
  displayPrice?: string; // Formatted display price
}

// Property dimensions
export interface PropertyDimensions {
  totalArea: number;
  carpetArea?: number;
  builtUpArea?: number;
  plotArea?: number;
  areaUnit: AreaUnit;
  length?: number;
  width?: number;
  floors?: number;
  floorNumber?: number;
  totalFloors?: number;
}

// Room details
export interface RoomDetails {
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  parkingSpaces?: number;
  livingRooms?: number;
  kitchens?: number;
  studyRooms?: number;
  servantQuarters?: number;
  storeRooms?: number;
}

// Property amenities (grouped)
export interface PropertyAmenities {
  interior: string[];
  exterior: string[];
  community: string[];
  security: string[];
  utilities: string[];
}

// Media files
export interface PropertyMedia {
  images: MediaFile[];
  videos: MediaFile[];
  floorPlans: MediaFile[];
  virtualTourUrl?: string;
  brochureUrl?: string;
  threeDModelUrl?: string;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document';
  title?: string;
  isPrimary?: boolean;
  order?: number;
  thumbnailUrl?: string;
  size?: number;
  uploadedAt: string;
}

// Contact information
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  whatsapp?: string;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp' | 'any';
  availableHours?: string;
  company?: string;
  designation?: string;
  licenseNumber?: string;
}

// Property analytics
export interface PropertyAnalytics {
  views: number;
  inquiries: number;
  favorites: number;
  shares: number;
  lastViewed?: string;
  averageViewDuration?: number;
  conversionRate?: number;
}

// Legal and compliance
export interface LegalInfo {
  ownershipType?: 'freehold' | 'leasehold' | 'cooperative';
  legalClearance?: boolean;
  encumbrance?: boolean;
  occupancyCertificate?: boolean;
  reraRegistered?: boolean;
  reraNumber?: string;
  propertyTax?: number;
  taxAssessmentYear?: string;
}

// Financial details
export interface FinancialInfo {
  deposit?: number;
  maintenanceCharges?: number;
  maintenanceFrequency?: 'monthly' | 'quarterly' | 'yearly';
  stampDuty?: number;
  registrationCharges?: number;
  brokeragePercent?: number;
  loanEligible?: boolean;
  maxLoanAmount?: number;
}

// Main Property interface
export interface Property {
  id: string;
  
  // Basic Information
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  
  // Location
  location: PropertyLocation;
  // Legacy fields for backward compatibility
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Pricing
  price: PriceInfo;
  // Legacy field
  priceString?: string;
  
  // Property Specifications
  dimensions: PropertyDimensions;
  rooms: RoomDetails;
  // Legacy fields
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  
  // Property Features
  yearBuilt?: number;
  ageOfProperty?: number;
  furnishing: FurnishingStatus;
  condition: PropertyCondition;
  facing?: FacingDirection;
  amenities: PropertyAmenities;
  features?: string[];
  
  // Media
  media: PropertyMedia;
  images?: (File | string)[];
  videos?: (File | string)[];
  virtualTourUrl?: string;
  
  // Contact
  contact: ContactInfo;
  // Legacy fields
  contactName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  
  // Availability
  availableFrom: string;
  minimumLease?: number;
  maximumLease?: number;
  
  // Additional Info
  inclusions?: string;
  exclusions?: string;
  specialConditions?: string;
  
  // Legal & Financial
  legal?: LegalInfo;
  financial?: FinancialInfo;
  
  // Analytics
  analytics: PropertyAnalytics;
  
  // Property identifiers
  propertyId?: string;
  referenceNumber?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
  published: boolean;
  draft: boolean;
  featured?: boolean;
  verified?: boolean;
  premium?: boolean;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Audit
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}

// Filter interface
export interface PropertyFilters {
  search?: string;
  propertyType?: PropertyType[];
  listingType?: ListingType[];
  status?: PropertyStatus[];
  priceMin?: number;
  priceMax?: number;
  currency?: CurrencyCode;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  areaMin?: number;
  areaMax?: number;
  areaUnit?: AreaUnit;
  country?: string;
  city?: string;
  state?: string;
  amenities?: string[];
  furnishing?: FurnishingStatus[];
  condition?: PropertyCondition[];
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  featured?: boolean;
  verified?: boolean;
}

// Sort options
export type SortField = 'createdAt' | 'updatedAt' | 'price' | 'area' | 'bedrooms' | 'views' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Context type
interface PropertyContextType {
  properties: Property[];
  filteredProperties: Property[];
  selectedProperties: string[];
  filters: PropertyFilters;
  sort: SortOption;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  addProperty: (property: Partial<Property>) => Property;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  deleteProperties: (ids: string[]) => void;
  duplicateProperty: (id: string) => Property | null;
  getProperty: (id: string) => Property | undefined;
  
  // Bulk operations
  selectProperty: (id: string) => void;
  deselectProperty: (id: string) => void;
  selectAllProperties: () => void;
  clearSelection: () => void;
  bulkUpdateStatus: (ids: string[], status: PropertyStatus) => void;
  
  // Filtering and sorting
  setFilters: (filters: PropertyFilters) => void;
  clearFilters: () => void;
  setSort: (sort: SortOption) => void;
  
  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Analytics
  incrementViews: (id: string) => void;
  incrementInquiries: (id: string) => void;
  
  // Export
  exportProperties: (format: 'csv' | 'json' | 'pdf', ids?: string[]) => void;
  
  // Utilities
  formatPrice: (price: PriceInfo) => string;
  formatArea: (area: number, unit: AreaUnit) => string;
  getPropertyStats: () => { total: number; available: number; sold: number; rented: number; pending: number };
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within PropertyProvider');
  }
  return context;
};

// Currency formatting
const currencyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
  EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
  GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }),
  INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }),
  AED: new Intl.NumberFormat('ar-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }),
  CAD: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }),
  AUD: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }),
  JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }),
  CNY: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }),
  SGD: new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 }),
};

// Slug generator
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Create default property structure
const createDefaultProperty = (data: Partial<Property>): Property => {
  const now = new Date().toISOString();
  const id = Date.now().toString();
  
  return {
    id,
    title: data.title || 'Untitled Property',
    slug: data.slug || generateSlug(data.title || 'untitled-property'),
    description: data.description || '',
    shortDescription: data.shortDescription,
    propertyType: data.propertyType || 'apartment',
    listingType: data.listingType || 'sale',
    status: data.status || 'available',
    
    location: data.location || {
      addressLine1: data.address || '',
      city: data.city || '',
      state: data.state || '',
      postalCode: data.zipCode || '',
      country: 'United States',
      countryCode: 'US',
    },
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    
    price: data.price || {
      amount: parseFloat(data.priceString?.replace(/[^0-9.]/g, '') || '0') || 0,
      currency: 'USD',
      negotiable: false,
    },
    priceString: data.priceString,
    
    dimensions: data.dimensions || {
      totalArea: data.area || 0,
      areaUnit: 'sqft',
    },
    rooms: data.rooms || {
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      balconies: 0,
      parkingSpaces: 0,
    },
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: data.area,
    
    yearBuilt: data.yearBuilt,
    furnishing: data.furnishing || 'unfurnished',
    condition: data.condition || 'good',
    facing: data.facing,
    amenities: data.amenities || {
      interior: [],
      exterior: [],
      community: [],
      security: [],
      utilities: [],
    },
    features: data.features,
    
    media: data.media || {
      images: [],
      videos: [],
      floorPlans: [],
    },
    images: data.images,
    videos: data.videos,
    virtualTourUrl: data.virtualTourUrl,
    
    contact: data.contact || {
      name: data.contactName || '',
      email: data.emailAddress || '',
      phone: data.phoneNumber || '',
      preferredContactMethod: 'any',
    },
    contactName: data.contactName,
    phoneNumber: data.phoneNumber,
    emailAddress: data.emailAddress,
    
    availableFrom: data.availableFrom || data.availableDate || now,
    inclusions: data.inclusions,
    exclusions: data.exclusions,
    
    analytics: data.analytics || {
      views: 0,
      inquiries: 0,
      favorites: 0,
      shares: 0,
    },
    
    propertyId: data.propertyId || `PROP-${id.slice(-6)}`,
    referenceNumber: data.referenceNumber,
    
    createdAt: data.createdAt || now,
    updatedAt: now,
    published: data.published ?? false,
    draft: data.draft ?? true,
    featured: data.featured ?? false,
    verified: data.verified ?? false,
    premium: data.premium ?? false,
    
    version: 1,
  } as Property;
};

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<PropertyFilters>({});
  const [sort, setSort] = useState<SortOption>({ field: 'createdAt', order: 'desc' });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load properties from localStorage on mount
  useEffect(() => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('properties');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old properties to new structure
        const migrated = parsed.map((p: any) => createDefaultProperty(p));
        setProperties(migrated);
      }
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save properties to localStorage whenever they change
  useEffect(() => {
    if (properties.length > 0) {
      localStorage.setItem('properties', JSON.stringify(properties));
    }
  }, [properties]);

  // Apply filters and sorting
  const filteredProperties = useCallback(() => {
    let result = [...properties];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.location?.addressLine1?.toLowerCase().includes(searchLower) ||
        p.location?.city?.toLowerCase().includes(searchLower) ||
        p.address?.toLowerCase().includes(searchLower) ||
        p.city?.toLowerCase().includes(searchLower)
      );
    }

    // Property type filter
    if (filters.propertyType?.length) {
      result = result.filter(p => filters.propertyType!.includes(p.propertyType));
    }

    // Listing type filter
    if (filters.listingType?.length) {
      result = result.filter(p => filters.listingType!.includes(p.listingType));
    }

    // Status filter
    if (filters.status?.length) {
      result = result.filter(p => filters.status!.includes(p.status));
    }

    // Price range filter
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      result = result.filter(p => {
        const price = p.price?.amount || 0;
        const minOk = filters.priceMin === undefined || price >= filters.priceMin;
        const maxOk = filters.priceMax === undefined || price <= filters.priceMax;
        return minOk && maxOk;
      });
    }

    // Bedrooms filter
    if (filters.bedroomsMin !== undefined) {
      result = result.filter(p => (p.rooms?.bedrooms || p.bedrooms || 0) >= filters.bedroomsMin!);
    }
    if (filters.bedroomsMax !== undefined) {
      result = result.filter(p => (p.rooms?.bedrooms || p.bedrooms || 0) <= filters.bedroomsMax!);
    }

    // Bathrooms filter
    if (filters.bathroomsMin !== undefined) {
      result = result.filter(p => (p.rooms?.bathrooms || p.bathrooms || 0) >= filters.bathroomsMin!);
    }

    // Area filter
    if (filters.areaMin !== undefined) {
      result = result.filter(p => (p.dimensions?.totalArea || p.area || 0) >= filters.areaMin!);
    }
    if (filters.areaMax !== undefined) {
      result = result.filter(p => (p.dimensions?.totalArea || p.area || 0) <= filters.areaMax!);
    }

    // Furnishing filter
    if (filters.furnishing?.length) {
      result = result.filter(p => filters.furnishing!.includes(p.furnishing));
    }

    // Featured filter
    if (filters.featured !== undefined) {
      result = result.filter(p => p.featured === filters.featured);
    }

    // Verified filter
    if (filters.verified !== undefined) {
      result = result.filter(p => p.verified === filters.verified);
    }

    // City filter
    if (filters.city) {
      result = result.filter(p => 
        (p.location?.city || p.city)?.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    // Country filter
    if (filters.country) {
      result = result.filter(p => 
        p.location?.country?.toLowerCase().includes(filters.country!.toLowerCase())
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'price':
          comparison = (a.price?.amount || 0) - (b.price?.amount || 0);
          break;
        case 'area':
          comparison = (a.dimensions?.totalArea || a.area || 0) - (b.dimensions?.totalArea || b.area || 0);
          break;
        case 'bedrooms':
          comparison = (a.rooms?.bedrooms || a.bedrooms || 0) - (b.rooms?.bedrooms || b.bedrooms || 0);
          break;
        case 'views':
          comparison = (a.analytics?.views || 0) - (b.analytics?.views || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sort.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [properties, filters, sort]);

  const filtered = filteredProperties();

  // Update pagination when filtered results change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit),
    }));
  }, [filtered.length, pagination.limit]);

  // Get paginated results
  const paginatedProperties = filtered.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // CRUD Operations
  const addProperty = (propertyData: Partial<Property>): Property => {
    const newProperty = createDefaultProperty(propertyData);
    setProperties(prev => [...prev, newProperty]);
    return newProperty;
  };

  const updateProperty = (id: string, propertyData: Partial<Property>) => {
    setProperties(prev =>
      prev.map(prop =>
        prop.id === id
          ? { 
              ...prop, 
              ...propertyData, 
              updatedAt: new Date().toISOString(),
              version: (prop.version || 0) + 1,
            }
          : prop
      )
    );
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(prop => prop.id !== id));
    setSelectedProperties(prev => prev.filter(pid => pid !== id));
  };

  const deleteProperties = (ids: string[]) => {
    setProperties(prev => prev.filter(prop => !ids.includes(prop.id)));
    setSelectedProperties(prev => prev.filter(pid => !ids.includes(pid)));
  };

  const duplicateProperty = (id: string): Property | null => {
    const original = properties.find(p => p.id === id);
    if (!original) return null;
    
    const duplicate = createDefaultProperty({
      ...original,
      title: `${original.title} (Copy)`,
      published: false,
      draft: true,
      analytics: { views: 0, inquiries: 0, favorites: 0, shares: 0 },
    });
    
    setProperties(prev => [...prev, duplicate]);
    return duplicate;
  };

  const getProperty = (id: string): Property | undefined => {
    return properties.find(prop => prop.id === id);
  };

  // Selection operations
  const selectProperty = (id: string) => {
    setSelectedProperties(prev => 
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  const deselectProperty = (id: string) => {
    setSelectedProperties(prev => prev.filter(pid => pid !== id));
  };

  const selectAllProperties = () => {
    setSelectedProperties(paginatedProperties.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedProperties([]);
  };

  const bulkUpdateStatus = (ids: string[], status: PropertyStatus) => {
    setProperties(prev =>
      prev.map(prop =>
        ids.includes(prop.id)
          ? { ...prop, status, updatedAt: new Date().toISOString() }
          : prop
      )
    );
  };

  // Filter operations
  const setFilters = (newFilters: PropertyFilters) => {
    setFiltersState(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFiltersState({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Pagination operations
  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  // Analytics operations
  const incrementViews = (id: string) => {
    setProperties(prev =>
      prev.map(prop =>
        prop.id === id
          ? { 
              ...prop, 
              analytics: { 
                ...prop.analytics, 
                views: (prop.analytics?.views || 0) + 1,
                lastViewed: new Date().toISOString(),
              } 
            }
          : prop
      )
    );
  };

  const incrementInquiries = (id: string) => {
    setProperties(prev =>
      prev.map(prop =>
        prop.id === id
          ? { 
              ...prop, 
              analytics: { 
                ...prop.analytics, 
                inquiries: (prop.analytics?.inquiries || 0) + 1,
              } 
            }
          : prop
      )
    );
  };

  // Export functionality
  const exportProperties = (format: 'csv' | 'json' | 'pdf', ids?: string[]) => {
    const toExport = ids 
      ? properties.filter(p => ids.includes(p.id))
      : paginatedProperties;
    
    if (format === 'json') {
      const dataStr = JSON.stringify(toExport, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      downloadBlob(blob, 'properties.json');
    } else if (format === 'csv') {
      const headers = ['ID', 'Title', 'Type', 'Status', 'Price', 'Currency', 'Bedrooms', 'Bathrooms', 'Area', 'City', 'Country', 'Created At'];
      const rows = toExport.map(p => [
        p.id,
        `"${p.title}"`,
        p.propertyType,
        p.status,
        p.price?.amount || '',
        p.price?.currency || 'USD',
        p.rooms?.bedrooms || p.bedrooms || '',
        p.rooms?.bathrooms || p.bathrooms || '',
        p.dimensions?.totalArea || p.area || '',
        p.location?.city || p.city || '',
        p.location?.country || '',
        p.createdAt,
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadBlob(blob, 'properties.csv');
    }
    // PDF export would require a library like jspdf - left as a placeholder
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Utility functions
  const formatPrice = (price: PriceInfo): string => {
    const formatter = currencyFormatters[price.currency] || currencyFormatters.USD;
    return formatter.format(price.amount);
  };

  const formatArea = (area: number, unit: AreaUnit): string => {
    const formatted = new Intl.NumberFormat().format(area);
    const unitLabels: Record<AreaUnit, string> = {
      sqft: 'sq ft',
      sqm: 'sq m',
      acres: 'acres',
      hectares: 'ha',
    };
    return `${formatted} ${unitLabels[unit]}`;
  };

  const getPropertyStats = () => {
    return {
      total: properties.length,
      available: properties.filter(p => p.status === 'available').length,
      sold: properties.filter(p => p.status === 'sold').length,
      rented: properties.filter(p => p.status === 'rented').length,
      pending: properties.filter(p => p.status === 'pending').length,
    };
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        filteredProperties: paginatedProperties,
        selectedProperties,
        filters,
        sort,
        pagination,
        loading,
        error,
        addProperty,
        updateProperty,
        deleteProperty,
        deleteProperties,
        duplicateProperty,
        getProperty,
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
        incrementViews,
        incrementInquiries,
        exportProperties,
        formatPrice,
        formatArea,
        getPropertyStats,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export default PropertyContext;
