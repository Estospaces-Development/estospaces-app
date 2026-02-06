# EstoSpaces - Complete Migration Plan

**Last Updated**: February 6, 2026
**Timeline**: 8 weeks (2 months)
**Current Status**: Week 1 - Foundation Setup

---

## Current Status Summary

### ✅ Completed
- [x] Architecture documentation (14-repo strategy, tech stack guide, 8-week plan)
- [x] Repository creation (8 MVP repos on GitHub)
- [x] **estospaces-web**: Next.js 15 setup, routing structure, auth middleware, login page, UI components
- [x] **estospaces-core-service**: Complete authentication system (register, login, JWT, middleware)
- [x] Docker setup for web and core service
- [x] Local testing documentation for both

### 🚧 In Progress
- [ ] **estospaces-booking-service**: Basic structure exists, needs full implementation
- [ ] Backend service Docker setup (booking, payment, platform)
- [ ] Frontend component migration from demo branch

### ⏳ Not Started
- [ ] **estospaces-payment-service**: Full implementation
- [ ] **estospaces-platform-service**: Full implementation
- [ ] **estospaces-mobile**: React Native setup
- [ ] **estospaces-shared**: TypeScript monorepo
- [ ] **estospaces-infrastructure**: Terraform + K8s configs

---

## Repository-by-Repository Plan

### 1. estospaces-web (Next.js Frontend)

#### Phase 1: Foundation ✅ DONE
- [x] Next.js 15 + TypeScript + Tailwind setup
- [x] Route groups: `(auth)`, `(admin)`, `(manager)`, `(user)`
- [x] Middleware for auth & role-based routing
- [x] Zustand stores (auth)
- [x] API clients (axios instances for 4 services)
- [x] Utility functions (currency, date, cn)
- [x] Basic UI components (Button, Card, Input)

#### Phase 2: Shared Components (Week 1-2)
```
Priority Order:
1. UI Primitives
   - Modal, Dropdown, Tooltip, Badge, Avatar
   - Table (with sorting, pagination)
   - Form components (Select, Checkbox, Radio, Switch)
   - Loading states (Spinner, Skeleton)

2. Layout Components
   - Sidebar (Admin, Manager, User variants)
   - Header/Navbar (with user menu)
   - Footer
   - Breadcrumbs

3. Domain Components
   - PropertyCard (for listings)
   - BookingCard (for bookings list)
   - UserCard (for admin/manager dashboards)
   - StatCard (for analytics)
```

#### Phase 3: Dashboard Pages (Week 2-4)
```
User Dashboard (Priority: HIGH)
├── /dashboard (home)
├── /search (property search with filters)
├── /properties (listings)
├── /bookings (user bookings list)
├── /favorites (saved properties)
├── /profile (user settings)
└── /messages (chat)

Manager Dashboard (Priority: HIGH)
├── /manager/dashboard (analytics overview)
├── /manager/properties (CRUD properties)
├── /manager/bookings (booking management)
├── /manager/leads (lead tracking)
├── /manager/clients (client management)
└── /manager/analytics (detailed reports)

Admin Dashboard (Priority: MEDIUM)
├── /admin/verifications (approve users/properties)
├── /admin/properties (all properties management)
├── /admin/users (user management)
├── /admin/analytics (platform metrics)
└── /admin/chat (support)
```

#### Phase 4: Integration & Polish (Week 5-6)
- Connect to real backend APIs
- Error handling & loading states
- Form validation with Zod
- Image optimization
- SEO (metadata, Open Graph)
- Responsive design refinement

#### Testing Locally:
```bash
cd estospaces-web

# Option 1: Docker (fastest)
docker-compose up -d
# Access: http://localhost:3000

# Option 2: Local dev (recommended for development)
npm install
npm run dev
# Access: http://localhost:3000

# Prerequisites:
# - Backend services must be running (see backend section)
# - Update .env.local with correct API URLs
```

---

### 2. estospaces-core-service (Go - Auth, Users, Properties)

#### Phase 1: Authentication ✅ DONE
- [x] User model (GORM)
- [x] Register endpoint
- [x] Login endpoint (JWT)
- [x] Me endpoint (get current user)
- [x] Logout endpoint
- [x] Auth middleware
- [x] Password hashing (bcrypt)

#### Phase 2: Users Management (Week 1-2)
```go
Endpoints:
- GET    /api/v1/users           (admin only)
- GET    /api/v1/users/:id       (admin + self)
- PUT    /api/v1/users/:id       (admin + self)
- DELETE /api/v1/users/:id       (admin only)
- POST   /api/v1/users/:id/verify (admin only)
- GET    /api/v1/users/:id/properties (public)

Features:
- User profile management
- Role updates (admin only)
- User verification workflow
- User search & filtering
```

#### Phase 3: Properties Management (Week 2-3)
```go
Endpoints:
- POST   /api/v1/properties          (manager + admin)
- GET    /api/v1/properties          (public, with filters)
- GET    /api/v1/properties/:id      (public)
- PUT    /api/v1/properties/:id      (owner + admin)
- DELETE /api/v1/properties/:id      (owner + admin)
- POST   /api/v1/properties/:id/verify (admin only)

Models:
type Property struct {
    ID          string
    ManagerID   string
    Title       string
    Description string
    Address     Address (embedded)
    Price       Money (embedded)
    Bedrooms    int
    Bathrooms   int
    Amenities   []string (JSON)
    Images      []string (JSON - GCS URLs)
    Status      string (draft, published, verified, archived)
    IsVerified  bool
}

Features:
- CRUD operations
- Property search (location, price, beds, amenities)
- Image upload to GCS
- Property verification workflow
- Manager-property association
```

#### Phase 4: Reviews (Week 3-4)
```go
Endpoints:
- POST   /api/v1/properties/:id/reviews
- GET    /api/v1/properties/:id/reviews
- PUT    /api/v1/reviews/:id
- DELETE /api/v1/reviews/:id

Features:
- 5-star rating system
- Review moderation (admin)
- Average rating calculation
```

#### Testing Locally:
```bash
cd estospaces-core-service

# Option 1: Docker (recommended)
docker-compose up -d
# Access: http://localhost:8080
# PostgreSQL: localhost:5432

# Option 2: Local Go
go mod download
go run cmd/server/main.go

# Test endpoints:
curl http://localhost:8080/health
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

---

### 3. estospaces-booking-service (Go - Bookings, Applications)

#### Phase 1: Booking CRUD (Week 3-4)
```go
Models:
type Booking struct {
    ID            string
    PropertyID    string
    UserID        string
    CheckInDate   time.Time
    CheckOutDate  time.Time
    TotalAmount   Money
    Status        string (pending, confirmed, cancelled, completed)
    GuestCount    int
    SpecialRequests string
}

Endpoints:
- POST   /api/v1/bookings              (authenticated)
- GET    /api/v1/bookings              (own bookings)
- GET    /api/v1/bookings/:id          (owner + manager + admin)
- PUT    /api/v1/bookings/:id          (owner before check-in)
- DELETE /api/v1/bookings/:id/cancel   (owner + manager)
- GET    /api/v1/properties/:id/bookings (manager + admin)

Features:
- Date validation (no overlaps)
- Pricing calculation
- Booking confirmation workflow
- Cancellation policies
```

#### Phase 2: Rental Applications (Week 4)
```go
Models:
type Application struct {
    ID                string
    PropertyID        string
    UserID            string
    MoveInDate        time.Time
    EmploymentStatus  string
    Income            Money
    References        []Reference (JSON)
    Documents         []string (GCS URLs)
    Status            string (submitted, under_review, approved, rejected)
}

Endpoints:
- POST   /api/v1/applications
- GET    /api/v1/applications
- GET    /api/v1/applications/:id
- PUT    /api/v1/applications/:id/approve (manager + admin)
- PUT    /api/v1/applications/:id/reject  (manager + admin)
```

#### Testing Locally:
```bash
cd estospaces-booking-service
docker-compose up -d
# Access: http://localhost:8081

# Prerequisites:
# - Core service must be running (for user validation)
# - Properties must exist in core service
```

---

### 4. estospaces-payment-service (Go - Payments, Invoices)

#### Phase 1: Payment Processing (Week 4-5)
```go
Models:
type Payment struct {
    ID              string
    BookingID       string
    UserID          string
    Amount          Money
    Currency        string
    PaymentMethod   string (card, bank_transfer, wallet)
    Status          string (pending, processing, completed, failed, refunded)
    StripePaymentID string
    ProcessedAt     time.Time
}

Endpoints:
- POST   /api/v1/payments                    (create payment intent)
- GET    /api/v1/payments/:id                (payment status)
- POST   /api/v1/payments/:id/confirm        (confirm payment)
- POST   /api/v1/payments/:id/refund         (manager + admin)
- GET    /api/v1/bookings/:id/payments       (payment history)

Integration:
- Stripe payment gateway
- Webhook handlers for payment events
- Automatic invoice generation
```

#### Phase 2: Invoicing (Week 5)
```go
Models:
type Invoice struct {
    ID          string
    PaymentID   string
    InvoiceNumber string (auto-generated)
    IssuedDate  time.Time
    DueDate     time.Time
    LineItems   []LineItem
    Subtotal    Money
    Tax         Money
    Total       Money
    Status      string (draft, issued, paid, overdue)
    PDFUrl      string (GCS)
}

Features:
- PDF generation
- Email delivery
- Payment reminders
```

#### Testing Locally:
```bash
cd estospaces-payment-service
docker-compose up -d
# Access: http://localhost:8082

# Prerequisites:
# - Stripe test API keys in .env
# - Booking service running
# - Use Stripe test cards: 4242 4242 4242 4242
```

---

### 5. estospaces-platform-service (Go - Notifications, Chat, Analytics)

#### Phase 1: Notifications (Week 5)
```go
Models:
type Notification struct {
    ID        string
    UserID    string
    Title     string
    Message   string
    Type      string (booking, payment, message, system)
    IsRead    bool
    ActionURL string
}

Endpoints:
- GET    /api/v1/notifications           (user's notifications)
- PUT    /api/v1/notifications/:id/read
- POST   /api/v1/notifications/:id/dismiss
- DELETE /api/v1/notifications/:id

Delivery Channels:
- In-app (real-time via WebSocket)
- Email (SendGrid/AWS SES)
- Push notifications (Firebase Cloud Messaging)
```

#### Phase 2: Chat/Messaging (Week 6)
```go
Models:
type Conversation struct {
    ID            string
    ParticipantIDs []string
    PropertyID    string (optional)
    LastMessage   Message
}

type Message struct {
    ID             string
    ConversationID string
    SenderID       string
    Content        string
    Attachments    []string
    IsRead         bool
    SentAt         time.Time
}

Endpoints:
- GET    /api/v1/conversations
- POST   /api/v1/conversations
- GET    /api/v1/conversations/:id/messages
- POST   /api/v1/conversations/:id/messages
- WS     /api/v1/ws (WebSocket for real-time)
```

#### Phase 3: Analytics (Week 6)
```go
Endpoints:
- GET /api/v1/analytics/dashboard (admin + manager)
- GET /api/v1/analytics/bookings  (booking trends)
- GET /api/v1/analytics/revenue   (revenue metrics)
- GET /api/v1/analytics/properties (property performance)

Metrics:
- Total bookings, revenue, users
- Conversion rates
- Popular properties
- User engagement
```

#### Testing Locally:
```bash
cd estospaces-platform-service
docker-compose up -d
# Access: http://localhost:8083

# WebSocket testing:
wscat -c ws://localhost:8083/api/v1/ws?token=YOUR_JWT_TOKEN
```

---

### 6. estospaces-mobile (React Native)

#### Phase 1: Setup (Week 6-7)
```
Tech Stack:
- React Native 0.73+
- Expo (managed workflow)
- TypeScript
- React Navigation 6
- Zustand (state)
- TanStack Query (data fetching)
- NativeBase or Tamagui (UI)

Structure:
/src
  /screens
    /Auth (Login, Register)
    /User (Dashboard, Search, Bookings)
  /components
  /navigation
  /services (API clients)
  /stores (Zustand)
  /utils
```

#### Phase 2: Core Features (Week 7-8)
```
Priority Screens:
1. Auth (Login/Register)
2. Property Search (with map view)
3. Property Details
4. Booking Flow
5. User Bookings
6. Profile
7. Messages

Features:
- Push notifications
- Offline support
- Image caching
- Biometric auth
- Location services (for search)
```

#### Testing Locally:
```bash
cd estospaces-mobile

# Install dependencies
npm install

# Start Expo
npx expo start

# Run on simulators:
# iOS: Press 'i' (requires Xcode)
# Android: Press 'a' (requires Android Studio)

# Run on physical device:
# Scan QR code with Expo Go app
```

---

### 7. estospaces-shared (TypeScript Monorepo)

#### Structure (Week 2)
```
/packages
  /types          - Shared TypeScript types
  /utils          - Shared utility functions
  /constants      - Shared constants
  /validation     - Zod schemas
  /ui-components  - Shared React components

Setup:
- Turborepo or Nx for monorepo management
- Independent package versioning
- Consumed by web and mobile apps
```

#### Testing Locally:
```bash
cd estospaces-shared
npm install
npm run build

# Link to web app for testing:
cd packages/types
npm link
cd ../../../estospaces-web
npm link @estospaces/types
```

---

### 8. estospaces-infrastructure (Terraform + K8s)

#### Phase 1: GCP Infrastructure (Week 1)
```hcl
Resources:
- GKE cluster (autopilot mode)
- Cloud SQL (PostgreSQL 15)
- Cloud Storage buckets (images, documents)
- VPC networking
- Cloud Armor (WAF)
- Cloud Load Balancer
- Cloud CDN
- Secret Manager
```

#### Phase 2: Kubernetes Manifests (Week 2-3)
```yaml
Deployments:
- core-service (2 replicas)
- booking-service (2 replicas)
- payment-service (2 replicas)
- platform-service (2 replicas)
- web (3 replicas)

Services:
- LoadBalancer for Ingress
- ClusterIP for internal services

ConfigMaps & Secrets:
- Database credentials
- JWT secrets
- API keys (Stripe, SendGrid)
```

#### Phase 3: CI/CD (Week 3)
```yaml
GitHub Actions:
- Build Docker images
- Push to Artifact Registry
- Run tests
- Deploy to GKE (rolling update)
- Database migrations
```

#### Testing Locally:
```bash
# Terraform
cd estospaces-infrastructure/terraform
terraform init
terraform plan
# DO NOT APPLY YET (only after review)

# K8s (local testing with minikube)
minikube start
kubectl apply -f k8s/
kubectl get pods
kubectl port-forward svc/core-service 8080:8080
```

---

## Complete Local Testing Strategy

### Phase 1: Backend Services Only
```bash
# Terminal 1: Core Service
cd estospaces-core-service
docker-compose up

# Terminal 2: Booking Service
cd estospaces-booking-service
docker-compose up

# Terminal 3: Payment Service
cd estospaces-payment-service
docker-compose up

# Terminal 4: Platform Service
cd estospaces-platform-service
docker-compose up

# Test with curl:
curl http://localhost:8080/health  # Core
curl http://localhost:8081/health  # Booking
curl http://localhost:8082/health  # Payment
curl http://localhost:8083/health  # Platform
```

### Phase 2: Frontend + Backend
```bash
# Start all backend services (as above)

# Terminal 5: Web App
cd estospaces-web
npm run dev
# Access: http://localhost:3000

# Test flow:
1. Register: http://localhost:3000/register
2. Login: http://localhost:3000/login
3. Dashboard: http://localhost:3000/dashboard
```

### Phase 3: Full Stack with Mobile
```bash
# Backend services running
# Web app running

# Terminal 6: Mobile
cd estospaces-mobile
npx expo start

# Update mobile API URLs to point to your machine:
# API_URL: http://192.168.1.X:8080 (not localhost)
```

### Phase 4: Integration Testing
```bash
# Create test data script
cd estospaces-core-service/scripts

# seed_data.sh
#!/bin/bash
# Create admin user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@estospaces.com","password":"admin123","role":"admin"}'

# Create manager user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@estospaces.com","password":"manager123","role":"manager"}'

# Create properties (after getting manager token)
# ... etc

# Run seed:
chmod +x scripts/seed_data.sh
./scripts/seed_data.sh
```

---

## Docker Compose - All Services (Ultimate Setup)

### Create: `/esp/docker-compose.yml`
```yaml
version: '3.8'

networks:
  estospaces:
    driver: bridge

services:
  # Databases
  postgres-core:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: estospaces_core
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    networks:
      - estospaces
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s

  postgres-booking:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: estospaces_booking
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    networks:
      - estospaces
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s

  postgres-payment:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: estospaces_payment
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"
    networks:
      - estospaces

  postgres-platform:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: estospaces_platform
      POSTGRES_PASSWORD: postgres
    ports:
      - "5435:5432"
    networks:
      - estospaces

  # Backend Services
  core-service:
    build: ./estospaces-core-service
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres-core
      DB_PORT: 5432
      DB_NAME: estospaces_core
      DB_USER: postgres
      DB_PASSWORD: postgres
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
    depends_on:
      postgres-core:
        condition: service_healthy
    networks:
      - estospaces

  booking-service:
    build: ./estospaces-booking-service
    ports:
      - "8081:8081"
    environment:
      DB_HOST: postgres-booking
      DB_PORT: 5432
      CORE_SERVICE_URL: http://core-service:8080
    depends_on:
      - postgres-booking
      - core-service
    networks:
      - estospaces

  payment-service:
    build: ./estospaces-payment-service
    ports:
      - "8082:8082"
    environment:
      DB_HOST: postgres-payment
      BOOKING_SERVICE_URL: http://booking-service:8081
      STRIPE_SECRET_KEY: sk_test_your_key
    depends_on:
      - postgres-payment
      - booking-service
    networks:
      - estospaces

  platform-service:
    build: ./estospaces-platform-service
    ports:
      - "8083:8083"
    environment:
      DB_HOST: postgres-platform
      CORE_SERVICE_URL: http://core-service:8080
    depends_on:
      - postgres-platform
      - core-service
    networks:
      - estospaces

  # Frontend
  web:
    build: ./estospaces-web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_CORE_SERVICE_URL: http://localhost:8080
      NEXT_PUBLIC_BOOKING_SERVICE_URL: http://localhost:8081
      NEXT_PUBLIC_PAYMENT_SERVICE_URL: http://localhost:8082
      NEXT_PUBLIC_PLATFORM_SERVICE_URL: http://localhost:8083
    depends_on:
      - core-service
      - booking-service
      - payment-service
      - platform-service
    networks:
      - estospaces
```

### Usage:
```bash
# Start everything
cd /Users/puvendhan/Documents/repos/new/esp
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Clean restart
docker-compose down -v && docker-compose up -d --build
```

---

## Week-by-Week Execution Plan

### Week 1: Backend Foundation
- **Days 1-2**: Complete core-service (users, properties)
- **Days 3-4**: Complete booking-service
- **Days 5**: Complete payment-service basics
- **Day 6**: Complete platform-service basics
- **Day 7**: Integration testing

### Week 2: Frontend Core
- **Days 1-2**: Shared UI components library
- **Days 3-4**: User dashboard pages
- **Days 5-6**: Manager dashboard pages
- **Day 7**: Testing & bug fixes

### Week 3: Advanced Features
- **Days 1-2**: Admin dashboard
- **Days 3-4**: Property search & filters
- **Days 5-6**: Booking flow end-to-end
- **Day 7**: Integration testing

### Week 4: Payments & Reviews
- **Days 1-3**: Stripe integration
- **Days 4-5**: Reviews system
- **Days 6-7**: Testing & refinement

### Week 5: Real-time Features
- **Days 1-3**: Chat/messaging (WebSocket)
- **Days 4-5**: Notifications system
- **Days 6-7**: Email templates

### Week 6: Mobile App
- **Days 1-2**: React Native setup
- **Days 3-5**: Core screens
- **Days 6-7**: Testing on devices

### Week 7: Polish & Infrastructure
- **Days 1-2**: GCP infrastructure (Terraform)
- **Days 3-4**: K8s manifests
- **Days 5-6**: CI/CD pipeline
- **Day 7**: Staging deployment

### Week 8: Production Launch
- **Days 1-3**: Production deployment
- **Days 4-5**: Monitoring setup
- **Days 6-7**: Documentation & handoff

---

## Testing Checklist

### Backend Testing
- [ ] All health endpoints return 200
- [ ] Can register new users
- [ ] Can login and receive JWT
- [ ] Protected endpoints require auth
- [ ] Role-based access control works
- [ ] Database migrations run successfully
- [ ] CRUD operations for all entities
- [ ] Service-to-service communication works

### Frontend Testing
- [ ] Login/register flow works
- [ ] Token stored and sent with requests
- [ ] Protected routes redirect to login
- [ ] Role-based dashboard routing works
- [ ] Forms validate with Zod
- [ ] Loading states display
- [ ] Error messages display
- [ ] Responsive on mobile/tablet/desktop

### Integration Testing
- [ ] Can create booking end-to-end
- [ ] Payment processing works (test mode)
- [ ] Notifications sent on events
- [ ] Chat messages delivered real-time
- [ ] File uploads to GCS work
- [ ] Email delivery works

### Performance Testing
- [ ] API response times < 200ms
- [ ] Frontend Lighthouse score > 90
- [ ] Load test: 100 concurrent users
- [ ] Database queries optimized (no N+1)

---

## Priority Order (If Time Constrained)

### Must Have (Week 1-4)
1. Authentication (login, register)
2. User dashboard
3. Property listings & search
4. Basic booking flow
5. Manager property management

### Should Have (Week 5-6)
1. Payment processing
2. Admin dashboard
3. Reviews system
4. Basic notifications

### Nice to Have (Week 7-8)
1. Real-time chat
2. Mobile app
3. Advanced analytics
4. Email notifications

---

## Next Immediate Steps

### Today (Week 1, Day 1):
1. ✅ Core service authentication (DONE)
2. ✅ Web app foundation (DONE)
3. ✅ Docker setup (DONE)
4. ⏳ Complete booking-service implementation
5. ⏳ Payment & platform service skeletons
6. ⏳ Root docker-compose.yml for all services

### Tomorrow (Week 1, Day 2):
1. Core service: Add users management endpoints
2. Core service: Add properties CRUD
3. Booking service: Complete booking CRUD
4. Test integration between services
5. Web: Create more UI components
6. Web: Start user dashboard pages

### This Week Goals:
- All 4 backend services running and communicating
- Basic CRUD for users, properties, bookings
- Web app can register, login, view properties
- Everything testable locally with Docker

---

**Questions? Check:**
- Individual LOCAL_TESTING.md in each repo
- Architecture docs in `/docs/architecture/`
- This plan for high-level overview
