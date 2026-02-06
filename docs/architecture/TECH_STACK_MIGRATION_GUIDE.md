# EstoSpaces Tech Stack Migration Guide

## Executive Summary

This document provides a comprehensive guide to migrate from the **current monolithic tech stack** to a **modern, scalable microservices architecture**. It covers frontend, backend, database, and infrastructure migration strategies with step-by-step implementation plans.

---

## Table of Contents

1. [Current Tech Stack Analysis](#current-tech-stack-analysis)
2. [Target Tech Stack](#target-tech-stack)
3. [Migration Strategy Overview](#migration-strategy-overview)
4. [Frontend Migration](#frontend-migration)
5. [Backend Migration](#backend-migration)
6. [Database Migration](#database-migration)
7. [Infrastructure Migration](#infrastructure-migration)
8. [Step-by-Step Migration Plan](#step-by-step-migration-plan)
9. [Code Examples](#code-examples)
10. [Testing Strategy](#testing-strategy)

---

## Current Tech Stack Analysis

### 🌐 Current Frontend Stack

```yaml
Framework:           React 19.2.0 (Latest)
Build Tool:          Vite 5.4.10
Language:            TypeScript 5.0.2 + JavaScript (Mixed - JSX/TSX)
Routing:             React Router DOM 7.9.6
State Management:    React Context API (Multiple contexts)
Styling:             Tailwind CSS 3.4.15 + CSS
UI Components:       Custom components + Lucide React icons
Animation:           Framer Motion 12.24.7
Maps:                Leaflet 1.9.4 + React Leaflet 4.2.1
Date Handling:       date-fns 4.1.0
PDF Generation:      jsPDF 3.0.4 + jspdf-autotable 5.0.2
Excel Export:        XLSX 0.18.5
File Handling:       file-saver 2.0.5
3D Graphics:         Three.js 0.182.0
Tour Guide:          Driver.js 1.4.0
Forms:               Native React (No form library)
Validation:          None (Manual validation)
HTTP Client:         Native fetch + node-fetch 3.3.2
Dev Server:          Vite dev server (port 5173)
```

**File Structure**:
- **JSX files**: ~45 files (JavaScript + JSX)
- **TSX files**: ~35 files (TypeScript + JSX)
- **TS files**: ~15 files (TypeScript utilities)
- **JS files**: ~20 files (JavaScript utilities)
- **Mixed codebase**: ~60% TypeScript, 40% JavaScript

**Issues with Current Frontend**:
- ❌ **Mixed JS/TS**: Inconsistent type safety across codebase
- ❌ **No Form Library**: Manual form handling, prone to errors
- ❌ **Context API Only**: Not ideal for complex state management
- ❌ **No Server State Management**: Manual caching and refetching
- ❌ **No Code Splitting**: Large initial bundle size
- ❌ **Client-Side Rendering**: Poor SEO, slow initial page load
- ❌ **No API Type Safety**: No tRPC or GraphQL for type-safe APIs
- ❌ **Manual Validation**: Error-prone, inconsistent

### 🔧 Current Backend Stack

```yaml
Runtime:             Node.js (Latest LTS)
Framework:           Express 4.22.1
Language:            JavaScript (ES Modules)
Architecture:        Monolithic (Single server.js - 1,602 lines)
Database Client:     pg (node-postgres) or Prisma
Database:            Cloud SQL PostgreSQL (GCP-hosted)
Authentication:      Custom JWT-based auth
Storage:             Google Cloud Storage (GCS)
Real-time:           Custom WebSocket implementation
API Style:           REST API
Middleware:          CORS 2.8.5, Express built-in
Environment:         dotenv 16.6.1
Server Port:         3002
Development:         Concurrent dev (Vite + Express)
Deployment:          Docker + GKE
```

**Server Architecture** (server.js - 1,602 lines):
```
server.js
├── Express app initialization
├── CORS configuration
├── Supabase client setup
├── Authentication middleware
├── ~30+ API endpoints (all in one file)
│   ├── /api/properties/*
│   ├── /api/users/*
│   ├── /api/bookings/*
│   ├── /api/messages/*
│   ├── /api/notifications/*
│   └── ... (many more)
├── Error handling
└── Server startup
```

**Issues with Current Backend**:
- ❌ **Monolithic**: All endpoints in single 1,602-line file
- ❌ **No Separation**: Cannot deploy features independently
- ❌ **No Type Safety**: JavaScript only, no compile-time checks
- ❌ **Difficult to Scale**: Cannot scale endpoints independently
- ❌ **No Service Boundaries**: All logic mixed together
- ❌ **No API Documentation**: No OpenAPI/Swagger spec
- ❌ **Limited Error Handling**: Basic try-catch blocks
- ❌ **No Request Validation**: Vulnerable to malformed requests
- ❌ **No Containerization**: Difficult to deploy consistently

### 💾 Current Database Stack

```yaml
Database:            Cloud SQL (Managed PostgreSQL on GCP)
Version:             PostgreSQL 15+
ORM:                 None (Direct SQL queries via pg/node-postgres)
Migrations:          SQL files in root directory (to be organized)
Schema:              Multiple tables (no RLS - app-level security)
Real-time:           Custom WebSocket server (to be built)
File Storage:        Google Cloud Storage (GCS) buckets
Auth:                Custom JWT implementation (to be migrated)
Connection:          Cloud SQL Proxy for secure connections
```

**Database Files**:
```
Root directory SQL files:
├── supabase_setup_properties.sql
├── supabase_properties_schema.sql
├── supabase_profiles_table.sql
├── supabase_verification_schema.sql
├── supabase_manager_verification_schema.sql
├── supabase_chatbot_schema.sql
├── supabase_notifications_schema.sql
├── supabase_analytics_enhanced.sql
└── ... (20+ SQL files)
```

**Issues with Current Database**:
- ❌ **No Migration Tool**: Manual SQL file execution
- ❌ **No Versioning**: Hard to track schema changes
- ❌ **No ORM**: Raw SQL queries everywhere
- ❌ **App-Level Security Needed**: Will need to implement authorization in application layer
- ❌ **Migration from Supabase**: Need to migrate auth, storage, realtime

### 🏗️ Current Infrastructure

```yaml
Development:
  Frontend:          Vite dev server (localhost:5173)
  Backend:           Express server (localhost:3002)
  Database:          Supabase Cloud
  Proxy:             Vite proxy for /api and /supabase

Production:
  Hosting:           GKE (Google Kubernetes Engine)
  Database:          Cloud SQL (production instance with HA)
  CDN:               Cloud CDN + Load Balancer
  Storage:           Google Cloud Storage (GCS)

DevOps:
  CI/CD:             Unknown (no .github/workflows visible)
  Containerization:  None (no Dockerfile)
  Orchestration:     None (no Kubernetes)
  Monitoring:        None (no monitoring setup)
  Logging:           Console logs only
```

**Issues with Current Infrastructure**:
- ❌ **No Containerization**: Cannot deploy consistently
- ❌ **No CI/CD**: Manual deployment process
- ❌ **No Monitoring**: No observability
- ❌ **No Auto-scaling**: Manual scaling
- ❌ **No Infrastructure as Code**: Manual setup

---

## Target Tech Stack

### 🌐 Target Frontend Stack

```yaml
# Web Application
Framework:           Next.js 15+ (React 19)
  - Server Components (default)
  - App Router
  - Edge Runtime
  - Streaming SSR
  - ISR (Incremental Static Regeneration)

Language:            TypeScript 5+ (100% - No JavaScript)
Routing:             Next.js App Router (file-based)
State Management:
  - Client State:    Zustand 4+ (lightweight)
  - Server State:    TanStack Query (React Query) 5+
  - Form State:      React Hook Form 7+

Styling:
  - Framework:       Tailwind CSS 4+
  - Components:      Shadcn/ui (Radix UI primitives)

Validation:          Zod 3+ (Type-safe schemas)
API Client:
  - Option A:        tRPC (End-to-end type safety)
  - Option B:        GraphQL with Apollo Client

Animation:           Framer Motion 11+
Maps:                Mapbox GL JS or Google Maps (better than Leaflet)
Testing:
  - Unit:            Vitest
  - E2E:             Playwright
  - Component:       Testing Library

Build Tool:          Turbopack (Next.js built-in)
Package Manager:     pnpm (faster, disk-efficient)
```

```yaml
# Mobile Application
Framework:           React Native 0.73+ with Expo
Language:            TypeScript 5+
Navigation:          React Navigation 6+
State Management:    Zustand + React Query
Styling:             React Native Paper + StyleSheet
UI Components:       React Native Paper (Material Design)
Forms:               React Hook Form Native
Storage:             AsyncStorage / MMKV
API Client:          Same as web (tRPC or GraphQL)
Push Notifications:  Expo Notifications (Firebase)
Maps:                React Native Maps
Testing:             Jest + React Native Testing Library
```

### 🔧 Target Backend Stack

```yaml
# Core Service (Auth + Users + Properties)
Language:            Go 1.23+
Framework:           Fiber 2.52+ (Express-like, fast)
Database Driver:     pgx (PostgreSQL driver)
ORM (optional):      GORM or sqlx
Validation:          validator 10+
JWT:                 golang-jwt 5+
Configuration:       Viper

# Other Services
Booking Service:     Go + Fiber
Payment Service:     Go + Fiber + Stripe SDK
Platform Service:    Go + Fiber + AWS SDK

# Alternative: Performance-Critical Services
Language:            Rust 1.75+
Framework:           Axum or Actix-web
```

### 💾 Target Database Stack

```yaml
Primary Database:    PostgreSQL 16+ (Self-hosted or RDS)
  - Cloud SQL (GCP managed PostgreSQL)
  - Portable to any Postgres-compatible database

ORM/Query Builder:
  - Go:              GORM or sqlx
  - Rust:            sqlx or diesel

Migrations:
  - Go:              golang-migrate
  - Rust:            sqlx-cli

Cache:               Redis 7+
  - Session storage
  - API response cache
  - Rate limiting

Search:              Elasticsearch 8+ (Phase 2)
  - Full-text search
  - Faceted search

Message Queue:
  - Simple:          NATS
  - Advanced:        Apache Kafka (Phase 2)

Storage:
  - S3 (AWS)
  - MinIO (self-hosted S3-compatible)
```

### 🏗️ Target Infrastructure

```yaml
Containerization:    Docker
  - Multi-stage builds
  - Optimized images

Orchestration:       Kubernetes (K8s)
  - Deployments
  - Services
  - Ingress
  - HPA (Horizontal Pod Autoscaler)

Infrastructure:
  - IaC:             Terraform
  - Config:          Helm charts
  - Secrets:         HashiCorp Vault or Sealed Secrets

CI/CD:               GitHub Actions
  - Build & test
  - Docker build & push
  - Kubernetes deploy
  - E2E tests

Monitoring:
  - Metrics:         Prometheus + Grafana
  - Logging:         Loki + Promtail or ELK Stack
  - Tracing:         Jaeger (OpenTelemetry)
  - APM:             Optional (Datadog/New Relic)

API Gateway:         Kong or Traefik
  - Routing
  - Rate limiting
  - Authentication
  - Load balancing
```

---

## Migration Strategy Overview

### Three-Phase Approach

```
Phase 1: Backend Migration (4-6 weeks)
  ├── Create Go microservices
  ├── Migrate database schema
  ├── Run in parallel with old backend
  └── Gradual traffic migration

Phase 2: Frontend Migration (4-6 weeks)
  ├── Create Next.js application
  ├── Migrate pages incrementally
  ├── Update API calls
  └── Deploy alongside old frontend

Phase 3: Mobile & Infrastructure (4-6 weeks)
  ├── Build React Native app
  ├── Set up Kubernetes
  ├── Implement CI/CD
  └── Full cutover
```

### Migration Principles

✅ **Incremental**: Migrate piece by piece, not all at once
✅ **Parallel Running**: Run old and new systems simultaneously
✅ **Feature Flags**: Toggle between old and new implementations
✅ **Zero Downtime**: No service interruption during migration
✅ **Rollback Plan**: Ability to revert at any point
✅ **Data Integrity**: No data loss during migration

---

## Frontend Migration

### Step 1: Set Up Next.js Project

**Create New Repository**: `estospaces-web`

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest estospaces-web --typescript --tailwind --app --use-pnpm

cd estospaces-web

# Install additional dependencies
pnpm add zustand @tanstack/react-query zod react-hook-form @hookform/resolvers
pnpm add shadcn-ui lucide-react framer-motion date-fns
pnpm add -D @playwright/test vitest
```

**Project Structure**:
```
estospaces-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── (manager)/
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── (user)/
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── admin/
│   │   ├── manager/
│   │   └── user/
│   ├── lib/
│   │   ├── api/                # API clients
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Utilities
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── propertyStore.ts
│   │   └── uiStore.ts
│   └── types/                  # TypeScript types
└── package.json
```

### Step 2: Migrate Components (Page by Page)

**Migration Order**:
1. Shared components (UI, layouts)
2. Authentication pages
3. User dashboard (highest priority)
4. Manager dashboard
5. Admin dashboard

**Example: Migrate Login Page**

**Old (React + Vite)**:
```tsx
// src/components/auth/Login.jsx (Current)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**New (Next.js + TypeScript + React Hook Form + Zod)**:
```tsx
// src/app/(auth)/login/page.tsx (New)
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

// Validation schema with Zod
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        type="email"
        placeholder="Email"
      />
      {errors.email && <p>{errors.email.message}</p>}

      <input
        {...register('password')}
        type="password"
        placeholder="Password"
      />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Step 3: Migrate State Management

**Old: React Context API**
```tsx
// src/contexts/AuthContext.tsx (Current)
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**New: Zustand Store**
```tsx
// src/stores/authStore.ts (New)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Call API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) throw new Error('Login failed');

        const { user, token } = await response.json();
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      refreshToken: async () => {
        // Implement token refresh logic
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### Step 4: Migrate API Calls with React Query

**Old: Direct fetch in component**
```tsx
// src/pages/PropertiesList.tsx (Current)
function PropertiesList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      const { data } = await supabase
        .from('properties')
        .select('*');
      setProperties(data || []);
      setLoading(false);
    }
    fetchProperties();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

**New: React Query with API client**
```tsx
// src/app/(manager)/properties/page.tsx (New)
'use client';

import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '@/lib/api/property';

export default function PropertiesPage() {
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {properties?.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

// src/lib/api/property.ts
import { api } from './client';

export const propertyApi = {
  getAll: () => api.get<Property[]>('/properties'),
  getById: (id: string) => api.get<Property>(`/properties/${id}`),
  create: (data: CreatePropertyDto) => api.post<Property>('/properties', data),
  update: (id: string, data: UpdatePropertyDto) =>
    api.put<Property>(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
};
```

---

## Backend Migration

### Step 1: Create Go Microservice Structure

**New Repository**: `estospaces-core-service`

```bash
mkdir estospaces-core-service
cd estospaces-core-service
go mod init github.com/estospaces/core-service

# Install dependencies
go get github.com/gofiber/fiber/v2
go get github.com/jackc/pgx/v5
go get gorm.io/gorm
go get gorm.io/driver/postgres
go get github.com/golang-jwt/jwt/v5
go get github.com/go-playground/validator/v10
```

**Project Structure**:
```
estospaces-core-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── auth/
│   │   ├── handler.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── middleware.go
│   ├── users/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── repository.go
│   ├── properties/
│   │   ├── handler.go
│   │   ├── service.go
│   │   └── repository.go
│   ├── models/
│   │   ├── user.go
│   │   └── property.go
│   └── shared/
│       ├── database/
│       │   └── postgres.go
│       ├── config/
│       │   └── config.go
│       ├── errors/
│       │   └── errors.go
│       └── middleware/
│           ├── auth.go
│           └── logger.go
├── api/
│   └── openapi.yaml
├── migrations/
│   ├── 000001_create_users_table.up.sql
│   ├── 000001_create_users_table.down.sql
│   ├── 000002_create_properties_table.up.sql
│   └── 000002_create_properties_table.down.sql
├── tests/
│   ├── integration/
│   └── unit/
├── Dockerfile
├── go.mod
├── go.sum
└── README.md
```

### Step 2: Migrate Express Endpoints to Go

**Old: Express Endpoint (JavaScript)**
```javascript
// server.js (Current - lines 500-550)
app.get('/api/properties', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('manager_id', req.user.id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**New: Go Fiber Endpoint (TypeScript-style)**
```go
// internal/properties/handler.go (New)
package properties

import (
	"github.com/gofiber/fiber/v2"
	"github.com/estospaces/core-service/internal/models"
	"github.com/estospaces/core-service/internal/shared/errors"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GetProperties godoc
// @Summary Get all properties
// @Description Get all properties for the authenticated manager
// @Tags properties
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Property
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/v1/properties [get]
func (h *Handler) GetProperties(c *fiber.Ctx) error {
	// Get user from context (set by auth middleware)
	userID := c.Locals("userID").(string)

	properties, err := h.service.GetByManagerID(c.Context(), userID)
	if err != nil {
		return errors.HandleError(c, err)
	}

	return c.JSON(fiber.Map{
		"data": properties,
	})
}

// internal/properties/service.go
package properties

import (
	"context"
	"github.com/estospaces/core-service/internal/models"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetByManagerID(ctx context.Context, managerID string) ([]models.Property, error) {
	return s.repo.FindByManagerID(ctx, managerID)
}

// internal/properties/repository.go
package properties

import (
	"context"
	"gorm.io/gorm"
	"github.com/estospaces/core-service/internal/models"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByManagerID(ctx context.Context, managerID string) ([]models.Property, error) {
	var properties []models.Property

	err := r.db.WithContext(ctx).
		Where("manager_id = ?", managerID).
		Find(&properties).Error

	if err != nil {
		return nil, err
	}

	return properties, nil
}

// cmd/server/main.go
package main

import (
	"log"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/estospaces/core-service/internal/auth"
	"github.com/estospaces/core-service/internal/properties"
	"github.com/estospaces/core-service/internal/shared/database"
	"github.com/estospaces/core-service/internal/shared/config"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize repositories
	propertyRepo := properties.NewRepository(db)

	// Initialize services
	propertyService := properties.NewService(propertyRepo)

	// Initialize handlers
	propertyHandler := properties.NewHandler(propertyService)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: errors.GlobalErrorHandler,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// API v1 routes
	api := app.Group("/api/v1")

	// Public routes
	api.Post("/auth/login", authHandler.Login)
	api.Post("/auth/register", authHandler.Register)

	// Protected routes (require authentication)
	protected := api.Use(auth.AuthMiddleware())
	protected.Get("/properties", propertyHandler.GetProperties)
	protected.Post("/properties", propertyHandler.CreateProperty)
	protected.Get("/properties/:id", propertyHandler.GetProperty)
	protected.Put("/properties/:id", propertyHandler.UpdateProperty)
	protected.Delete("/properties/:id", propertyHandler.DeleteProperty)

	// Start server
	log.Fatal(app.Listen(":8080"))
}
```

### Step 3: Database Migration from Supabase to PostgreSQL

**Current: Supabase SQL Files (Scattered)**
```sql
-- supabase_properties_schema.sql (Current)
create table properties (
  id uuid default uuid_generate_v4() primary key,
  manager_id uuid references auth.users not null,
  title text not null,
  description text,
  price decimal(10, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table properties enable row level security;

-- Create policy
create policy "Managers can view own properties" on properties
  for select using (auth.uid() = manager_id);
```

**New: Structured Migrations with golang-migrate**
```sql
-- migrations/000001_create_users_table.up.sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'manager', 'admin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- migrations/000001_create_users_table.down.sql
DROP TABLE IF EXISTS users;

-- migrations/000002_create_properties_table.up.sql
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100),
    postcode VARCHAR(20),
    price DECIMAL(10, 2) NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    property_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'pending')),
    images JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_properties_manager_id ON properties(manager_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);

-- migrations/000002_create_properties_table.down.sql
DROP TABLE IF EXISTS properties;
```

**Run Migrations**:
```bash
# Install golang-migrate
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations
migrate -path ./migrations -database "postgresql://user:pass@localhost:5432/estospaces?sslmode=disable" up

# Rollback
migrate -path ./migrations -database "postgresql://user:pass@localhost:5432/estospaces?sslmode=disable" down 1
```

### Step 4: Authentication Migration

**Old: Supabase Auth (Client-side)**
```typescript
// src/services/authService.ts (Current)
import { supabase } from '../lib/supabaseClient';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};
```

**New: JWT-based Auth (Go Backend)**
```go
// internal/auth/service.go (New)
package auth

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"github.com/estospaces/core-service/internal/models"
)

type Service struct {
	repo      *Repository
	jwtSecret []byte
}

func NewService(repo *Repository, jwtSecret string) *Service {
	return &Service{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
	}
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type LoginResponse struct {
	User         *models.User `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
}

func (s *Service) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	// Find user by email
	user, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT tokens
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	// Remove password hash from response
	user.PasswordHash = ""

	return &LoginResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *Service) generateAccessToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(15 * time.Minute).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *Service) generateRefreshToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// internal/auth/middleware.go
package auth

import (
	"strings"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Unauthorized - No token provided",
			})
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{
				"error": "Unauthorized - Invalid token",
			})
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Locals("userID", claims["user_id"])
		c.Locals("role", claims["role"])

		return c.Next()
	}
}
```

---

## Database Migration

### Step-by-Step Database Migration

**Phase 1: Export Data from Supabase**

```bash
# Export schema
pg_dump --schema-only \
  "postgresql://postgres:[password]@db.yydtsteyknbpfpxjtlxe.supabase.co:5432/postgres" \
  > supabase_schema.sql

# Export data
pg_dump --data-only \
  "postgresql://postgres:[password]@db.yydtsteyknbpfpxjtlxe.supabase.co:5432/postgres" \
  > supabase_data.sql
```

**Phase 2: Clean and Adapt Schema**

Remove Supabase-specific features:
- Remove RLS policies (implement in application layer)
- Remove Supabase triggers
- Remove auth.users references
- Adapt UUID generation

**Phase 3: Import to New PostgreSQL**

```bash
# Create new database
createdb estospaces_prod

# Run migrations
migrate -path ./migrations \
  -database "postgresql://user:pass@localhost:5432/estospaces_prod" up

# Import data (after schema is set up)
psql estospaces_prod < supabase_data_cleaned.sql
```

**Phase 4: Dual-Write Pattern**

During migration, write to both databases:

```go
func (s *Service) CreateProperty(ctx context.Context, property *models.Property) error {
	// Write to new database
	err := s.newRepo.Create(ctx, property)
	if err != nil {
		return err
	}

	// Also write to old Supabase (temporary)
	go func() {
		_ = s.supabaseRepo.Create(context.Background(), property)
	}()

	return nil
}
```

---

## Infrastructure Migration

### Step 1: Containerize Services

**Dockerfile for Go Service**:
```dockerfile
# estospaces-core-service/Dockerfile
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["./server"]
```

**Dockerfile for Next.js**:
```dockerfile
# estospaces-web/Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Step 2: Kubernetes Deployment

**Kubernetes Manifests**:
```yaml
# kubernetes/core-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-service
  namespace: estospaces
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-service
  template:
    metadata:
      labels:
        app: core-service
    spec:
      containers:
      - name: core-service
        image: estospaces/core-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: core-service
  namespace: estospaces
spec:
  selector:
    app: core-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: ClusterIP
```

### Step 3: CI/CD Pipeline

**GitHub Actions Workflow**:
```yaml
# .github/workflows/deploy-core-service.yml
name: Deploy Core Service

on:
  push:
    branches: [main]
    paths:
      - 'estospaces-core-service/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.23'

      - name: Run tests
        working-directory: ./estospaces-core-service
        run: go test -v ./...

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./estospaces-core-service
          push: true
          tags: estospaces/core-service:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBECONFIG }}" > kubeconfig
          export KUBECONFIG=./kubeconfig

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f kubernetes/core-service/
          kubectl rollout status deployment/core-service -n estospaces
```

---

## Step-by-Step Migration Plan

### Week 1-2: Preparation

- [ ] Set up 8 new repositories
- [ ] Create `estospaces-shared` monorepo
- [ ] Extract shared TypeScript types
- [ ] Set up CI/CD pipelines
- [ ] Set up Kubernetes cluster (dev)

### Week 3-4: Backend Foundation

- [ ] Create `estospaces-core-service` (Go)
- [ ] Implement authentication endpoints
- [ ] Implement user management endpoints
- [ ] Set up PostgreSQL database
- [ ] Run database migrations
- [ ] Deploy to dev environment

### Week 5-6: Backend Services

- [ ] Migrate properties endpoints to Go
- [ ] Create `estospaces-booking-service`
- [ ] Create `estospaces-payment-service` (Stripe)
- [ ] Create `estospaces-platform-service`
- [ ] Test all services integration

### Week 7-8: Frontend Setup

- [ ] Create `estospaces-web` (Next.js)
- [ ] Set up App Router structure
- [ ] Implement authentication pages
- [ ] Set up Zustand stores
- [ ] Set up React Query

### Week 9-10: Frontend Migration - User Dashboard

- [ ] Migrate user dashboard layouts
- [ ] Migrate property search pages
- [ ] Migrate application pages
- [ ] Migrate profile pages
- [ ] Update all API calls

### Week 11-12: Frontend Migration - Manager Dashboard

- [ ] Migrate manager dashboard layouts
- [ ] Migrate property management pages
- [ ] Migrate leads pages
- [ ] Migrate analytics pages
- [ ] Migrate fast-track pages

### Week 13-14: Frontend Migration - Admin Dashboard

- [ ] Migrate admin dashboard layouts
- [ ] Migrate verification pages
- [ ] Migrate chat/support pages
- [ ] Migrate analytics pages

### Week 15-16: Mobile App

- [ ] Create `estospaces-mobile` (React Native)
- [ ] Implement navigation
- [ ] Implement authentication
- [ ] Implement user features
- [ ] Implement manager features

### Week 17-18: Testing & Launch

- [ ] Integration testing
- [ ] E2E testing (Playwright)
- [ ] Load testing
- [ ] Security testing
- [ ] Gradual rollout with feature flags
- [ ] Monitor and fix issues
- [ ] Full cutover

---

## Code Examples

### Converting Mixed JS/TS to Pure TypeScript

**Before (JSX)**:
```jsx
// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const response = await fetch('/api/dashboard');
    const json = await response.json();
    setData(json);
  }

  return <div>{data?.title}</div>;
}
```

**After (TSX with proper types)**:
```tsx
// src/app/(user)/dashboard/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import type { DashboardData } from '@/types/dashboard';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getData,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data?.title}</div>;
}

// src/types/dashboard.ts
export interface DashboardData {
  title: string;
  stats: {
    views: number;
    applications: number;
  };
}

// src/lib/api/dashboard.ts
import { api } from './client';
import type { DashboardData } from '@/types/dashboard';

export const dashboardApi = {
  getData: () => api.get<DashboardData>('/dashboard'),
};
```

---

## Testing Strategy

### Frontend Testing

```typescript
// tests/unit/components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/stores/authStore');

describe('LoginForm', () => {
  it('should login successfully with valid credentials', async () => {
    const mockLogin = vi.fn();
    (useAuthStore as any).mockReturnValue({ login: mockLogin });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

### Backend Testing

```go
// internal/auth/service_test.go
package auth

import (
	"context"
	"testing"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	args := m.Called(ctx, email)
	return args.Get(0).(*models.User), args.Error(1)
}

func TestLogin_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo, "test-secret")

	user := &models.User{
		ID:           "123",
		Email:        "test@example.com",
		PasswordHash: "$2a$10$...", // bcrypt hash
	}

	mockRepo.On("FindByEmail", mock.Anything, "test@example.com").Return(user, nil)

	response, err := service.Login(context.Background(), &LoginRequest{
		Email:    "test@example.com",
		Password: "password123",
	})

	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.Equal(t, user.Email, response.User.Email)
	assert.NotEmpty(t, response.AccessToken)
	mockRepo.AssertExpectations(t)
}
```

---

## Conclusion

This migration from the current monolithic stack to a modern microservices architecture will provide:

✅ **Type Safety**: 100% TypeScript frontend, type-safe Go backend
✅ **Performance**: Go microservices, Next.js SSR, optimized bundle sizes
✅ **Scalability**: Independent service scaling, Kubernetes orchestration
✅ **Developer Experience**: Better tooling, faster builds, easier debugging
✅ **Maintainability**: Clear boundaries, easier to test and modify
✅ **Future-Proof**: Modern stack with strong community support

The 18-week migration plan is comprehensive and includes:
- Parallel running of old and new systems
- Feature flags for gradual rollout
- Comprehensive testing at every stage
- Zero downtime migration strategy

---

**Document Version**: 1.0
**Created**: February 6, 2026
**Status**: Ready for Implementation

---

**End of Document**
