# Remove Vercel Integration & Proper Deployment Guide

## Why Vercel Checks Are Showing Up

Vercel deployment checks appear in GitHub PRs because the repository is **connected to Vercel at the repository level** (in Vercel's dashboard), not because of local configuration files.

Even though we removed `vercel.json` from the repository, Vercel continues to:
- Monitor the repository for pushes/PRs
- Attempt deployments automatically
- Show status checks in GitHub PRs

## How to Remove Vercel Completely

### Step 1: Disconnect Repository in Vercel Dashboard

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find the `estospaces-app` project**
3. **Go to Project Settings** → **Git** tab
4. **Click "Disconnect" or "Remove Integration"**
   - This will stop all Vercel deployments and remove status checks from GitHub PRs

### Step 2: Remove from Branch Protection Rules (Optional)

If Vercel checks are required in branch protection rules:

1. Go to: https://github.com/Estospaces/estospaces-app/settings/branches
2. Edit branch protection rule (e.g., for `main` branch)
3. Under **"Require status checks to pass before merging"**
4. **Uncheck/Remove** "Vercel — Deployment has failed"
5. Save changes

### Step 3: Verify Removal

After disconnecting:
- ✅ Vercel checks should stop appearing in new PRs
- ✅ No automatic deployments from Vercel
- ✅ Repository is decoupled from Vercel

---

## Proper Deployment Strategy for Estospaces-App

**Important**: `estospaces-app` is **NOT a static site** like `estospaces.com` (landing page). It requires:

- ✅ **Express.js backend** (API server on port 3002)
- ✅ **React frontend** (static build served)
- ✅ **Both services running together**

### Deployment Options

#### Option 1: Google Kubernetes Engine (GKE) - Recommended for Scale

**Best for**: Production, scalability, microservices architecture

**Setup**:
```bash
# Follow TECH_STACK_AND_MIGRATION_PLAN.md
# Containerize both frontend and backend
# Deploy to GKE with separate services
```

**Pros**:
- Scalable and production-ready
- Supports microservices architecture
- Auto-scaling, load balancing
- Managed Kubernetes by Google

**Cons**:
- More complex setup
- Requires Kubernetes knowledge
- Higher operational overhead

#### Option 2: Railway.app - Recommended for Quick Deployment

**Best for**: Fast deployment, simplicity, full-stack apps

**Setup**:
```bash
# Railway detects package.json and server.js
# Automatically builds and deploys both frontend and backend
# Configure environment variables in Railway dashboard
```

**Pros**:
- Simple deployment (Git push to deploy)
- Automatic builds
- Built-in environment variables
- Supports both frontend and backend
- Free tier available

**Cons**:
- Less control than self-hosted
- Vendor lock-in

**Steps**:
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `estospaces-app` repository
4. Railway will detect `server.js` and `package.json`
5. Configure environment variables:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   API_PORT=3002
   NODE_ENV=production
   ```
6. Deploy!

#### Option 3: Render.com - Alternative to Railway

**Best for**: Docker support, PostgreSQL, simple setup

**Setup**:
1. Create **Web Service** for backend (Express API)
2. Create **Static Site** for frontend (React build)
3. Or use **Docker** for full-stack deployment

**Pros**:
- Docker support
- PostgreSQL hosting
- Free tier available
- Good documentation

**Steps**:
1. Go to https://render.com
2. Create **Web Service**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run server` (for backend)
3. Or deploy via Dockerfile

#### Option 4: DigitalOcean App Platform

**Best for**: Simple deployment, good pricing

**Pros**:
- Simple interface
- Automatic HTTPS
- Database hosting
- Good pricing

**Setup**: Similar to Railway/Render

#### Option 5: Self-Hosted VPS (Traditional)

**Best for**: Full control, cost-effective

**Requirements**:
- VPS (DigitalOcean, Linode, AWS EC2)
- Domain name
- Nginx as reverse proxy
- PM2 for process management

**Setup**:
```bash
# On VPS
git clone https://github.com/Estospaces/estospaces-app.git
cd estospaces-app
npm install
npm run build

# Start backend with PM2
pm2 start server.js --name estospaces-api

# Configure Nginx
# - Serve frontend static files from /dist
# - Proxy /api/* to backend (localhost:3002)
```

---

## Recommended Deployment Architecture

### For Production (Current Recommended)

```
┌─────────────────────────────────────────┐
│         Load Balancer / CDN             │
│         (Cloudflare / Cloud Load)      │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│   Frontend   │      │   Backend API    │
│   (Static)   │      │   (Express)      │
│              │      │                  │
│ Build:       │      │ Port: 3002       │
│ dist/        │      │ server.js        │
│              │      │                  │
│ Served via:  │      │ Handles:         │
│ Nginx/CDN    │      │ /api/* routes    │
└──────────────┘      └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │    Supabase      │
                    │  (Database/Auth) │
                    └──────────────────┘
```

### Deployment Configuration

#### Environment Variables Required

```bash
# Backend (Express API)
NODE_ENV=production
PORT=3002  # or API_PORT
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ZOOPLA_API_KEY=your_zoopla_key  # Optional

# Frontend Build
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### Build & Start Commands

```bash
# Build frontend
npm run build  # Outputs to dist/

# Start backend API
npm run server  # Starts Express on port 3002

# Or both together (development)
npm run dev:all  # Runs both concurrently
```

---

## Quick Start: Deploy to Railway (Simplest)

### Step 1: Prepare Repository

1. Ensure `package.json` has build and start scripts:
   ```json
   {
     "scripts": {
       "build": "tsc && vite build",
       "server": "node server.js",
       "start": "npm run server"
     }
   }
   ```

2. Add `railway.json` (optional, for configuration):
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run server",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

### Step 2: Deploy to Railway

1. **Sign up**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Select**: `estospaces-app`
4. **Configure Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `API_PORT=3002`
   - `NODE_ENV=production`
5. **Deploy!**

Railway will:
- Automatically detect `server.js`
- Build the frontend (`npm run build`)
- Start the Express server
- Serve the React app through Express or separate services

---

## Migration from Vercel to Proper Deployment

### Checklist

- [ ] Disconnect repository from Vercel dashboard
- [ ] Remove Vercel status checks from branch protection rules
- [ ] Choose deployment platform (Railway/Render/GKE)
- [ ] Set up deployment configuration
- [ ] Configure environment variables
- [ ] Test deployment in staging environment
- [ ] Update domain DNS (if applicable)
- [ ] Update README.md with deployment instructions
- [ ] Remove Vercel reference from README.md (line 664)

### Update README.md

Remove or update this line:
```markdown
**Live Demo**: https://estospaces-app.vercel.app
```

Replace with:
```markdown
**Production URL**: https://app.estospaces.com  # Or your deployed URL
```

---

## Summary

1. **Vercel checks appear** because the repo is connected in Vercel dashboard (not local files)
2. **Disconnect in Vercel dashboard** to remove checks
3. **estospaces-app needs proper deployment** (not static hosting like landing page)
4. **Recommended**: Railway.app for quick deployment, or GKE for production scale
5. **Update README.md** to remove Vercel references

---

**Next Steps**:
1. Disconnect from Vercel dashboard
2. Choose deployment platform
3. Set up deployment configuration
4. Deploy and test
5. Update documentation
