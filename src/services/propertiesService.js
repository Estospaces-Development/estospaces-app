import { supabase } from '../lib/supabase';

/**
 * Properties Service - Handles all property-related API calls
 */

// Get UK properties with optional filters
export const getUKProperties = async ({
  status = 'online',
  country = 'UK',
  propertyType = null,
  city = null,
  postcode = null,
  minPrice = null,
  maxPrice = null,
  minBedrooms = null,
  maxBedrooms = null,
  minBathrooms = null,
  limit = 20,
  offset = 0,
  orderBy = 'created_at',
  orderDirection = 'desc',
  userId = null,
} = {}) => {
  try {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase client not initialized' }, count: 0 };
    }

    let query = supabase
      .from('properties')
      .select('*, images', { count: 'exact' })
      .eq('country', country);
    
    // Support status='online' OR 'active'
    if (status === 'online' || status === 'active') {
      query = query.or('status.eq.online,status.eq.active');
    } else if (status) {
      query = query.eq('status', status);
    }
    
    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (postcode) {
      query = query.ilike('postcode', `%${postcode}%`);
    }
    if (minPrice !== null) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice !== null) {
      query = query.lte('price', maxPrice);
    }
    if (minBedrooms !== null) {
      query = query.gte('bedrooms', minBedrooms);
    }
    if (maxBedrooms !== null) {
      query = query.lte('bedrooms', maxBedrooms);
    }
    if (minBathrooms !== null) {
      query = query.gte('bathrooms', minBathrooms);
    }

    const { data, error, count } = await query;

    if (error) {
      // Check if it's a table not found error
      const errorMsg = error.message || error.toString() || '';
      if (errorMsg.includes('relation') || 
          errorMsg.includes('does not exist') || 
          errorMsg.includes('schema cache') ||
          errorMsg.includes('properties')) {
        return { 
          data: null, 
          error: { 
            message: 'Properties table not found. Please run the SQL schema in Supabase Dashboard. See SETUP_INSTRUCTIONS.md for details.',
            code: 'TABLE_NOT_FOUND',
            originalError: error
          }, 
          count: 0 
        };
      }
      throw error;
    }

    // If user is authenticated, get their interaction status
    if (userId && data) {
      const enrichedData = await enrichPropertiesWithUserStatus(data, userId);
      return { data: enrichedData, error: null, count };
    }

    return { data, error: null, count };
  } catch (error) {
    console.error('Error fetching UK properties:', error);
    return { data: null, error, count: 0 };
  }
};

// Get single property by ID
export const getPropertyById = async (propertyId, userId = null) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) throw error;

    // Track view if user is authenticated
    if (userId) {
      await trackPropertyView(propertyId, userId);
    }

    // Enrich with user status
    if (userId && data) {
      const enriched = await enrichPropertiesWithUserStatus([data], userId);
      return { data: enriched[0], error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching property:', error);
    return { data: null, error };
  }
};

// Search properties by keyword
export const searchProperties = async ({
  searchQuery,
  country = 'UK',
  status = 'online',
  limit = 20,
  offset = 0,
  userId = null,
} = {}) => {
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('country', country)
      .eq('status', status)
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,postcode.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    if (userId && data) {
      const enrichedData = await enrichPropertiesWithUserStatus(data, userId);
      return { data: enrichedData, error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error searching properties:', error);
    return { data: null, error };
  }
};

// Enrich properties with user interaction status
export const enrichPropertiesWithUserStatus = async (properties, userId) => {
  if (!properties || properties.length === 0) return properties;

  const propertyIds = properties.map(p => p.id);

  // Fetch saved, applied, and viewed status in parallel
  const [savedData, appliedData, viewedData] = await Promise.all([
    supabase
      .from('saved_properties')
      .select('property_id')
      .eq('user_id', userId)
      .in('property_id', propertyIds),
    supabase
      .from('applied_properties')
      .select('property_id, status')
      .eq('user_id', userId)
      .in('property_id', propertyIds),
    supabase
      .from('viewed_properties')
      .select('property_id, view_count')
      .eq('user_id', userId)
      .in('property_id', propertyIds),
  ]);

  const savedIds = new Set(savedData.data?.map(s => s.property_id) || []);
  const appliedMap = new Map(
    appliedData.data?.map(a => [a.property_id, a.status]) || []
  );
  const viewedMap = new Map(
    viewedData.data?.map(v => [v.property_id, v.view_count]) || []
  );

  // Enrich each property
  return properties.map(property => ({
    ...property,
    is_saved: savedIds.has(property.id),
    is_applied: appliedMap.has(property.id),
    application_status: appliedMap.get(property.id) || null,
    view_count: viewedMap.get(property.id) || 0,
  }));
};

// Save a property
export const saveProperty = async (propertyId, userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .insert({ user_id: userId, property_id: propertyId })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving property:', error);
    return { data: null, error };
  }
};

// Unsave a property
export const unsaveProperty = async (propertyId, userId) => {
  try {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error unsaving property:', error);
    return { data: null, error };
  }
};

// Apply to a property
export const applyToProperty = async (propertyId, userId, applicationData = {}) => {
  try {
    const { data, error } = await supabase
      .from('applied_properties')
      .insert({
        user_id: userId,
        property_id: propertyId,
        status: 'pending',
        application_data: applicationData,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error applying to property:', error);
    return { data: null, error };
  }
};

// Track property view
export const trackPropertyView = async (propertyId, userId) => {
  try {
    const { error } = await supabase
      .from('viewed_properties')
      .upsert(
        {
          user_id: userId,
          property_id: propertyId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,property_id',
        }
      );

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error tracking property view:', error);
    return { success: false, error };
  }
};

// Get user's saved properties
export const getSavedProperties = async (userId, limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        property_id,
        created_at,
        properties (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const properties = data?.map(item => ({
      ...item.properties,
      saved_at: item.created_at,
    })) || [];

    return { data: properties, error: null };
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    return { data: null, error };
  }
};

// Get user's applied properties
export const getAppliedProperties = async (userId, limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('applied_properties')
      .select(`
        property_id,
        status,
        application_data,
        created_at,
        updated_at,
        properties (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const properties = data?.map(item => ({
      ...item.properties,
      application_status: item.status,
      application_data: item.application_data,
      applied_at: item.created_at,
      updated_at: item.updated_at,
    })) || [];

    return { data: properties, error: null };
  } catch (error) {
    console.error('Error fetching applied properties:', error);
    return { data: null, error };
  }
};

// Get user's viewed properties
export const getViewedProperties = async (userId, limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('viewed_properties')
      .select(`
        property_id,
        viewed_at,
        view_count,
        properties (
          id,
          title,
          address_line_1,
          city,
          postcode,
          price,
          property_type,
          listing_type,
          image_urls,
          status,
          bedrooms,
          bathrooms,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const properties = data?.map(item => ({
      ...item.properties,
      viewed_at: item.viewed_at,
      view_count: item.view_count,
    })) || [];

    return { data: properties, error: null };
  } catch (error) {
    console.error('Error fetching viewed properties:', error);
    return { data: null, error };
  }
};

