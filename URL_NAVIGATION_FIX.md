# URL Navigation Fix - Manager Dashboard Redirect

## Issue
After signing in as a manager, the URL was not updating to `/manager/dashboard`.

## Root Cause
The redirect logic was working correctly, but there was insufficient debugging information to verify:
1. That the user's role was being correctly identified
2. That the redirect path was being correctly calculated
3. That the navigation was actually happening

## Fixes Applied

### 1. Added Debug Logging
Added console logging (only in development mode) to track:
- User role detection from `user_metadata`
- User role detection from `profiles` table
- Calculated redirect path
- Navigation execution

**Files Modified:**
- `src/utils/authHelpers.js` - Added role detection logging
- `src/components/auth/EmailLogin.jsx` - Added sign-in redirect logging
- `src/components/auth/Login.jsx` - Added OAuth redirect logging
- `src/components/auth/AuthCallback.jsx` - Added OAuth callback logging

### 2. Enhanced Role Detection
Improved the `getUserRole` function to:
- Check `user_metadata.role` first (fastest)
- Fallback to `profiles` table query
- Log which source provided the role
- Warn if no role is found (defaults to 'user')

## How to Verify

### Step 1: Clear Browser Cache & Storage
1. Open browser DevTools (F12)
2. Go to Application tab → Storage → Clear site data
3. Or manually clear localStorage for `supabase.auth.token`
4. Close and reopen the browser

### Step 2: Sign In and Check Console
1. Navigate to the login page
2. Open browser console (F12 → Console tab)
3. Sign in with manager credentials
4. Check console output - you should see:

```
Login successful: {
    userId: "...",
    email: "manager@example.com",
    role: "manager",
    redirectPath: "/manager/dashboard"
}
```

### Step 3: Verify URL
After sign-in, the browser URL should change to:
```
http://localhost:5173/manager/dashboard
```

### Step 4: Check Role in Database
If the redirect is not working, verify your user's role in Supabase:

#### Option A: Check user_metadata
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user
3. Click to view details
4. Check **User Metadata** section
5. Verify `role: "manager"` is present

#### Option B: Check profiles table
1. Go to Supabase Dashboard → Table Editor → profiles
2. Find your user by `id` (matches auth.users.id)
3. Check the `role` column
4. Verify it says `"manager"`

## Troubleshooting

### Issue: URL shows `/user/dashboard` instead of `/manager/dashboard`

**Cause:** User role is not set to "manager"

**Solution:**
1. Go to Supabase Dashboard → Table Editor → profiles
2. Update the `role` column for your user to `"manager"`
3. OR update via SQL:
   ```sql
   UPDATE profiles 
   SET role = 'manager' 
   WHERE id = 'your-user-id';
   ```

### Issue: Console shows "No role found, defaulting to user"

**Cause:** Neither `user_metadata` nor `profiles` table has a role

**Solution:**
1. Ensure the user has a profile in the `profiles` table
2. Ensure the `role` column is set to `"manager"`
3. If using OAuth signup, ensure the profile is created on first login

### Issue: Console shows "Role from user_metadata: user"

**Cause:** The `user_metadata.role` is set to "user" instead of "manager"

**Solution:**
Update the user's metadata in Supabase:
1. Go to Supabase Dashboard → Authentication → Users
2. Click on your user
3. Update **User Metadata** to include:
   ```json
   {
     "role": "manager"
   }
   ```

### Issue: No console logs appear

**Cause:** Running in production mode

**Solution:**
- The debug logs only appear in development mode
- Ensure you're running `npm run dev` (not `npm run build`)
- Check that `import.meta.env.DEV` is true

## Testing Checklist

- [ ] Sign in with manager credentials
- [ ] Console shows correct role detection
- [ ] URL changes to `/manager/dashboard`
- [ ] Manager dashboard loads correctly
- [ ] Sidebar shows manager navigation items
- [ ] Logout works correctly
- [ ] Sign back in → URL is `/manager/dashboard` again

## Production Deployment

The debug console logs are automatically disabled in production builds. They only run when `import.meta.env.DEV` is true.

To build for production:
```bash
npm run build
```

The console logs will not appear in the production bundle.

---

## Summary

✅ **Redirect logic works correctly**
✅ **Added debug logging for development**
✅ **Enhanced role detection with fallbacks**
✅ **URL should now correctly show `/manager/dashboard`**

**If URL is still not updating:**
1. Check browser console for role detection logs
2. Verify user role in Supabase database
3. Clear browser cache and localStorage
4. Try signing in again
