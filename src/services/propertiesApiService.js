/**
 * Properties API Service
 * Client-side service for calling /api/properties endpoint
 */

/**
 * Fetch properties from the API endpoint
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.country - Filter by country (default: 'UK')
 * @param {string} params.city - Filter by city
 * @param {string} params.postcode - Filter by postcode
 * @param {string} params.type - Filter by type ('rent' or 'sale')
 * @param {number} params.min_price - Minimum price
 * @param {number} params.max_price - Maximum price
 * @returns {Promise<Object>} Response with data and pagination
 */
export const fetchPropertiesFromAPI = async ({
  page = 1,
  limit = 20,
  country = 'UK',
  city = null,
  postcode = null,
  type = null,
  min_price = null,
  max_price = null,
} = {}) => {
  try {
    // Build query string
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('country', country);
    
    if (city) params.append('city', city);
    if (postcode) params.append('postcode', postcode);
    if (type) params.append('type', type);
    if (min_price !== null) params.append('min_price', min_price.toString());
    if (max_price !== null) params.append('max_price', max_price.toString());

    const url = `/api/properties?${params.toString()}`;
    
    console.log('📡 Fetching properties from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ API Response:', {
      propertiesCount: result.data?.length || 0,
      total: result.pagination?.total || 0,
      page: result.pagination?.page || 1,
    });

    return result;
  } catch (error) {
    console.error('❌ Error fetching properties from API:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to fetch properties',
        code: 'FETCH_ERROR',
      },
      pagination: null,
    };
  }
};

/**
 * Get a single property by ID
 * Note: This uses the existing Supabase service for now
 * Can be extended to use API endpoint if needed
 */
export const getPropertyByIdFromAPI = async (propertyId) => {
  try {
    const response = await fetch(`/api/properties?id=${propertyId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching property:', error);
    return {
      data: null,
      error: {
        message: error.message || 'Failed to fetch property',
      },
    };
  }
};

