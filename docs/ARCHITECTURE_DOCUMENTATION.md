# Estospaces App - Complete Architecture Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Routes & Navigation](#routes--navigation)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Service Layer](#service-layer)
9. [Context Providers](#context-providers)
10. [Graphical Architecture Diagrams](#graphical-architecture-diagrams)

---

## Overview

**Estospaces App** is a comprehensive property management platform built with React, TypeScript, and Supabase. It supports three user roles: **Users** (tenants/renters), **Managers** (property managers/brokers), and **Admins** (platform administrators).

### Key Features

- **Multi-role Authentication** (User, Manager, Admin)
- **Property Management** (CRUD operations, search, filtering)
- **Property Discovery** (Zoopla API integration with Supabase fallback)
- **Applications & Viewings** (Property application workflow)
- **Messaging System** (Real-time chat between users and managers)
- **Notifications** (In-app notifications)
- **Analytics Dashboard** (For managers and admins)
- **Manager Verification** (Document-based verification system)
- **Location-based Search** (Postcode, city, radius search)

---

## Technology Stack

### Frontend
- **React** 19.2.0 (with Hooks)
- **TypeScript** 5.0.2
- **React Router DOM** 7.9.6 (Client-side routing)
- **Vite** 5.4.10 (Build tool & dev server)
- **Tailwind CSS** 3.4.15 (Styling)
- **Framer Motion** 12.24.7 (Animations)
- **Lucide React** 0.554.0 (Icons)
- **React Leaflet** 4.2.1 (Maps)
- **jsPDF** 3.0.4 (PDF generation)

### Backend
- **Express.js** 4.22.1 (API server)
- **Supabase** 2.89.0 (Backend-as-a-Service)
  - PostgreSQL Database
  - Authentication (OAuth & Email/Password)
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage (for documents/images)
- **Zoopla API** (External property data source)
- **Node.js** (Runtime)

### Development Tools
- **ESLint** (Code linting)
- **TypeScript** (Type checking)
- **Concurrently** (Run multiple processes)

---

## Frontend Architecture

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── Admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── Dashboard/      # Dashboard components
│   ├── layout/         # Layout components (Header, Sidebar)
│   ├── ui/             # Generic UI components (buttons, modals, etc.)
│   └── chatbot/        # Chatbot components
├── contexts/           # React Context providers (state management)
├── hooks/              # Custom React hooks
├── layouts/            # Page layout wrappers
├── lib/                # Third-party library configurations
├── pages/              # Page components (routes)
├── services/           # API service layer
└── utils/              # Utility functions
```

### Component Hierarchy

```
App (Root)
├── ThemeProvider
├── AuthProvider
├── PropertyProvider
├── LeadProvider
├── MessagesProvider
├── SavedPropertiesProvider
├── ApplicationsProvider
├── NotificationsProvider
├── ToastProvider
└── Router
    ├── LocationProvider
    └── PropertyFilterProvider
        └── Routes
            ├── Public Routes
            ├── Auth Routes
            ├── Manager Routes (Protected)
            ├── User Routes (Protected)
            └── Admin Routes (Protected)
```

### Key Components

#### 1. **Layout Components**
- `MainLayout.tsx` - Manager dashboard layout (Header + Sidebar)
- `DashboardLayout.jsx` - User dashboard layout (with bottom navigation)
- `AuthLayout.jsx` - Authentication pages layout

#### 2. **Admin Components** (`components/Admin/`)
- `AdminProtectedRoute.tsx` - Route protection for admins
- `ManagerProtectedRoute.jsx` - Route protection for managers
- `UserProtectedRoute.jsx` - Route protection for users
- `AdminChatWindow.jsx` - Admin chat interface
- `ConversationList.jsx` - List of conversations
- `TicketsList.jsx` - Support tickets management

#### 3. **Dashboard Components** (`components/Dashboard/`)
- `PropertyCard.jsx` - Property display card
- `PropertyDiscoverySection.jsx` - Property discovery with sections
- `MapView.jsx` / `MapViewReal.jsx` - Map view components
- `LakshmiAssistant.jsx` - AI assistant widget
- `VerificationSection.tsx` - Manager verification section
- `Messaging/` - Messaging components (9 files)
- `Applications/` - Application components (7 files)

#### 4. **UI Components** (`components/ui/`)
- `SearchBar.tsx` - Property search bar
- `PropertyCard.tsx` - Reusable property card
- `Toast.jsx` - Toast notifications
- `LoadingState.tsx` - Loading spinner
- `Charts/` - BarChart, LineChart, PieChart
- `Modals/` - Various modal components

---

## Backend Architecture

### Express Server (`server.js`)

The Express server runs on **port 3002** (configurable via `API_PORT` env var) and provides REST API endpoints for property data.

#### Server Configuration
- **Port**: 3002 (default) or `process.env.API_PORT`
- **CORS**: Configured for `http://localhost:5173` (Vite dev server)
- **Body Parser**: JSON middleware enabled
- **Timeout**: 30 seconds per request

#### Architecture Flow

```
Frontend (React)
    ↓ HTTP Request
Vite Dev Server (Port 5173)
    ↓ Proxy /api/*
Express Server (Port 3002)
    ↓ Query/Fetch
Supabase Client
    ↓ Database Query
PostgreSQL Database
```

**OR** (for external APIs)

```
Frontend (React)
    ↓ HTTP Request
Express Server (Port 3002)
    ↓ API Call (Server-side only)
Zoopla API
    ↓ Response
Express Server
    ↓ Transform & Return
Frontend
```

### Supabase Integration

- **Client**: Initialized with service role key or anon key
- **Connection**: Auto-refresh enabled, session persistence disabled (server-side)
- **Error Handling**: Comprehensive error messages for RLS, table not found, etc.

---

## Routes & Navigation

### Route Structure

```
/                                    → Redirect to /auth/login
/auth/*                              → Authentication routes
/user/dashboard/*                    → User dashboard (protected)
/manager/dashboard/*                 → Manager dashboard (protected)
/admin/*                             → Admin dashboard (protected)
/properties/*                        → Public property pages
```

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `<Navigate to="/auth/login" />` | Root redirect |
| `/properties/search` | `PropertySearch` | Public property search |
| `/property/:id` | `PropertyDetail` | Public property detail |
| `/privacy` | `PrivacyPolicy` | Privacy policy page |
| `/cookies` | `CookiePolicy` | Cookie policy page |
| `/terms` | `TermsConditions` | Terms & conditions |
| `/contact` | `ContactUs` | Contact us page |
| `/faq` | `FAQ` | FAQ page |

### Authentication Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/auth/login` | `Login` | Main login page (OAuth options) |
| `/auth/sign-in-email` | `EmailLogin` | Email/password login |
| `/auth/signup` | `Signup` | User registration |
| `/auth/reset-password` | `ResetPassword` | Password reset |
| `/auth/callback` | `AuthCallback` | OAuth callback handler |

### Manager Dashboard Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/manager/dashboard` | `Dashboard` | Manager dashboard home |
| `/manager/dashboard/properties` | `PropertiesList` | List all properties |
| `/manager/dashboard/properties/add` | `AddProperty` | Add new property |
| `/manager/dashboard/properties/edit/:id` | `AddProperty` | Edit property |
| `/manager/dashboard/properties/:id` | `PropertyView` | View property details |
| `/manager/dashboard/leads` | `LeadsClients` | Leads & clients management |
| `/manager/dashboard/application` | `Application` | View applications |
| `/manager/dashboard/appointment` | `Appointment` | View appointments |
| `/manager/dashboard/messages` | `Messages` | Messaging interface |
| `/manager/dashboard/analytics` | `Analytics` | Analytics dashboard |
| `/manager/dashboard/billing` | `Billing` | Billing & payments |
| `/manager/dashboard/profile` | `Profile` | Manager profile |
| `/manager/dashboard/help` | `HelpSupport` | Help & support |
| `/manager/dashboard/verification` | `ManagerVerificationSection` | Verification status |

### User Dashboard Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/user/dashboard` | `DashboardLocationBased` | Location-based dashboard (default) |
| `/user/dashboard/discover` | `DashboardDiscover` | Property discovery |
| `/user/dashboard/saved` | `DashboardSaved` | Saved properties |
| `/user/dashboard/property/:id` | `PropertyDetail` | Property detail view |
| `/user/dashboard/applications` | `DashboardApplications` | My applications |
| `/user/dashboard/viewings` | `DashboardViewings` | Viewing appointments |
| `/user/dashboard/messages` | `DashboardMessages` | Messaging interface |
| `/user/dashboard/payments` | `DashboardPayments` | Payment history |
| `/user/dashboard/contracts` | `DashboardContracts` | Contract documents |
| `/user/dashboard/reviews` | `DashboardReviews` | Property reviews |
| `/user/dashboard/settings` | `DashboardSettings` | User settings |
| `/user/dashboard/help` | `DashboardHelp` | Help & support |
| `/user/dashboard/notifications` | `DashboardNotifications` | Notifications |
| `/user/dashboard/profile` | `DashboardProfile` | User profile |

### Admin Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/login` | `AdminLogin` | Admin login |
| `/admin/verifications` | `AdminVerificationDashboard` | Manager verification dashboard |
| `/admin/chat` | `AdminChatDashboard` | Admin chat dashboard |
| `/admin/analytics` | `UserAnalytics` | User analytics |

### Route Protection

- **ManagerProtectedRoute**: Requires `role === 'manager' || role === 'admin'`
- **UserProtectedRoute**: Requires `role === 'user'`
- **AdminProtectedRoute**: Requires `role === 'admin'`

---

## Database Schema

### Core Tables

#### 1. `profiles`
User profile information linked to `auth.users`.

```sql
profiles (
  id UUID PRIMARY KEY → auth.users(id),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('user', 'manager', 'admin')),
  company_name TEXT,
  bio TEXT,
  location TEXT,
  is_verified BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 2. `properties`
Property listings with full details.

```sql
properties (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  property_type TEXT CHECK (property_type IN ('rent', 'sale')),
  status TEXT CHECK (status IN ('online', 'offline', 'under_offer', 'sold', 'let')),
  listing_type TEXT, -- 'rent' or 'sale'
  bedrooms INTEGER,
  bathrooms INTEGER,
  image_urls JSONB,
  video_urls JSONB,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'UK',
  address_line_1 TEXT,
  address_line_2 TEXT,
  agent_id UUID → auth.users(id),
  agent_name TEXT,
  agent_email TEXT,
  agent_phone TEXT,
  property_size_sqm INTEGER,
  year_built INTEGER,
  property_features JSONB,
  viewing_available BOOLEAN,
  deposit_amount NUMERIC(12, 2),
  council_tax_band TEXT,
  energy_rating TEXT,
  featured BOOLEAN,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  verified BOOLEAN DEFAULT false
)
```

#### 3. `saved_properties`
User's saved/favorited properties.

```sql
saved_properties (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  property_id UUID → properties(id),
  created_at TIMESTAMP,
  UNIQUE(user_id, property_id)
)
```

#### 4. `applied_properties`
Property applications submitted by users.

```sql
applied_properties (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  property_id UUID → properties(id),
  status TEXT CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', ...)),
  application_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 5. `viewings`
Property viewing appointments.

```sql
viewings (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  property_id UUID → properties(id),
  appointment_date TIMESTAMP,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP
)
```

#### 6. `messages`
Chat messages between users and managers.

```sql
messages (
  id UUID PRIMARY KEY,
  sender_id UUID → auth.users(id),
  receiver_id UUID → auth.users(id),
  property_id UUID → properties(id) (optional),
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)
```

#### 7. `notifications`
In-app notifications.

```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  type TEXT, -- 'VIEWING_BOOKED', 'APPLICATION_SUBMITTED', 'SYSTEM', etc.
  title TEXT,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)
```

#### 8. `manager_profiles`
Extended manager information for verification.

```sql
manager_profiles (
  id UUID PRIMARY KEY → auth.users(id),
  profile_type TEXT CHECK (profile_type IN ('broker', 'company')),
  license_number TEXT (unique),
  license_expiry_date DATE,
  company_registration_number TEXT (unique),
  verification_status TEXT CHECK (status IN ('incomplete', 'submitted', 'under_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID → auth.users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### 9. `manager_verification_documents`
Documents uploaded for manager verification.

```sql
manager_verification_documents (
  id UUID PRIMARY KEY,
  manager_id UUID → manager_profiles(id),
  document_type TEXT, -- 'license', 'identity', 'company_registration', etc.
  file_url TEXT,
  file_name TEXT,
  uploaded_at TIMESTAMP
)
```

#### 10. `chats`
Chat conversations (for admin chat dashboard).

```sql
chats (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  property_id UUID → properties(id) (optional),
  status TEXT, -- 'open', 'closed', 'resolved'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

## API Endpoints

### Express Server Endpoints (`server.js`)

Base URL: `http://localhost:3002/api` (development)

#### 1. `GET /api/properties`

**Description**: Get all properties with pagination and filters.

**Query Parameters**:
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `country` (string) - Filter by country
- `city` (string) - Filter by city (partial match)
- `postcode` (string) - Filter by postcode (partial match)
- `type` (string: 'buy', 'rent', 'all') - Filter by property type
- `min_price` (number) - Minimum price
- `max_price` (number) - Maximum price

**Response**:
```json
{
  "data": [/* Property[] */],
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

**Filters**: Properties with `status = 'online' OR status = 'active'`

#### 2. `GET /api/properties/sections`

**Description**: Get properties for specific dashboard sections.

**Query Parameters**:
- `section` (string) - One of: `'most_viewed'`, `'trending'`, `'recently_added'`, `'high_demand'`, `'featured'`, `'discovery'`
- `limit` (number, default: 6, max: 20) - Items per section
- `type` (string: 'buy', 'rent', 'all') - Optional type filter

**Response**:
```json
{
  "data": [/* Property[] */],
  "section": "most_viewed",
  "count": 6
}
```

#### 3. `GET /api/properties/all-sections`

**Description**: Get all property sections in one request (for dashboard).

**Query Parameters**:
- `type` (string: 'buy', 'rent', 'all') - Optional type filter
- `limit` (number, default: 6) - Items per section

**Response**:
```json
{
  "mostViewed": [/* Property[] */],
  "trending": [/* Property[] */],
  "recentlyAdded": [/* Property[] */],
  "highDemand": [/* Property[] */],
  "featured": [/* Property[] */],
  "discovery": [/* Property[] */]
}
```

#### 4. `GET /api/properties/global`

**Description**: Global property search with Zoopla API integration and Supabase fallback.

**Query Parameters**:
- `postcode` (string) - Filter by postcode
- `city` (string) - Filter by city
- `lat` (number) - Latitude for radius search
- `lng` (number) - Longitude for radius search
- `radius` (number, default: 5) - Search radius in miles
- `type` (string: 'rent', 'sale', 'both') - Property type
- `min_price` (number) - Minimum price
- `max_price` (number) - Maximum price
- `bedrooms` (number) - Number of bedrooms
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page

**Response**:
```json
{
  "source": "zoopla" | "supabase",
  "properties": [/* Property[] */],
  "totalResults": 100,
  "page": 1,
 "totalPages": 5,
  "fallbackUsed": false,
  "error": null
}
```

**Note**: Zoopla API is called server-side only. If Zoopla fails or API key is missing, it falls back to Supabase.

#### 5. `GET /api/health`

**Description**: Health check endpoint with system status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {/* Process memory usage */},
  "supabase": "connected" | "error"
}
```

---

### Supabase Client API (Frontend)

All Supabase operations are done via the `@supabase/supabase-js` client in the frontend:

- **Auth**: `supabase.auth.*` (login, signup, session management)
- **Database**: `supabase.from('table').*` (select, insert, update, delete)
- **Realtime**: `supabase.channel().subscribe()` (real-time updates)
- **Storage**: `supabase.storage.from('bucket').*` (file upload/download)

---

## Service Layer

Services are located in `src/services/` and act as an abstraction layer between components and Supabase/API.

### Services

| Service | Description |
|---------|-------------|
| `authService.ts` | Authentication operations (login, signup, session) |
| `propertyService.ts` | Property CRUD operations |
| `propertiesApiService.js` | Express API client for properties |
| `propertiesService.js` | Supabase property queries |
| `propertyDataService.js` | Property data fetching (Zoopla + Supabase) |
| `applicationsService.js` | Property application operations |
| `notificationsService.ts` | Notification operations |
| `leadsService.js` | Lead management |
| `analyticsService.js` | Analytics data |
| `managerVerificationService.ts` | Manager verification operations |
| `addressService.ts` | Address/postcode utilities |
| `postcodeService.js` | Postcode lookup |
| `locationService.js` | Location-based services |
| `userPropertiesService.js` | User-specific property queries |
| `verificationService.js` | Verification utilities |
| `zooplaService.js` | Zoopla API client (server-side only) |

---

## Context Providers

React Context API is used for global state management. All providers are wrapped in `App.tsx`.

### Contexts

| Context | Purpose | Key State |
|---------|---------|-----------|
| `ThemeContext.tsx` | Dark/light theme | `theme`, `toggleTheme` |
| `AuthContext.tsx` | Authentication state | `user`, `session`, `signIn`, `signOut` |
| `PropertyContext.tsx` | Property data | `properties`, `fetchProperties` |
| `LeadContext.jsx` | Lead management | `leads`, `addLead` |
| `MessagesContext.jsx` | Messages state | `messages`, `sendMessage` |
| `PropertyFilterContext.jsx` | Property filters | `filters`, `updateFilters` |
| `SavedPropertiesContext.jsx` | Saved properties | `savedProperties`, `toggleSave` |
| `ApplicationsContext.jsx` | Applications | `applications`, `submitApplication` |
| `LocationContext.jsx` | User location | `location`, `updateLocation` |
| `NotificationsContext.tsx` | Notifications | `notifications`, `markAsRead` |
| `ToastContext.jsx` | Toast notifications | `showToast` |
| `ManagerVerificationContext.tsx` | Manager verification | `verificationStatus`, `submitVerification` |

---

## Graphical Architecture Diagrams

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     src/App.tsx                           │  │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐   │  │
│  │  │ Providers │  │  Router   │  │      Components     │   │  │
│  │  │ (Context) │→ │ (Routes)  │→ │   (Pages/UI)        │   │  │
│  │  └───────────┘  └───────────┘  └─────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Services Layer                          │  │
│  │  authService │ propertyService │ notificationsService │ ... │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP
                              │ /api/*
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Express Server (Port 3002)                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  GET /api/properties                                       │  │
│  │  GET /api/properties/sections                              │  │
│  │  GET /api/properties/all-sections                          │  │
│  │  GET /api/properties/global                                │  │
│  │  GET /api/health                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                                  │
         │ Supabase Client                  │ Zoopla API (External)
         ↓                                  ↓
┌─────────────────────────────────┐  ┌─────────────────────────┐
│      Supabase (Backend)         │  │    Zoopla API           │
│  ┌───────────────────────────┐  │  │  (Property Listings)    │
│  │   PostgreSQL Database     │  │  │                         │
│  │   - properties            │  │  │  Server-side only       │
│  │   - profiles              │  │  │  (No CORS)              │
│  │   - messages              │  │  │                         │
│  │   - notifications         │  │  │                         │
│  │   - ...                   │  │  │                         │
│  └───────────────────────────┘  │  └─────────────────────────┘
│  ┌───────────────────────────┐  │
│  │   Authentication          │  │
│  │   - OAuth (Google, etc.)  │  │
│  │   - Email/Password        │  │
│  │   - Session Management    │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Realtime Subscriptions  │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   Storage (Files/Images)  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Request Flow for Property Search

```
User searches for properties
    ↓
[Frontend] PropertySearch component
    ↓
[Service] propertiesApiService.fetchProperties()
    ↓
HTTP GET /api/properties?city=London&type=rent
    ↓
[Express] server.js → GET /api/properties handler
    ↓
[Express] Query Supabase
    ↓
[Supabase] PostgreSQL: SELECT * FROM properties WHERE ...
    ↓
[Supabase] Returns data (with RLS policies applied)
    ↓
[Express] Transform & paginate response
    ↓
HTTP Response: { data: [...], pagination: {...} }
    ↓
[Frontend] Update PropertyContext state
    ↓
[Frontend] Re-render components with new data
```

### Request Flow for Global Property Search (Zoopla)

```
User searches with postcode
    ↓
[Frontend] DashboardDiscover component
    ↓
[Service] propertyDataService.fetchPropertiesFromZoopla()
    ↓
HTTP GET /api/properties/global?postcode=SW1A&type=both
    ↓
[Express] server.js → GET /api/properties/global handler
    ↓
[Express] Try Zoopla API first
    │
    ├─ Success → Transform Zoopla data → Return response
    │
    └─ Fail/No API Key → Fallback to Supabase
           ↓
        [Express] Query Supabase properties
           ↓
        [Supabase] Return data
           ↓
        [Express] Return response with fallbackUsed: true
    ↓
[Frontend] Display properties (from Zoopla or Supabase)
```

### Authentication Flow

```
User clicks "Sign In"
    ↓
[Frontend] Login component
    ↓
[Context] AuthContext.signIn()
    ↓
[Service] authService.signInWithEmail()
    ↓
[Supabase] supabase.auth.signInWithPassword()
    ↓
[Supabase] Verify credentials
    ↓
[Supabase] Create session & JWT token
    ↓
[Frontend] Store session in localStorage
    ↓
[Frontend] Fetch user profile from profiles table
    ↓
[Context] Update AuthContext state (user, session)
    ↓
[Router] Redirect based on role:
    ├─ user → /user/dashboard
    ├─ manager → /manager/dashboard
    └─ admin → /admin/verifications
```

### Component Hierarchy (Manager Dashboard)

```
App
└── ThemeProvider
    └── AuthProvider
        └── Router
            └── ManagerProtectedRoute
                └── MainLayout
                    ├── Header (with sidebar toggle)
                    ├── Sidebar (navigation)
                    └── Dashboard (page content)
                        ├── KPICard (stats)
                        ├── PropertyCard (listings)
                        ├── Analytics (charts)
                        └── RecentActivity (feed)
```

### Component Hierarchy (User Dashboard)

```
App
└── AuthProvider
    └── Router
        └── UserProtectedRoute
            └── DashboardLayout
                ├── Header (with notifications)
                ├── DashboardLocationBased (content)
                │   ├── PropertyFilterTabs
                │   ├── PropertyDiscoverySection
                │   │   ├── PropertyCard (most viewed)
                │   │   ├── PropertyCard (trending)
                │   │   └── PropertyCard (recently added)
                │   └── MapView (optional)
                └── HorizontalNavigation (bottom nav)
```

### Database Relationships

```
auth.users
    │
    ├──→ profiles (1:1)
    │       ├──→ role: 'manager' → manager_profiles
    │       │                         └──→ manager_verification_documents
    │       └──→ role: 'user' → [user activities]
    │
    ├──→ properties (1:N) [if manager]
    │       └──→ saved_properties (N:M via users)
    │       └──→ applied_properties (N:M via users)
    │       └──→ viewings (N:M via users)
    │       └──→ messages (N:M via users)
    │
    ├──→ messages (sender_id, receiver_id)
    │
    └──→ notifications (user_id)
```

---

## Development Workflow

### Running the Application

```bash
# Install dependencies
npm install

# Start both servers (recommended)
npm run dev:all

# OR start separately:
npm run server  # Express API (port 3002)
npm run dev     # Vite dev server (port 5173)
```

### Environment Variables

Required in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional (for admin operations)
ZOOPLA_API_KEY=your_zoopla_api_key  # Optional (for Zoopla integration)
API_PORT=3002  # Optional (default: 3002)
VITE_DEV_URL=http://localhost:5173  # Optional
```

### Build for Production

```bash
npm run build  # Build frontend (output: dist/)
```

---

## Security Features

1. **Row Level Security (RLS)**: All Supabase tables have RLS policies
2. **Route Protection**: Protected routes check user roles
3. **Server-side API Keys**: Zoopla API key never exposed to frontend
4. **CORS Configuration**: Express server configured for specific origins
5. **Authentication**: JWT tokens managed by Supabase Auth
6. **Input Validation**: Server-side validation for API endpoints

---

## Performance Optimizations

1. **Pagination**: All property lists are paginated
2. **Parallel Queries**: `/api/properties/all-sections` uses `Promise.all()`
3. **Caching**: React Context reduces redundant API calls
4. **Lazy Loading**: Route-based code splitting (Vite default)
5. **Image Optimization**: Supabase Storage CDN for images
6. **Request Timeout**: 30-second timeout prevents hanging requests

---

## Testing

- **Linting**: `npm run lint` (ESLint)
- **Type Checking**: `npm run build` (TypeScript)
- **Health Check**: `http://localhost:3002/api/health`

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Router Docs**: https://reactrouter.com
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS Docs**: https://tailwindcss.com

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Estospaces Development Team
