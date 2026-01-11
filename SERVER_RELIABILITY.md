# Server Reliability & 24/7 Operation Guide

## 🎯 Quick Start

The servers have been optimized for reliable 24/7 operation. Here's what was fixed:

### ✅ Issues Resolved

1. **Port Conflict Fixed** ✓
   - Killed conflicting process on port 3002
   - Added automatic port cleanup in startup script

2. **Auth Timeouts Optimized** ✓
   - Reduced session check timeout from 15s → 5s
   - Reduced sign-in timeout from 30s → 10s
   - Reduced profile fetch from 10s → 5s
   - Faster failure detection = better UX

3. **Server Reliability Enhanced** ✓
   - Added request timeout middleware (30s)
   - Enhanced Supabase client configuration
   - Added health check endpoint with diagnostics
   - Implemented graceful shutdown handlers
   - Added uncaught exception handlers

4. **Connection Pooling Optimized** ✓
   - Configured Supabase with optimal settings
   - Added rate limiting for realtime events
   - Proper headers for request tracking

## 🚀 Running the Servers

### Option 1: Development Mode (Current)
```powershell
npm run dev:all
```
- Runs both backend (port 3002) and frontend (port 5173)
- Hot reload enabled for development

### Option 2: Production Mode with Monitoring
```powershell
.\start-production.ps1
```
- Automatic health monitoring every 30 seconds
- Auto-restart on failure
- Port cleanup before starting
- Comprehensive logging

### Option 3: Individual Servers
```powershell
# Backend only
npm run server

# Frontend only
npm run dev
```

## 🏥 Health Monitoring

### Health Check Endpoint
```
GET http://localhost:3002/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T19:54:26.605Z",
  "uptime": 123.45,
  "memory": {
    "rss": 50000000,
    "heapTotal": 20000000,
    "heapUsed": 15000000
  },
  "supabase": "connected"
}
```

### Status Codes:
- `200` - All systems operational
- `503` - Supabase connection issues

## 🔧 Troubleshooting

### "Sign-in is taking too long"

**Possible Causes:**
1. **Supabase Connection Issue**
   - Check: http://localhost:3002/api/health
   - Verify Supabase credentials in `.env`
   - Check Supabase dashboard for outages

2. **Network/Firewall**
   - Ensure internet connection is stable
   - Check if firewall is blocking Supabase URLs
   - Try disabling VPN temporarily

3. **Browser Cache**
   - Clear browser cache and localStorage
   - Try incognito/private mode
   - Hard refresh (Ctrl+F5)

### "Port Already in Use"

**Solution:**
```powershell
# Check what's using the port
netstat -ano | findstr :3002

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use the production script which does this automatically
.\start-production.ps1
```

### Server Crashes or Stops

**Built-in Recovery:**
- The server now catches uncaught exceptions and continues running
- Use `start-production.ps1` for automatic restart
- Check logs in terminals folder

## 📊 Performance Optimizations Applied

### Authentication Layer
- **Faster Timeouts**: Quick failure detection (5-10s instead of 15-30s)
- **Better Error Messages**: Users know exactly what went wrong
- **Abort Handling**: Prevents hanging requests on page navigation

### Backend Server
- **Request Timeouts**: 30-second timeout prevents hanging connections
- **Supabase Optimization**: Configured with production-ready settings
- **Error Recovery**: Continues running even on unexpected errors
- **Health Monitoring**: Real-time status checks

### Frontend
- **Optimized Supabase Client**: Better connection handling
- **Rate Limiting**: Prevents overwhelming the backend
- **Persistent Sessions**: Faster login after first visit

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use different credentials for dev/prod
   - Rotate keys regularly

2. **CORS Configuration**
   - Currently set to localhost for development
   - Update for production domain

3. **API Keys**
   - Backend uses service role key (more permissions)
   - Frontend uses anon key (limited access)
   - Both properly configured in `.env`

## 📝 Configuration Files

### `.env` (Required)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_PORT=3002
VITE_DEV_URL=http://localhost:5173
NODE_ENV=development
```

### Modified Files
1. `server.js` - Enhanced with health checks and error handling
2. `src/lib/supabase.js` - Optimized client configuration
3. `src/utils/authHelpers.js` - Reduced timeouts for faster response
4. `start-production.ps1` - New production startup script

## 🎯 Current Server Status

✅ **Backend**: Running on http://localhost:3002
✅ **Frontend**: Running on http://localhost:5174 (5173 was in use)
✅ **Health Check**: http://localhost:3002/api/health
✅ **Auto-Recovery**: Enabled
✅ **Monitoring**: Active

## 📞 Support Commands

```powershell
# Check server status
netstat -ano | findstr :3002
netstat -ano | findstr :5173

# Test health endpoint
curl http://localhost:3002/api/health

# View server logs
Get-Content "C:\Users\jeevi\.cursor\projects\c-Users-jeevi-Estospaces-project-estospaces-app\terminals\907200.txt"

# Restart servers
npm run dev:all
```

## 🚨 Emergency Recovery

If everything fails:

1. **Full Reset**
   ```powershell
   # Stop all Node processes
   Get-Process node | Stop-Process -Force
   
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   Remove-Item node_modules -Recurse -Force
   npm install
   
   # Restart
   npm run dev:all
   ```

2. **Check Supabase**
   - Visit: https://app.supabase.com
   - Verify project is active
   - Check API keys are correct
   - Review logs in Dashboard

3. **Contact Support**
   - Check server logs in terminals folder
   - Note error messages
   - Share health check response

## 🔄 Maintenance Schedule

**Recommended:**
- Daily: Check health endpoint
- Weekly: Review server logs
- Monthly: Update dependencies (`npm update`)
- Quarterly: Rotate API keys

## ✨ New Features Added

1. **Enhanced Health Endpoint**: Provides detailed system status
2. **Graceful Shutdown**: Handles termination signals properly
3. **Production Script**: Automated startup with monitoring
4. **Error Recovery**: Continues running despite errors
5. **Connection Optimization**: Better Supabase configuration
6. **Faster Auth**: Reduced timeout values for better UX

---

**Last Updated**: January 10, 2026
**Status**: All systems operational ✅
