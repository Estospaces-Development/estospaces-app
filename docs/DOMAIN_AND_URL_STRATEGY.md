# Domain & URL Strategy for Estospaces

## Current Situation

You have **two separate applications** that should use **different domains/subdomains**:

1. **Landing Page** (`estospaces.com` repository)
   - Static marketing/landing page
   - Deployed separately (Vercel recommended for static sites)
   - Domain: `https://estospaces.com` (root domain)

2. **Web Application** (`estospaces-app` repository)
   - Full-stack app (Express API + React frontend)
   - Requires backend server (not static)
   - Domain: `https://app.estospaces.com` (subdomain)

## Recommended URL Structure

```
┌─────────────────────────────────────────────────────────┐
│                    estospaces.com                       │
│                  (Root Domain)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  https://estospaces.com                                │
│  └─ Landing Page (estospaces.com repo)                 │
│     └─ Marketing, signup, waitlist                     │
│                                                         │
│  https://app.estospaces.com                            │
│  └─ Web Application (estospaces-app repo)              │
│     └─ User dashboard, Manager dashboard, Admin        │
│                                                         │
│  https://api.estospaces.com (optional)                 │
│  └─ API Gateway (if microservices)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Domain Configuration

### Option 1: Vercel (Current - Keep if it works)

**For Landing Page (`estospaces.com` repo)**:
- ✅ **Keep using Vercel** - Perfect for static sites
- Domain: `https://estospaces.com`
- Deploy from `estospaces.com` repository

**For Web App (`estospaces-app` repo)**:
- ⚠️ **Vercel CAN work** but has limitations for full-stack apps
- Custom domain: `https://app.estospaces.com`
- Need to configure both:
  1. **Vercel project settings** → Add custom domain `app.estospaces.com`
  2. **DNS settings** at your domain registrar:
     ```
     Type: CNAME
     Name: app
     Value: cname.vercel-dns.com
     ```

**Limitations of Vercel for Full-Stack**:
- ❌ Express.js backend runs as serverless functions (not ideal for persistent connections)
- ❌ Limited to serverless function timeout limits
- ❌ API routes need to be in `/api` directory or serverless functions
- ✅ Can work if you adapt `server.js` to Vercel's serverless format

### Option 2: Separate Deployment Platforms (Recommended)

**For Landing Page**:
- **Platform**: Vercel
- **Domain**: `https://estospaces.com`
- **Repo**: `estospaces.com`

**For Web App**:
- **Platform**: Railway, Render, or GKE
- **Domain**: `https://app.estospaces.com`
- **Repo**: `estospaces-app`

**DNS Configuration**:
```
Type    Name    Value
─────────────────────────────────────────────
A       @       [Vercel IP]              # Root domain → Landing page
CNAME   app     [Railway/Render CNAME]   # Subdomain → Web app
```

## How to Configure Custom Domain on Vercel

If you want to keep using Vercel for the web app:

### Step 1: Add Domain in Vercel Dashboard

1. Go to: https://vercel.com/estospaces-projects/estospaces-app/settings/domains
2. Click **"Add Domain"**
3. Enter: `app.estospaces.com`
4. Follow Vercel's DNS instructions

### Step 2: Configure DNS

At your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

```
Type: CNAME
Name: app
Value: [Vercel provides this - something like cname.vercel-dns.com]
TTL: 3600 (or Auto)
```

### Step 3: SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt (takes a few minutes to hours).

## How to Configure Custom Domain on Railway

If you switch to Railway for the web app:

### Step 1: Add Domain in Railway

1. Go to Railway project settings
2. Navigate to **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter: `app.estospaces.com`

### Step 2: Configure DNS

```
Type: CNAME
Name: app
Value: [Railway provides this - something like *.up.railway.app]
TTL: 3600
```

Railway also auto-provisions SSL certificates.

## Current Vercel Deployment

Based on the URL you shared: https://vercel.com/estospaces-projects/estospaces-app/64Fmnn8ZWUCrYYbSE4sk5VYwqpwD

This shows:
- ✅ Project exists in Vercel
- ✅ Connected to `estospaces-app` repository
- ⚠️ Currently deploying (which causes the status checks in PRs)

## Decision Matrix

| Scenario | Landing Page | Web App | Recommendation |
|----------|-------------|---------|----------------|
| **Current Setup** | Vercel ✅ | Vercel ⚠️ | Keep landing page on Vercel, move app to Railway/Render |
| **Best Practice** | Vercel ✅ | Railway/Render ✅ | Separate platforms for different needs |
| **Simplest** | Vercel ✅ | Vercel ✅ | Keep both, but adapt `server.js` to serverless |
| **Production Scale** | Vercel ✅ | GKE ✅ | Use Kubernetes for web app, Vercel for landing |

## Recommended Action Plan

### Phase 1: Keep Vercel for Now (Quick Fix)

1. **Keep Vercel connected** to `estospaces-app` repo
2. **Configure custom domain** `app.estospaces.com` in Vercel
3. **Adapt deployment** to work with Vercel's serverless format
4. **Accept Vercel status checks** in PRs (or disable if needed)

**Pros**: Quick, no migration needed  
**Cons**: Vercel limitations for full-stack apps

### Phase 2: Migrate Web App (Recommended)

1. **Deploy `estospaces-app` to Railway** (or Render)
2. **Configure `app.estospaces.com`** domain on Railway
3. **Update DNS** to point `app` subdomain to Railway
4. **Disconnect Vercel** from `estospaces-app` repo
5. **Keep Vercel** only for `estospaces.com` landing page repo

**Pros**: Proper full-stack hosting, better performance  
**Cons**: Requires migration effort

## DNS Configuration Example

If your domain is registered at **Cloudflare**, **GoDaddy**, or **Namecheap**:

### For Root Domain (estospaces.com → Landing Page)

```
Type: A
Name: @
Value: 76.76.21.21  # Vercel IP (check Vercel dashboard)
TTL: Auto
```

### For Subdomain (app.estospaces.com → Web App)

**If using Railway**:
```
Type: CNAME
Name: app
Value: [Railway-provided CNAME]
TTL: Auto
```

**If using Vercel**:
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
```

## Summary

- ✅ **Landing page** (`estospaces.com`) → Keep on Vercel
- ✅ **Web app** (`app.estospaces.com`) → Deploy to Railway/Render (or keep Vercel with limitations)
- ✅ **Different URLs** for different purposes:
  - `https://estospaces.com` → Marketing/landing
  - `https://app.estospaces.com` → Application

The Vercel deployment you're seeing is for the **web app** (`estospaces-app` repo). You have two options:
1. **Keep it on Vercel** and configure `app.estospaces.com` as custom domain
2. **Migrate to Railway/Render** and disconnect from Vercel (recommended)

---

**Next Steps**:
1. Decide on deployment platform for web app
2. Configure custom domain (`app.estospaces.com`)
3. Update DNS records
4. Test deployment
