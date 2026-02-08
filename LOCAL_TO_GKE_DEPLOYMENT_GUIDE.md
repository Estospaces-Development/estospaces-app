# Complete Guide: Local Development to GKE Deployment

**Last Updated**: February 8, 2026
**Stack**: Next.js + Go Microservices + PostgreSQL + Docker + GKE

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [How Frontend Connects to Backend](#how-frontend-connects-to-backend)
3. [Local Development with Docker Compose](#local-development-with-docker-compose)
4. [Testing Locally](#testing-locally)
5. [Deploying to GKE](#deploying-to-gke)
6. [Environment Configuration](#environment-configuration)

---

## Architecture Overview

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
│  User navigates to: http://localhost:3000/dashboard                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Request
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS FRONTEND                                 │
│                         (Port 3000)                                      │
│                                                                          │
│  1. Page Component loads                                                │
│  2. Calls API function: getProperties()                                 │
│                                                                          │
│  // src/lib/api/properties.ts                                           │
│  const response = await coreApi.get('/api/v1/properties')               │
│                                                                          │
│  coreApi = axios instance pointing to:                                  │
│  - Local: http://localhost:8080                                         │
│  - Production: https://api.estospaces.com                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST/GET
                                    │ Headers: Authorization: Bearer <JWT>
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      GO BACKEND SERVICE                                  │
│                    (Core Service - Port 8080)                           │
│                                                                          │
│  1. Fiber web server receives request                                   │
│  2. Auth middleware validates JWT token                                 │
│  3. Handler extracts query params                                       │
│  4. Service layer builds database query                                 │
│                                                                          │
│  // internal/properties/handler.go                                      │
│  func (h *Handler) GetProperties(c *fiber.Ctx) error {                 │
│      filters := parseFilters(c)                                         │
│      properties, err := h.service.GetProperties(filters)                │
│      return c.JSON(properties)                                          │
│  }                                                                       │
│                                                                          │
│  // internal/properties/service.go                                      │
│  func (s *Service) GetProperties(filters) ([]Property, error) {        │
│      query := s.db.Where("status = ?", "online")                       │
│      query.Find(&properties)                                            │
│      return properties, nil                                             │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL Query via GORM
                                    │ Connection Pool (10-100 connections)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL DATABASE                              │
│                         (Port 5432)                                      │
│                                                                          │
│  Database: estospaces_core                                              │
│  Query: SELECT * FROM properties WHERE status = 'online'                │
│                                                                          │
│  1. PostgreSQL executes query                                           │
│  2. Uses indexes for fast lookup                                        │
│  3. Returns result set                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Result rows
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      GO BACKEND SERVICE                                  │
│  GORM maps rows to Go structs                                           │
│  Serializes to JSON                                                     │
│  Returns HTTP 200 response                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ JSON Response
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS FRONTEND                                 │
│  Axios receives response                                                │
│  React state updates                                                    │
│  UI re-renders with data                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTML/CSS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
│  User sees property list                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Points:

1. **Frontend NEVER connects directly to PostgreSQL** (security risk!)
2. **All database access goes through Go backend** (business logic layer)
3. **Frontend only makes HTTP/REST API calls** (standard web architecture)
4. **Backend validates authentication before database queries**

---

## How Frontend Connects to Backend

### 1. Frontend Configuration

**Environment Variables** (.env.local):
```bash
# Next.js frontend environment
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_CORE_SERVICE_URL=http://localhost:8080
NEXT_PUBLIC_BOOKING_SERVICE_URL=http://localhost:8081
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:8082
NEXT_PUBLIC_PLATFORM_SERVICE_URL=http://localhost:8083
```

**API Client Setup**:
```typescript
// src/lib/api/client.ts
import axios from 'axios';

// Read from environment variable
const CORE_SERVICE_URL = process.env.NEXT_PUBLIC_CORE_SERVICE_URL || 'http://localhost:8080';

// Create axios instance
export const coreApi = axios.create({
  baseURL: CORE_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
coreApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
coreApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Backend Configuration

**Environment Variables** (.env):
```bash
# Go backend environment
PORT=8080
DB_HOST=postgres-core
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=estospaces_core
DB_SSL_MODE=disable
JWT_SECRET=your-super-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

**CORS Configuration** (Allow frontend to call backend):
```go
// cmd/server/main.go
package main

import (
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "os"
)

func main() {
    app := fiber.New()

    // CORS middleware - CRITICAL for frontend to connect
    app.Use(cors.New(cors.Config{
        AllowOrigins:     os.Getenv("ALLOWED_ORIGINS"), // "http://localhost:3000"
        AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
        AllowCredentials: true,
    }))

    // Routes
    v1 := app.Group("/api/v1")
    v1.Get("/properties", propertyHandler.GetProperties)

    app.Listen(":8080")
}
```

### 3. Complete Request Flow Example

**Step 1: User clicks "View Properties" on dashboard**

**Step 2: Frontend React Component**:
```typescript
// src/app/(user)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getProperties } from '@/lib/api/properties';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        // This makes HTTP call to backend
        const data = await getProperties({
          country: 'UK',
          limit: 20
        });
        setProperties(data.data);
      } catch (error) {
        console.error('Failed:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  return (
    <div>
      {loading ? 'Loading...' : properties.map(p => <Card {...p} />)}
    </div>
  );
}
```

**Step 3: Frontend API Service**:
```typescript
// src/lib/api/properties.ts
import { coreApi } from './client';

export async function getProperties(filters: { country?: string; limit?: number }) {
  // Makes HTTP GET to: http://localhost:8080/api/v1/properties?country=UK&limit=20
  const response = await coreApi.get('/api/v1/properties', {
    params: filters,
  });

  // Response format:
  // {
  //   data: [{ id, title, price, ... }],
  //   pagination: { page, total, ... }
  // }
  return response.data;
}
```

**Step 4: Backend Receives Request**:
```go
// internal/properties/handler.go
func (h *Handler) GetProperties(c *fiber.Ctx) error {
    // 1. Parse query parameters
    country := c.Query("country") // "UK"
    limit := c.QueryInt("limit", 20) // 20

    // 2. Build filters
    filters := PropertyFilters{
        Country: country,
        Limit:   limit,
    }

    // 3. Call service layer
    properties, pagination, err := h.service.GetProperties(filters)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    // 4. Return JSON response
    return c.JSON(fiber.Map{
        "data":       properties,
        "pagination": pagination,
    })
}
```

**Step 5: Backend Service Queries Database**:
```go
// internal/properties/service.go
func (s *Service) GetProperties(filters PropertyFilters) ([]Property, *Pagination, error) {
    var properties []Property

    // 1. Build SQL query using GORM
    query := s.db.Where("status = ?", "online")

    if filters.Country != "" {
        query = query.Where("country = ?", filters.Country)
    }

    // 2. Execute query (GORM translates to SQL)
    // SQL: SELECT * FROM properties WHERE status = 'online' AND country = 'UK' LIMIT 20
    if err := query.Limit(filters.Limit).Find(&properties).Error; err != nil {
        return nil, nil, err
    }

    // 3. Return data
    return properties, pagination, nil
}
```

**Step 6: PostgreSQL Executes Query**:
```sql
-- PostgreSQL receives and executes:
SELECT id, title, description, price, bedrooms, bathrooms, city, country, image_urls, created_at
FROM properties
WHERE status = 'online' AND country = 'UK'
ORDER BY created_at DESC
LIMIT 20;

-- Returns 20 rows
```

**Step 7: Data flows back**:
- PostgreSQL → GORM → Go Service → Go Handler → JSON Response
- JSON Response → axios → React State → UI Re-render
- User sees properties!

### Why This Architecture?

1. **Security**: Frontend can't access database directly (prevents SQL injection)
2. **Business Logic**: Backend enforces rules (e.g., only show published properties)
3. **Performance**: Backend can cache, optimize queries
4. **Flexibility**: Can change database without changing frontend
5. **Scalability**: Can add more backend instances easily

---

## Local Development with Docker Compose

### Project Structure

```
/Users/puvendhan/Documents/repos/new/esp/
├── estospaces-web/              # Next.js frontend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── estospaces-core-service/     # Go backend (auth, properties)
│   ├── Dockerfile
│   ├── go.mod
│   └── internal/
├── estospaces-booking-service/  # Go backend (bookings)
│   ├── Dockerfile
│   └── internal/
├── estospaces-payment-service/  # Go backend (payments)
│   ├── Dockerfile
│   └── internal/
├── estospaces-platform-service/ # Go backend (chat, notifs)
│   ├── Dockerfile
│   └── internal/
└── docker-compose.yml           # Root compose file (all services)
```

### Root Docker Compose Configuration

Create this file at: `/Users/puvendhan/Documents/repos/new/esp/docker-compose.yml`

```yaml
version: '3.8'

# Define networks for service communication
networks:
  estospaces-network:
    driver: bridge

# Define volumes for persistent data
volumes:
  postgres-core-data:
  postgres-booking-data:
  postgres-payment-data:
  postgres-platform-data:

services:
  # ============================================
  # DATABASES
  # ============================================

  postgres-core:
    image: postgres:15-alpine
    container_name: estospaces-postgres-core
    environment:
      POSTGRES_DB: estospaces_core
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-core-data:/var/lib/postgresql/data
      - ./sql/schema_core.sql:/docker-entrypoint-initdb.d/01_schema.sql
    networks:
      - estospaces-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-booking:
    image: postgres:15-alpine
    container_name: estospaces-postgres-booking
    environment:
      POSTGRES_DB: estospaces_booking
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    volumes:
      - postgres-booking-data:/var/lib/postgresql/data
      - ./sql/schema_booking.sql:/docker-entrypoint-initdb.d/01_schema.sql
    networks:
      - estospaces-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-payment:
    image: postgres:15-alpine
    container_name: estospaces-postgres-payment
    environment:
      POSTGRES_DB: estospaces_payment
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"
    volumes:
      - postgres-payment-data:/var/lib/postgresql/data
      - ./sql/schema_payment.sql:/docker-entrypoint-initdb.d/01_schema.sql
    networks:
      - estospaces-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres-platform:
    image: postgres:15-alpine
    container_name: estospaces-postgres-platform
    environment:
      POSTGRES_DB: estospaces_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5435:5432"
    volumes:
      - postgres-platform-data:/var/lib/postgresql/data
      - ./sql/schema_platform.sql:/docker-entrypoint-initdb.d/01_schema.sql
    networks:
      - estospaces-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============================================
  # BACKEND SERVICES (Go)
  # ============================================

  core-service:
    build:
      context: ./estospaces-core-service
      dockerfile: Dockerfile
    container_name: estospaces-core-service
    environment:
      PORT: 8080
      DB_HOST: postgres-core
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: estospaces_core
      DB_SSL_MODE: disable
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      JWT_EXPIRY: 24h
      ALLOWED_ORIGINS: http://localhost:3000
      LOG_LEVEL: info
    ports:
      - "8080:8080"
    depends_on:
      postgres-core:
        condition: service_healthy
    networks:
      - estospaces-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  booking-service:
    build:
      context: ./estospaces-booking-service
      dockerfile: Dockerfile
    container_name: estospaces-booking-service
    environment:
      PORT: 8081
      DB_HOST: postgres-booking
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: estospaces_booking
      DB_SSL_MODE: disable
      CORE_SERVICE_URL: http://core-service:8080
      ALLOWED_ORIGINS: http://localhost:3000
    ports:
      - "8081:8081"
    depends_on:
      postgres-booking:
        condition: service_healthy
      core-service:
        condition: service_started
    networks:
      - estospaces-network
    restart: unless-stopped

  payment-service:
    build:
      context: ./estospaces-payment-service
      dockerfile: Dockerfile
    container_name: estospaces-payment-service
    environment:
      PORT: 8082
      DB_HOST: postgres-payment
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: estospaces_payment
      DB_SSL_MODE: disable
      BOOKING_SERVICE_URL: http://booking-service:8081
      STRIPE_SECRET_KEY: sk_test_your_stripe_key_here
      ALLOWED_ORIGINS: http://localhost:3000
    ports:
      - "8082:8082"
    depends_on:
      postgres-payment:
        condition: service_healthy
      booking-service:
        condition: service_started
    networks:
      - estospaces-network
    restart: unless-stopped

  platform-service:
    build:
      context: ./estospaces-platform-service
      dockerfile: Dockerfile
    container_name: estospaces-platform-service
    environment:
      PORT: 8083
      DB_HOST: postgres-platform
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: estospaces_platform
      DB_SSL_MODE: disable
      CORE_SERVICE_URL: http://core-service:8080
      ALLOWED_ORIGINS: http://localhost:3000
    ports:
      - "8083:8083"
    depends_on:
      postgres-platform:
        condition: service_healthy
      core-service:
        condition: service_started
    networks:
      - estospaces-network
    restart: unless-stopped

  # ============================================
  # FRONTEND (Next.js)
  # ============================================

  web:
    build:
      context: ./estospaces-web
      dockerfile: Dockerfile
    container_name: estospaces-web
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      NEXT_PUBLIC_APP_NAME: EstoSpaces
      NEXT_PUBLIC_API_URL: http://localhost:8080/api
      NEXT_PUBLIC_CORE_SERVICE_URL: http://localhost:8080
      NEXT_PUBLIC_BOOKING_SERVICE_URL: http://localhost:8081
      NEXT_PUBLIC_PAYMENT_SERVICE_URL: http://localhost:8082
      NEXT_PUBLIC_PLATFORM_SERVICE_URL: http://localhost:8083
    ports:
      - "3000:3000"
    depends_on:
      - core-service
      - booking-service
      - payment-service
      - platform-service
    networks:
      - estospaces-network
    restart: unless-stopped

  # ============================================
  # OPTIONAL: pgAdmin (Database Management UI)
  # ============================================

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: estospaces-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@estospaces.com
      PGADMIN_DEFAULT_PASSWORD: admin
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "5050:80"
    networks:
      - estospaces-network
    depends_on:
      - postgres-core
      - postgres-booking
      - postgres-payment
      - postgres-platform
    restart: unless-stopped
```

### Key Features of This Setup:

1. **Health Checks**: Services wait for dependencies to be ready
2. **Persistent Data**: Database data survives container restarts
3. **Service Discovery**: Services can call each other by name (e.g., `postgres-core`)
4. **Auto-restart**: Services restart if they crash
5. **Network Isolation**: All services in same network
6. **Port Mapping**: Access services from host machine

### Environment Variables Explained:

**Database Connection (Backend → PostgreSQL)**:
```yaml
DB_HOST: postgres-core          # Container name (not localhost!)
DB_PORT: 5432                   # Internal port (not 5432 on host)
DB_USER: postgres
DB_PASSWORD: postgres           # Change in production!
DB_NAME: estospaces_core
```

**Service Communication (Backend → Backend)**:
```yaml
CORE_SERVICE_URL: http://core-service:8080    # Not localhost!
BOOKING_SERVICE_URL: http://booking-service:8081
```

**Frontend → Backend (Browser → Backend)**:
```yaml
# These must be localhost because browser runs on host machine
NEXT_PUBLIC_CORE_SERVICE_URL: http://localhost:8080
NEXT_PUBLIC_BOOKING_SERVICE_URL: http://localhost:8081
```

---

## Testing Locally

### Step 1: Start All Services

```bash
cd /Users/puvendhan/Documents/repos/new/esp

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

**Expected Output**:
```
NAME                              STATUS          PORTS
estospaces-postgres-core          Up (healthy)    0.0.0.0:5432->5432/tcp
estospaces-postgres-booking       Up (healthy)    0.0.0.0:5433->5432/tcp
estospaces-postgres-payment       Up (healthy)    0.0.0.0:5434->5432/tcp
estospaces-postgres-platform      Up (healthy)    0.0.0.0:5435->5432/tcp
estospaces-core-service           Up (healthy)    0.0.0.0:8080->8080/tcp
estospaces-booking-service        Up              0.0.0.0:8081->8081/tcp
estospaces-payment-service        Up              0.0.0.0:8082->8082/tcp
estospaces-platform-service       Up              0.0.0.0:8083->8083/tcp
estospaces-web                    Up              0.0.0.0:3000->3000/tcp
estospaces-pgadmin                Up              0.0.0.0:5050->80/tcp
```

### Step 2: Verify Services

**Test Backend APIs**:
```bash
# Core Service Health Check
curl http://localhost:8080/health
# Expected: {"status":"ok","service":"core-service"}

# Booking Service
curl http://localhost:8081/health

# Payment Service
curl http://localhost:8082/health

# Platform Service
curl http://localhost:8083/health
```

**Test Database Connection**:
```bash
# Connect to core database
docker exec -it estospaces-postgres-core psql -U postgres -d estospaces_core

# Run SQL query
SELECT COUNT(*) FROM users;

# Exit
\q
```

**Access pgAdmin** (Database UI):
- URL: http://localhost:5050
- Email: admin@estospaces.com
- Password: admin

### Step 3: Test Complete Flow

**1. Register a User**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Expected Response**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**2. Login**:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token from response!**

**3. Test Protected Endpoint**:
```bash
# Replace YOUR_TOKEN with token from login
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Test Frontend**:
- Open browser: http://localhost:3000
- Navigate to login: http://localhost:3000/login
- Login with: test@example.com / password123
- Should redirect to dashboard
- Check browser Network tab to see API calls

### Step 4: Verify Frontend → Backend → Database Flow

**Open Browser DevTools** (F12):

1. Go to **Network tab**
2. Navigate to http://localhost:3000/dashboard
3. Look for XHR/Fetch requests:
   ```
   GET http://localhost:8080/api/v1/properties
   Status: 200 OK
   Response: { "data": [...], "pagination": {...} }
   ```

**Check Backend Logs**:
```bash
docker-compose logs -f core-service

# You should see:
# [INFO] GET /api/v1/properties - 200 OK - 45ms
# [INFO] Database query executed: SELECT * FROM properties...
```

**Check Database**:
```bash
docker exec -it estospaces-postgres-core psql -U postgres -d estospaces_core -c "SELECT * FROM properties LIMIT 5;"
```

### Troubleshooting

**Problem: Frontend can't connect to backend**
```bash
# Check if backend is running
curl http://localhost:8080/health

# Check CORS configuration in Go backend
# Make sure ALLOWED_ORIGINS includes http://localhost:3000

# Check browser console for CORS errors
```

**Problem: Backend can't connect to database**
```bash
# Check if database is running
docker-compose ps postgres-core

# Check database logs
docker-compose logs postgres-core

# Try connecting manually
docker exec -it estospaces-postgres-core psql -U postgres -d estospaces_core
```

**Problem: Services not starting**
```bash
# Rebuild images
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d --build
```

### Development Workflow

**Option A: Docker Compose (Full Stack)**
```bash
# Start everything
docker-compose up -d

# Make code changes in estospaces-web or estospaces-core-service

# Rebuild and restart specific service
docker-compose up -d --build core-service

# View logs
docker-compose logs -f core-service
```

**Option B: Hybrid (Backend in Docker, Frontend local)**
```bash
# Start only backend services
docker-compose up -d postgres-core core-service booking-service payment-service platform-service

# Run frontend locally with hot-reload
cd estospaces-web
npm run dev

# Now you can edit React code and see changes immediately
```

**Option C: Full Local Development**
```bash
# Terminal 1: Start databases only
docker-compose up -d postgres-core postgres-booking postgres-payment postgres-platform

# Terminal 2: Core service
cd estospaces-core-service
DB_HOST=localhost go run cmd/server/main.go

# Terminal 3: Booking service
cd estospaces-booking-service
DB_HOST=localhost PORT=8081 go run cmd/server/main.go

# Terminal 4: Frontend
cd estospaces-web
npm run dev
```

---

## Deploying to GKE

### GKE Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE CLOUD PLATFORM                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    GKE Cluster (estospaces-cluster)             │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │         Ingress / Load Balancer                          │ │   │
│  │  │         (External IP: 34.105.x.x)                        │ │   │
│  │  │         DNS: api.estospaces.com → 34.105.x.x            │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  │                            │                                    │   │
│  │                            ▼                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │   │
│  │  │ web         │  │ core-svc    │  │ booking-svc │           │   │
│  │  │ (3 pods)    │  │ (2 pods)    │  │ (2 pods)    │           │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │   │
│  │         │                 │                 │                   │   │
│  │         │                 ▼                 ▼                   │   │
│  │         │          ┌─────────────────────────────────┐         │   │
│  │         │          │   Cloud SQL Proxy (sidecar)     │         │   │
│  │         │          └─────────────────────────────────┘         │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                     │                                   │
│                                     │ Private IP                        │
│                                     ▼                                   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              Cloud SQL (PostgreSQL 15)                          │   │
│  │              Private IP: 10.x.x.x                               │   │
│  │                                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │   │
│  │  │estospaces_   │  │estospaces_   │  │estospaces_   │        │   │
│  │  │core          │  │booking       │  │payment       │        │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              Google Cloud Storage                                │   │
│  │              (Property images, documents)                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Deployment Steps

#### Step 1: Build and Push Docker Images

```bash
cd /Users/puvendhan/Documents/repos/new/esp

# Set project ID
PROJECT_ID="your-gcp-project-id"
REGION="europe-west2"

# Configure Docker for GCR
gcloud auth configure-docker gcr.io

# Build images
docker build -t gcr.io/$PROJECT_ID/estospaces-web:v1.0.0 ./estospaces-web
docker build -t gcr.io/$PROJECT_ID/estospaces-core-service:v1.0.0 ./estospaces-core-service
docker build -t gcr.io/$PROJECT_ID/estospaces-booking-service:v1.0.0 ./estospaces-booking-service
docker build -t gcr.io/$PROJECT_ID/estospaces-payment-service:v1.0.0 ./estospaces-payment-service
docker build -t gcr.io/$PROJECT_ID/estospaces-platform-service:v1.0.0 ./estospaces-platform-service

# Push images
docker push gcr.io/$PROJECT_ID/estospaces-web:v1.0.0
docker push gcr.io/$PROJECT_ID/estospaces-core-service:v1.0.0
docker push gcr.io/$PROJECT_ID/estospaces-booking-service:v1.0.0
docker push gcr.io/$PROJECT_ID/estospaces-payment-service:v1.0.0
docker push gcr.io/$PROJECT_ID/estospaces-platform-service:v1.0.0
```

#### Step 2: Create GKE Cluster

```bash
# Create GKE cluster (if not exists)
gcloud container clusters create estospaces-cluster \
  --region=$REGION \
  --num-nodes=2 \
  --machine-type=e2-standard-2 \
  --disk-size=50 \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=5 \
  --enable-autorepair \
  --enable-autoupgrade

# Get credentials
gcloud container clusters get-credentials estospaces-cluster --region=$REGION
```

#### Step 3: Create Kubernetes Secrets

```bash
# Database credentials
kubectl create secret generic cloudsql-db-credentials \
  --from-literal=username=estospaces-user \
  --from-literal=password=YOUR_SECURE_PASSWORD

# JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=secret=YOUR_JWT_SECRET_KEY

# Stripe API key
kubectl create secret generic stripe-secret \
  --from-literal=api-key=sk_live_YOUR_STRIPE_KEY
```

#### Step 4: Kubernetes Manifests

Create directory: `/Users/puvendhan/Documents/repos/new/esp/k8s/`

**k8s/core-service-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-service
  labels:
    app: core-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: core-service
  template:
    metadata:
      labels:
        app: core-service
    spec:
      containers:
      # Main application container
      - name: core-service
        image: gcr.io/YOUR_PROJECT_ID/estospaces-core-service:v1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: PORT
          value: "8080"
        - name: DB_HOST
          value: "127.0.0.1"  # Cloud SQL Proxy on localhost
        - name: DB_PORT
          value: "5432"
        - name: DB_NAME
          value: "estospaces_core"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: cloudsql-db-credentials
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: cloudsql-db-credentials
              key: password
        - name: DB_SSL_MODE
          value: "require"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        - name: JWT_EXPIRY
          value: "24h"
        - name: ALLOWED_ORIGINS
          value: "https://estospaces.com,https://www.estospaces.com"
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

      # Cloud SQL Proxy sidecar
      - name: cloud-sql-proxy
        image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:latest
        args:
          - "--structured-logs"
          - "--port=5432"
          - "YOUR_PROJECT_ID:europe-west2:estospaces-db"
        securityContext:
          runAsNonRoot: true
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi

---
apiVersion: v1
kind: Service
metadata:
  name: core-service
spec:
  type: ClusterIP
  selector:
    app: core-service
  ports:
  - port: 8080
    targetPort: 8080
```

**k8s/web-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: gcr.io/YOUR_PROJECT_ID/estospaces-web:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_APP_URL
          value: "https://estospaces.com"
        - name: NEXT_PUBLIC_CORE_SERVICE_URL
          value: "https://api.estospaces.com"
        - name: NEXT_PUBLIC_BOOKING_SERVICE_URL
          value: "https://api.estospaces.com/booking"
        - name: NEXT_PUBLIC_PAYMENT_SERVICE_URL
          value: "https://api.estospaces.com/payment"
        - name: NEXT_PUBLIC_PLATFORM_SERVICE_URL
          value: "https://api.estospaces.com/platform"
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 400m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 3000
    targetPort: 3000
```

**k8s/ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: estospaces-ingress
  annotations:
    kubernetes.io/ingress.class: "gce"
    kubernetes.io/ingress.global-static-ip-name: "estospaces-ip"
    networking.gke.io/managed-certificates: "estospaces-cert"
spec:
  rules:
  # Frontend
  - host: estospaces.com
    http:
      paths:
      - path: /*
        pathType: ImplementationSpecific
        backend:
          service:
            name: web
            port:
              number: 3000

  # Backend API
  - host: api.estospaces.com
    http:
      paths:
      - path: /api/v1/*
        pathType: ImplementationSpecific
        backend:
          service:
            name: core-service
            port:
              number: 8080
      - path: /booking/*
        pathType: ImplementationSpecific
        backend:
          service:
            name: booking-service
            port:
              number: 8081
      - path: /payment/*
        pathType: ImplementationSpecific
        backend:
          service:
            name: payment-service
            port:
              number: 8082
      - path: /platform/*
        pathType: ImplementationSpecific
        backend:
          service:
            name: platform-service
            port:
              number: 8083

---
apiVersion: networking.gke.io/v1
kind: ManagedCertificate
metadata:
  name: estospaces-cert
spec:
  domains:
    - estospaces.com
    - www.estospaces.com
    - api.estospaces.com
```

#### Step 5: Deploy to GKE

```bash
cd /Users/puvendhan/Documents/repos/new/esp/k8s

# Apply deployments
kubectl apply -f core-service-deployment.yaml
kubectl apply -f booking-service-deployment.yaml
kubectl apply -f payment-service-deployment.yaml
kubectl apply -f platform-service-deployment.yaml
kubectl apply -f web-deployment.yaml

# Apply ingress
kubectl apply -f ingress.yaml

# Check status
kubectl get pods
kubectl get services
kubectl get ingress

# View logs
kubectl logs -f deployment/core-service
```

#### Step 6: Configure DNS

```bash
# Get external IP
kubectl get ingress estospaces-ingress

# Output:
# NAME                  HOSTS                           ADDRESS         PORTS
# estospaces-ingress    estospaces.com,api.esto...     34.105.x.x      80, 443

# Add DNS records:
# A    estospaces.com       → 34.105.x.x
# A    www.estospaces.com   → 34.105.x.x
# A    api.estospaces.com   → 34.105.x.x
```

---

## Environment Configuration

### Environment Comparison

| Environment | Frontend URL | Backend URL | Database |
|-------------|-------------|-------------|----------|
| **Local Docker Compose** | http://localhost:3000 | http://localhost:8080 | postgres-core:5432 |
| **Local Hybrid** | http://localhost:3000 | http://localhost:8080 | localhost:5432 |
| **GKE Production** | https://estospaces.com | https://api.estospaces.com | Cloud SQL (Private IP) |

### Configuration Files

**Local Development** (.env.local):
```bash
# Frontend (estospaces-web/.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CORE_SERVICE_URL=http://localhost:8080
NEXT_PUBLIC_BOOKING_SERVICE_URL=http://localhost:8081
```

**Production** (Kubernetes ConfigMap):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NEXT_PUBLIC_APP_URL: "https://estospaces.com"
  NEXT_PUBLIC_CORE_SERVICE_URL: "https://api.estospaces.com"
```

---

## Summary

### Local Development Flow:
1. **Start**: `docker-compose up -d` (starts all services)
2. **Frontend**: Browser → http://localhost:3000
3. **Frontend calls**: axios → http://localhost:8080 (core service)
4. **Backend connects**: GORM → postgres-core:5432
5. **Database**: PostgreSQL in Docker container

### GKE Production Flow:
1. **User visits**: https://estospaces.com
2. **Ingress routes**: Load Balancer → web pods
3. **Frontend calls**: axios → https://api.estospaces.com
4. **Ingress routes**: Load Balancer → core-service pods
5. **Backend connects**: Cloud SQL Proxy → Private Cloud SQL
6. **Database**: Cloud SQL (managed PostgreSQL)

### Key Differences:

| Aspect | Local | GKE |
|--------|-------|-----|
| **DNS** | localhost | Custom domain |
| **HTTPS** | No (HTTP) | Yes (SSL cert) |
| **Database** | Docker container | Cloud SQL |
| **Scaling** | Manual (docker-compose scale) | Auto-scaling |
| **Load Balancing** | None | Google Load Balancer |
| **High Availability** | No | Yes (multi-zone) |

**Next Steps**:
1. Test locally with Docker Compose
2. Build and push images to GCR
3. Deploy to GKE
4. Configure DNS
5. Monitor and scale
