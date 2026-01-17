/**
 * Vercel Serverless Function Wrapper for Express.js API
 * 
 * This file wraps the Express.js server for Vercel's serverless environment.
 * Vercel treats each API route as a serverless function, so we need to export
 * the Express app as a serverless handler.
 */

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// CORS configuration - allow requests from the frontend
app.use(cors({
  origin: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.VITE_DEV_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Request timeout middleware
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
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
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
      eventsPerSecond: 10,
    },
  },
}) : null;

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    supabase: 'unknown',
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('properties').select('id').limit(1);
      healthCheck.supabase = error ? 'error' : 'connected';
    } catch (err) {
      healthCheck.supabase = 'error';
      healthCheck.supabaseError = err.message;
    }
  }

  const statusCode = healthCheck.supabase === 'connected' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// GET /api/properties
app.get('/api/properties', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      data: null,
      error: { message: 'Supabase not configured' },
      pagination: null,
    });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const country = req.query.country;
    const city = req.query.city;
    const postcode = req.query.postcode;
    const type = req.query.type;
    const minPrice = req.query.min_price ? parseFloat(req.query.min_price) : null;
    const maxPrice = req.query.max_price ? parseFloat(req.query.max_price) : null;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .or('status.eq.online,status.eq.active');

    if (country && country !== 'all') {
      query = query.eq('country', country);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (postcode) {
      query = query.ilike('postcode', `%${postcode}%`);
    }

    if (minPrice !== null && !isNaN(minPrice)) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice !== null && !isNaN(maxPrice)) {
      query = query.lte('price', maxPrice);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Supabase Error:', error);
      return res.status(500).json({
        data: null,
        error: { message: 'Failed to fetch properties', code: 'QUERY_ERROR', details: error.message },
        pagination: null,
      });
    }

    let filteredData = data || [];
    if (type && type !== 'all') {
      if (type === 'buy' || type === 'sale') {
        filteredData = filteredData.filter(p => p.listing_type === 'sale');
      } else if (type === 'rent') {
        filteredData = filteredData.filter(p => p.listing_type === 'rent');
      }
    }

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / limit);

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
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR', details: error.message },
      pagination: null,
    });
  }
});

// GET /api/properties/sections
app.get('/api/properties/sections', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      data: [],
      section: req.query.section || 'discovery',
      error: { message: 'Supabase not configured' },
    });
  }

  try {
    const section = req.query.section || 'discovery';
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);
    const type = req.query.type;

    let query = supabase
      .from('properties')
      .select('*')
      .or('status.eq.online,status.eq.active');

    if (type === 'buy' || type === 'sale') {
      query = query.eq('listing_type', 'sale');
    } else if (type === 'rent') {
      query = query.eq('listing_type', 'rent');
    }

    switch (section) {
      case 'most_viewed':
        query = query.order('views', { ascending: false });
        break;
      case 'trending':
        query = query
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('views', { ascending: false });
        break;
      case 'recently_added':
        query = query.order('created_at', { ascending: false });
        break;
      case 'high_demand':
        query = query
          .order('inquiries', { ascending: false })
          .order('favorites', { ascending: false });
        break;
      case 'featured':
        query = query.eq('featured', true).order('created_at', { ascending: false });
        break;
      default:
        query = query
          .order('featured', { ascending: false })
          .order('views', { ascending: false })
          .order('created_at', { ascending: false });
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

// GET /api/properties/all-sections
app.get('/api/properties/all-sections', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      mostViewed: [],
      trending: [],
      recentlyAdded: [],
      highDemand: [],
      featured: [],
      discovery: [],
      error: { message: 'Supabase not configured' },
    });
  }

  try {
    const type = req.query.type;
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const baseFilter = type === 'buy' || type === 'sale' 
      ? { listing_type: 'sale' }
      : type === 'rent' 
        ? { listing_type: 'rent' }
        : null;

    const [mostViewedResult, trendingResult, recentlyAddedResult, highDemandResult, featuredResult, discoveryResult] = await Promise.all([
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .order('views', { ascending: false })
        .limit(limit),
      
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('views', { ascending: false })
        .limit(limit),
      
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .order('created_at', { ascending: false })
        .limit(limit),
      
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .order('inquiries', { ascending: false })
        .order('favorites', { ascending: false })
        .limit(limit),
      
      supabase
        .from('properties')
        .select('*')
        .or('status.eq.online,status.eq.active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit),
      
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

// Vercel serverless function export
// This is the handler that Vercel will invoke for API routes
export default app;
