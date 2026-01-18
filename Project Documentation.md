# Estospaces Platform - Project Documentation

## Project Overview
Estospaces Platform is a modern, comprehensive property management and real estate listing application. It serves multiple user roles including standard users (property seekers), managers (property listers), and administrators, facilitating the entire lifecycle of property management from listing and discovery to viewing arrangements and contract management.

## Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (v19) with [Vite](https://vitejs.dev/)
- **Language**: TypeScript / JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **Maps**: [Leaflet](https://leafletjs.com/) with [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API

### Backend & Database
- **Primary Backend**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: RESTful API endpoints served via Express

### Utilities & Tools
- **Date Handling**: date-fns
- **Data Export**: xlsx, jspdf
- **Linting**: ESLint

## Features

### Public / General
- **Landing Page**: Modern hero section, featured properties (`Home.jsx`).
- **Property Discovery**: Advanced search and filtering (`PropertySearch.tsx`), detailed property views (`PropertyDetail.jsx`, `PropertyView.tsx`).
- **Information**: About Us, Contact, FAQ, Help & Support.
- **Legal**: Privacy Policy, Terms & Conditions, Cookie Policy.

### User Dashboard (Property Seekers)
- **Overview**: Personalized dashboard with recent activity (`Dashboard.tsx`).
- **Applications**: Track property applications (`DashboardApplications.jsx`).
- **Saved Properties**: Manage wishlist (`DashboardSaved.jsx`).
- **Viewings**: Schedule and manage property viewings (`DashboardViewings.jsx`).
- **Messages**: Internal messaging system (`DashboardMessages.jsx`).
- **Contracts**: View and manage rental/sale contracts (`DashboardContracts.jsx`).
- **Payments**: Payment history and management (`DashboardPayments.jsx`).
- **Analytics**: Personal activity insights (`UserAnalytics.jsx`).
- **Profile & Settings**: Manage account details and preferences.

### Manager / Admin Dashboard
- **Property Management**: Add, edit, and list properties (`AddProperty.tsx`, `AdminPropertyManagement.jsx`).
- **Lead Management**: CRM features for managing leads and clients (`LeadsClients.tsx`).
- **Verification**: User and property verification workflows (`AdminVerificationDashboard.tsx`).
- **Analytics**: Platform-wide performance metrics (`Analytics.tsx`).
- **Chat Support**: Admin interaction with users (`AdminChatDashboard.jsx`).
- **Billing**: Platform billing and subscription management (`Billing.tsx`).
- **Appointments**: Calendar management for viewings and meetings (`Appointment.tsx`).

## Authentication & Authorization
Authentication is handled by **Supabase Auth** and managed via `AuthContext`.
- **Flow**: Users sign up/login via email or OAuth providers.
- **Roles**: Access is controlled via user roles (e.g., `user`, `manager`, `admin`) stored in the user profile.
- **Context**: `AuthContext` provides global access to the current `session`, `user` object, and helper methods like `getRole()`.

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd estospaces-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory (refer to `.env.example`) and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

## Running the Project

### Development
To run both the backend server and frontend concurrently:
```bash
npm run dev:all
# Frontend runs on local Vite port (usually 5173)
# Backend runs on configured port (usually 3000/5000)
```

To run them individually:
- **Frontend**: `npm run dev`
- **Backend**: `npm run server`

### Production
For production environments (Windows/PowerShell):
```bash
npm run start:prod
```

### Health Check
Run a system health check:
```bash
npm run health
```

## Directory Structure

```
/src
  /assets         # Static assets (images, fonts)
  /components     # Reusable UI components
  /contexts       # React Context providers (Auth, Theme, etc.)
  /hooks          # Custom React hooks
  /layouts        # Page layout wrappers
  /lib            # Third-party library configurations (Supabase, etc.)
  /pages          # Application routes/views
  /services       # API service layers
  /utils          # Helper functions
  App.tsx         # Main application component
  main.tsx        # Entry point
/server.js        # Express backend server entry
```

## API Usage
The project utilizes a custom Express server alongside Supabase Client queries.

**Base URL**: `/api`

### Key Endpoints
- `GET /api/properties`: Fetch properties with filtering (page, limit, country, city, type, price, etc.).
- `GET /api/properties/sections`: Fetch grouped properties for dashboard sections (most_viewed, trending, etc.).

## Known Issues
- No critical issues currently documented in `error.txt`.
- Ensure Supabase credentials are correctly set to avoid connection errors.

## TODOs
- Complete comprehensive test coverage.
- Further optimize bulk property loading.
- Enhance role-based routing security headers in the backend.

## License
MIT License
