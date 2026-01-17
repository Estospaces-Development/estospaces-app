# Testing CORS Fix - Step by Step Guide

## ✅ Pre-Testing Checklist

1. **Environment Variables:**
   ```bash
   # Check .env file has:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ZOOPLA_API_KEY=your_zoopla_key  # Optional - will fallback to Supabase if missing
   ```

2. **Start Servers:**
   ```bash
   npm run dev:all
   ```
   
   This starts:
   - Express API server on port 3001
   - Vite dev server on port 5173

## 🧪 Test 1: Verify No CORS Errors

### Steps:
1. Open browser: http://localhost:5173/user/dashboard
2. Open DevTools (F12)
3. Go to **Network** tab
4. Filter by "Fetch/XHR"
5. Reload the page

### Expected Results:
✅ **NO requests to `api.zoopla.co.uk`**
✅ **ONLY requests to `/api/properties/global`**
✅ **NO CORS errors in Console**
✅ **NO "Failed to fetch" errors**

### If you see CORS errors:
- Check that `server.js` is running
- Check that Vite proxy is configured in `vite.config.js`
- Verify no direct Zoopla calls in Network tab

## 🧪 Test 2: API Endpoint Direct Test

### Test in Browser:
```
http://localhost:3001/api/properties/global?postcode=BT9+7GG&type=both
```

### Expected Response:
```json
{
  "source": "zoopla" | "supabase",
  "properties": [...],
  "totalResults": 100,
  "page": 1,
  "totalPages": 5,
  "fallbackUsed": false,
  "error": null
}
```

### Test with curl:
```bash
curl "http://localhost:3001/api/properties/global?postcode=BT9+7GG&type=both"
```

## 🧪 Test 3: Verify Fallback Works

### Test Without Zoopla Key:
1. Temporarily remove/comment `ZOOPLA_API_KEY` from `.env`
2. Restart server: `npm run server`
3. Test API: `http://localhost:3001/api/properties/global?postcode=BT9+7GG`

### Expected:
✅ Response has `"source": "supabase"`
✅ Response has `"fallbackUsed": true`
✅ Properties still returned (from Supabase)
✅ No errors

## 🧪 Test 4: Dashboard Integration

### Steps:
1. Open: http://localhost:5173/user/dashboard
2. Check Console (F12 → Console tab)
3. Look for:
   - ✅ No CORS errors
   - ✅ No "Failed to fetch" errors
   - ✅ Properties loading successfully

### Network Tab Check:
1. Open Network tab
2. Filter by "properties"
3. Verify:
   - ✅ Requests to `/api/properties/global`
   - ✅ Status: 200 OK
   - ✅ Response contains properties array

## 🧪 Test 5: Filter Testing

### Test Postcode Search:
```
http://localhost:5173/user/dashboard?location=BT9+7GG
```

### Test City Search:
```
http://localhost:5173/user/dashboard?location=London
```

### Expected:
✅ Properties filtered correctly
✅ No errors
✅ Loading states work
✅ Empty states work if no results

## 🧪 Test 6: Browse Properties Page

### Steps:
1. Navigate to: http://localhost:5173/user/dashboard/discover
2. Enter postcode: `BT9 7GG`
3. Click search
4. Check Network tab

### Expected:
✅ Properties load
✅ No CORS errors
✅ Filters work
✅ Pagination works

## 🔍 Debugging

### If properties don't load:

1. **Check Server Logs:**
   ```bash
   # Terminal running npm run server
   # Should see:
   📥 Global Properties API Request: {...}
   ✅ Zoopla API success: X properties
   # OR
   ⚠️ Zoopla API failed, falling back to Supabase
   ✅ Supabase fallback success: X properties
   ```

2. **Check Browser Console:**
   - Look for error messages
   - Check Network tab for failed requests
   - Verify response status codes

3. **Check Environment Variables:**
   ```bash
   # In server.js terminal, should see:
   ✅ Supabase client initialized
   📍 Supabase URL: ...
   ```

4. **Test API Directly:**
   ```bash
   curl http://localhost:3001/api/health
   # Should return: {"status":"ok",...}
   ```

## ✅ Success Criteria

- [ ] No CORS errors in browser console
- [ ] No requests to `api.zoopla.co.uk` in Network tab
- [ ] Properties load in Dashboard
- [ ] Properties load in Browse Properties page
- [ ] Filters work correctly
- [ ] Fallback to Supabase works when Zoopla fails
- [ ] API returns normalized response format
- [ ] Server logs show successful requests

## 🎯 Final Verification

### Network Tab Screenshot Checklist:
- [ ] No red failed requests
- [ ] All requests to `/api/properties/*`
- [ ] Status codes: 200 OK
- [ ] Response times reasonable (< 2 seconds)

### Console Checklist:
- [ ] No CORS errors
- [ ] No "Failed to fetch" errors
- [ ] No Zoopla-related errors
- [ ] Properties loaded successfully

---

**Status:** ✅ Ready for Testing
**Next:** Run `npm run dev:all` and test in browser!

