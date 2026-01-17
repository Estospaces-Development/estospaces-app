# Estospaces Platform - Architecture & Tech Stack Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Application Structure](#application-structure)
5. [Data Flow](#data-flow)
6. [Authentication & Authorization](#authentication--authorization)
7. [Database Schema](#database-schema)
8. [API Services](#api-services)
9. [State Management](#state-management)
10. [Routing & Navigation](#routing--navigation)
11. [Styling & Theming](#styling--theming)
12. [Real-time Features](#real-time-features)
13. [Deployment Architecture](#deployment-architecture)

---

## 🎯 Overview

**Estospaces** is a comprehensive property management platform that connects property managers, agents, and tenants. The platform facilitates property listings, applications, appointments, messaging, and analytics.

### Key Features
- **Multi-role System**: Users, Managers, and Admins with role-based access control
- **Property Management**: CRUD operations for property listings with rich media support
- **Application System**: End-to-end property application workflow
- **Real-time Notifications**: Toast notifications and in-app notification system
- **Messaging System**: Real-time chat between users and managers
- **Analytics Dashboard**: Comprehensive analytics for managers and admins
- **Location-based Search**: Advanced property search with map integration

---

## 🛠️ Tech Stack

### Frontend Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI library and component framework |
| **TypeScript** | 5.0.2 | Type safety and enhanced developer experience |
| **Vite** | 5.4.10 | Build tool, dev server, and bundler |
| **React Router DOM** | 7.9.6 | Client-side routing and navigation |

### Styling & UI

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.15 | Utility-first CSS framework |
| **Framer Motion** | 12.24.7 | Animation library for smooth transitions |
| **Lucide React** | 0.554.0 | Icon library |
| **Inter Font** | - | Modern typography system |

### Backend & Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.89.0 | Backend-as-a-Service (BaaS) |
| **PostgreSQL** | (via Supabase) | Primary database |
| **Express.js** | 4.22.1 | API server for property listings |
| **Node.js** | - | Runtime environment |

### Maps & Location Services

| Technology | Version | Purpose |
|------------|---------|---------|
| **Leaflet** | 1.9.4 | Interactive maps |
| **React Leaflet** | 4.2.1 | React bindings for Leaflet |
| **Postcodes.io** | - | UK postcode validation and geocoding |
| **OpenStreetMap Nominatim** | - | Address lookup service |

### Utilities & Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| **date-fns** | 4.1.0 | Date manipulation and formatting |
| **uuid** | 13.0.0 | Unique ID generation |
| **jsPDF** | 3.0.4 | PDF generation |
| **jspdf-autotable** | 5.0.2 | PDF table generation |
| **xlsx** | 0.18.5 | Excel file generation |
| **file-saver** | 2.0.5 | File download utilities |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.15.0 | Code linting |
| **TypeScript ESLint** | 6.0.0 | TypeScript-specific linting |
| **PostCSS** | 8.4.49 | CSS processing |
| **Autoprefixer** | 10.4.20 | CSS vendor prefixing |
| **Concurrently** | 8.2.2 | Run multiple processes simultaneously |

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              React Application (Vite)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │   Contexts   │  │   Services   │  │  Components  │ │  │
│  │  │  (State Mgmt)│  │  (API Calls) │  │   (UI/Pages) │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST/WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth API   │  │  Database    │  │  Realtime    │      │
│  │  (OAuth/JWT) │  │ (PostgreSQL) │  │ (WebSocket)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Storage    │  │  Edge        │  │  Functions   │      │
│  │  (Files)     │  │  Functions   │  │  (Serverless)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│              Express API Server (Optional)                   │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Property API │  │ External     │                         │
│  │  Endpoints   │  │ Integrations │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App.tsx
├── ThemeProvider
│   └── AuthProvider
│       └── PropertyProvider
│           └── LeadProvider
│               └── MessagesProvider
│                   └── SavedPropertiesProvider
│                       └── ApplicationsProvider
│                           └── NotificationsProvider
│                               └── ToastProvider
│                                   └── Router
│                                       └── LocationProvider
│                                           └── PropertyFilterProvider
│                                               ├── NotificationContainer
│                                               └── Routes
│                                                   ├── Public Routes
│                                                   ├── Auth Routes
│                                                   ├── Manager Routes
│                                                   ├── Admin Routes
│                                                   └── User Routes
```

---

## 📁 Application Structure

```
estospaces-app/
├── public/                          # Static assets
├── src/
│   ├── assets/                     # Images, videos, fonts
│   │   ├── auth/                   # Auth page assets
│   │   └── ...
│   │
│   ├── components/                 # Reusable components
│   │   ├── Admin/                  # Manager/Admin components
│   │   │   ├── ManagerProtectedRoute.jsx
│   │   │   ├── AdminProtectedRoute.tsx
│   │   │   └── UserProtectedRoute.jsx
│   │   │
│   │   ├── Dashboard/              # User dashboard components
│   │   │   ├── Applications/        # Application-related components
│   │   │   ├── Header.jsx          # Dashboard header
│   │   │   ├── Sidebar.jsx          # Dashboard sidebar
│   │   │   └── ...
│   │   │
│   │   ├── auth/                   # Authentication components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── EmailLogin.jsx
│   │   │   └── AuthCallback.jsx
│   │   │
│   │   ├── chatbot/                # AI chatbot components
│   │   │   └── LakshmiChatbot.tsx
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── ui/                     # Reusable UI components
│   │       ├── Toast.jsx
│   │       ├── NotificationContainer.jsx
│   │       ├── NotificationDropdown.jsx
│   │       ├── SummaryCard.tsx
│   │       └── ...
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── AuthContext.tsx         # Authentication state
│   │   ├── ApplicationsContext.jsx # Applications data
│   │   ├── LeadContext.tsx         # Leads management
│   │   ├── MessagesContext.jsx    # Messaging state
│   │   ├── NotificationsContext.jsx # Notifications
│   │   ├── PropertyContext.tsx     # Property data
│   │   ├── SavedPropertiesContext.jsx # Saved properties
│   │   ├── ThemeContext.tsx         # Theme management
│   │   ├── ToastContext.jsx         # Toast notifications
│   │   └── ...
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useToast.js
│   │   ├── useLiveChat.js
│   │   ├── useAdminChat.js
│   │   └── ...
│   │
│   ├── layouts/                    # Layout wrappers
│   │   └── MainLayout.tsx          # Main layout for manager dashboard
│   │
│   ├── lib/                         # Library configurations
│   │   └── supabase.js              # Supabase client setup
│   │
│   ├── pages/                       # Page components
│   │   ├── Home.jsx                  # Landing page
│   │   ├── Dashboard.tsx           # Manager dashboard
│   │   ├── DashboardLocationBased.jsx # User dashboard
│   │   ├── DashboardDiscover.jsx   # Property discovery
│   │   ├── DashboardApplications.jsx # User applications
│   │   ├── Application.tsx          # Manager applications view
│   │   ├── Appointment.tsx          # Appointments management
│   │   ├── PropertyDetail.jsx      # Property detail page
│   │   ├── LeadsClients.tsx         # Leads management
│   │   ├── Messages.tsx             # Messaging interface
│   │   ├── Analytics.tsx            # Analytics dashboard
│   │   └── ...
│   │
│   ├── services/                    # API and business logic services
│   │   ├── authService.ts           # Authentication logic
│   │   ├── propertiesService.js     # Property operations
│   │   ├── applicationsService.js   # Application operations
│   │   ├── notificationsService.ts  # Notification system
│   │   ├── analyticsService.js     # Analytics calculations
│   │   ├── postcodeService.js       # UK postcode validation
│   │   ├── addressService.ts        # Address lookup
│   │   └── ...
│   │
│   ├── utils/                       # Utility functions
│   │   ├── authHelpers.js           # Auth helper functions
│   │   ├── exportUtils.ts           # PDF/Excel export
│   │   └── ...
│   │
│   ├── App.tsx                      # Main app component with routing
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global styles
│
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies and scripts
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # Project documentation
```

---

## 🔄 Data Flow

### Authentication Flow

```
1. User visits /auth/login
2. User selects OAuth provider (Google) or Email/Password
3. AuthService handles authentication via Supabase Auth
4. Supabase returns JWT token and user session
5. AuthContext stores session and fetches user profile
6. User redirected based on role:
   - Manager → /manager/dashboard
   - User → /user/dashboard
   - Admin → /admin/verifications
```

### Property Application Flow

```
1. User browses properties on DashboardDiscover
2. User clicks "Apply" on a property
3. NewApplicationModal opens with multi-step form
4. User fills personal info, financial info, documents
5. ApplicationsContext.createApplication() called
6. Application saved to applied_properties table
7. notifyManagersApplicationSubmitted() sends notifications
8. Managers see new application in Application.tsx
9. Manager updates status (pending → approved/rejected)
10. User receives notification via NotificationsContext
11. Toast notification displayed via ToastContext
```

### Real-time Notification Flow

```
1. Database event occurs (new application, status change, etc.)
2. Supabase Realtime triggers postgres_changes event
3. NotificationsContext subscription receives event
4. Notification created in notifications table
5. NotificationDropdown component fetches new notifications
6. Badge count updated in header
7. Toast notification displayed via ToastContext
8. User clicks notification → navigates to relevant page
```

---

## 🔐 Authentication & Authorization

### Authentication Methods

1. **OAuth (Google)**
   - Implemented via Supabase Auth
   - PKCE flow for security
   - Automatic profile creation

2. **Email/Password**
   - Email verification required
   - Password reset functionality
   - Session persistence

### Role-Based Access Control (RBAC)

| Role | Access Level | Routes |
|------|-------------|--------|
| **User** | Basic tenant features | `/user/dashboard/*` |
| **Manager** | Property management | `/manager/dashboard/*` |
| **Admin** | Platform administration | `/admin/*` |

### Protected Routes

- **ManagerProtectedRoute**: Verifies `role === 'manager' || role === 'admin'`
- **UserProtectedRoute**: Verifies `role === 'user'`
- **AdminProtectedRoute**: Verifies `role === 'admin'`

### Session Management

- Sessions stored in localStorage (Supabase default)
- Auto-refresh enabled
- Session timeout handling
- Secure token storage

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
- User profile information
- Links to `auth.users` via `id`
- Contains: `full_name`, `email`, `phone`, `role`, `avatar_url`, etc.

#### `properties`
- Property listings
- Contains: `title`, `description`, `price`, `address`, `coordinates`, `images`, etc.
- Foreign keys: `agent_id` → `profiles.id`

#### `applied_properties`
- Property applications
- Contains: `user_id`, `property_id`, `status`, `application_data` (JSONB)
- Status values: `pending`, `submitted`, `approved`, `rejected`, etc.

#### `viewings`
- Property viewing appointments
- Contains: `user_id`, `property_id`, `appointment_date`, `status`
- Links to `applied_properties` when applicable

#### `notifications`
- In-app notifications
- Contains: `user_id`, `type`, `title`, `message`, `data` (JSONB), `read`
- Types: `VIEWING_BOOKED`, `APPLICATION_SUBMITTED`, `SYSTEM`, etc.

#### `saved_properties`
- User's saved/favorited properties
- Contains: `user_id`, `property_id`, `created_at`

#### `messages`
- Chat messages between users and managers
- Contains: `sender_id`, `receiver_id`, `property_id`, `message`, `read`

#### `leads`
- Lead management (stored in localStorage, can be migrated to DB)
- Contains: `name`, `email`, `phone`, `propertyInterested`, `status`, `score`

### Relationships

```
auth.users (1) ──→ (1) profiles
profiles (1) ──→ (N) properties (agent_id)
profiles (1) ──→ (N) applied_properties (user_id)
properties (1) ──→ (N) applied_properties (property_id)
profiles (1) ──→ (N) notifications (user_id)
profiles (1) ──→ (N) viewings (user_id)
properties (1) ──→ (N) viewings (property_id)
```

---

## 🔌 API Services

### Supabase Services

All database operations go through Supabase client:

```typescript
// Example: Fetching applications
const { data, error } = await supabase
  .from('applied_properties')
  .select(`
    *,
    properties (*),
    profiles:user_id (*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Service Layer Architecture

```
services/
├── authService.ts           # Authentication & authorization
├── propertiesService.js     # Property CRUD operations
├── applicationsService.js   # Application management
├── notificationsService.ts # Notification creation & delivery
├── analyticsService.js     # Analytics & statistics
├── postcodeService.js      # UK postcode validation
├── addressService.ts        # Address geocoding
├── leadsService.js         # Lead management
└── ...
```

### External API Integrations

- **Postcodes.io**: UK postcode validation
- **OpenStreetMap Nominatim**: Address geocoding
- **Zoopla API**: Property data (if configured)

---

## 📊 State Management

### Context API Pattern

The application uses React Context API for global state management:

1. **AuthContext**: User authentication, session, profile
2. **ApplicationsContext**: User's property applications
3. **PropertyContext**: Property listings and filters
4. **NotificationsContext**: In-app notifications
5. **ToastContext**: Toast notifications (success, error, warning, info)
6. **MessagesContext**: Chat messages
7. **SavedPropertiesContext**: Saved/favorited properties
8. **ThemeContext**: Dark/light theme
9. **LeadContext**: Lead management
10. **LocationContext**: User location and preferences

### State Flow Pattern

```
Component
  ↓ (calls)
Service/Context Method
  ↓ (executes)
Supabase API Call
  ↓ (updates)
Database
  ↓ (triggers)
Realtime Subscription
  ↓ (notifies)
Context Update
  ↓ (re-renders)
Component
```

### Local State

- Component-specific state uses `useState`
- Form state managed locally
- UI state (modals, dropdowns) managed locally

---

## 🧭 Routing & Navigation

### Route Structure

```
/                                    # Landing page
/auth/login                          # Login page
/auth/signup                         # Signup page
/auth/callback                       # OAuth callback

# Public Routes
/properties/search                    # Property search
/property/:id                        # Property detail

# Manager Routes (Protected)
/manager/dashboard                   # Manager dashboard
/manager/dashboard/properties         # Properties list
/manager/dashboard/properties/add     # Add property
/manager/dashboard/leads              # Leads management
/manager/dashboard/application        # Applications view
/manager/dashboard/appointment        # Appointments
/manager/dashboard/messages          # Messages
/manager/dashboard/analytics         # Analytics

# User Routes (Protected)
/user/dashboard                      # User dashboard
/user/dashboard/discover             # Property discovery
/user/dashboard/applications         # User applications
/user/dashboard/viewings             # Viewing appointments
/user/dashboard/messages             # Messages
/user/dashboard/saved                # Saved properties

# Admin Routes (Protected)
/admin/login                         # Admin login
/admin/verifications                 # Manager verifications
/admin/chat                          # Admin chat dashboard
/admin/analytics                     # User analytics
```

### Navigation Guards

- **Protected Routes**: Require authentication
- **Role-based Routes**: Require specific role
- **Redirect Logic**: Unauthenticated users → `/auth/login`

---

## 🎨 Styling & Theming

### Tailwind CSS Configuration

- **Primary Color**: `#FF6B35` (Orange)
- **Dark Mode**: Class-based (`dark:` prefix)
- **Typography**: Inter font for user dashboard, Arial for manager dashboard
- **Responsive**: Mobile-first approach

### Theme System

```typescript
// Light Theme (Default)
- Background: White (#FFFFFF)
- Text: Dark gray (#1F2937)
- Borders: Light gray (#E5E7EB)

// Dark Theme
- Background: Deep black (#000000)
- Text: Light gray (#F3F4F6)
- Borders: Dark gray (#374151)
```

### Component Styling Patterns

1. **Utility Classes**: Tailwind utility classes
2. **Component Classes**: Reusable component classes
3. **Conditional Styling**: Based on theme, state, props
4. **Responsive Design**: Mobile, tablet, desktop breakpoints

---

## ⚡ Real-time Features

### Supabase Realtime Subscriptions

The application uses Supabase Realtime for:

1. **Application Updates**: Real-time status changes
2. **New Notifications**: Instant notification delivery
3. **Message Updates**: Real-time chat
4. **Property Updates**: Live property status changes

### Implementation Pattern

```typescript
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'table_name',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        // Handle update
        updateLocalState(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [userId]);
```

---

## 🚀 Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────┐
│     Local Development (Vite)        │
│  - Hot Module Replacement (HMR)       │
│  - Fast refresh                      │
│  - Source maps                        │
└─────────────────────────────────────┘
              │
              │ Proxy to
              ↓
┌─────────────────────────────────────┐
│   Express API Server (Port 3002)    │
│  - Property API endpoints            │
│  - Health checks                      │
└─────────────────────────────────────┘
              │
              │ API calls
              ↓
┌─────────────────────────────────────┐
│      Supabase (Cloud)                │
│  - Database                          │
│  - Auth                              │
│  - Storage                           │
│  - Realtime                          │
└─────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────┐
│   Static Hosting (Vercel/Netlify)  │
│  - Built React app (dist/)          │
│  - CDN distribution                 │
│  - SSL/TLS                           │
└─────────────────────────────────────┘
              │
              │ HTTPS
              ↓
┌─────────────────────────────────────┐
│      Supabase (Production)           │
│  - Production database               │
│  - Production auth                   │
│  - Production storage                │
│  - Production realtime              │
└─────────────────────────────────────┘
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3002 (dev)
```

---

## 📝 Key Design Patterns

### 1. **Provider Pattern**
- Context providers wrap the application
- Provides global state access
- Prevents prop drilling

### 2. **Service Layer Pattern**
- Business logic separated from components
- Reusable service functions
- Centralized API calls

### 3. **Protected Route Pattern**
- Higher-order components for route protection
- Role-based access control
- Automatic redirects

### 4. **Real-time Subscription Pattern**
- Subscribe on mount
- Unsubscribe on unmount
- Debounce rapid updates

### 5. **Error Boundary Pattern**
- Graceful error handling
- User-friendly error messages
- Fallback UI

---

## 🔒 Security Considerations

1. **Authentication**: JWT tokens via Supabase Auth
2. **Authorization**: Row Level Security (RLS) in Supabase
3. **API Keys**: Stored in environment variables
4. **CORS**: Configured for allowed origins
5. **Input Validation**: Client and server-side validation
6. **XSS Protection**: React's built-in XSS protection
7. **CSRF Protection**: Supabase handles CSRF tokens

---

## 📈 Performance Optimizations

1. **Code Splitting**: Route-based code splitting
2. **Lazy Loading**: Components loaded on demand
3. **Memoization**: `useMemo` and `useCallback` for expensive operations
4. **Image Optimization**: Lazy loading and responsive images
5. **Database Indexing**: Indexed columns for faster queries
6. **Caching**: Supabase query caching
7. **Debouncing**: Search and filter debouncing

---

## 🧪 Testing Strategy (Future)

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Component integration testing
- **E2E Tests**: Playwright or Cypress
- **API Tests**: Supabase function testing

---

## 📚 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **Tailwind CSS Documentation**: https://tailwindcss.com
- **React Router Documentation**: https://reactrouter.com

---

## 🔄 Version History

- **v1.0.0**: Initial architecture documentation
- Last Updated: January 2025

---

**Document Maintained By**: Development Team  
**Last Review**: January 2025
