# Estospaces - Property Management Platform

A comprehensive property management platform built with React, TypeScript, and Tailwind CSS. This platform provides both manager and user dashboards for complete property management workflows.

## 🌟 Features

### Manager Dashboard

A comprehensive property management dashboard for property managers with tools to manage properties, leads, applications, appointments, analytics, billing, and more.

#### Dashboard Features

- **Main Dashboard**
  - Welcome banner with summary statistics
  - KPI cards displaying key metrics (Revenue, Listings, Views, Conversion Rate)
  - Tab-based navigation (Overview, Properties, Leads, Applications, Analytics)
  - Recent activity feed with map visualization
  - Top performing properties section
  - Property management grid with search and filters

- **Properties Management**
  - Add new properties with multi-step form
  - Edit and delete properties
  - Property viewing with detailed information
  - Image and video upload support (base64 conversion)
  - Search and filter functionality
  - Status management (Available, Pending, Sold/Rented)

- **Leads & Clients**
  - Lead management with status tracking
  - Add new leads with property selection
  - Lead overview table with contact information
  - Lead scoring and budget tracking
  - Email and phone contact options

- **Applications**
  - Application management system
  - Status tracking (Approved, Pending, Rejected)
  - Approve/reject functionality
  - Application history
  - Search and filter options
  - Email and messaging integration

- **Analytics**
  - Monthly revenue trends with bar charts and detailed breakdown
  - Property performance metrics and comparison charts
  - Lead analytics with pie charts and key metrics
  - Monthly applications line chart
  - **Future Property Rate Analysis & Predictions**
    - Property rate predictions for next 1-2 months
    - Current vs predicted rates comparison
    - Trend indicators (increasing/decreasing)
    - Summary cards for properties increasing/decreasing
    - Average rate increase calculations
    - Property-specific recommendations for estate agents
    - Rate prediction trend visualization
    - Agent recommendations panel with actionable insights

- **Appointments**
  - Calendar view for scheduling
  - Add new appointments
  - Appointment management

- **Billing & Payments**
  - Revenue overview with summary cards
  - Invoice management table
  - Payment status tracking
  - Dark theme support with proper text visibility

- **Messages**
  - Messaging interface
  - Communication management

- **Profile**
  - User profile management
  - Verification system (Email and Phone)
  - Account settings

- **Help & Support**
  - Help resources and documentation

### User Dashboard

A modern, responsive property search and management dashboard for property seekers and tenants.

#### User Features

- **Property Discovery**
  - Browse and search properties with advanced filtering
  - Buy/Rent tabs with real-time property filtering from Supabase
  - Smart search by postcode, street, address, keyword, or title
  - Filter by location, property type, price range, beds, and baths
  - Residential and commercial property categories
  - New homes filter (properties listed in last 30 days)
  - Interactive map showing nearby properties
  - Property detail pages with market insights and analytics
  - Grid and map view toggle

- **Quick Action CTAs**
  - Buy Property - Browse homes for sale
  - Rent Property - Explore rental options
  - Saved Properties - View all saved properties with count
  - My Applications - Track application progress

- **Property Management**
  - Saved/favorited properties with real-time sync
  - Property applications tracking with modern card design
  - New Application modal with multi-step form (Property Selection → Personal Details → Review)
  - Stat cards (Total, Pending, Approved, Action Required)
  - Scheduled viewings management with Supabase integration
  - Schedule viewing directly from property detail page
  - Cancel/manage viewings with status tracking (Pending, Confirmed, Cancelled, Completed)
  - Property reviews

- **User Profile**
  - Profile photo upload with camera overlay
  - Personal information with keyboard navigation (Enter to next field)
  - UK postcode auto-detection with address suggestions
  - Address auto-fill from postcode lookup
  - Document uploads (ID, Proof of Address, Employment Proof)
  - User verification steps (Email, Phone, Identity, Address)

- **Communication**
  - Real-time messaging with brokers/agencies
  - Notifications for property updates

- **Financial Management**
  - Digital contracts with e-signature functionality
  - Payment management (rent, utilities)
  - Payment history tracking
  - Stripe integration ready

- **User Experience**
  - AI Assistant (Lakshmi) for property search and navigation help
  - Welcome animation for first-time users
  - Modern hero section with family-in-front-of-house background
  - Smooth navigation animations and page transitions
  - Dark mode theme support
  - Responsive horizontal navigation
  - Smart "Back" navigation for policy pages

### 📄 Legal & Support Pages

- **Privacy Policy** - Comprehensive data protection information
- **Cookie Policy** - Cookie usage and management details
- **Terms & Conditions** - Service terms and user agreements
- **Contact Us** - Interactive contact form with validation
- **FAQ** - Searchable FAQ with category filters and accordion answers

All pages feature smart navigation that returns users to their previous location (dashboard or landing page).

### 🎨 UI/UX Features

- **Dark Theme Implementation**
  - Deep black dark theme (#000000) for optimal visual experience
  - Full dark mode support across all components and pages
  - Theme switcher in header with Light and Dark options
  - Theme preference saved in localStorage for persistence

- **Typography System**
  - Inter font family for modern, readable UI
  - Consistent font sizes across all components
  - Optimized letter-spacing and line-height for readability
  - Page/Dashboard Titles: 30px (Manager) / 20px (User), Bold (700/600)
  - Section/Card Headings: 19px (Manager) / 18px (User), Semi-bold (600)
  - Body Text: 15px (Manager) / 14px (User), Regular (400)
  - Captions/Timestamps: 12px, Regular (400)

- **Modern Design**
  - Orange theme (#FF6B35) for consistent branding
  - Responsive grid layouts
  - Adaptive typography
  - Mobile-friendly navigation
  - Smooth animations and transitions
  - CSS animations (fadeIn, slideUp, slideDown, scaleIn)
  - Hover effects with lift and shadow transitions
  - Color-coded property type badges

- **Polished Components**
  - Property cards with rounded corners and hover effects
  - Application cards with modern horizontal layout
  - Stat cards with visual indicators
  - Error/notification banners with slide-down animations
  - Loading skeletons for better perceived performance

### 🤖 AI Features

- **Lakshmi Chatbot**
  - AI-powered assistant ("Ask Lakshmi")
  - Voice recognition support
  - Smart responses about properties, dashboard insights, and analytics
  - Navigation commands (e.g., "take me to the application")
  - Available on all dashboard pages

### 🔧 Technical Implementation

- **Framework & Libraries**
  - React 18/19 with TypeScript
  - React Router for navigation
  - Tailwind CSS for styling
  - Lucide React for icons
  - Vite for build tooling
  - Framer Motion for animations
  - Leaflet.js and React-Leaflet for interactive maps
  - Web Speech API for voice recognition in chatbot

- **Backend Services**
  - Supabase for authentication, database, and real-time subscriptions
  - Express.js API server for property listings
  - Postcodes.io API for UK postcode validation
  - OpenStreetMap Nominatim API for address lookup

- **State Management**
  - React Context API for global state
  - PropertyContext for property data management
  - LeadContext for lead data management
  - ThemeContext for theme management
  - SavedPropertiesContext for user saved properties
  - PropertyFilterContext for Buy/Rent filtering
  - ApplicationsContext for user applications
  - LocationContext for geolocation features
  - AuthContext for authentication state
  - localStorage for data persistence

- **Components**
  - Reusable UI components
  - Layout components (Sidebar for Manager, Horizontal Navigation for User, Header, MainLayout)
  - Chart components (Pie Chart, Bar Chart, Line Chart)
  - Form components with validation and keyboard navigation
  - Modal components for user interactions
  - Satellite map component with Leaflet.js integration
  - Calendar component for appointment scheduling
  - Back button component for navigation
  - Verification modal for user verification flow
  - Property card with hover effects and type badges
  - Application card with status indicators

- **Responsive Design**
  - Mobile-first approach
  - Responsive grid layouts
  - Adaptive typography
  - Mobile-friendly navigation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for database and authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Estospaces/estospaces-app.git
   cd estospaces-app
   git checkout user-dahboard
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for server-side)
   ```

4. **Run the development servers**
   ```bash
   # Run both Vite dev server and API server
   npm run dev:all
   
   # Or run separately:
   npm run server  # API server on port 3002
   npm run dev     # Vite dev server on port 5173
   ```

5. **Open your browser**
   - **Manager Dashboard**: `http://localhost:5173/manager/dashboard`
   - **User Dashboard**: `http://localhost:5173/user/dashboard`
   - **Landing Page**: `http://localhost:5173/`

### Dashboard URLs

#### Manager Dashboard
- **Main Dashboard**: `http://localhost:5173/manager/dashboard`
- **Properties**: `http://localhost:5173/manager/dashboard/properties`
- **Add Property**: `http://localhost:5173/manager/dashboard/properties/add`
- **Leads & Clients**: `http://localhost:5173/manager/dashboard/leads`
- **Applications**: `http://localhost:5173/manager/dashboard/application`
- **Appointments**: `http://localhost:5173/manager/dashboard/appointment`
- **Messages**: `http://localhost:5173/manager/dashboard/messages`
- **Analytics**: `http://localhost:5173/manager/dashboard/analytics`
- **Billing**: `http://localhost:5173/manager/dashboard/billing`
- **Profile**: `http://localhost:5173/manager/dashboard/profile`
- **Help & Support**: `http://localhost:5173/manager/dashboard/help`

#### User Dashboard
- **Main Dashboard**: `http://localhost:5173/user/dashboard`
- **Discover Properties (All)**: `http://localhost:5173/user/dashboard/discover`
- **Discover Properties (Buy)**: `http://localhost:5173/user/dashboard/discover?tab=buy`
- **Discover Properties (Rent)**: `http://localhost:5173/user/dashboard/discover?tab=rent`
- **Homes for Sale**: `http://localhost:5173/user/dashboard/discover?tab=buy&type=residential`
- **Homes for Rent**: `http://localhost:5173/user/dashboard/discover?tab=rent&type=residential`
- **Commercial for Sale**: `http://localhost:5173/user/dashboard/discover?tab=buy&type=commercial`
- **Commercial to Rent**: `http://localhost:5173/user/dashboard/discover?tab=rent&type=commercial`
- **New Homes**: `http://localhost:5173/user/dashboard/discover?new=true&tab=buy`
- **Location Filter**: `http://localhost:5173/user/dashboard/discover?location=london`
- **Saved Properties**: `http://localhost:5173/user/dashboard/saved`
- **Property Detail**: `http://localhost:5173/user/dashboard/property/:id`
- **My Applications**: `http://localhost:5173/user/dashboard/applications`
- **Viewings**: `http://localhost:5173/user/dashboard/viewings`
- **Messages**: `http://localhost:5173/user/dashboard/messages`
- **Payments**: `http://localhost:5173/user/dashboard/payments`
- **Contracts**: `http://localhost:5173/user/dashboard/contracts`
- **Reviews**: `http://localhost:5173/user/dashboard/reviews`
- **Settings**: `http://localhost:5173/user/dashboard/settings`
- **Help & Support**: `http://localhost:5173/user/dashboard/help`
- **Profile**: `http://localhost:5173/user/dashboard/profile`

#### Legal & Support Pages
- **Privacy Policy**: `http://localhost:5173/privacy`
- **Cookie Policy**: `http://localhost:5173/cookies`
- **Terms & Conditions**: `http://localhost:5173/terms`
- **Contact Us**: `http://localhost:5173/contact`
- **FAQ**: `http://localhost:5173/faq`

### API Endpoints

The Express server provides the following API endpoints:

- **GET /api/properties** - Get all properties with pagination and filters
  - Query params: `page`, `limit`, `type` (buy/rent/all), `country`, `city`, `postcode`, `min_price`, `max_price`, `min_bedrooms`, `min_bathrooms`
  - Returns: `{ data: Property[], pagination: { page, limit, total, totalPages } }`

- **GET /api/properties/all-sections** - Get all discovery sections at once
  - Returns: `{ mostViewed, trending, recentlyAdded, highDemand, featured, discovery }`

- **GET /api/properties/sections** - Get specific discovery section
  - Query params: `section` (most_viewed|trending|recently_added|high_demand|featured|discovery), `limit`, `type`
  - Returns: `{ data: Property[], section, count }`

- **GET /api/health** - Health check endpoint

### Build for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Admin/              # Manager-specific components
│   ├── Dashboard/          # User dashboard components
│   │   ├── Applications/   # Application card components
│   │   ├── Header.jsx      # Dashboard header with sign-out
│   │   ├── PropertyCard.jsx # Property display card
│   │   ├── DashboardFooter.jsx # Footer with search links
│   │   └── VerificationSection.jsx # User verification steps
│   ├── chatbot/            # AI chatbot components
│   ├── layout/             # Layout components (Sidebar, Header)
│   └── ui/                 # Reusable UI components
├── contexts/               # React Context providers
│   ├── AuthContext.tsx     # Authentication state
│   ├── ApplicationsContext.jsx # Applications data
│   ├── SavedPropertiesContext.jsx # Saved properties
│   ├── PropertyFilterContext.jsx # Property filters
│   └── ...
├── layouts/                # Page layout wrappers
├── pages/                  # Page components
│   ├── DashboardLocationBased.jsx # Main user dashboard
│   ├── DashboardDiscover.jsx # Property discovery
│   ├── DashboardProfile.jsx # User profile
│   ├── DashboardApplications.jsx # Applications list
│   ├── PrivacyPolicy.jsx   # Privacy policy page
│   ├── CookiePolicy.jsx    # Cookie policy page
│   ├── TermsConditions.jsx # Terms page
│   ├── ContactUs.jsx       # Contact form page
│   ├── FAQ.jsx             # FAQ page
│   └── ...
├── services/               # API services
│   └── postcodeService.js  # UK postcode lookup
├── App.tsx                 # Main app component with routing
├── index.css               # Global styles, animations, and theme
└── main.tsx                # Application entry point
```

## 🛠️ Tech Stack

- **React 18/19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **Lucide React**: Icon library
- **Framer Motion**: Animation library for smooth transitions
- **Inter Font**: Modern typography system for consistent, readable UI
- **Context API**: State management
- **Supabase**: Backend services (authentication, database, real-time subscriptions)
- **Express.js**: API server for property listings
- **Leaflet.js**: Interactive maps for property locations
- **Postcodes.io**: UK postcode validation and geocoding
- **OpenStreetMap Nominatim**: Address lookup service

## 🎨 Theme & Typography System

### Theme System

The platform supports two themes:
- **Light**: Default light theme with white backgrounds
- **Deep Dark**: Dark theme with deep black (#000000) background

Theme preference is saved in localStorage and persists across sessions. The theme switcher is available in the header on all dashboard pages.

### Typography System

The platform uses a consistent typography system:

- **Font Family**: Inter (User Dashboard) / Arial, Helvetica (Manager Dashboard) with system font fallbacks
- **Manager Dashboard**:
  - Page/Dashboard Titles: 30px, Bold (700)
  - Section/Card Headings: 19px, Semi-bold (600)
  - Primary Buttons/Menu Items: 16px, Medium (500)
  - Body Text/Table Content: 15px, Regular (400)
  - Captions/Timestamps: 12px, Regular (400)

- **User Dashboard**:
  - H1: 20px (semibold, 600)
  - H2: 18px (semibold, 600)
  - H3: 16px (semibold, 600)
  - Body Text: 14px (normal, 400)
  - Captions/Labels: 12px (normal/medium, 400/500)
  - Buttons: 14px (medium, 500)

All typography uses optimized letter-spacing and line-height for enhanced readability.

## 🎬 Navigation Animations

The user dashboard features smooth animations for enhanced user experience:

- **Click Animations**: Navigation tabs scale to 95% when clicked (300ms duration)
- **Page Transitions**: Smooth fade + slide transitions (200ms) when navigating between pages
- **Easing**: ease-out timing function for natural motion
- **Framer Motion**: Powered by Framer Motion for performant animations
- **CSS Animations**: fadeIn, slideUp, slideDown, scaleIn for UI elements

## 🗺️ Map Integration

The map view component is ready for Mapbox integration. To enable:

1. Install Mapbox packages:
   ```bash
   npm install react-map-gl mapbox-gl
   ```

2. Add your Mapbox token to `.env`:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

3. See `MAP_SETUP.md` for detailed setup instructions.

## 💳 Payment Integration

The payments page uses a placeholder Stripe integration. To integrate real payments:

1. Install Stripe packages:
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

2. Add Stripe keys to `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   ```

3. Update `DashboardPayments.jsx` with real Stripe Elements.

## 🔐 Authentication

Authentication is handled via Supabase Auth. The platform integrates with Supabase for:
- User authentication with email/password
- Session management with automatic refresh
- User profile data with verification status
- Property ownership (agent_id)
- Role-based access (manager vs user)
- Robust sign-out with timeout handling

## 🌐 Browser Compatibility

The application is fully compatible with all modern browsers:
- **Google Chrome** (recommended)
- **Safari**
- **Firefox**
- **Microsoft Edge**

The Supabase client includes fallback configuration to ensure reliable API connections across all browsers.

## 🔄 Recent Updates (January 2026)

### Navigation System Overhaul
- **Independent Tab Navigation**: All dashboard tabs (Dashboard, Buy, Rent, Saved Properties, My Applications, Viewings, Messages, Payments, Contracts, Profile, Help & Support) now navigate independently without conflicts
- **Fixed Tab Switching**: Clicking on any navigation tab now correctly routes to that page without unexpected redirects
- **URL Parameter Support**: Both `?tab=buy` and `?type=buy` URL patterns are now supported for property filtering

### Context Improvements
- **LocationContext**: Renamed `useLocation` to `useUserLocation` to avoid conflicts with React Router's `useLocation` hook
- **PropertyFilterContext**: `setActiveTab` now accepts an optional second parameter (`shouldNavigate`) to control whether navigation should occur - preventing unwanted redirects when updating filter state

### Bug Fixes
- Fixed issue where clicking Messages, Saved Properties, or other tabs would redirect to the Buy page
- Fixed loading state issues on property discovery pages
- Improved Supabase client initialization with fallback credentials for reliable cross-browser support
- Enhanced HMR (Hot Module Replacement) compatibility

## 📊 Database Schema

The application uses Supabase PostgreSQL with the following key tables:

- **properties**: Property listings with fields for title, price, location, images, property_type, listing_type, etc.
- **saved_properties**: User saved/favorited properties
- **applied_properties**: Property applications with status tracking
- **viewed_properties**: Property view tracking
- **viewings**: Scheduled property viewings with date, time, and status
- **profiles**: User profiles with verification status and role information

See `supabase/` directory for migration files.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 📞 Support

For support:
- **Manager Dashboard**: manager@estospaces.com
- **User Dashboard**: support@estospaces.com
- Visit the Help & Support page in the respective dashboard
- Use the Contact Us page at `/contact`

## 🔗 Social Media

- **LinkedIn**: [Estospaces Solutions](https://www.linkedin.com/company/estospaces-solutions-private-limited/?viewAsMember=true)
- **Instagram**: [@estospaces](https://www.instagram.com/estospaces/ram)
- **Twitter/X**: [@ESTOSPACES](https://x.com/ESTOSPACES)

---

**Branch**: user-dahboard  
**Repository**: https://github.com/Estospaces/estospaces-app  
**Live Demo**: https://estospaces-app.vercel.app  
Built with ❤️ by the Estospaces team
