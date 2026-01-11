# 🧪 Manual Testing Guide - Login Flow

## 📋 Test Credentials
- **Email**: estospacessolutions@gmail.com
- **Password**: Estospaces@123

## 🎯 Step-by-Step Testing Instructions

### Prerequisites
1. **Clear browser data** (Important!)
   - Press `Ctrl + Shift + Delete`
   - Select "All time"
   - Check: Cookies, Cache, Local Storage
   - Click "Clear data"

2. **Open DevTools** (F12)
   - Go to **Console** tab
   - Clear console (click 🚫 icon)

3. **Verify servers are running**
   ```bash
   npm run health
   ```
   Should show both backend and frontend healthy

---

## 🔍 Test Procedure

### Step 1: Navigate to Login
1. Go to: `http://localhost:5173/auth/sign-in-email`
2. Console should show: "Checking for existing session..."

### Step 2: Enter Credentials
1. **Email field**: Enter `estospacessolutions@gmail.com`
2. **Password field**: Enter `Estospaces@123`
3. **Don't click login yet!**

### Step 3: Watch Console & Click Login
1. Keep Console tab visible
2. Click "Sign In" button
3. **Watch for these console messages** (in order):

```
🔐 Attempting sign in... {email: "estospacessolutions@gmail.com"}
📨 Sign in response: {hasData: true, hasSession: true, hasError: false}
✅ Session obtained, getting user role...
✅ Login successful: {userId: "...", email: "...", role: "...", redirectPath: "..."}
🔄 Navigating to: /user/dashboard (or /manager/dashboard)
⏭️  Executing navigation...
✅ User session valid: {userId: "...", email: "..."}
```

### Step 4: Expected Outcomes

#### ✅ SUCCESS Scenario:
- Loading spinner appears briefly
- Console shows all ✅ messages
- Page redirects to dashboard within 1 second
- No error messages
- Dashboard loads successfully

#### ❌ FAILURE Scenarios:

**Scenario A: Network Error**
```
❌ Sign in error: {message: "fetch failed"}
Error: "Network error. Please check your connection."
```
**Fix**: Check if backend is running on port 3002

**Scenario B: Invalid Credentials**
```
❌ Sign in error: {message: "Invalid login credentials"}
Error: "Invalid email or password"
```
**Fix**: Double-check credentials or verify user exists in Supabase

**Scenario C: Timeout**
```
❌ Sign in error: {message: "timeout"}
Error: "Sign-in is taking too long..."
```
**Fix**: Check internet connection and Supabase status

**Scenario D: No Session**
```
📨 Sign in response: {hasData: true, hasSession: false}
❌ No session in response
```
**Fix**: Supabase configuration issue

**Scenario E: Redirect Doesn't Happen**
```
✅ Login successful: {userId: "..."}
🔄 Navigating to: /user/dashboard
⏭️  Executing navigation...
(But page stays on login)
```
**Fix**: Protected route issue or React Router problem

---

## 🔧 Troubleshooting Checklist

### Before Testing:
- [ ] Backend server running on port 3002
- [ ] Frontend server running on port 5173
- [ ] Browser cache completely cleared
- [ ] DevTools console open and cleared
- [ ] Internet connection stable

### If Login Fails:
1. **Check Backend Health**
   ```bash
   curl http://localhost:3002/api/health
   ```
   Should return: `{"status":"ok","supabase":"connected"}`

2. **Check Supabase Connection**
   - Console should NOT show: "Supabase not configured"
   - Look for: "✅ Supabase client initialized"

3. **Check Network Tab** (in DevTools)
   - Look for request to Supabase
   - Status should be 200
   - Response should contain access_token

4. **Check Application Tab** (in DevTools)
   - Local Storage > http://localhost:5173
   - Should see: `supabase.auth.token`
   - Should contain JSON with access_token

5. **Check for JavaScript Errors**
   - Red errors in console?
   - Any uncaught exceptions?

---

## 📊 What to Report Back

After testing, please provide:

### 1. **Console Output**
Copy and paste ALL console messages (both regular and errors)

### 2. **What Happened**
- Did page stay on login or redirect?
- Any error messages shown to user?
- How long did it take?

### 3. **Network Tab Info** (if login failed)
- Go to Network tab
- Filter by "auth" or "token"
- Check the request to Supabase
- Status code?
- Response body?

### 4. **Screenshots**
If possible:
- Screenshot of console
- Screenshot of Network tab
- Screenshot of error (if any)

---

## 🎯 Quick Test Commands

Run these in order to verify setup:

```bash
# 1. Check servers are running
npm run health

# 2. Check backend health directly
curl http://localhost:3002/api/health

# 3. Check if ports are listening
netstat -ano | findstr ":3002 :5173"
```

---

## 💡 Expected Timeline

**Normal Login Flow:**
- Click "Sign In" → 0ms
- Sign in request → 100-500ms
- Get role → 50-200ms  
- Redirect delay → 100ms
- Protected route check → 100-300ms
- Dashboard renders → 200-500ms

**Total: 0.5-2 seconds**

If it takes longer than 3 seconds, something is wrong!

---

## 🚨 Common Issues & Quick Fixes

| Issue | Symptom | Quick Fix |
|-------|---------|-----------|
| **Port conflict** | Backend won't start | `taskkill /F /PID [PID]` then restart |
| **Cache issues** | Old data showing | Clear browser cache completely |
| **Supabase offline** | All requests fail | Check https://status.supabase.com |
| **Wrong .env** | "Not configured" error | Verify .env file exists with correct keys |
| **Network blocked** | Timeout errors | Check firewall/antivirus |

---

## ✅ Success Checklist

Login is working correctly if:
- [ ] Console shows all ✅ messages in correct order
- [ ] No ❌ or red error messages in console
- [ ] Page redirects within 1-2 seconds
- [ ] Dashboard loads successfully
- [ ] No error displayed to user
- [ ] Session persists on page refresh

---

**Ready to test!** Follow the steps above and let me know what you see. I'll fix any issues immediately based on your feedback.
