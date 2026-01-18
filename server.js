/**
 * Express Server for Property Listing API
 * Runs alongside Vite dev server
 * 
 * Start: npm run server
 * Or: node server.js
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the same directory as server.js
const envPath = path.resolve(__dirname, '.env');
console.log('📁 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ .env loaded successfully');
}

const app = express();
const PORT = process.env.API_PORT || 3002;

// CORS configuration
app.use(cors({
  origin: process.env.VITE_DEV_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Request timeout middleware - prevent hanging requests
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 second timeout
  res.setTimeout(30000);
  next();
});

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

// Supabase client with optimized settings for reliability
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Server-side doesn't need session persistence
  },
  global: {
    headers: {
      'x-application-name': 'estospaces-api',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for stability
    },
  },
});

console.log('✅ Supabase client initialized');
console.log(`📍 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

/**
 * GET /api/properties
 * Global Property Listing API
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - country: Filter by country (default: 'UK')
 * - city: Filter by city
 * - postcode: Filter by postcode
 * - type: Filter by property type ('rent' or 'sale')
 * - min_price: Minimum price filter
 * - max_price: Maximum price filter
 * - status: Filter by status (default: 'online' or 'active')
 */
app.get('/api/properties', async (req, res) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const country = req.query.country; // Optional - don't default to UK
    const city = req.query.city;
    const postcode = req.query.postcode;
    const type = req.query.type; // 'rent' or 'sale'
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price) : null;
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price) : null;
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    console.log('📥 API Request:', {
      page,
      limit,
      country,
      city,
      postcode,
      type,
      minPrice,
      maxPrice,
    });

    // Build query
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' });

    // Status filter: 'online' OR 'active'
    query = query.or('status.eq.online,status.eq.active');

    // Country filter (optional)
    if (country && country !== 'all') {
      query = query.eq('country', country);
    }

    // City filter
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Postcode filter
    if (postcode) {
      query = query.ilike('postcode', `%${postcode}%`);
    }

    // NOTE: Removed listing_type filter because the existing .or() filter for status
    // seems to conflict with additional filters. Properties are correctly retrieved
    // without the type filter. For now, filter client-side or use a separate query approach.
    // TODO: Investigate Supabase query chaining with .or() and .eq() together
    
    // For now, we'll handle the type filter after fetching
    const typeFilter = type;

    // Price filters
    if (minPrice !== null && !isNaN(minPrice)) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      query = query.lte('price', maxPrice);
    }

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    // Handle errors
    if (error) {
      console.error('❌ Supabase Error:', error);
      
      // Check for table not found
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.status(500).json({
          data: null,
          error: {
            message: 'Properties table not found. Please run the SQL schema in Supabase Dashboard.',
            code: 'TABLE_NOT_FOUND',
            details: error.message,
          },
          pagination: null,
        });
      }

      // Check for RLS errors
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        return res.status(403).json({
          data: null,
          error: {
            message: 'Access denied. RLS policy may be blocking access. Check Supabase RLS policies.',
            code: 'RLS_ERROR',
            details: error.message,
          },
          pagination: null,
        });
      }

      // Generic error
      return res.status(500).json({
        data: null,
        error: {
          message: 'Failed to fetch properties',
          code: 'QUERY_ERROR',
          details: error.message,
        },
        pagination: null,
      });
    }

    // Apply type filter client-side if specified
    let filteredData = data || [];
    if (typeFilter && typeFilter !== 'all') {
      if (typeFilter === 'buy' || typeFilter === 'sale') {
        filteredData = filteredData.filter(p => p.listing_type === 'sale');
      } else if (typeFilter === 'rent') {
        filteredData = filteredData.filter(p => p.listing_type === 'rent');
      }
    }

    // Success response
    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / limit);

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        propertiesCount: data?.length || 0,
        totalCount,
        page,
        totalPages,
      });
    }

    res.status(200).json({
      data: filteredData,
      error: null,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({
      data: null,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error.message,
      },
      pagination: null,
    });
  }
});

/**
 * GET /api/properties/sections
 * Get properties for different dashboard sections
 * 
 * Query Parameters:
 * - section: 'most_viewed' | 'trending' | 'recently_added' | 'high_demand' | 'featured' | 'discovery'
 * - limit: Items per section (default: 6)
 * - type: 'buy' | 'rent' | 'all' (optional filter)
 */
app.get('/api/properties/sections', async (req, res) => {
  try {
    const section = req.query.section || 'discovery';
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);
    const type = req.query.type;

    let query = supabase
      .from('properties')
      .select('*')
      .or('status.eq.online,status.eq.active');

    // Apply type filter if specified
    if (type === 'buy' || type === 'sale') {
      query = query.eq('listing_type', 'sale');
    } else if (type === 'rent') {
      query = query.eq('listing_type', 'rent');
    }

    // Apply section-specific ordering
    switch (section) {
      case 'most_viewed':
        query = query.order('views', { ascending: false });
        break;
      case 'trending':
        // Trending = high views in recent time (last 7 days with high views)
        query = query
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('views', { ascending: false });
        break;
      case 'recently_added':
        query = query.order('created_at', { ascending: false });
        break;
      case 'high_demand':
        // High demand = most inquiries + favorites
        query = query
          .order('inquiries', { ascending: false })
          .order('favorites', { ascending: false });
        break;
      case 'featured':
        query = query.eq('featured', true).order('created_at', { ascending: false });
        break;
      case 'discovery':
      default:
        // Discovery = mix of featured, popular, and recent
        query = query
          .order('featured', { ascending: false })
          .order('views', { ascending: false })
          .order('created_at', { ascending: false });
        break;
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error(`❌ Error fetching ${section} properties:`, error);
      return res.status(500).json({
        data: [],
        section,
        error: { message: error.message },
      });
    }

    res.status(200).json({
      data: data || [],
      section,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({
      data: [],
      section: req.query.section || 'discovery',
      error: { message: 'Internal server error' },
    });
  }
});

/**
 * GET /api/properties/all-sections
 * Get all property sections in one request for dashboard
 */
app.get('/api/properties/all-sections', async (req, res) => {
  try {
    const type = req.query.type;
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    // Build base query options
    const baseFilter = type === 'buy' || type === 'sale' 
      ? { listing_type: 'sale' }
      : type === 'rent' 
        ? { listing_type: 'rent' }
        : null;

    // Fetch all sections in parallel
    const [
      mostViewedResult,
      trendingResult,
      recentlyAddedResult,
      highDemandResult,
      featuredResult,
      discoveryResult,
    ] = await Promise.all([
      // Most Viewed
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .order('views', { ascending: false })
        .limit(limit),
      
      // Trending (recent with high views)
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('views', { ascending: false })
        .limit(limit),
      
      // Recently Added
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .order('created_at', { ascending: false })
        .limit(limit),
      
      // High Demand
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .order('inquiries', { ascending: false })
        .order('favorites', { ascending: false })
        .limit(limit),
      
      // Featured
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit),
      
      // Discovery (mixed)
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .order('views', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    res.status(200).json({
      mostViewed: mostViewedResult.data || [],
      trending: trendingResult.data || [],
      recentlyAdded: recentlyAddedResult.data || [],
      highDemand: highDemandResult.data || [],
      featured: featuredResult.data || [],
      discovery: discoveryResult.data || [],
    });
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({
      mostViewed: [],
      trending: [],
      recentlyAdded: [],
      highDemand: [],
      featured: [],
      discovery: [],
      error: { message: 'Internal server error' },
    });
  }
});

/**
 * GET /api/properties/global
 * Global Property Listing API with Zoopla + Supabase Fallback
 * 
 * Query Parameters:
 * - postcode: Filter by postcode
 * - city: Filter by city
 * - lat: Latitude for radius search
 * - lng: Longitude for radius search
 * - radius: Search radius in miles (default: 5)
 * - type: Property type ('rent', 'sale', or 'both')
 * - min_price: Minimum price
 * - max_price: Maximum price
 * - bedrooms: Number of bedrooms
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
app.get('/api/properties/global', async (req, res) => {
  try {
    const {
      postcode,
      city,
      lat,
      lng,
      radius = 5,
      type = 'both',
      min_price,
      max_price,
      bedrooms,
      page = 1,
      limit = 20,
    } = req.query;

    // Log request (production: use proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Global Properties API Request:', {
        postcode,
        city,
        lat,
        lng,
        radius,
        type,
        min_price,
        max_price,
        bedrooms,
        page,
        limit,
      });
    }

    let zooplaResults = null;
    let fallbackUsed = false;

    // Try Zoopla API first (server-side only)
    const zooplaApiKey = process.env.ZOOPLA_API_KEY || process.env.VITE_ZOOPLA_API_KEY;
    
    if (zooplaApiKey) {
      try {
        zooplaResults = await fetchFromZoopla({
          apiKey: zooplaApiKey,
          postcode,
          latitude: lat ? parseFloat(lat) : null,
          longitude: lng ? parseFloat(lng) : null,
          radius: parseFloat(radius),
          listingStatus: type,
          minPrice: min_price ? parseFloat(min_price) : null,
          maxPrice: max_price ? parseFloat(max_price) : null,
          minBedrooms: bedrooms ? parseInt(bedrooms) : null,
          page: parseInt(page),
          pageSize: parseInt(limit),
        });

        if (zooplaResults && zooplaResults.properties && zooplaResults.properties.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Zoopla API success:', zooplaResults.properties.length, 'properties');
          }
          return res.status(200).json({
            source: 'zoopla',
            properties: zooplaResults.properties,
            totalResults: zooplaResults.totalResults || 0,
            page: zooplaResults.page || parseInt(page),
            totalPages: zooplaResults.totalPages || 1,
            fallbackUsed: false,
            error: null,
          });
        }
      } catch (zooplaError) {
        // Log error server-side only (production: use proper logging service)
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Zoopla API failed, falling back to Supabase:', zooplaError.message);
        }
        fallbackUsed = true;
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Zoopla API key not found, using Supabase fallback');
      }
      fallbackUsed = true;
    }

    // Fallback to Supabase
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .or('status.eq.online,status.eq.active')
      .eq('country', 'UK')
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply filters
    if (postcode) {
      query = query.ilike('postcode', `%${postcode}%`);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (type && type !== 'both') {
      query = query.eq('property_type', type);
    }
    if (min_price) {
      query = query.gte('price', parseFloat(min_price));
    }
    if (max_price) {
      query = query.lte('price', parseFloat(max_price));
    }
    if (bedrooms) {
      query = query.eq('bedrooms', parseInt(bedrooms));
    }

    // Location-based search if lat/lng provided
    if (lat && lng) {
      // For now, we'll filter by city/postcode
      // In production, you could use PostGIS for radius search
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      // Note: Supabase doesn't have built-in radius search without PostGIS
      // This is a simplified fallback
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Supabase fallback error:', error);
      return res.status(500).json({
        source: 'supabase',
        properties: [],
        totalResults: 0,
        page: parseInt(page),
        totalPages: 0,
        fallbackUsed: true,
        error: {
          message: 'Failed to fetch properties from Supabase',
          code: 'SUPABASE_ERROR',
          details: error.message,
        },
      });
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Supabase fallback success:', data?.length || 0, 'properties');
    }

    res.status(200).json({
      source: 'supabase',
      properties: data || [],
      totalResults: totalCount,
      page: parseInt(page),
      totalPages,
      fallbackUsed: true,
      error: null,
    });
  } catch (error) {
    // Log error server-side only (production: use proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Global Properties API Error:', error);
    }
    res.status(500).json({
      source: 'error',
      properties: [],
      totalResults: 0,
      page: 1,
      totalPages: 0,
      fallbackUsed: true,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error.message,
      },
    });
  }
});

/**
 * Server-side Zoopla API call (NEVER called from browser)
 */
async function fetchFromZoopla({
  apiKey,
  postcode,
  latitude,
  longitude,
  radius = 5,
  listingStatus = 'both',
  minPrice,
  maxPrice,
  minBedrooms,
  page = 1,
  pageSize = 20,
}) {
  const ZOOPLA_BASE_URL = 'https://api.zoopla.co.uk/api/v1';
  const results = {
    properties: [],
    totalResults: 0,
    page: 1,
    totalPages: 1,
  };

  const searchTypes = listingStatus === 'both' ? ['sale', 'rent'] : [listingStatus];

  for (const status of searchTypes) {
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        listing_status: status,
        page_size: pageSize.toString(),
        page: page.toString(),
      });

      if (postcode) {
        params.append('postcode', postcode);
      } else if (latitude && longitude) {
        params.append('latitude', latitude.toString());
        params.append('longitude', longitude.toString());
        params.append('radius', radius.toString());
      } else {
        throw new Error('Either postcode or lat/lng required');
      }

      if (minPrice) params.append('minimum_price', minPrice.toString());
      if (maxPrice) params.append('maximum_price', maxPrice.toString());
      if (minBedrooms) params.append('minimum_beds', minBedrooms.toString());

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${ZOOPLA_BASE_URL}/property_listings.json?${params}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Zoopla API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const listings = data.listing || [];

      // Transform Zoopla properties to our format
      const transformed = listings.map(transformZooplaProperty).filter(Boolean);
      results.properties.push(...transformed);
      results.totalResults += data.result_count || 0;
      } catch (error) {
        // Log error server-side only
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error fetching ${status} properties from Zoopla:`, error.message);
        }
        // Continue with other listing types
      }
  }

  return results;
}

/**
 * Transform Zoopla property to normalized format
 */
function transformZooplaProperty(zooplaProperty) {
  if (!zooplaProperty) return null;

  return {
    id: `zoopla_${zooplaProperty.listing_id || zooplaProperty.id}`,
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
    agent_name: zooplaProperty.agent_name || '',
    agent_email: zooplaProperty.agent_email || '',
    agent_phone: zooplaProperty.agent_phone || zooplaProperty.phone || '',
    agent_company: zooplaProperty.agent_name || '',
    property_size_sqm: zooplaProperty.floor_area ? parseFloat(zooplaProperty.floor_area.value) : null,
    year_built: zooplaProperty.year_built ? parseInt(zooplaProperty.year_built) : null,
    property_features: [],
    viewing_available: true,
    zoopla_listing_id: zooplaProperty.listing_id,
    zoopla_url: zooplaProperty.details_url || zooplaProperty.url,
    featured: zooplaProperty.featured || false,
    created_at: zooplaProperty.first_published_date || new Date().toISOString(),
  };
}

// Health check endpoint with detailed status
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    supabase: 'unknown',
  };

  // Quick Supabase health check
  try {
    const { error } = await supabase.from('properties').select('id').limit(1);
    healthCheck.supabase = error ? 'error' : 'connected';
  } catch (err) {
    healthCheck.supabase = 'error';
    healthCheck.supabaseError = err.message;
  }

  const statusCode = healthCheck.supabase === 'connected' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

app.post('/api/appointments/book', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: { message: 'Missing authorization token' } });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user?.id) {
      return res.status(401).json({ error: { message: 'Invalid session' } });
    }

    const userId = userData.user.id;
    const { property_id, viewing_date, viewing_time, notes, application_data } = req.body || {};

    if (!property_id || !viewing_date || !viewing_time) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    const db =
      process.env.SUPABASE_SERVICE_ROLE_KEY
        ? supabase
        : createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || supabaseKey, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          });

    const { data: insertedApps, error: appError } = await db
      .from('applied_properties')
      .insert({
        user_id: userId,
        property_id,
        status: 'appointment_booked',
        application_data: application_data || {
          appointment: { date: viewing_date, time: viewing_time, notes: notes || '', type: 'viewing' },
        },
      })
      .select('id')
      .limit(1);

    if (appError) {
      return res.status(400).json({ error: { message: appError.message } });
    }

    const { error: viewingError } = await db.from('viewings').insert({
      user_id: userId,
      property_id,
      viewing_date,
      viewing_time,
      notes: notes || '',
      status: 'pending',
    });

    if (viewingError) {
      return res.status(201).json({
        ok: true,
        application_id: insertedApps?.[0]?.id || null,
        warning: { message: viewingError.message },
      });
    }

    return res.status(201).json({ ok: true, application_id: insertedApps?.[0]?.id || null });
  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Don't exit - keep server running
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep server running
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Property API Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoint: http://localhost:${PORT}/api/properties`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`⏰ Server started at: ${new Date().toISOString()}`);
});
