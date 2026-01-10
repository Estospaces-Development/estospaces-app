/**
 * Zoopla/PropAPIS Service
 * 
 * ⚠️ WARNING: This service should NOT be used from the frontend!
 * 
 * Zoopla API does not allow browser-side requests (CORS blocked).
 * All Zoopla calls must go through the server-side API endpoint:
 * 
 * ✅ Use: fetch('/api/properties/global?postcode=...')
 * ❌ Don't: import zooplaService from frontend
 * 
 * This file is kept for reference but should only be used server-side.
 * Frontend should use propertyDataService.js which calls the internal API.
 */

// Note: This is server-side only code
// Frontend should NEVER import this file
const ZOOPLA_API_KEY = import.meta.env.VITE_ZOOPLA_API_KEY || '';
const ZOOPLA_BASE_URL = 'https://api.zoopla.co.uk/api/v1';

/**
 * Search properties for sale
 */
export const searchPropertiesForSale = async ({
  postcode,
  latitude,
  longitude,
  radius = 5, // miles
  page = 1,
  pageSize = 20,
  minPrice,
  maxPrice,
  minBedrooms,
  maxBedrooms,
  propertyType,
}) => {
  try {
    const params = new URLSearchParams({
      api_key: ZOOPLA_API_KEY,
      listing_status: 'sale',
      page_size: pageSize.toString(),
      page: page.toString(),
    });

    if (postcode) {
      params.append('postcode', postcode);
    } else if (latitude && longitude) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
      params.append('radius', radius.toString());
    }

    if (minPrice) params.append('minimum_price', minPrice.toString());
    if (maxPrice) params.append('maximum_price', maxPrice.toString());
    if (minBedrooms) params.append('minimum_beds', minBedrooms.toString());
    if (maxBedrooms) params.append('maximum_beds', maxBedrooms.toString());
    if (propertyType) params.append('property_type', propertyType);

    const response = await fetch(`${ZOOPLA_BASE_URL}/property_listings.json?${params}`);
    
    if (!response.ok) {
      throw new Error(`Zoopla API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      properties: data.listing || [],
      totalResults: data.result_count || 0,
      page: data.page || 1,
      totalPages: data.total_pages || 1,
    };
  } catch (error) {
    console.error('Error fetching properties for sale:', error);
    throw error;
  }
};

/**
 * Search properties for rent
 */
export const searchPropertiesToRent = async ({
  postcode,
  latitude,
  longitude,
  radius = 5,
  page = 1,
  pageSize = 20,
  minPrice,
  maxPrice,
  minBedrooms,
  maxBedrooms,
  propertyType,
}) => {
  try {
    const params = new URLSearchParams({
      api_key: ZOOPLA_API_KEY,
      listing_status: 'rent',
      page_size: pageSize.toString(),
      page: page.toString(),
    });

    if (postcode) {
      params.append('postcode', postcode);
    } else if (latitude && longitude) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
      params.append('radius', radius.toString());
    }

    if (minPrice) params.append('minimum_price', minPrice.toString());
    if (maxPrice) params.append('maximum_price', maxPrice.toString());
    if (minBedrooms) params.append('minimum_beds', minBedrooms.toString());
    if (maxBedrooms) params.append('maximum_beds', maxBedrooms.toString());
    if (propertyType) params.append('property_type', propertyType);

    const response = await fetch(`${ZOOPLA_BASE_URL}/property_listings.json?${params}`);
    
    if (!response.ok) {
      throw new Error(`Zoopla API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      properties: data.listing || [],
      totalResults: data.result_count || 0,
      page: data.page || 1,
      totalPages: data.total_pages || 1,
    };
  } catch (error) {
    console.error('Error fetching properties to rent:', error);
    throw error;
  }
};

/**
 * Get property details by ID
 */
export const getPropertyDetails = async (listingId) => {
  try {
    const params = new URLSearchParams({
      api_key: ZOOPLA_API_KEY,
      listing_id: listingId.toString(),
    });

    const response = await fetch(`${ZOOPLA_BASE_URL}/property_listings.json?${params}`);
    
    if (!response.ok) {
      throw new Error(`Zoopla API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.listing?.[0] || null;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};

/**
 * Transform Zoopla property to our format
 */
export const transformZooplaProperty = (zooplaProperty) => {
  if (!zooplaProperty) return null;

  return {
    id: zooplaProperty.listing_id?.toString() || zooplaProperty.id?.toString(),
    title: zooplaProperty.displayable_address || zooplaProperty.short_description || 'Property',
    description: zooplaProperty.description || zooplaProperty.detailed_description || '',
    price: parseFloat(zooplaProperty.price) || 0,
    property_type: zooplaProperty.listing_status === 'rent' ? 'rent' : 'sale',
    status: 'online',
    bedrooms: parseInt(zooplaProperty.num_bedrooms) || 0,
    bathrooms: parseInt(zooplaProperty.num_bathrooms) || 0,
    city: zooplaProperty.town || zooplaProperty.county || '',
    postcode: zooplaProperty.postcode || '',
    country: 'UK',
    address_line_1: zooplaProperty.displayable_address || zooplaProperty.street_name || '',
    latitude: parseFloat(zooplaProperty.latitude) || null,
    longitude: parseFloat(zooplaProperty.longitude) || null,
    image_urls: zooplaProperty.image_url ? [zooplaProperty.image_url] : (zooplaProperty.image_caption ? [zooplaProperty.image_caption] : []),
    // Agent information
    agent_name: zooplaProperty.agent_name || '',
    agent_email: zooplaProperty.agent_email || '',
    agent_phone: zooplaProperty.agent_phone || zooplaProperty.phone || '',
    agent_company: zooplaProperty.agent_name || '',
    // Additional details
    property_size_sqm: zooplaProperty.floor_area ? parseFloat(zooplaProperty.floor_area.value) : null,
    year_built: zooplaProperty.year_built ? parseInt(zooplaProperty.year_built) : null,
    property_features: [],
    viewing_available: true,
    // Zoopla specific
    zoopla_listing_id: zooplaProperty.listing_id,
    zoopla_url: zooplaProperty.details_url || zooplaProperty.url,
    featured: zooplaProperty.featured || false,
    created_at: zooplaProperty.first_published_date || new Date().toISOString(),
  };
};

/**
 * Search properties (both sale and rent)
 */
export const searchProperties = async ({
  postcode,
  latitude,
  longitude,
  radius = 5,
  listingStatus = 'both', // 'sale', 'rent', or 'both'
  ...filters
}) => {
  try {
    const results = {
      properties: [],
      totalResults: 0,
      page: 1,
      totalPages: 1,
    };

    if (listingStatus === 'both' || listingStatus === 'sale') {
      const saleResults = await searchPropertiesForSale({
        postcode,
        latitude,
        longitude,
        radius,
        ...filters,
      });
      results.properties.push(...saleResults.properties);
      results.totalResults += saleResults.totalResults;
    }

    if (listingStatus === 'both' || listingStatus === 'rent') {
      const rentResults = await searchPropertiesToRent({
        postcode,
        latitude,
        longitude,
        radius,
        ...filters,
      });
      results.properties.push(...rentResults.properties);
      results.totalResults += rentResults.totalResults;
    }

    // Transform all properties
    results.properties = results.properties.map(transformZooplaProperty).filter(Boolean);

    return results;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

