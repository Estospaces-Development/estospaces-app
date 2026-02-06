# EstoSpaces Current Code Analysis & Repository Migration Plan

## Document Overview

This document analyzes the **current monolithic codebase** in the `demo` branch and provides a detailed mapping to the proposed **8-repository MVP architecture**.

**Current State**: Single monolithic React application with 3 distinct user roles
**Target State**: 8 independent repositories with modern microservices architecture

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Three Dashboard Systems](#three-dashboard-systems)
3. [Current Tech Stack](#current-tech-stack)
4. [Feature Mapping](#feature-mapping)
5. [Repository Migration Plan](#repository-migration-plan)
6. [Code Split Strategy](#code-split-strategy)
7. [Migration Timeline](#migration-timeline)

---

## Current Architecture Analysis

### Monolithic Structure

```
estospaces-app/ (CURRENT - Monolithic)
├── src/
│   ├── components/
│   │   ├── Admin/              # Admin dashboard components
│   │   ├── Dashboard/          # User dashboard components
│   │   ├── manager/            # Manager dashboard components
│   │   ├── auth/               # Authentication components
│   │   ├── ui/                 # Shared UI components
│   │   └── ...
│   ├── pages/
│   │   ├── Admin*.jsx/tsx      # Admin pages
│   │   ├── Dashboard*.jsx/tsx  # User dashboard pages
│   │   ├── manager/            # Manager pages
│   │   └── ...
│   ├── services/               # Frontend API services
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Utility functions
├── server.js                   # Backend server (Express)
├── supabase/                   # Supabase configs
└── package.json
```

### Current Issues

❌ **Monolithic Deployment**: All features deploy together
❌ **No Clear Separation**: Admin, User, Manager code mixed
❌ **Scaling Limitations**: Cannot scale dashboards independently
❌ **Development Bottlenecks**: Teams block each other
❌ **Single Tech Stack**: No flexibility for specialized needs
❌ **Large Bundle Size**: Users download code for all dashboards
❌ **Complex Testing**: Hard to test individual features

---

## Three Dashboard Systems

### 1. **Admin Dashboard** (Platform Administration)

**Route Prefix**: `/admin/*`

**Purpose**: Platform administrators manage the entire system

**Key Features**:
- User verification management
- Property approval/rejection
- Support ticket management (chat)
- User analytics and reporting
- System monitoring
- Content moderation

**Components** (`src/components/Admin/`):
```
Admin/
├── AdminChatWindow.jsx
├── AdminProtectedRoute.tsx
├── ConversationList.jsx
├── CreateTicketModal.jsx
├── ManagerReviewModal.tsx
├── TicketDetailsModal.jsx
└── TicketsList.jsx
```

**Pages** (`src/pages/`):
```
pages/
├── AdminLogin.jsx
├── AdminVerificationDashboard.tsx
├── AdminChatDashboard.jsx
├── AdminPropertyManagement.jsx
└── UserAnalytics.jsx
```

**Routes** (from App.tsx):
```
/admin/login
/admin/verifications
/admin/chat
/admin/analytics
```

**Services**:
- `verificationService.js` - User/property verification
- `analyticsService.js` - Analytics data
- Mock data service for admin features

---

### 2. **Manager Dashboard** (Broker/Property Manager)

**Route Prefix**: `/manager/dashboard/*`

**Purpose**: Property managers, brokers, and landlords manage their properties and clients

**Key Features**:
- Property listing management (CRUD)
- Lead and client management
- Booking/viewing management
- Fast-track verification system
- Broker community features
- System monitoring dashboard
- Client communication
- Analytics and reporting
- Billing and payments

**Components** (`src/components/manager/`):
```
manager/
├── FastTrackCard.tsx
├── FastTrackCaseCard.tsx
├── FastTrackCaseDetail.tsx
├── FastTrackProgress.tsx
├── FastTrackActions.tsx
├── FastTrackDocuments.tsx
├── FastTrackTimeline.tsx
├── LiveActivityFeed.tsx
├── LocationInsights.tsx
├── LocationVerificationActions.tsx
├── MonitorMetricCard.tsx
├── SystemHealthBar.tsx
├── StreetViewPanel.tsx
├── StreetViewViewer.tsx
├── VirtualTourManagerPanel.tsx
└── BrokerResponse/
    ├── BrokerResponseWidget.tsx
    ├── BrokerRequestItem.tsx
    └── ClientProfileModal.tsx
```

**Pages** (`src/pages/` and `src/pages/manager/`):
```
pages/
├── Dashboard.tsx                    # Main manager dashboard
├── AddProperty.tsx                  # Add/Edit properties
├── PropertiesList.tsx              # Property list view
├── PropertyView.tsx                # Property details
├── LeadsClients.tsx                # Lead management
├── Application.tsx                 # Application management
├── Appointment.tsx                 # Viewing appointments
├── Messages.tsx                    # Messaging
├── Analytics.tsx                   # Analytics dashboard
├── Billing.tsx                     # Billing & payments
├── Profile.tsx                     # Manager profile
├── HelpSupport.tsx                 # Help & support
├── BrokerPropertyDetail.tsx        # Broker property details
├── AllBrokerRequests.tsx           # Broker requests
├── ClientHistory.tsx               # Client history
└── manager/
    ├── FastTrackDashboard.tsx      # Fast-track verification
    ├── MonitoringDashboard.tsx     # System monitoring
    └── BrokersCommunity.tsx        # Broker community
```

**Routes** (from App.tsx):
```
/manager/dashboard                          # Main dashboard
/manager/dashboard/fast-track              # Fast-track verification
/manager/dashboard/monitoring              # System monitoring
/manager/dashboard/brokers-community       # Broker community
/manager/dashboard/properties              # Property list
/manager/dashboard/properties/add          # Add property
/manager/dashboard/properties/edit/:id     # Edit property
/manager/dashboard/properties/:id          # View property
/manager/dashboard/leads                   # Leads & clients
/manager/dashboard/application             # Applications
/manager/dashboard/appointment             # Appointments
/manager/dashboard/messages                # Messages
/manager/dashboard/analytics               # Analytics
/manager/dashboard/notifications           # Notifications
/manager/dashboard/billing                 # Billing
/manager/dashboard/profile                 # Profile
/manager/dashboard/help                    # Help
/manager/dashboard/verification            # Verification section
/manager/dashboard/broker-property/:id     # Broker property detail
/manager/dashboard/broker-requests         # Broker requests
/manager/dashboard/client-history/:id      # Client history
```

**Services**:
- `propertiesService.js` - Property management
- `propertyDataService.js` - Property data
- `leadsService.js` - Lead management
- `managerVerificationService.ts` - Manager verification
- `brokerRequestService.js` - Broker requests
- `analyticsService.js` - Analytics
- `dashboardStatsService.js` - Dashboard statistics

---

### 3. **User Dashboard** (Property Seekers/Tenants)

**Route Prefix**: `/user/dashboard/*`

**Purpose**: End users (property seekers) search, apply, and manage their rentals

**Key Features**:
- Property search and discovery
- Location-based property search
- Saved properties/favorites
- Property applications
- Viewing scheduling
- Contract management
- Payment management
- Messaging with managers
- Profile management
- Notifications
- Overseas property search

**Components** (`src/components/Dashboard/`):
```
Dashboard/
├── DashboardLayout.jsx
├── Header.jsx
├── Sidebar.jsx
├── HorizontalNavigation.jsx
├── DashboardFooter.jsx
├── PropertyCard.jsx
├── PropertyCardSkeleton.jsx
├── MapView.jsx
├── NearbyPropertiesMap.jsx
├── NearbyAgenciesList.jsx
├── LakshmiAssistant.jsx              # AI Assistant
├── WelcomeModal.jsx
├── ProfileCompletionCard.jsx
├── NotificationDropdown.jsx
├── VerificationSection.tsx
├── ManagerVerificationSection.tsx
├── ApplicationTimelineWidget.jsx
├── BrokerRequestWidget.jsx
├── NearestBrokerWidget.jsx
├── ContractViewer.jsx
├── SignatureModal.jsx
├── ShareModal.jsx
├── PropertyContactInfo.jsx
├── PropertyDiscoverySection.jsx
├── PropertyFilterTabs.jsx
├── UserPropertiesList.jsx
├── ThemeSwitcher.jsx
├── VirtualTourModal.jsx
├── Applications/
│   └── (application components)
└── Messaging/
    └── (messaging components)
```

**Pages** (`src/pages/Dashboard*.jsx`):
```
pages/
├── DashboardLocationBased.jsx       # Location-based search
├── DashboardDiscover.jsx            # Discover properties
├── DashboardSaved.jsx               # Saved properties
├── DashboardApplications.jsx        # User applications
├── DashboardViewings.jsx            # Scheduled viewings
├── DashboardMessages.jsx            # Messages
├── DashboardContracts.jsx           # Contracts
├── DashboardPayments.jsx            # Payments
├── DashboardProfile.jsx             # User profile
├── DashboardSettings.jsx            # Settings
├── DashboardNotifications.tsx       # Notifications
├── DashboardReviews.jsx             # Reviews
├── DashboardHelp.jsx                # Help & support
├── DashboardOverseas.jsx            # Overseas properties
└── PropertyDetail.jsx               # Property detail page
```

**Routes** (from App.tsx):
```
/user/dashboard                  # Main dashboard (location-based)
/user/dashboard/discover         # Discover properties
/user/dashboard/saved           # Saved properties
/user/dashboard/property/:id    # Property details
/user/dashboard/applications    # Applications
/user/dashboard/viewings        # Viewings
/user/dashboard/messages        # Messages
/user/dashboard/contracts       # Contracts
/user/dashboard/payments        # Payments
/user/dashboard/profile         # Profile
/user/dashboard/settings        # Settings
/user/dashboard/notifications   # Notifications
/user/dashboard/reviews         # Reviews
/user/dashboard/help            # Help
/user/dashboard/overseas        # Overseas properties
```

**Services**:
- `propertiesApiService.js` - Property API
- `userPropertiesService.js` - User properties
- `applicationsService.js` - Application management
- `locationService.js` - Location services
- `postcodeService.js` - Postcode lookup
- `addressService.ts` - Address services

---

## Current Tech Stack

### Frontend
```
Framework:     React 19.2.0
Language:      TypeScript (tsx) + JavaScript (jsx) [Mixed]
Routing:       React Router DOM 7.9.6
State:         React Context API
Styling:       Tailwind CSS 3.4.15
UI Library:    Custom + Lucide React icons
Build Tool:    Vite 5.4.10
Maps:          Leaflet 1.9.4 + React Leaflet 4.2.1
Animation:     Framer Motion 12.24.7
Date:          date-fns 4.1.0
PDF:           jsPDF 3.0.4
Excel:         XLSX 0.18.5
Forms:         Native React (no form library)
```

### Backend
```
Server:        Express 4.22.1 (Node.js)
Database:      Supabase (PostgreSQL)
Auth:          Supabase Auth (@supabase/supabase-js 2.89.0)
Real-time:     Supabase Realtime
Storage:       Supabase Storage
```

### Issues with Current Stack
❌ **Mixed JS/TS**: Inconsistent type safety
❌ **No Form Library**: Manual form handling
❌ **Context API Only**: Not ideal for complex state
❌ **No Server State Management**: Manual caching
❌ **Single Backend Server**: Monolithic Express app
❌ **No Microservices**: All backend logic in one server

---

## Feature Mapping

### Shared Features (Across All Dashboards)

| Feature | Current Location | Used By |
|---------|-----------------|---------|
| **Authentication** | `components/auth/` | All |
| **User Management** | `services/authService.ts` | All |
| **Notifications** | `services/notificationsService.ts` | All |
| **Messaging** | `services/mockDataService.js` | Manager + User |
| **File Upload** | Inline code | Manager + Admin |
| **Theme Switching** | `contexts/ThemeContext.tsx` | All |

### Admin-Specific Features

| Feature | Current Location | Complexity |
|---------|-----------------|------------|
| **User Verification** | `services/verificationService.js` | High |
| **Property Approval** | `pages/AdminPropertyManagement.jsx` | Medium |
| **Support Chat** | `pages/AdminChatDashboard.jsx` | High |
| **Analytics Dashboard** | `pages/UserAnalytics.jsx` | Medium |

### Manager-Specific Features

| Feature | Current Location | Complexity |
|---------|-----------------|------------|
| **Property CRUD** | `pages/AddProperty.tsx`, `PropertiesList.tsx` | High |
| **Lead Management** | `pages/LeadsClients.tsx`, `services/leadsService.js` | Medium |
| **Fast-Track Verification** | `pages/manager/FastTrackDashboard.tsx` | High |
| **Broker Community** | `pages/manager/BrokersCommunity.tsx` | Medium |
| **Client Communication** | `components/manager/BrokerResponse/` | Medium |
| **Analytics** | `pages/Analytics.tsx` | High |
| **Billing** | `pages/Billing.tsx` | Medium |

### User-Specific Features

| Feature | Current Location | Complexity |
|---------|-----------------|------------|
| **Property Search** | `pages/DashboardDiscover.jsx` | High |
| **Location Search** | `pages/DashboardLocationBased.jsx` | High |
| **Property Applications** | `pages/DashboardApplications.jsx` | Medium |
| **Viewing Scheduling** | `pages/DashboardViewings.jsx` | Medium |
| **Contract Management** | `pages/DashboardContracts.jsx` | High |
| **Payment Management** | `pages/DashboardPayments.jsx` | High |
| **AI Assistant (Lakshmi)** | `components/Dashboard/LakshmiAssistant.jsx` | Very High |

---

## Repository Migration Plan

### Target: 8 Repositories

#### **1. estospaces-shared** (Monorepo)

**Purpose**: Shared code, types, and utilities

**Migrate From**:
```
src/utils/                  → packages/utils/
src/components/ui/          → packages/ui-components/
src/hooks/                  → packages/hooks/
src/contexts/ThemeContext   → packages/shared/
Types (to be extracted)     → packages/types/
```

**Tech Stack**: TypeScript, pnpm workspaces

**Structure**:
```
estospaces-shared/
├── packages/
│   ├── types/              # Shared TypeScript types
│   │   ├── user.ts
│   │   ├── property.ts
│   │   ├── booking.ts
│   │   └── api.ts
│   ├── ui-components/      # Shared React components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Form/
│   ├── utils/              # Shared utilities
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   ├── hooks/              # Shared React hooks
│   │   ├── useAuth.ts
│   │   ├── useAPI.ts
│   │   └── useForm.ts
│   ├── constants/          # Shared constants
│   │   └── index.ts
│   └── config/             # Shared configs
│       └── tailwind.config.js
└── package.json
```

---

#### **2. estospaces-infrastructure**

**Purpose**: Infrastructure as Code, CI/CD, Kubernetes configs

**Migrate From**:
```
.github/workflows/          → .github/workflows/
Deployment configs (new)    → terraform/, kubernetes/
```

**Tech Stack**: Terraform, Kubernetes, Helm, GitHub Actions

**Structure**:
```
estospaces-infrastructure/
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   └── modules/
│       ├── networking/
│       ├── database/
│       └── storage/
├── kubernetes/
│   ├── base/
│   │   ├── namespaces/
│   │   └── configmaps/
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── production/
├── .github/
│   └── workflows/
│       ├── deploy-web.yml
│       ├── deploy-services.yml
│       └── terraform.yml
└── scripts/
    ├── setup.sh
    └── deploy.sh
```

---

#### **3. estospaces-web**

**Purpose**: Main web application with all three dashboards

**Migrate From**:
```
ENTIRE src/ directory       → src/
public/                     → public/
All configs                 → configs
```

**Tech Stack**: Next.js 15, React 19, TypeScript

**Key Decision**: Keep all dashboards in one web app initially

**Why?**
- ✅ Faster migration (don't split immediately)
- ✅ Shared routing and layouts
- ✅ Single build process
- ✅ Can split later if needed

**Structure**:
```
estospaces-web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (admin)/                # Admin dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── verifications/
│   │   │   ├── chat/
│   │   │   └── analytics/
│   │   ├── (manager)/              # Manager dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── properties/
│   │   │   ├── leads/
│   │   │   ├── fast-track/
│   │   │   └── analytics/
│   │   ├── (user)/                 # User dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── discover/
│   │   │   ├── applications/
│   │   │   └── contracts/
│   │   ├── (public)/               # Public routes
│   │   │   ├── properties/
│   │   │   ├── about/
│   │   │   └── contact/
│   │   └── api/                    # API routes (if needed)
│   ├── components/
│   │   ├── admin/                  # Admin components
│   │   ├── manager/                # Manager components
│   │   ├── user/                   # User components
│   │   ├── shared/                 # Shared components
│   │   └── layouts/
│   ├── lib/
│   │   ├── api/                    # API clients
│   │   ├── hooks/
│   │   └── utils/
│   ├── stores/                     # Zustand stores
│   │   ├── authStore.ts
│   │   ├── propertyStore.ts
│   │   └── userStore.ts
│   └── styles/
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

**Alternative Approach** (Phase 2):
Split into 3 separate web apps if needed:
- `estospaces-admin-web`
- `estospaces-manager-web`
- `estospaces-user-web`

---

#### **4. estospaces-mobile**

**Purpose**: Cross-platform mobile app (React Native)

**New Repository**: No current mobile app exists

**Tech Stack**: React Native (Expo), TypeScript

**Features to Implement**:
- User dashboard features (priority)
- Manager dashboard features (secondary)
- Admin dashboard (web only initially)

**Structure**:
```
estospaces-mobile/
├── src/
│   ├── navigation/
│   │   ├── AuthNavigator.tsx
│   │   ├── UserNavigator.tsx
│   │   └── ManagerNavigator.tsx
│   ├── screens/
│   │   ├── Auth/
│   │   ├── User/
│   │   │   ├── Dashboard/
│   │   │   ├── Properties/
│   │   │   ├── Applications/
│   │   │   └── Profile/
│   │   └── Manager/
│   │       ├── Dashboard/
│   │       ├── Properties/
│   │       └── Leads/
│   ├── components/
│   ├── services/
│   │   └── api/
│   ├── hooks/
│   └── theme/
├── assets/
├── app.json
└── package.json
```

---

#### **5. estospaces-core-service** (Go)

**Purpose**: Authentication, Users, Properties (consolidated backend)

**Migrate From**:
```
server.js (Express)         → Go service
services/authService.ts     → internal/auth/
services/propertiesService  → internal/properties/
Supabase SQL migrations     → migrations/
```

**Tech Stack**: Go 1.23+, Fiber, PostgreSQL, Supabase

**Structure**:
```
estospaces-core-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── auth/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── middleware.go
│   ├── users/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   └── repository.go
│   ├── properties/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── search.go
│   └── shared/
│       ├── database/
│       ├── config/
│       └── errors/
├── api/
│   └── openapi.yaml
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_properties.sql
│   └── ...
├── tests/
└── go.mod
```

**API Endpoints**:
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
GET    /api/v1/properties
POST   /api/v1/properties
GET    /api/v1/properties/:id
PUT    /api/v1/properties/:id
DELETE /api/v1/properties/:id
GET    /api/v1/properties/search
```

---

#### **6. estospaces-booking-service** (Go)

**Purpose**: Booking, viewings, appointments

**Migrate From**:
```
services/applicationsService.js  → internal/bookings/
Appointment features            → internal/appointments/
Viewing scheduling              → internal/viewings/
```

**Tech Stack**: Go 1.23+, Fiber, PostgreSQL

**Structure**:
```
estospaces-booking-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── bookings/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   └── repository.go
│   ├── viewings/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   └── repository.go
│   ├── availability/
│   │   ├── service.go
│   │   └── repository.go
│   └── notifications/
│       └── service.go
├── migrations/
└── go.mod
```

**API Endpoints**:
```
POST   /api/v1/bookings
GET    /api/v1/bookings/:id
PUT    /api/v1/bookings/:id
DELETE /api/v1/bookings/:id
GET    /api/v1/bookings/user/:userId
POST   /api/v1/viewings
GET    /api/v1/viewings/:id
GET    /api/v1/availability/:propertyId
```

---

#### **7. estospaces-payment-service** (Go)

**Purpose**: Payment processing, billing, invoices

**Migrate From**:
```
pages/DashboardPayments.jsx     → Payment UI (stays in web)
pages/Billing.tsx               → Billing UI (stays in web)
Payment logic (new)             → Go service
```

**Tech Stack**: Go 1.23+, Fiber, PostgreSQL, Stripe SDK

**Structure**:
```
estospaces-payment-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── payments/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── stripe.go
│   ├── invoices/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   └── generator.go
│   ├── refunds/
│   │   ├── service.go
│   │   └── repository.go
│   └── webhooks/
│       └── stripe.go
├── migrations/
└── go.mod
```

**API Endpoints**:
```
POST   /api/v1/payments
GET    /api/v1/payments/:id
POST   /api/v1/payments/:id/refund
GET    /api/v1/payments/user/:userId
POST   /api/v1/invoices
GET    /api/v1/invoices/:id
POST   /api/v1/webhooks/stripe
```

---

#### **8. estospaces-platform-service** (Go)

**Purpose**: Notifications, media upload, basic search, messaging

**Migrate From**:
```
services/notificationsService.ts    → internal/notifications/
Image upload logic                  → internal/media/
Messaging features                  → internal/messaging/
Search features                     → internal/search/
```

**Tech Stack**: Go 1.23+, Fiber, PostgreSQL, Redis, S3, WebSockets

**Structure**:
```
estospaces-platform-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── notifications/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   ├── email.go          # SendGrid
│   │   ├── sms.go            # Twilio
│   │   └── push.go           # Firebase
│   ├── media/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   ├── upload.go
│   │   └── storage.go        # S3/MinIO
│   ├── search/
│   │   ├── handlers.go
│   │   └── service.go        # PostgreSQL full-text
│   ├── messaging/
│   │   ├── handlers.go
│   │   ├── service.go
│   │   ├── websocket.go
│   │   └── repository.go
│   └── shared/
├── migrations/
└── go.mod
```

**API Endpoints**:
```
POST   /api/v1/notifications
GET    /api/v1/notifications/user/:userId
POST   /api/v1/media/upload
GET    /api/v1/media/:id
GET    /api/v1/search?q=query
POST   /api/v1/messages
GET    /api/v1/messages/:conversationId
WS     /ws/messages
```

---

## Code Split Strategy

### Phase 1: Preparation (Week 1-2)

**Goal**: Analyze and document before splitting

1. ✅ **Analyze current codebase** (DONE - this document)
2. **Identify shared code**
   - Extract shared types to interfaces
   - Identify reusable components
   - Document API contracts
3. **Set up new repositories**
   - Create all 8 repositories
   - Set up CI/CD pipelines
   - Configure branch protection
4. **Plan migration sequence**
   - Determine order of migration
   - Set up feature flags for gradual rollout

### Phase 2: Shared Code Migration (Week 3-4)

**Goal**: Create shared monorepo first

1. **Create `estospaces-shared`**
   - Set up pnpm workspaces
   - Migrate UI components from `src/components/ui/`
   - Extract utilities from `src/utils/`
   - Extract hooks from `src/hooks/`
   - Create TypeScript types
   - Publish to npm (private registry or GitHub packages)

2. **Create `estospaces-infrastructure`**
   - Set up Terraform configs
   - Set up Kubernetes manifests
   - Configure CI/CD workflows
   - Set up monitoring stack

### Phase 3: Backend Migration (Week 5-8)

**Goal**: Migrate Express server to Go microservices

**Priority Order**:

**Week 5-6: Core Service**
1. Create `estospaces-core-service`
2. Implement authentication endpoints
3. Implement user management
4. Implement properties CRUD
5. Migrate database schema
6. Run in parallel with old server (feature flag)

**Week 7: Booking Service**
2. Create `estospaces-booking-service`
3. Implement booking endpoints
4. Implement viewing/appointment logic
5. Test integration with core service

**Week 7-8: Payment & Platform Services**
3. Create `estospaces-payment-service`
   - Integrate Stripe
   - Implement payment endpoints
4. Create `estospaces-platform-service`
   - Implement notification service
   - Implement media upload
   - Implement messaging WebSocket
   - Implement basic search

### Phase 4: Frontend Migration (Week 9-12)

**Goal**: Migrate React app to Next.js

**Week 9-10: Setup & Routing**
1. Create `estospaces-web` with Next.js
2. Set up App Router structure
3. Migrate layouts and navigation
4. Set up Zustand stores
5. Set up React Query for API calls

**Week 10-11: Dashboard Migration**
1. Migrate Admin dashboard pages
2. Migrate Manager dashboard pages
3. Migrate User dashboard pages
4. Update API calls to use new backend services

**Week 12: Testing & Refinement**
1. Update all components
2. Fix routing issues
3. Test all features
4. Performance optimization

### Phase 5: Mobile App (Week 13-16)

**Goal**: Build React Native app

**Week 13-14: Setup & Core Features**
1. Create `estospaces-mobile` with Expo
2. Implement navigation
3. Implement authentication screens
4. Implement user dashboard screens

**Week 15-16: Advanced Features**
1. Implement manager dashboard screens
2. Implement property search
3. Implement booking flow
4. Test on iOS and Android

### Phase 6: Testing & Launch (Week 17-18)

**Goal**: Comprehensive testing and go-live

1. **Integration Testing**
   - Test all services together
   - Test web and mobile apps
   - Load testing

2. **Security Testing**
   - Penetration testing
   - Security audit
   - Fix vulnerabilities

3. **Deployment**
   - Deploy to staging
   - User acceptance testing
   - Deploy to production
   - Gradual rollout with feature flags

---

## Migration Timeline

### 18-Week Migration Plan

```
Week 1-2:   Preparation & Analysis
Week 3-4:   Shared Code & Infrastructure
Week 5-6:   Core Backend Service
Week 7-8:   Booking, Payment, Platform Services
Week 9-12:  Frontend Migration (Next.js)
Week 13-16: Mobile App Development
Week 17-18: Testing & Launch
```

### Parallel Development Strategy

- ✅ **Weeks 5-8**: Backend team works on services
- ✅ **Weeks 9-12**: Frontend team works on Next.js (uses new backend)
- ✅ **Weeks 13-16**: Mobile team works on React Native (uses new backend)
- ✅ **Week 17-18**: All teams collaborate on testing

### Team Allocation

```
Backend Team (2 devs):  Weeks 5-8  (Go microservices)
Frontend Team (2 devs): Weeks 9-12 (Next.js migration)
Mobile Team (1 dev):    Weeks 13-16 (React Native app)
DevOps (1 dev):         Weeks 3-18 (Infrastructure, CI/CD)
```

---

## Repository Naming Conventions

### Repository Naming Rules

1. **Prefix**: All repos start with `estospaces-`
2. **Lowercase**: Use lowercase with hyphens
3. **Descriptive**: Clear purpose from name
4. **No Abbreviations**: Full words (e.g., `service` not `svc`)

### Repository Names

| Repository | Name | Purpose |
|------------|------|---------|
| 1 | `estospaces-shared` | Shared code monorepo |
| 2 | `estospaces-infrastructure` | IaC and DevOps |
| 3 | `estospaces-web` | Next.js web application |
| 4 | `estospaces-mobile` | React Native mobile app |
| 5 | `estospaces-core-service` | Auth + Users + Properties (Go) |
| 6 | `estospaces-booking-service` | Bookings + Viewings (Go) |
| 7 | `estospaces-payment-service` | Payments + Billing (Go) |
| 8 | `estospaces-platform-service` | Notifications + Media + Search + Messaging (Go) |

### GitHub Organization

```
Organization: Estospaces-Development (or similar)

├── estospaces-shared
├── estospaces-infrastructure
├── estospaces-web
├── estospaces-mobile
├── estospaces-core-service
├── estospaces-booking-service
├── estospaces-payment-service
└── estospaces-platform-service
```

---

## Code Migration Checklist

### Shared Code (`estospaces-shared`)
- [ ] Extract UI components from `src/components/ui/`
- [ ] Extract utilities from `src/utils/`
- [ ] Extract hooks from `src/hooks/`
- [ ] Create TypeScript types for all entities
- [ ] Create API client SDK
- [ ] Publish to private npm registry

### Infrastructure (`estospaces-infrastructure`)
- [ ] Set up Terraform for cloud resources
- [ ] Create Kubernetes manifests
- [ ] Set up CI/CD pipelines
- [ ] Configure monitoring (Prometheus + Grafana)
- [ ] Set up logging (ELK Stack or Loki)

### Web App (`estospaces-web`)
- [ ] Set up Next.js project
- [ ] Migrate authentication pages
- [ ] Migrate admin dashboard (10+ pages)
- [ ] Migrate manager dashboard (20+ pages)
- [ ] Migrate user dashboard (15+ pages)
- [ ] Migrate public pages
- [ ] Update all API calls
- [ ] Set up Zustand stores
- [ ] Set up React Query
- [ ] Migrate all components

### Mobile App (`estospaces-mobile`)
- [ ] Set up React Native with Expo
- [ ] Implement navigation
- [ ] Implement authentication
- [ ] Implement user dashboard features
- [ ] Implement manager dashboard features
- [ ] Set up push notifications
- [ ] Test on iOS and Android

### Backend Services

#### Core Service
- [ ] Implement authentication (JWT)
- [ ] Implement user management
- [ ] Implement properties CRUD
- [ ] Implement basic search
- [ ] Set up PostgreSQL database
- [ ] Write database migrations
- [ ] Add unit tests
- [ ] Add integration tests

#### Booking Service
- [ ] Implement booking CRUD
- [ ] Implement viewing scheduling
- [ ] Implement availability checking
- [ ] Implement notifications
- [ ] Add tests

#### Payment Service
- [ ] Integrate Stripe
- [ ] Implement payment processing
- [ ] Implement invoice generation
- [ ] Implement refunds
- [ ] Handle webhooks
- [ ] Add tests

#### Platform Service
- [ ] Implement email notifications (SendGrid)
- [ ] Implement SMS notifications (Twilio)
- [ ] Implement push notifications (Firebase)
- [ ] Implement media upload (S3)
- [ ] Implement WebSocket messaging
- [ ] Implement search
- [ ] Add tests

---

## Risk Analysis

### High-Risk Items

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Data Migration Issues** | High | Medium | Thorough testing, database backups, rollback plan |
| **Breaking Changes in APIs** | High | Medium | API versioning, parallel running of old/new APIs |
| **Performance Degradation** | Medium | Medium | Load testing before migration, monitoring |
| **User Disruption** | High | Low | Gradual rollout, feature flags, communication |
| **Timeline Overrun** | Medium | High | Buffer time, prioritize MVP features |

### Mitigation Strategies

1. **Parallel Running**
   - Run old and new systems in parallel
   - Gradually migrate traffic
   - Use feature flags for A/B testing

2. **Comprehensive Testing**
   - Unit tests for all services
   - Integration tests between services
   - E2E tests for critical flows
   - Load testing before production

3. **Rollback Plan**
   - Document rollback procedures
   - Keep old system running for 2 weeks
   - Database backups before migration

4. **Communication**
   - Regular updates to stakeholders
   - User communication about changes
   - Support team training

---

## Success Metrics

### Technical Metrics

- ✅ **Code Coverage**: 80%+ unit test coverage
- ✅ **API Response Time**: <100ms (p95)
- ✅ **Uptime**: 99.9% availability
- ✅ **Build Time**: <5 minutes
- ✅ **Deployment Time**: <10 minutes per service

### Business Metrics

- ✅ **Zero Downtime**: No service interruption during migration
- ✅ **User Satisfaction**: >4.5 stars in app stores
- ✅ **Bug Rate**: <5 critical bugs per month
- ✅ **Performance**: 50% faster page loads (Next.js vs React)

---

## Conclusion

This migration from a monolithic structure to 8 repositories will provide:

✅ **Better Separation of Concerns**: Clear boundaries between admin, manager, and user features
✅ **Independent Scaling**: Scale services based on load
✅ **Faster Development**: Teams can work independently
✅ **Better Deployment**: Deploy services without affecting others
✅ **Technology Flexibility**: Use best language for each service
✅ **Improved Testing**: Test services in isolation
✅ **Reduced Bundle Size**: Users only download what they need
✅ **Future-Proof**: Ready to scale to 14 repositories when needed

The 18-week migration plan is aggressive but achievable with proper planning and a dedicated team.

---

**Document Version**: 1.0
**Created**: February 6, 2026
**Last Analyzed Branch**: `demo`
**Status**: Ready for Review

---

## Next Steps

1. ✅ Review this analysis document
2. ✅ Get stakeholder approval
3. ✅ Allocate team resources
4. ✅ Set up 8 repositories
5. ✅ Start Week 1: Preparation phase
6. ✅ Begin migration following the timeline

---

**End of Document**
