// Analytics API Endpoint Documentation
// This file explains how to set up the backend to receive analytics data

/**
 * ANALYTICS ENDPOINT SETUP
 * 
 * The cookie consent banner sends analytics data to: POST /api/analytics/track
 * 
 * You need to create this endpoint in your backend to receive and store the data.
 * 
 * REQUEST FORMAT:
 * {
 *   "event": "cookie_accepted",
 *   "sessionData": {
 *     "timestamp": "2025-11-23T14:00:00.000Z",
 *     "userAgent": "Mozilla/5.0...",
 *     "language": "en-US",
 *     "screenResolution": "1920x1080",
 *     "referrer": "https://google.com",
 *     "timezone": "Asia/Kolkata",
 *     "platform": "Win32"
 *   },
 *   "pageView": {
 *     "url": "/",
 *     "timestamp": "2025-11-23T14:00:00.000Z"
 *   }
 * }
 * 
 * IMPLEMENTATION OPTIONS:
 * 
 * 1. SUPABASE (Recommended for your stack):
 *    - Create a 'analytics_events' table in Supabase
 *    - Use Supabase Edge Functions or direct insert from frontend
 * 
 * 2. CUSTOM BACKEND:
 *    - Create an Express.js/Node.js endpoint
 *    - Store in PostgreSQL, MongoDB, or any database
 * 
 * 3. THIRD-PARTY ANALYTICS:
 *    - Google Analytics
 *    - Mixpanel
 *    - Segment
 * 
 * SUPABASE TABLE SCHEMA:
 * 
 * CREATE TABLE analytics_events (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   event_type TEXT NOT NULL,
 *   user_agent TEXT,
 *   language TEXT,
 *   screen_resolution TEXT,
 *   referrer TEXT,
 *   timezone TEXT,
 *   platform TEXT,
 *   page_url TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Enable RLS
 * ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
 * 
 * -- Allow anonymous inserts (for tracking)
 * CREATE POLICY "Allow anonymous inserts" ON analytics_events
 *   FOR INSERT TO anon
 *   WITH CHECK (true);
 * 
 * -- Allow admins to view all analytics
 * CREATE POLICY "Admins can view all" ON analytics_events
 *   FOR SELECT TO authenticated
 *   USING (true);
 */

export const ANALYTICS_ENDPOINT = '/api/analytics/track';

// Example: How to query analytics data from Supabase
export const exampleQueries = {
  // Get total users who accepted cookies
  totalUsers: `
    SELECT COUNT(DISTINCT user_agent) as total_users
    FROM analytics_events
    WHERE event_type = 'cookie_accepted'
  `,
  
  // Get page views by URL
  pageViews: `
    SELECT page_url, COUNT(*) as views
    FROM analytics_events
    GROUP BY page_url
    ORDER BY views DESC
  `,
  
  // Get user demographics
  demographics: `
    SELECT 
      language,
      timezone,
      COUNT(*) as count
    FROM analytics_events
    WHERE event_type = 'cookie_accepted'
    GROUP BY language, timezone
  `,
  
  // Get referrer sources
  referrers: `
    SELECT 
      referrer,
      COUNT(*) as count
    FROM analytics_events
    WHERE referrer != 'direct'
    GROUP BY referrer
    ORDER BY count DESC
  `
};
