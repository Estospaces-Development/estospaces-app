# EstoSpaces Tech Stack Migration - Execution Guide

## Executive Summary

This document provides a **practical, step-by-step guide** to migrate EstoSpaces from the current monolithic tech stack to a modern microservices architecture. This guide focuses on **HOW** to execute the migration with minimal disruption.

**Current Stack**: React + Express (JavaScript) + Supabase
**Target Stack**: Next.js + Go microservices + GCP (Cloud SQL, GKE)

**Migration Approach**: Incremental, parallel-running strategy with zero downtime

---

## Table of Contents

1. [Migration Philosophy](#migration-philosophy)
2. [Migration Strategies Compared](#migration-strategies-compared)
3. [Recommended Approach: Strangler Fig Pattern](#recommended-approach-strangler-fig-pattern)
4. [Phase-by-Phase Migration Plan](#phase-by-phase-migration-plan)
5. [Backend Migration: Express → Go](#backend-migration-express--go)
6. [Frontend Migration: React → Next.js](#frontend-migration-react--nextjs)
7. [Database Migration: Supabase → Cloud SQL](#database-migration-supabase--cloud-sql)
8. [Running Systems in Parallel](#running-systems-in-parallel)
9. [Traffic Migration Strategy](#traffic-migration-strategy)
10. [Testing During Migration](#testing-during-migration)
11. [Rollback Plans](#rollback-plans)
12. [Migration Checklist](#migration-checklist)

---

## Migration Philosophy

### Core Principles

1. **Zero Downtime**: Users should never experience service interruption
2. **Incremental**: Migrate piece by piece, not all at once
3. **Reversible**: Every step should be reversible
4. **Data Integrity**: No data loss during migration
5. **Parallel Running**: Run old and new systems side by side
6. **Feature Flags**: Toggle between old and new implementations
7. **Monitor Everything**: Track metrics at every step

### Success Criteria

✅ **No user-facing bugs** introduced during migration
✅ **Performance maintained or improved** throughout
✅ **Data consistency** between old and new systems
✅ **Ability to rollback** at any point
✅ **Team velocity maintained** (not blocked by migration)

---

## Migration Strategies Compared

### Option 1: Big Bang Migration ❌

**Approach**: Switch everything at once

```
Old System (100%) → [Weekend Migration] → New System (100%)
```

**Pros**:
- Fastest completion time
- No complex parallel running

**Cons**:
- ❌ High risk of catastrophic failure
- ❌ No rollback possible once started
- ❌ Requires long downtime
- ❌ Testing only happens in production

**Verdict**: **NOT RECOMMENDED** for EstoSpaces

---

### Option 2: Parallel Running (Dual Write) ⚠️

**Approach**: Write to both systems, read from old

```
Requests → Old System (read/write)
        → New System (write only, dark launch)
```

**Pros**:
- Lower risk
- Can test new system with real data
- Easy rollback

**Cons**:
- ⚠️ Complex to maintain consistency
- ⚠️ Double infrastructure cost
- ⚠️ Risk of data drift

**Verdict**: **ACCEPTABLE** but requires careful planning

---

### Option 3: Strangler Fig Pattern ✅

**Approach**: Gradually replace old system piece by piece

```
Day 1:  [Old 100%]
Week 1: [Old 90%, New 10%] (Auth migrated)
Week 3: [Old 70%, New 30%] (Auth + Properties)
Week 5: [Old 30%, New 70%] (Most features)
Week 8: [Old 0%, New 100%] (Complete)
```

**Pros**:
- ✅ Lowest risk
- ✅ Continuous rollback possible
- ✅ Real production testing
- ✅ Team learns as they go

**Cons**:
- Takes longer
- Requires routing logic

**Verdict**: **RECOMMENDED** for EstoSpaces

---

## Recommended Approach: Strangler Fig Pattern

### Overview

Named after the strangler fig tree that gradually grows around and replaces its host tree, this pattern involves:

1. **Create new system alongside old**
2. **Route specific features to new system**
3. **Gradually increase traffic to new system**
4. **Decommission old system piece by piece**

### Architecture During Migration

```
┌─────────────────────────────────────────────────────┐
│                    Load Balancer                    │
│              (Traffic Routing Logic)                │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│  OLD SYSTEM  │        │  NEW SYSTEM  │
│              │        │              │
│ Express API  │◄─────► │   Go APIs    │
│ (Node.js)    │  Sync  │ (Microservices)│
│              │        │              │
└──────┬───────┘        └──────┬───────┘
       │                       │
       ▼                       ▼
┌──────────────┐        ┌──────────────┐
│   Supabase   │◄─────► │  Cloud SQL   │
│  PostgreSQL  │  Sync  │  PostgreSQL  │
└──────────────┘        └──────────────┘
```

### Feature-by-Feature Migration (8 Weeks)

**Week 1**: Infrastructure Setup
- Deploy GKE cluster
- Set up Cloud SQL
- Deploy API Gateway with routing rules

**Week 2-3**: Authentication Migration
- Build Go auth service
- Deploy alongside Express
- Route `/auth/*` to Go service
- Keep user sessions compatible

**Week 4**: Properties Service
- Build Go properties service
- Migrate property CRUD endpoints
- Route `/api/properties/*` to Go

**Week 5-6**: Remaining Backend Services
- Migrate booking, payment, platform services
- Gradually shift traffic

**Week 7**: Frontend Migration
- Deploy Next.js alongside React
- Migrate key pages

**Week 8**: Final Testing & Decommission
- Complete traffic migration
- Decommission old system

---

## Phase-by-Phase Migration Plan

### Phase 0: Preparation (Week 1)

#### Infrastructure Setup

**1. Set up GCP Project**

```bash
# Create GCP project
gcloud projects create estospaces-prod --name="EstoSpaces Production"
gcloud config set project estospaces-prod

# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

**2. Create GKE Cluster**

```bash
# Create GKE cluster
gcloud container clusters create estospaces-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=e2-standard-2 \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=10

# Get credentials
gcloud container clusters get-credentials estospaces-cluster --zone=us-central1-a
```

**3. Set up Cloud SQL**

```bash
# Create Cloud SQL instance
gcloud sql instances create estospaces-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --backup \
  --backup-start-time=03:00

# Create database
gcloud sql databases create estospaces --instance=estospaces-db

# Create user
gcloud sql users create estospaces-user \
  --instance=estospaces-db \
  --password=[SECURE_PASSWORD]
```

**4. Set up Routing/API Gateway**

Deploy Kong or Traefik as API Gateway with routing rules:

```yaml
# kong-routing.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kong-routing
data:
  routing.conf: |
    # Old system (default)
    location / {
      proxy_pass http://old-express-service;
    }

    # New auth service (migrate first)
    location /api/v2/auth {
      proxy_pass http://auth-service;
    }

    # Gradually add more routes...
```

---

### Phase 1: Backend Migration (Week 2-6)

#### Step 1: Migrate Authentication Service

**Current: Express + Supabase Auth**

```javascript
// server.js (Current - Express)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({ user: data.user, session: data.session });
});
```

**New: Go + Custom JWT**

**1. Create Go project structure**

```bash
mkdir -p estospaces-auth-service/{cmd/server,internal/{auth,middleware,models},pkg}
cd estospaces-auth-service
go mod init github.com/estospaces/auth-service
```

**2. Implement authentication in Go**

```go
// internal/auth/service.go
package auth

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Service struct {
	db        *gorm.DB
	jwtSecret []byte
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	User  User   `json:"user"`
	Token string `json:"token"`
}

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

func NewService(db *gorm.DB, jwtSecret string) *Service {
	return &Service{
		db:        db,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *Service) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	// Find user by email
	var user struct {
		ID           string
		Email        string
		PasswordHash string
		Role         string
		CreatedAt    time.Time
	}

	err := s.db.WithContext(ctx).
		Table("users").
		Where("email = ?", req.Email).
		First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(req.Password),
	)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := s.generateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		User: User{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
		},
		Token: token,
	}, nil
}

func (s *Service) generateToken(userID, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}
```

**3. Create HTTP handlers**

```go
// internal/auth/handler.go
package auth

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	// (use validator library)

	resp, err := h.service.Login(c.Context(), &req)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(resp)
}

func (h *Handler) Register(c *fiber.Ctx) error {
	// Similar implementation
	return c.JSON(fiber.Map{"status": "not implemented"})
}
```

**4. Wire everything together**

```go
// cmd/server/main.go
package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/estospaces/auth-service/internal/auth"
)

func main() {
	// Connect to Cloud SQL
	dsn := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize services
	jwtSecret := os.Getenv("JWT_SECRET")
	authService := auth.NewService(db, jwtSecret)
	authHandler := auth.NewHandler(authService)

	// Create Fiber app
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: os.Getenv("ALLOWED_ORIGINS"),
	}))

	// Routes
	api := app.Group("/api/v2")
	api.Post("/auth/login", authHandler.Login)
	api.Post("/auth/register", authHandler.Register)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Fatal(app.Listen(":" + port))
}
```

**5. Deploy to GKE**

```dockerfile
# Dockerfile
FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o server ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

```bash
# Build and push
docker build -t gcr.io/estospaces-prod/auth-service:v1.0.0 .
docker push gcr.io/estospaces-prod/auth-service:v1.0.0
```

```yaml
# kubernetes/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: gcr.io/estospaces-prod/auth-service:v1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
spec:
  selector:
    app: auth-service
  ports:
  - port: 80
    targetPort: 8080
```

```bash
# Deploy
kubectl apply -f kubernetes/auth-service.yaml
```

**6. Update API Gateway Routing**

```yaml
# Route /api/v2/auth/* to new Go service
# Keep /api/auth/* to old Express service (for now)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: api.estospaces.com
    http:
      paths:
      # New Go auth service
      - path: /api/v2/auth(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 80
      # Old Express service (fallback)
      - path: /
        pathType: Prefix
        backend:
          service:
            name: old-express-service
            port:
              number: 3002
```

**7. Frontend Update - Feature Flag**

```typescript
// lib/api/config.ts
export const API_CONFIG = {
  // Feature flag: use new auth service
  useNewAuth: process.env.NEXT_PUBLIC_USE_NEW_AUTH === 'true',

  authBaseUrl: process.env.NEXT_PUBLIC_USE_NEW_AUTH === 'true'
    ? 'https://api.estospaces.com/api/v2/auth'
    : 'https://api.estospaces.com/api/auth',
};

// lib/api/auth.ts
export async function login(email: string, password: string) {
  const response = await fetch(`${API_CONFIG.authBaseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}
```

**8. Test New Service**

```bash
# Test new auth service
curl -X POST https://api.estospaces.com/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected response:
# {
#   "user": {"id": "...", "email": "test@example.com", "role": "user"},
#   "token": "eyJhbGc..."
# }
```

**9. Gradual Traffic Migration**

Week 1: 10% traffic to new service
Week 2: 25% traffic
Week 3: 50% traffic
Week 4: 100% traffic

**10. Decommission Old Auth**

Once 100% traffic is on new service for 2 weeks:
- Remove old Express auth endpoints
- Remove Supabase Auth dependency
- Update documentation

---

#### Step 2: Migrate Properties Service

Follow similar pattern:

**1. Build Go service**

```go
// internal/properties/service.go
type Service struct {
	db *gorm.DB
}

func (s *Service) GetAll(ctx context.Context, filters PropertyFilters) ([]Property, error) {
	var properties []Property

	query := s.db.WithContext(ctx).Model(&Property{})

	if filters.City != "" {
		query = query.Where("city = ?", filters.City)
	}

	if filters.MinPrice > 0 {
		query = query.Where("price >= ?", filters.MinPrice)
	}

	if filters.MaxPrice > 0 {
		query = query.Where("price <= ?", filters.MaxPrice)
	}

	err := query.Find(&properties).Error
	return properties, err
}
```

**2. Deploy alongside old system**

**3. Route `/api/v2/properties/*` to new service**

**4. Test thoroughly**

**5. Migrate traffic gradually**

**6. Decommission old properties endpoints**

---

### Phase 2: Frontend Migration (Week 7)

#### Parallel Frontend Deployment

**Strategy**: Deploy Next.js alongside React app, migrate pages one by one

**1. Set up Next.js project**

```bash
npx create-next-app@latest estospaces-web --typescript --tailwind --app
```

**2. Deploy to GKE**

```yaml
# kubernetes/nextjs-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nextjs-app
  template:
    metadata:
      labels:
        app: nextjs-app
    spec:
      containers:
      - name: nextjs
        image: gcr.io/estospaces-prod/nextjs-app:latest
        ports:
        - containerPort: 3000
```

**3. Route specific pages to Next.js**

```yaml
# Ingress routing
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  rules:
  - host: estospaces.com
    http:
      paths:
      # New Next.js pages
      - path: /properties
        backend:
          service:
            name: nextjs-app
            port:
              number: 3000
      # Old React app (fallback)
      - path: /
        backend:
          service:
            name: react-app
            port:
              number: 80
```

**4. Migrate pages incrementally (Week 7)**

Day 1-2: Property listing page
Day 3: Property detail page
Day 4-5: User dashboard
Day 6-7: Manager dashboard

**5. Update DNS when complete**

---

### Phase 3: Database Migration (Week 1-6, Parallel to Backend Migration)

#### Data Synchronization Strategy

**Option A: Real-time Sync (Recommended)**

```go
// Dual-write pattern
func (s *Service) CreateProperty(ctx context.Context, prop *Property) error {
	// Write to Cloud SQL (new)
	err := s.newDB.Create(prop).Error
	if err != nil {
		return err
	}

	// Also write to Supabase (old) - temporary
	go func() {
		_ = s.oldSupabaseClient.From("properties").Insert(prop).Execute()
	}()

	return nil
}
```

**Option B: Batch Sync**

```bash
# Run nightly sync job
kubectl create job --from=cronjob/db-sync db-sync-manual
```

**Migration Steps**:

1. **Export from Supabase**

```bash
# Export schema
pg_dump -h db.yydtsteyknbpfpxjtlxe.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  > supabase_schema.sql

# Export data
pg_dump -h db.yydtsteyknbpfpxjtlxe.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  > supabase_data.sql
```

2. **Import to Cloud SQL**

```bash
# Connect via Cloud SQL Proxy
cloud_sql_proxy -instances=estospaces-prod:us-central1:estospaces-db=tcp:5432

# Import
psql -h localhost -U estospaces-user -d estospaces < supabase_schema.sql
psql -h localhost -U estospaces-user -d estospaces < supabase_data.sql
```

3. **Verify data integrity**

```sql
-- Compare row counts
SELECT 'supabase' as source, COUNT(*) FROM properties_old
UNION ALL
SELECT 'cloud_sql', COUNT(*) FROM properties;

-- Check for differences
SELECT * FROM properties_old
EXCEPT
SELECT * FROM properties;
```

---

## Running Systems in Parallel

### Infrastructure During Migration

```
┌──────────────────────────────────────────────┐
│          Cloud Load Balancer                 │
│         (Traffic Distribution)               │
└────────────┬─────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌──────────┐
│   Old   │      │   New    │
│ System  │      │ System   │
│         │      │          │
│ Express │      │   Go     │
│ Node.js │      │Services  │
│         │      │          │
└────┬────┘      └────┬─────┘
     │                │
     ▼                ▼
┌─────────┐      ┌──────────┐
│Supabase │◄────►│Cloud SQL │
│   DB    │ Sync │    DB    │
└─────────┘      └──────────┘
```

### Cost During Migration

**Month 1-2**: Double infrastructure
- Old system: $X
- New system: $Y
- Total: $X + $Y

**Month 3**: Decommission old system
- New system only: $Y

---

## Traffic Migration Strategy

### Gradual Rollout Plan

**Week 1: 10% traffic**
```
90% users → Old system
10% users → New system (canary users)
```

**Week 2: 25% traffic**
```
75% users → Old system
25% users → New system
```

**Week 3: 50% traffic**
```
50% users → Old system
50% users → New system
```

**Week 4: 100% traffic**
```
0% users → Old system (standby)
100% users → New system
```

### Implementation with Feature Flags

```typescript
// Feature flag service
export async function getFeatureFlags(userId: string) {
  const hash = hashUserId(userId);
  const rolloutPercentage = 25; // 25% traffic

  return {
    useNewAuthService: hash % 100 < rolloutPercentage,
    useNewPropertiesService: hash % 100 < rolloutPercentage,
  };
}
```

### Monitoring During Rollout

```yaml
# Prometheus alerts
- alert: HighErrorRateNewService
  expr: rate(http_requests_total{service="new",status=~"5.."}[5m]) > 0.05
  annotations:
    summary: "High error rate in new service"

- alert: LatencyIncrease
  expr: http_request_duration_seconds{service="new",quantile="0.95"} > 2
  annotations:
    summary: "Latency increased in new service"
```

---

## Testing During Migration

### Testing Strategy

**1. Unit Tests**
```go
// internal/auth/service_test.go
func TestLogin_Success(t *testing.T) {
	// Test new Go service
}
```

**2. Integration Tests**
```bash
# Test old and new systems produce same results
./test_parity.sh
```

**3. End-to-End Tests**
```typescript
// e2e/auth.spec.ts
test('login works on both systems', async () => {
  // Test old system
  const oldResult = await loginOld('test@example.com', 'password');

  // Test new system
  const newResult = await loginNew('test@example.com', 'password');

  // Verify same behavior
  expect(newResult.user.id).toBe(oldResult.user.id);
});
```

**4. Load Testing**
```bash
# Load test new system
k6 run load-test.js --vus 100 --duration 30s
```

**5. Shadow Testing**
```
User Request → Old System (serves response)
            → New System (logs only, doesn't serve)

Compare responses offline
```

---

## Rollback Plans

### Rollback Triggers

Rollback if:
- ❌ Error rate > 5%
- ❌ P95 latency > 2x baseline
- ❌ Data inconsistencies detected
- ❌ Critical bug found

### Rollback Procedures

**Level 1: Traffic Rollback (5 minutes)**

```bash
# Revert traffic to old system
kubectl patch ingress api-ingress --type=json -p='[
  {"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/name", "value": "old-express-service"}
]'
```

**Level 2: Code Rollback (15 minutes)**

```bash
# Rollback deployment
kubectl rollout undo deployment/auth-service

# Verify
kubectl rollout status deployment/auth-service
```

**Level 3: Data Rollback (30 minutes)**

```bash
# Restore from backup
gcloud sql backups restore [BACKUP_ID] \
  --instance=estospaces-db \
  --backup-instance=estospaces-db
```

---

## Migration Checklist

### Pre-Migration

- [ ] GCP project created and configured
- [ ] GKE cluster deployed and tested
- [ ] Cloud SQL instance created and tested
- [ ] Database migration tested in staging
- [ ] All team members trained on new stack
- [ ] Monitoring and alerting set up
- [ ] Rollback procedures documented and tested

### Per-Service Migration

- [ ] Go service developed and tested
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Deployed to staging
- [ ] E2E tests passing in staging
- [ ] Load tested
- [ ] Security scanned
- [ ] Deployed to production
- [ ] Routing configured
- [ ] 10% traffic migrated
- [ ] Monitoring for 48 hours
- [ ] 25% traffic migrated
- [ ] Monitoring for 48 hours
- [ ] 50% traffic migrated
- [ ] Monitoring for 48 hours
- [ ] 100% traffic migrated
- [ ] Old service decommissioned

### Post-Migration

- [ ] All services migrated
- [ ] Old system fully decommissioned
- [ ] Supabase subscription cancelled
- [ ] Documentation updated
- [ ] Team retrospective completed
- [ ] Celebrate! 🎉

---

## Timeline Summary

### 8-Week Migration Plan (2 Months)

```
Week 1:    Infrastructure setup (GKE, Cloud SQL, API Gateway)
Week 2-3:  Auth service migration (Go service, gradual traffic rollout)
Week 4:    Properties service migration (Go service, CRUD endpoints)
Week 5:    Booking + Payment services migration
Week 6:    Platform service + remaining backend APIs
Week 7:    Frontend migration (Next.js deployment, page migration)
Week 8:    Final testing, traffic cutover, decommission old system
```

### Daily Breakdown for Critical Weeks

**Week 1 (Infrastructure)**:
- Day 1-2: GCP project setup, enable APIs
- Day 3-4: GKE cluster creation, Cloud SQL setup
- Day 5: API Gateway deployment, routing rules
- Day 6-7: Testing and verification

**Week 2-3 (Auth Service)**:
- Week 2 Day 1-3: Build Go auth service
- Week 2 Day 4-5: Deploy to GKE, integration testing
- Week 2 Day 6-7: 10% traffic rollout
- Week 3 Day 1-2: Monitor, 25% traffic
- Week 3 Day 3-4: 50% traffic
- Week 3 Day 5-7: 100% traffic, monitoring

**Week 8 (Final Migration)**:
- Day 1-2: Complete traffic cutover (100% to new system)
- Day 3-4: Monitor and stabilize
- Day 5-6: Decommission old Express server
- Day 7: Post-migration review, documentation

---

## Key Success Factors

1. **Team Buy-in**: Everyone understands why and how
2. **Incremental Approach**: Small, reversible changes
3. **Monitoring**: Know immediately when something breaks
4. **Communication**: Daily standups during migration
5. **Discipline**: Follow the plan, don't skip steps
6. **Patience**: Don't rush, test thoroughly

---

## Common Pitfalls to Avoid

❌ **Skipping staging environment**
❌ **Not testing rollback procedures**
❌ **Migrating too much at once**
❌ **Ignoring monitoring alerts**
❌ **Not having database backups**
❌ **Assuming parity without testing**
❌ **Forgetting to update documentation**

---

## Resources & Tools

### Migration Tools

- **Database**: pgloader, AWS DMS
- **Traffic Management**: Kong, Traefik, Nginx
- **Feature Flags**: LaunchDarkly, Unleash, custom
- **Monitoring**: Prometheus, Grafana, Cloud Monitoring
- **Load Testing**: k6, Apache JMeter, Gatling

### Documentation Templates

- Migration runbook
- Rollback procedures
- Incident response plan
- Post-migration report

---

## Conclusion

Migrating EstoSpaces from a monolithic architecture to microservices is a significant undertaking, but by following the **Strangler Fig pattern** and migrating incrementally, you can:

✅ **Minimize risk** through gradual rollout
✅ **Maintain service quality** with zero downtime
✅ **Learn and adapt** as you go
✅ **Rollback easily** if issues arise
✅ **Keep team velocity** high throughout

The key is **patience and discipline**: migrate one service at a time, test thoroughly, monitor constantly, and don't rush the process.

---

**Document Version**: 1.0
**Created**: February 6, 2026
**Status**: Ready for Execution

---

**End of Document**
