/**
 * Property Data Service
 * Combines data from Zoopla API and Supabase
 */

import * as propertiesService from './propertiesService';
import { supabase } from '../lib/supabase';

/**
 * Fetch properties from Global API (Zoopla + Supabase fallback)
 * This calls the server-side API endpoint, never Zoopla directly
 */
export const fetchPropertiesFromZoopla = async ({
  location,
  radius = 5,
  listingStatus = 'both',
  ...filters
}) => {
  try {
    // Build query params for internal API
    const params = new URLSearchParams();
    
    if (location?.postcode) {
      params.append('postcode', location.postcode);
    } else if (location?.city) {
      params.append('city', location.city);
    }
    
    if (location?.latitude && location?.longitude) {
      params.append('lat', location.latitude.toString());
      params.append('lng', location.longitude.toString());
    }
    
    params.append('radius', radius.toString());
    params.append('type', listingStatus);
    params.append('page', '1');
    params.append('limit', '20');
    
    if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
    if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
    if (filters.minBedrooms) params.append('bedrooms', filters.minBedrooms.toString());

    // Call internal API (server-side proxy)
    const response = await fetch(`/api/properties/global?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    return {
      properties: result.properties || [],
      totalResults: result.totalResults || 0,
      source: result.source || 'supabase',
      fallbackUsed: result.fallbackUsed || false,
      error: result.error,
    };
  } catch (error) {
    // Log error (production: use proper error tracking)
    if (import.meta.env.DEV) {
      console.error('Error fetching from Global API:', error);
    }
    return {
      properties: [],
      totalResults: 0,
      source: 'error',
      fallbackUsed: true,
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
    if (import.meta.env.DEV) {
      console.error('Error fetching most viewed properties:', error);
    }
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
    // Log error (production: use proper error tracking)
    if (import.meta.env.DEV) {
      console.error('Error fetching featured properties:', error);
    }
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
 * Uses direct REST API for reliability with timeout
 */
export const getPropertyById = async (propertyId, userId = null) => {
  console.log('[propertyDataService] getPropertyById called with:', propertyId);
  
  try {
    // Use direct REST API for reliability
    const supabaseUrl = 'https://yydtsteyknbpfpxjtlxe.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/properties?id=eq.${propertyId}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      console.log('[propertyDataService] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[propertyDataService] Data received:', data?.length, 'properties');
      
      if (data && data.length > 0) {
        const property = data[0];
        
        // Enrich with user status if authenticated (with timeout protection)
        if (userId && propertiesService?.enrichPropertiesWithUserStatus) {
          try {
            const enrichPromise = propertiesService.enrichPropertiesWithUserStatus([property], userId);
            const enrichTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Enrich timeout')), 3000)
            );
            const enriched = await Promise.race([enrichPromise, enrichTimeout]);
            return { data: enriched[0], error: null };
          } catch (enrichError) {
            console.warn('[propertyDataService] Enrich failed, returning raw data:', enrichError);
            return { data: property, error: null };
          }
        }
        
        return { data: property, error: null };
      }
      
      return { data: null, error: { message: 'Property not found' } };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('[propertyDataService] Request timed out');
        return { data: null, error: { message: 'Request timed out. Please try again.' } };
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('[propertyDataService] Error fetching property by ID:', error);
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
    if (import.meta.env.DEV) {
      console.error('Error tracking property view:', error);
    }
  }
};

/**
 * Get trending properties
 * Criteria: Rapid increase in views and high engagement in recent time window (last 7 days)
 */
export const getTrendingProperties = async ({
  location,
  limit = 6,
  userId = null,
  timeWindowDays = 7,
}) => {
  try {
    if (!supabase) {
      return { properties: [], error: 'Supabase not configured' };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);

    // Get properties with recent views and engagement
    let query = supabase
      .from('viewed_properties')
      .select(`
        property_id,
        view_count,
        viewed_at,
        properties (*)
      `)
      .gte('viewed_at', cutoffDate.toISOString())
      .order('view_count', { ascending: false })
      .order('viewed_at', { ascending: false });

    const { data: viewedData, error: viewedError } = await query;

    if (viewedError) throw viewedError;

    // Get properties with recent saves/applications
    const { data: savedData } = await supabase
      .from('saved_properties')
      .select('property_id, created_at')
      .gte('created_at', cutoffDate.toISOString());

    const { data: appliedData } = await supabase
      .from('applied_properties')
      .select('property_id, created_at')
      .gte('created_at', cutoffDate.toISOString());

    // Aggregate engagement metrics per property
    const engagementMap = new Map();

    // Count views
    (viewedData || []).forEach(item => {
      if (!item.properties) return;
      const propId = item.property_id;
      if (!engagementMap.has(propId)) {
        engagementMap.set(propId, {
          property: item.properties,
          viewCount: 0,
          recentViews: 0,
          saves: 0,
          applications: 0,
          trendingScore: 0,
        });
      }
      const metrics = engagementMap.get(propId);
      metrics.viewCount += item.view_count || 0;
      metrics.recentViews += 1;
    });

    // Count saves
    (savedData || []).forEach(item => {
      if (engagementMap.has(item.property_id)) {
        engagementMap.get(item.property_id).saves += 1;
      }
    });

    // Count applications
    (appliedData || []).forEach(item => {
      if (engagementMap.has(item.property_id)) {
        engagementMap.get(item.property_id).applications += 1;
      }
    });

    // Calculate trending score (weighted: views * 1, saves * 2, applications * 3)
    engagementMap.forEach((metrics, propId) => {
      metrics.trendingScore =
        metrics.recentViews * 1 +
        metrics.saves * 2 +
        metrics.applications * 3;
    });

    // Convert to array and sort by trending score
    let properties = Array.from(engagementMap.values())
      .filter(item => item.property && item.property.status === 'online' && item.property.country === 'UK')
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit * 2) // Get more to filter by location
      .map(item => ({
        ...item.property,
        view_count: item.viewCount,
        recent_views: item.recentViews,
        saves_count: item.saves,
        applications_count: item.applications,
        trending_score: item.trendingScore,
        trending: true,
      }));

    // Filter by location if provided
    if (location?.postcode) {
      const exactMatches = properties.filter(p =>
        p.postcode?.toLowerCase().includes(location.postcode.toLowerCase())
      );
      if (exactMatches.length > 0) {
        properties = exactMatches;
      }
    } else if (location?.city) {
      const cityMatches = properties.filter(p =>
        p.city?.toLowerCase().includes(location.city.toLowerCase())
      );
      if (cityMatches.length > 0) {
        properties = cityMatches;
      }
    }

    properties = properties.slice(0, limit);

    // Enrich with user status
    if (userId && properties.length > 0) {
      properties = await propertiesService.enrichPropertiesWithUserStatus(properties, userId);
    }

    return { properties, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching trending properties:', error);
    }
    return { properties: [], error: error.message };
  }
};

/**
 * Get recently added properties
 * Criteria: Latest properties sorted by created_at descending
 */
export const getRecentlyAddedProperties = async ({
  location,
  limit = 6,
  userId = null,
  days = 30, // Properties added in last N days
}) => {
  try {
    if (!supabase) {
      return { properties: [], error: 'Supabase not configured' };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let query = supabase
      .from('properties')
      .select('*')
      .eq('country', 'UK')
      .eq('status', 'online')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Get more to filter by location

    // Filter by location if provided
    if (location?.postcode) {
      query = query.ilike('postcode', `%${location.postcode}%`);
    } else if (location?.city) {
      query = query.ilike('city', `%${location.city}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    let properties = (data || []).slice(0, limit);

    // Mark as recently added
    properties = properties.map(p => ({
      ...p,
      recently_added: true,
      days_since_listed: Math.floor(
        (new Date() - new Date(p.created_at)) / (1000 * 60 * 60 * 24)
      ),
    }));

    // Enrich with user status
    if (userId && properties.length > 0) {
      properties = await propertiesService.enrichPropertiesWithUserStatus(properties, userId);
    }

    return { properties, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching recently added properties:', error);
    }
    return { properties: [], error: error.message };
  }
};

/**
 * Get high demand properties
 * Criteria: High applications, high save-to-view ratio, or agent-defined priority
 */
export const getHighDemandProperties = async ({
  location,
  limit = 6,
  userId = null,
}) => {
  try {
    if (!supabase) {
      return { properties: [], error: 'Supabase not configured' };
    }

    // Get all online UK properties
    let query = supabase
      .from('properties')
      .select('*')
      .eq('country', 'UK')
      .eq('status', 'online')
      .limit(limit * 3); // Get more to calculate demand metrics

    // Filter by location if provided
    if (location?.postcode) {
      query = query.ilike('postcode', `%${location.postcode}%`);
    } else if (location?.city) {
      query = query.ilike('city', `%${location.city}%`);
    }

    const { data: properties, error: propsError } = await query;

    if (propsError) throw propsError;

    if (!properties || properties.length === 0) {
      return { properties: [], error: null };
    }

    // Get application counts per property
    const propertyIds = properties.map(p => p.id);
    const { data: applicationsData } = await supabase
      .from('applied_properties')
      .select('property_id')
      .in('property_id', propertyIds);

    // Get save counts per property
    const { data: savedData } = await supabase
      .from('saved_properties')
      .select('property_id')
      .in('property_id', propertyIds);

    // Get view counts per property
    const { data: viewedData } = await supabase
      .from('viewed_properties')
      .select('property_id, view_count')
      .in('property_id', propertyIds);

    // Calculate demand metrics
    const applicationCounts = {};
    (applicationsData || []).forEach(item => {
      applicationCounts[item.property_id] = (applicationCounts[item.property_id] || 0) + 1;
    });

    const saveCounts = {};
    (savedData || []).forEach(item => {
      saveCounts[item.property_id] = (saveCounts[item.property_id] || 0) + 1;
    });

    const viewCounts = {};
    (viewedData || []).forEach(item => {
      viewCounts[item.property_id] = (viewCounts[item.property_id] || 0) + (item.view_count || 1);
    });

    // Calculate demand score for each property
    let propertiesWithDemand = properties.map(property => {
      const appCount = applicationCounts[property.id] || 0;
      const saveCount = saveCounts[property.id] || 0;
      const viewCount = viewCounts[property.id] || 0;
      const saveToViewRatio = viewCount > 0 ? saveCount / viewCount : 0;

      // Demand score: applications * 3 + saves * 2 + save-to-view ratio * 100
      const demandScore = appCount * 3 + saveCount * 2 + saveToViewRatio * 100;

      return {
        ...property,
        applications_count: appCount,
        saves_count: saveCount,
        view_count: viewCount,
        save_to_view_ratio: saveToViewRatio,
        demand_score: demandScore,
        high_demand: demandScore >= 5, // Threshold for "high demand"
      };
    });

    // Sort by demand score and filter high demand properties
    propertiesWithDemand = propertiesWithDemand
      .sort((a, b) => b.demand_score - a.demand_score)
      .filter(p => p.high_demand || p.applications_count > 0) // Include if high demand OR has applications
      .slice(0, limit);

    // Enrich with user status
    if (userId && propertiesWithDemand.length > 0) {
      propertiesWithDemand = await propertiesService.enrichPropertiesWithUserStatus(
        propertiesWithDemand,
        userId
      );
    }

    return { properties: propertiesWithDemand, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching high demand properties:', error);
    }
    return { properties: [], error: error.message };
  }
};

/**
 * Get property discovery (core) - personalized recommendations
 * Based on user location, preferences, and past interactions
 */
export const getPropertyDiscovery = async ({
  location,
  limit = 8,
  userId = null,
}) => {
  try {
    // Priority: Featured > Most Viewed > Recently Added
    // Combine and deduplicate, prioritizing relevance

    const [featuredResult, mostViewedResult, recentlyAddedResult] = await Promise.all([
      getFeaturedProperties({ location, limit: limit / 3, userId }),
      getMostViewedProperties({ location, limit: limit / 3, userId }),
      getRecentlyAddedProperties({ location, limit: limit / 3, userId }),
    ]);

    // Combine and deduplicate by property ID
    const propertyMap = new Map();

    // Add featured first (highest priority)
    (featuredResult.properties || []).forEach(prop => {
      if (prop && prop.id) {
        propertyMap.set(prop.id, { ...prop, priority: 1 });
      }
    });

    // Add most viewed (medium priority)
    (mostViewedResult.properties || []).forEach(prop => {
      if (prop && prop.id && !propertyMap.has(prop.id)) {
        propertyMap.set(prop.id, { ...prop, priority: 2 });
      }
    });

    // Add recently added (lower priority)
    (recentlyAddedResult.properties || []).forEach(prop => {
      if (prop && prop.id && !propertyMap.has(prop.id)) {
        propertyMap.set(prop.id, { ...prop, priority: 3 });
      }
    });

    // Convert to array, sort by priority, and limit
    let properties = Array.from(propertyMap.values())
      .sort((a, b) => a.priority - b.priority)
      .slice(0, limit);

    // If we don't have enough, fetch additional from general pool
    if (properties.length < limit && supabase) {
      const additionalLimit = limit - properties.length;
      const existingIds = new Set(properties.map(p => p.id));

      let query = supabase
        .from('properties')
        .select('*')
        .eq('country', 'UK')
        .eq('status', 'online')
        .not('id', 'in', `(${Array.from(existingIds).join(',')})`)
        .order('created_at', { ascending: false })
        .limit(additionalLimit);

      if (location?.postcode) {
        query = query.ilike('postcode', `%${location.postcode}%`);
      } else if (location?.city) {
        query = query.ilike('city', `%${location.city}%`);
      }

      const { data: additionalData } = await query;
      if (additionalData && additionalData.length > 0) {
        let enriched = additionalData;
        if (userId) {
          enriched = await propertiesService.enrichPropertiesWithUserStatus(additionalData, userId);
        }
        properties = [...properties, ...enriched];
      }
    }

    return { properties, error: null };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching property discovery:', error);
    }
    return { properties: [], error: error.message };
  }
};

