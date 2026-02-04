# Estospaces Platform - Tech Stack Quick Reference

## 🚀 Quick Overview

**Estospaces** is a property management platform built with modern web technologies, featuring real-time updates, role-based access control, and comprehensive property management capabilities.

---

## 📦 Core Technologies

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript 5.0.2** - Type safety
- **Vite 5.4.10** - Build tool & dev server
- **React Router DOM 7.9.6** - Routing

### Styling
- **Tailwind CSS 3.4.15** - Utility-first CSS
- **Framer Motion 12.24.7** - Animations
- **Lucide React 0.554.0** - Icons

### Backend
- **Supabase 2.89.0** - BaaS (Auth, Database, Storage, Realtime)
- **PostgreSQL** - Database (via Supabase)
- **Express.js 4.22.1** - API server

### Maps & Location
- **Leaflet 1.9.4** - Interactive maps
- **React Leaflet 4.2.1** - React bindings
- **Postcodes.io** - UK postcode validation

### Utilities
- **date-fns 4.1.0** - Date manipulation
- **uuid 13.0.0** - Unique IDs
- **jsPDF 3.0.4** - PDF generation
- **xlsx 0.18.5** - Excel export

---

## 🏗️ Architecture Pattern

```
Client (React) → Supabase (Backend) → PostgreSQL (Database)
     ↓                ↓                      ↓
  Contexts      Real-time Subscriptions   RLS Policies
  Services      Auth API                  Data Storage
  Components    Storage API
```

---

## 📁 Key Directories

```
src/
├── components/     # UI components
├── contexts/       # State management (Context API)
├── pages/          # Page components
├── services/       # API & business logic
├── hooks/          # Custom React hooks
├── layouts/         # Layout wrappers
└── utils/           # Utility functions
```

---

## 🔐 Authentication Flow

1. User logs in via Supabase Auth (OAuth or Email/Password)
2. JWT token stored in localStorage
3. AuthContext manages session state
4. Protected routes check authentication
5. Role-based access control (User/Manager/Admin)

---

## 🗄️ Database Tables

- `profiles` - User profiles
- `properties` - Property listings
- `applied_properties` - Applications
- `viewings` - Appointments
- `notifications` - In-app notifications
- `messages` - Chat messages
- `saved_properties` - Favorites

---

## 🔄 State Management

**Context API** for global state:
- AuthContext
- ApplicationsContext
- PropertyContext
- NotificationsContext
- ToastContext
- MessagesContext
- ThemeContext

---

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Theme**: Light/Dark mode (class-based)
- **Primary Color**: `#FF6B35` (Orange)
- **Typography**: Inter (User), Arial (Manager)

---

## ⚡ Real-time Features

- Supabase Realtime subscriptions
- Live notifications
- Real-time chat
- Instant status updates

---

## 🛣️ Route Structure

```
/                          # Landing
/auth/login               # Login
/manager/dashboard/*      # Manager routes
/user/dashboard/*         # User routes
/admin/*                  # Admin routes
```

---

## 🔧 Development Commands

```bash
npm run dev          # Start dev server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run preview       # Preview production build
```

---

## 📝 Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔗 Key Services

- `authService.ts` - Authentication
- `propertiesService.js` - Property operations
- `applicationsService.js` - Application management
- `notificationsService.ts` - Notifications
- `analyticsService.js` - Analytics

---

## 📚 Documentation

- Full Architecture: `ARCHITECTURE.md`
- API Documentation: Check service files
- Component Documentation: Inline comments

---

**Last Updated**: January 2025
