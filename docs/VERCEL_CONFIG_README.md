# Vercel Configuration for estospaces-app

## Files Created

### 1. `vercel.json` (Root)

Main Vercel configuration file that defines:
- **Build command**: `npm run build` (builds React frontend)
- **Output directory**: `dist/` (Vite build output)
- **API routing**: `/api/*` → `/api/index.js` (serverless function)
- **SPA routing**: All other routes → `index.html` (React Router)
- **Function timeout**: 30 seconds (for API calls)

### 2. `api/index.js`

Serverless function wrapper that:
- Exports Express.js app as Vercel serverless function
- Handles API routes: `/api/properties`, `/api/health`, `/api/properties/sections`, etc.
- Uses Supabase client for database operations
- Supports all existing API endpoints

## How It Works

```
Request Flow:
┌─────────────────────────────────────────────┐
│  User requests: app.estospaces.com         │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  /api/* → api/index.js (serverless)       │
│    └─ Express.js handles API routes        │
│                                             │
│  /* → dist/index.html (static files)      │
│    └─ React app handles client routing     │
│                                             │
└─────────────────────────────────────────────┘
```

## API Endpoints Supported

The following endpoints are available:

- `GET /api/health` - Health check
- `GET /api/properties` - List properties with filters
- `GET /api/properties/sections` - Get properties by section
- `GET /api/properties/all-sections` - Get all sections at once

## Environment Variables

Make sure these are set in Vercel project settings:

**Required**:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)

**Optional**:
- `ZOOPLA_API_KEY` - For Zoopla property integration
- `NODE_ENV=production` - Production environment flag

**To set environment variables**:
1. Go to: https://vercel.com/estospaces-projects/estospaces-app/settings/environment-variables
2. Add each variable
3. Redeploy after adding variables

## Deployment Process

1. **Vercel automatically detects** `vercel.json`
2. **Builds frontend**: Runs `npm run build` → creates `dist/`
3. **Packages API**: Packages `api/index.js` as serverless function
4. **Deploys**: Serves static files + serverless API

## Testing Locally

To test the Vercel setup locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

This will simulate the Vercel environment locally.

## Notes

- **Serverless functions** have a 30-second timeout (configurable in `vercel.json`)
- **Express.js app** is exported as default export in `api/index.js`
- **CORS** is configured to allow requests from the Vercel domain
- **Static files** are served from `dist/` directory (Vite build output)

## Troubleshooting

### API routes not working

1. Check that `api/index.js` exists
2. Verify `vercel.json` has correct routing
3. Check environment variables are set
4. Review Runtime Logs in Vercel dashboard

### Frontend not loading

1. Verify `npm run build` completes successfully
2. Check `dist/` directory contains built files
3. Verify `vercel.json` `outputDirectory` is correct

### Environment variables

- Variables must be set in Vercel dashboard (not in `.env` file)
- Redeploy after adding/modifying environment variables
- Variables prefixed with `VITE_` are available in frontend code

## Migration Notes

This configuration adapts the Express.js backend (`server.js`) for Vercel's serverless environment:

- **Original**: `server.js` runs as a standalone Node.js process
- **Vercel**: `api/index.js` runs as a serverless function per request

The API routes and logic remain the same, just adapted for serverless execution.
