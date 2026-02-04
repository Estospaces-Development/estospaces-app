# Estospaces Platform - Comprehensive Project Documentation

## 1. Executive Summary

**Estospaces Platform** is a state-of-the-art, comprehensive property management and real estate listing application designed to bridge the gap between property seekers (Users), property managers/brokers (Managers), and platform administrators. Built with a modern tech stack centered around **React 19**, **Vite**, and **Supabase**, it offers a seamless, high-performance experience for listing, discovering, and managing properties.

The platform facilitates the entire real estate lifecycle: from initial property discovery and virtual tours to application processing, contract management, and payment tracking.

---

## 2. System Architecture

The application follows a **Client-Server-Database** architecture, leveraging serverless technologies for scalability and performance.

### 2.1 High-Level Architecture
- **Frontend**: A Single Page Application (SPA) built with React 19 and Vite, ensuring fast load times and interactive user experiences.
- **Backend / Database**: Supabase serves as the backend-as-a-service (BaaS), providing authentication, a PostgreSQL database, real-time subscriptions, and secure API endpoints via Row Level Security (RLS).
- **Edge Functions**: (Where applicable) Used for specific server-side logic handled by Supabase functions.
- **External Integrations**:
    - **Maps**: OpenStreetMap via Leaflet for interactive property mapping.
    - **Payment Gateways**: (Placeholder structure for future Stripe/PayPal integration).

### 2.2 Tech Stack

#### Frontend Core
- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: TypeScript / JavaScript (ES6+)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **State Management**: React Context API (`AuthContext`, `PropertyContext`, `LeadContext`, etc.)

#### UI & Styling
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Complex UI transitions)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Data Visualization**: Custom components using HTML5 Canvas/SVG (Charts in Analytics).

#### Backend & Data
- **Platform**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth (Email/Password, OAuth support)
- **Storage**: Supabase Storage (Images, Documents)

#### Utilities
- **Date Handling**: `date-fns`
- **Data Export**: `xlsx` (Excel), `jspdf` (PDF generation)
- **HTTP Client**: `fetch` API / `node-fetch`

---

## 3. User Roles & Permissions

The platform uses a role-based access control (RBAC) model managed via the `profiles` table in Supabase.

| Role | Description | Key Capabilities |
| :--- | :--- | :--- |
| **User (Seeker)** | Standard user looking for properties. | • Search & Filter Properties<br>• Save Favorites<br>• Submit Applications<br>• Schedule Viewings<br>• Manage Rentals (Contracts, Payments) |
| **Manager** | Property owner, agent, or broker. | • List & Edit Properties<br>• Manage Leads & CRM<br>• Verify Applications<br>• View Analytics<br>• Handle Billing & Subscriptions |
| **Admin** | Platform administrator. | • System Oversight<br>• User/Manager Verification<br>• Platform-wide Analytics<br>• Resolve Disputes (Chat Support) |

---

## 4. Database Schema & Data Model

The data layer is built on **PostgreSQL**. Key tables include:

### 4.1 Core Tables
- **`profiles`**: Extends standard auth users.
    - `id` (UUID, PK): Links to `auth.users`.
    - `role`: 'user', 'manager', 'admin'.
    - `is_verified`: Boolean for identity verification status.
    - `full_name`, `email`, `phone`, `bio`, `company_name`.

- **`properties`**: The central entity for listings.
    - `id` (UUID, PK).
    - `title`, `description`, `price`.
    - `status`: 'online', 'offline', 'draft', 'sold', 'let', 'under_offer'.
    - `property_type`: 'rent' or 'sale'.
    - `specs`: `bedrooms`, `bathrooms`, `area_sqft`.
    - `location`: `address`, `city`, `postcode`, `latitude`, `longitude`.
    - `media`: `image_urls` (JSON array), `video_urls`.

### 4.2 Supporting Tables (Inferred)
- **`applications`**: Links Users to Properties with status (pending, approved, rejected).
- **`saved_properties`**: Wishlist functionality (User <-> Property).
- **`leads`**: CRM data for Managers (potential clients).
- **`notifications`**: System alerts for all users.
- **`contracts`**: Digital rental/sale agreements.
- **`payments`**: Transaction records.

---

## 5. Detailed Feature Documentation

### 5.1 Public / General Features
*Accessible to all visitors.*
- **Landing Page**: Immersive hero section, featured curated lists (Trending, Most Viewed), and quick search.
- **Property Discovery (`/dashboard/discover`)**:
    - **Advanced Filtering**: Price range, amenities, property type, location radius.
    - **Map View**: Interactive cluster map showing properties by location.
    - **Detail View**: High-res image gallery, virtual tour integration, comprehensive specs, and neighborhood info.
- **Authentication**: secure sign-up/login flows with email verification and password reset.

### 5.2 User Dashboard (Seeker)
*Route: `/user/dashboard`*
- **Location-Based Home**: Personalized feed based on the user's current or preferred location.
- **Applications Hub**: Track status of rental/purchase applications in real-time.
- **Saved Collection**: Manage bookmarked properties.
- **Viewings Calendar**: Schedule and manage appointments with agents.
- **Messages**: Real-time chat with Property Managers.
- **My Home**:
    - **Contracts**: View and download digital lease agreements.
    - **Payments**: Track rent/deposit payment history.
- **Overseas**: specialized section for international property seekers.

### 5.3 Manager Dashboard
*Route: `/manager/dashboard`*
- **Overview**: KPI cards (Active Listings, Total Views, Leads) and graphical analytics.
- **Property Management**:
    - **Add/Edit Wizard**: Multi-step form for creating detailed listings securely.
    - **Fast Track**: Quick listing tool for high-volume agents.
    - **Media Manager**: Upload images and link virtual tours.
- **Leads & CRM (`/manager/dashboard/leads`)**:
    - **Lead Table**: Detailed list of potential clients with scores and status.
    - **Kanban/Workflow**: Organize leads by stage (New, In Progress, Closed).
    - **Dark Mode Support**: Fully themed UI for night-time productivity.
- **Community**: **Brokers Community** forum for networking and deal-sharing.
- **Verification Center**: Submit documents for "Verified Agent" badge.
- **Billing**: Manage subscription tiers and invoice history.

### 5.4 Admin Dashboard
*Route: `/admin`*
- **Verification Queue**: Review and approve/reject Manager verification requests.
- **Global Analytics**: Platform-wide metrics (User growth, Transaction volume).
- **Support Chat**: Direct line to resolve user/manager issues.

### 5.5 UI/UX Enhancements
- **Dark Mode**: Comprehensive system-wide dark mode support, including all modals, forms, and charts.
- **Responsive Design**: Mobile-first architecture ensuring full functionality on phones and tablets.
- **Micro-interactions**: Framer Motion animations for smooth page transitions and interactive elements.
- **Toast Notifications**: Context-aware alerts for user actions (Success, Error, Info).

---

## 6. Directory Structure

```text
/src
├── assets/             # Static assets (images, fonts, global styles)
├── components/         # React Components
│   ├── Admin/          # Admin-specific components (Guards, Panels)
│   ├── auth/           # Login, Signup, Reset Password forms
│   ├── community/      # Broker community feeds and post modals
│   ├── Dashboard/      # Shared dashboard widgets (Sidebar, Header)
│   ├── layout/         # Layout wrappers (MainLayout, AuthLayout)
│   ├── manager/        # Manager-specific widgets (KPI cards, Charts)
│   ├── ui/             # Reusable UI atoms (Buttons, Modals, Inputs)
│   └── user/           # User dashboard specific widgets
├── contexts/           # Global State (Auth, Theme, Property, Lead, etc.)
├── hooks/              # Custom React Hooks (useAuth, useFetch)
├── layouts/            # Page structure layouts
├── lib/                # Third-party configurations (Supabase client)
├── pages/              # Application Routes (Views)
│   ├── manager/        # Manager pages (FastTrack, Monitoring)
│   └── [root]/         # General pages (Home, Login, Profile)
├── services/           # API Service Layer (Data fetching logic)
└── utils/              # Helper functions (Formatters, Validators)
```

---

## 7. Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**

### Step-by-Step Guide

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Estospaces/estospaces-app.git
    cd estospaces-platform
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. Use the credentials provided by your Supabase project settings.
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```

4.  **Run Development Server**
    Start both the backend server (if applicable) and frontend concurrently.
    ```bash
    npm run dev:all
    ```
    - Frontend will be available at `http://localhost:5173`.
    - Local API server (if running) will be at `http://localhost:3000`.

5.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 8. Deployment

- **Frontend**: Optimized for deployment on **Vercel**, **Netlify**, or any static site host compatible with Vite.
- **Database**: Hosted on **Supabase** (Managed PostgreSQL).
- **CI/CD**: (Recommended) GitHub Actions for automated testing and deployment pipelines.

---

## 9. Contact & Support

For technical support or feature requests, please contact the development team or open an issue in the project repository.

**License**: MIT License
