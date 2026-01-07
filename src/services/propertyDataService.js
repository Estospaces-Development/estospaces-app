/**
 * Property Data Service
 * Combines data from Zoopla API and Supabase
 */

import * as zooplaService from './zooplaService';
import * as propertiesService from './propertiesService';
import { supabase } from '../lib/supabase';

/**
 * Fetch properties from Zoopla based on location
 */
export const fetchPropertiesFromZoopla = async ({
  location,
  radius = 5,
  listingStatus = 'both',
  ...filters
}) => {
  try {
    const zooplaResults = await zooplaService.searchProperties({
      postcode: location?.postcode,
      latitude: location?.latitude,
      longitude: location?.longitude,
      radius,
      listingStatus,
      ...filters,
    });

    return {
      properties: zooplaResults.properties || [],
      totalResults: zooplaResults.totalResults || 0,
      source: 'zoopla',
    };
  } catch (error) {
    console.error('Error fetching from Zoopla:', error);
    return {
      properties: [],
      totalResults: 0,
      source: 'zoopla',
      error: error.message,
    };
  }
};

/**
 * Get most viewed properties from Supabase
 */
export const getMostViewedProperties = async ({
  location,
  limit = 10,
  userId = null,
}) => {
  try {
    if (!supabase) {
      return { properties: [], error: 'Supabase not configured' };
    }

    // Get most viewed properties by aggregating viewed_properties
    let query = supabase
      .from('viewed_properties')
      .select(`
        property_id,
        view_count,
        properties (*)
      `)
      .order('view_count', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    // Extract properties and filter by location if provided
    let properties = (data || [])
      .map(item => ({
        ...item.properties,
        view_count: item.view_count || 0,
      }))
      .filter(p => p && p.status === 'online' && p.country === 'UK');

    // Filter by location if provided
    if (location?.postcode) {
      const exactMatches = properties.filter(p => 
        p.postcode?.toLowerCase().includes(location.postcode.toLowerCase())
      );
      
      if (exactMatches.length > 0) {
        properties = exactMatches;
      } else {
        // If no exact matches, include nearby properties
        // (This is a simple filter - you could enhance with distance calculation)
        properties = properties.slice(0, limit);
      }
    }

    // Enrich with user status if authenticated
    if (userId && properties.length > 0) {
      properties = await propertiesService.enrichPropertiesWithUserStatus(properties, userId);
    }

    return { properties, error: null };
  } catch (error) {
    console.error('Error fetching most viewed properties:', error);
    return { properties: [], error: error.message };
  }
};

/**
 * Get featured properties
 * Criteria: Agent-selected OR high-value OR newest listings
 */
export const getFeaturedProperties = async ({
  location,
  limit = 6,
  userId = null,
}) => {
  try {
    // Try to get from Supabase first (agent-selected featured properties)
    if (supabase) {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('country', 'UK')
        .eq('status', 'online')
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more to filter

      // Filter by location if provided
      if (location?.postcode) {
        query = query.ilike('postcode', `%${location.postcode}%`);
      } else if (location?.city) {
        query = query.ilike('city', `%${location.city}%`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        // Prioritize: featured flag > high value > newest
        let properties = data
          .sort((a, b) => {
            // Featured first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            // Then by price (high value)
            if (a.price > b.price) return -1;
            if (a.price < b.price) return 1;
            // Then by newest
            return new Date(b.created_at) - new Date(a.created_at);
          })
          .slice(0, limit);

        // Enrich with user status
        if (userId && properties.length > 0) {
          properties = await propertiesService.enrichPropertiesWithUserStatus(properties, userId);
        }

        return { properties, source: 'supabase', error: null };
      }
    }

    // Fallback to Zoopla for featured properties
    const zooplaResults = await fetchPropertiesFromZoopla({
      location,
      radius: location ? 5 : 10,
      listingStatus: 'both',
      pageSize: limit,
    });

    // Sort by price (high value) and newest
    const featured = zooplaResults.properties
      .sort((a, b) => {
        if (a.price > b.price) return -1;
        if (a.price < b.price) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .slice(0, limit);

    return {
      properties: featured,
      source: 'zoopla',
      error: zooplaResults.error,
    };
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return { properties: [], source: 'error', error: error.message };
  }
};

/**
 * Fetch properties with nearby fallback
 */
export const fetchPropertiesWithFallback = async ({
  location,
  radius = 5,
  maxRadius = 20,
  listingStatus = 'both',
  ...filters
}) => {
  let currentRadius = radius;
  let results = null;
  let isExactMatch = false;

  // Try exact location first
  if (location?.postcode) {
    results = await fetchPropertiesFromZoopla({
      location: { ...location, postcode: location.postcode },
      radius: 0, // Exact postcode match
      listingStatus,
      ...filters,
    });

    if (results.properties.length > 0) {
      isExactMatch = true;
      return { ...results, isExactMatch, radius: 0 };
    }
  }

  // Try with small radius
  while (currentRadius <= maxRadius && (!results || results.properties.length === 0)) {
    results = await fetchPropertiesFromZoopla({
      location,
      radius: currentRadius,
      listingStatus,
      ...filters,
    });

    if (results.properties.length > 0) {
      break;
    }

    currentRadius += 5; // Increase radius by 5 miles
  }

  return {
    ...results,
    isExactMatch,
    radius: currentRadius,
    message: isExactMatch
      ? null
      : currentRadius > radius
      ? `No properties found in ${location?.postcode || location?.city || 'your area'}. Showing properties within ${currentRadius} miles.`
      : null,
  };
};

/**
 * Get property by ID
 * Tries Supabase first, then Zoopla as fallback
 */
export const getPropertyById = async (propertyId, userId = null) => {
  try {
    // First, try to get from Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (!error && data) {
        // Enrich with user status if authenticated
        if (userId) {
          const enriched = await propertiesService.enrichPropertiesWithUserStatus([data], userId);
          return { data: enriched[0], error: null };
        }
        return { data, error: null };
      }
    }

    // Fallback: Try Zoopla API if property ID looks like a Zoopla listing ID
    // (This assumes Zoopla listing IDs are numeric strings)
    try {
      const zooplaProperty = await zooplaService.getPropertyDetails(propertyId);
      if (zooplaProperty) {
        const transformed = zooplaService.transformZooplaProperty(zooplaProperty);
        // Enrich with user status
        if (userId) {
          const enriched = await propertiesService.enrichPropertiesWithUserStatus([transformed], userId);
          return { data: enriched[0], error: null };
        }
        return { data: transformed, error: null };
      }
    } catch (zooplaError) {
      console.warn('Zoopla API error:', zooplaError);
    }

    return { data: null, error: { message: 'Property not found' } };
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    return { data: null, error: { message: error.message || 'Failed to fetch property' } };
  }
};

/**
 * Track property view
 */
export const trackPropertyView = async (propertyId, userId) => {
  if (!userId || !supabase) return;

  try {
    // Check if view already exists
    const { data: existing } = await supabase
      .from('viewed_properties')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single();

    if (existing) {
      // Update view count
      await supabase
        .from('viewed_properties')
        .update({
          view_count: (existing.view_count || 1) + 1,
          viewed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('property_id', propertyId);
    } else {
      // Create new view record
      await supabase
        .from('viewed_properties')
        .insert({
          user_id: userId,
          property_id: propertyId,
          view_count: 1,
          viewed_at: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Error tracking property view:', error);
  }
};

