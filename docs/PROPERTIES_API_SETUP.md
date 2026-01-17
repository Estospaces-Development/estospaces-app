# Properties API Setup Guide

## Overview

This guide explains how to set up and use the Global Property Listing API (`/api/properties`) for the User Dashboard.

## Architecture

- **Express Server**: Runs on port 3001 (configurable via `API_PORT`)
- **Vite Dev Server**: Runs on port 5173 (default)
- **Vite Proxy**: Forwards `/api/*` requests to Express server
- **Supabase**: Backend database with RLS policies

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `concurrently` - Run multiple processes

### 2. Configure Environment Variables

Ensure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: Use service role key for admin access
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Optional: Custom API port
API_PORT=3001
```

### 3. Fix Supabase RLS Policies

Run this SQL in Supabase SQL Editor:

```sql
-- File: supabase_fix_rls_properties.sql
```

This will:
- Add 'active' status to the status constraint
- Create public read policy for 'online' or 'active' properties
- Verify table exists and has data

### 4. Start the Servers

**Option A: Run both servers together**
```bash
npm run dev:all
```

**Option B: Run separately (in two terminals)**
```bash
# Terminal 1: API Server
npm run server

# Terminal 2: Vite Dev Server
npm run dev
```

### 5. Verify API is Working

Open in browser:
- **API Health**: http://localhost:3001/api/health
- **Properties API**: http://localhost:3001/api/properties
- **With Filters**: http://localhost:3001/api/properties?country=UK&page=1&limit=10

You should see JSON response with properties data.

## API Endpoint

### GET /api/properties

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max: 100) |
| `country` | string | 'UK' | Filter by country |
| `city` | string | - | Filter by city (partial match) |
| `postcode` | string | - | Filter by postcode (partial match) |
| `type` | string | - | Filter by type: 'rent' or 'sale' |
| `min_price` | number | - | Minimum price filter |
| `max_price` | number | - | Maximum price filter |

**Response Format:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Property Title",
      "description": "Description",
      "price": 250000,
      "property_type": "sale",
      "status": "online",
      "bedrooms": 3,
      "bathrooms": 2,
      "city": "London",
      "postcode": "SW1A 1AA",
      "country": "UK",
      "image_urls": ["url1", "url2"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "error": null,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Status Filtering

The API automatically filters properties where:
- `status = 'online'` OR
- `status = 'active'`

This ensures only active/available properties are returned.

## Frontend Integration

### Using the API Service

```javascript
import { fetchPropertiesFromAPI } from '../services/propertiesApiService';

// Fetch properties
const result = await fetchPropertiesFromAPI({
  page: 1,
  limit: 20,
  country: 'UK',
  city: 'London',
  type: 'sale',
});

if (result.error) {
  console.error('Error:', result.error.message);
} else {
  console.log('Properties:', result.data);
  console.log('Total:', result.pagination.total);
}
```

### Direct Fetch

```javascript
const response = await fetch('/api/properties?page=1&limit=20&country=UK');
const data = await response.json();
```

## Troubleshooting

### API Returns Empty Array

1. **Check Supabase Table:**
   ```sql
   SELECT COUNT(*) FROM properties WHERE status IN ('online', 'active');
   ```

2. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'properties';
   ```

3. **Verify Status Values:**
   ```sql
   SELECT DISTINCT status FROM properties;
   ```

### RLS Errors

If you see "row-level security" errors:
1. Run `supabase_fix_rls_properties.sql`
2. Verify policy exists: `SELECT * FROM pg_policies WHERE tablename = 'properties';`
3. Check policy allows `anon` role: `SELECT roles FROM pg_policies WHERE tablename = 'properties';`

### Connection Errors

1. **Check Environment Variables:**
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. **Verify Supabase Client:**
   - Check server logs for "✅ Supabase client initialized"
   - Verify URL format is correct

3. **Check Server is Running:**
   - Visit http://localhost:3001/api/health
   - Should return `{"status":"ok"}`

### No Properties Showing

1. **Add Test Data:**
   ```sql
   INSERT INTO properties (
     title, description, price, property_type, status,
     bedrooms, bathrooms, city, postcode, country,
     address_line_1
   ) VALUES (
     'Test Property',
     'Test description',
     250000,
     'sale',
     'online',
     3,
     2,
     'London',
     'SW1A 1AA',
     'UK',
     '123 Test Street'
   );
   ```

2. **Verify Status:**
   - Properties must have `status = 'online'` or `status = 'active'`
   - Other statuses are filtered out

## Production Deployment

For production:
1. Deploy Express server (e.g., Railway, Render, Heroku)
2. Update Vite proxy target to production API URL
3. Or use environment variable for API URL
4. Ensure CORS allows your frontend domain

## Testing Checklist

- [ ] API server starts without errors
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] `/api/properties` returns JSON with properties
- [ ] Filters work (country, city, postcode, type)
- [ ] Pagination works (page, limit)
- [ ] Status filter returns only 'online' or 'active'
- [ ] Frontend can fetch from `/api/properties`
- [ ] No RLS errors in server logs
- [ ] Properties display in Dashboard
- [ ] Properties display in Browse Properties page

