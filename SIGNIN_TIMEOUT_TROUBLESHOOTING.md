# Sign-In Timeout Troubleshooting Guide

## Issue
Getting "Sign-in is taking too long. Please try again." error

## Recent Fixes Applied
1. ✅ Increased sign-in timeout from 10s to 20s
2. ✅ Added network connectivity check
3. ✅ Improved error messages

## Troubleshooting Steps

### 1. Check Network Connection
- Open browser DevTools (F12)
- Go to Network tab
- Try signing in
- Look for failed requests to Supabase

### 2. Verify Supabase Status
- Check if your Supabase project is running
- Visit: https://status.supabase.com/
- Check your project dashboard: https://app.supabase.com/

### 3. Check Browser Console
Look for these specific errors:
- `❌ Sign in error:` - Shows the actual error from Supabase
- `timeout` - Indicates network/server slowness
- `AbortError` - Usually safe to ignore, happens on page navigation

### 4. Test Supabase Connection
Run this in browser console (F12):
```javascript
// Test if Supabase is reachable
fetch('https://yy...hazdNsUG6XjdzhFDxcFae0hDSraF/rest/v1/')
  .then(r => console.log('✅ Supabase reachable:', r.status))
  .catch(e => console.error('❌ Supabase unreachable:', e));
```

### 5. Common Causes

#### A. Slow Database Triggers
If you have database triggers on the `auth.users` table, they might be slowing down sign-in.

**Check triggers:**
```sql
SELECT * FROM information_schema.triggers 
WHERE event_object_schema = 'auth';
```

#### B. Complex RLS Policies
Row Level Security policies on the `profiles` table might be slow.

**Simplify RLS temporarily:**
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### C. Network Issues
- Try from a different network
- Disable VPN if using one
- Check firewall settings

### 6. Quick Workaround
If timeouts persist, you can temporarily increase the timeout further:

**File:** `src/utils/authHelpers.js`
```javascript
export const AUTH_TIMEOUTS = {
  SIGN_IN: 30000,  // Increase to 30 seconds
  // ...
};
```

### 7. Enable Detailed Logging
The app already logs sign-in attempts. Check console for:
- `🔐 Attempting sign in...`
- `📨 Sign in response:`
- `✅ Login successful:` or `❌ Sign in error:`

## Next Steps
1. Try signing in again (timeout is now 20s instead of 10s)
2. Check browser console for specific errors
3. Verify Supabase project is active
4. If issue persists, share the console error logs
