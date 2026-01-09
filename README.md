# Estospaces - User Dashboard

A modern, responsive property management dashboard built with React, Tailwind CSS, and Vite.

## 🌟 Features

### Recent Updates

- **✅ Navigation Animations**: Smooth click animations and page transitions when navigating between tabs
  - Click scale animation (95% on click) for all navigation tabs
  - Page fade + slide transitions (200ms) when switching pages
  - 300ms transition duration with ease-out timing
- **✅ Buy/Rent Filtering**: Separate Buy and Rent buttons in navigation with real-time property filtering
  - Buy tab shows properties with `listing_type = 'sale'` (39 properties)
  - Rent tab shows properties with `listing_type = 'rent'` (5 properties)
  - Filtering works across Dashboard and Discover Properties pages
- **✅ Property Discovery Sections**: Multiple discovery sections on main dashboard
  - **Property Discovery (Core)**: 6-8 curated properties based on location and preferences
  - **Most Viewed Properties**: Properties sorted by view count from Supabase
  - **Trending Properties**: Properties with rapid increase in views/engagement
  - **Recently Added Properties**: Latest properties sorted by `created_at`
  - **High Demand Properties**: Properties with high inquiries and favorites
- **✅ Real Property Data Integration**: Connected to Supabase `properties` table
  - 44 total properties (39 for sale, 5 for rent)
  - Real property data with images, prices, locations, and details
  - Featured properties support
  - View tracking and analytics
- **✅ API Endpoints**: Production-ready property listing API
  - `GET /api/properties` - All properties with pagination
  - `GET /api/properties?type=buy` - Properties for sale
  - `GET /api/properties?type=rent` - Rental properties
  - `GET /api/properties/all-sections` - All discovery sections in one request
  - `GET /api/properties/sections?section=most_viewed|trending|recently_added|high_demand|featured|discovery`
- **✅ Horizontal Navigation**: Modern horizontal navigation bar replacing sidebar
  - All navigation items in horizontal tabs below header
  - Buy and Rent buttons positioned before "My Applications"
  - Active state highlighting
  - Responsive design (horizontal tabs on desktop, scrollable pills on mobile)
- **✅ Typography System**: Updated to Inter font family matching modern chat interface standards
  - Consistent font sizes across all components (H1: 20px, H2: 18px, H3: 16px, Body: 14px, Captions: 12px)
  - Optimized letter-spacing and line-height for readability
  - Applied globally via Tailwind config and CSS base styles
- **✅ Smart Search Filtering**: Enhanced "Discover Properties" page with multi-criteria filtering (Location, Type, Price, Beds, Baths)
- **✅ Postcode Autocomplete**: Real-time postcode suggestions when searching for properties
- **✅ Location-Based Dashboard**: Dynamic property filtering based on user location (profile, geolocation, or search input)
- **✅ Real Property Integration**: Integration with Zoopla API for real-time UK property listings (with Supabase fallback)
- **✅ Enhanced Help Center**: Interactive "Help & Support" page with:
  - **Documentation Modal**: Quick access to getting started guides and resources.
  - **Live Chat**: Direct email integration for support requests.
  - **Email Support**: One-click email composition.
- **✅ Property Detail Page**: Comprehensive property information with market insights and analytics (orange theme)
- **✅ Welcome Card**: Personalized welcome message with user name integrated into dashboard header
- **✅ Smart Search Navigation**: Search bars navigate to relevant pages based on keywords
- **✅ User Verification Badge**: Verified indicator displayed in sidebar for authenticated users
- **✅ Global Chatbot Access**: "Ask Lakshmi" AI Assistant available on all dashboard pages
- **✅ Theme Switcher**: Available on all dashboard pages (not just main dashboard)
- **✅ Orange Theme**: Property Detail page uses consistent orange branding matching dashboard theme

### User Dashboard

- **Responsive Dashboard Layout**: Clean, modern SaaS-style dashboard with horizontal navigation and top header
- **Property Management**: Browse, search, and manage properties with detailed property cards
- **AI Assistant (Lakshmi)**: Integrated AI assistant for property search, navigation help, and FAQs
- **Dark Mode Theme**: Deep dark theme support with theme switcher in the header
- **Digital Contracts**: View, sign, and manage property contracts digitally with e-signature functionality
- **Payments**: Pay rent and utility bills with payment history tracking (Stripe placeholder integration)
- **Messaging**: Real-time messaging system to communicate with brokers/agencies
- **Map View**: Interactive map showing nearby properties and agencies (Mapbox-ready)
- **Virtual Tours**: View property virtual tours with embedded video/360 iframe support

### Dashboard Pages

- **Dashboard Home**: Main dashboard with property discovery sections, map view, and quick stats
- **Discover Properties**: Browse and search properties with advanced filtering (Buy/Rent tabs, location, price, beds, baths)
- **Saved Properties**: View saved/favorited properties (saved from Featured Properties or Browse Properties)
- **Property Detail Page**: Comprehensive property information page with:
  - Property details (images, description, specs, agent info, inspection times)
  - Financial metrics (median price, rent, cashflow, yield, vacancy rate)
  - Market insights dashboard with charts and analytics:
    - Median price & growth trends
    - Average bedrooms distribution
    - Gross yield & vacancy rate history
    - Average age demographics
    - Potential value range analysis
  - Interactive map with street view and directions
  - Agent contact and calendar integration
- **My Applications**: Track property applications
- **Viewings**: Manage scheduled property viewings
- **Messages**: Chat with brokers and agencies
- **Reviews**: View and manage property reviews
- **Payments**: Manage payments and view payment history
- **Contracts**: View and sign digital contracts
- **Settings**: User settings and preferences
- **Help & Support**: Interactive help center with documentation and support channels
- **Profile**: User profile management with verified badge

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
   git checkout user-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
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
   Navigate to `http://localhost:5173/user/dashboard` (or the port shown in your terminal)

### Dashboard URLs

After starting the development server, access the dashboard at:
- **Main Dashboard**: `http://localhost:5173/user/dashboard`
- **Discover Properties (All)**: `http://localhost:5173/user/dashboard/discover`
- **Discover Properties (Buy)**: `http://localhost:5173/user/dashboard/discover?type=buy`
- **Discover Properties (Rent)**: `http://localhost:5173/user/dashboard/discover?type=rent`
- **Saved Properties**: `http://localhost:5173/user/dashboard/saved`
- **Property Detail**: `http://localhost:5173/user/dashboard/property/:id` (accessed via "View Details" button)
- **My Applications**: `http://localhost:5173/user/dashboard/applications`
- **Viewings**: `http://localhost:5173/user/dashboard/viewings`
- **Messages**: `http://localhost:5173/user/dashboard/messages`
- **Payments**: `http://localhost:5173/user/dashboard/payments`
- **Contracts**: `http://localhost:5173/user/dashboard/contracts`
- **Reviews**: `http://localhost:5173/user/dashboard/reviews`
- **Settings**: `http://localhost:5173/user/dashboard/settings`
- **Help & Support**: `http://localhost:5173/user/dashboard/help`
- **Profile**: `http://localhost:5173/user/dashboard/profile`

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

## 🛠️ Tech Stack

- **React 19**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **Lucide React**: Icon library
- **Framer Motion**: Animation library for smooth transitions
- **Inter Font**: Modern typography system for consistent, readable UI
- **Context API**: State management (Theme, Saved Properties, Messages, Applications, Location, PropertyFilter)
- **Supabase**: Backend services (authentication, database, real-time subscriptions)
- **Express.js**: API server for property listings
- **Mapbox**: Interactive maps for property locations
- **Zoopla API**: Real-time UK property listings integration (with Supabase fallback)

## 📁 Project Structure

```
estospaces-app/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── DashboardLayout.jsx         # Main dashboard layout with page transitions
│   │   │   ├── HorizontalNavigation.jsx    # Horizontal navigation bar
│   │   │   ├── Header.jsx                  # Top header with search, notifications
│   │   │   ├── ThemeSwitcher.jsx           # Theme toggle component
│   │   │   ├── PropertyCard.jsx            # Property card component
│   │   │   ├── PropertyCardSkeleton.jsx    # Loading skeleton
│   │   │   ├── PropertyDiscoverySection.jsx # Discovery section component
│   │   │   ├── LakshmiAssistant.jsx        # AI assistant chat widget
│   │   │   ├── MapView.jsx                 # Map view component
│   │   │   └── ...
│   │   └── ...
│   ├── pages/
│   │   ├── DashboardLocationBased.jsx       # Main dashboard with discovery sections
│   │   ├── DashboardDiscover.jsx           # Discover properties with filters
│   │   ├── DashboardMessages.jsx           # Messaging page
│   │   ├── DashboardPayments.jsx           # Payments page
│   │   ├── DashboardContracts.jsx          # Contracts page
│   │   └── ...
│   ├── contexts/
│   │   ├── ThemeContext.jsx                 # Theme context provider
│   │   ├── SavedPropertiesContext.jsx       # Saved properties context
│   │   ├── PropertyFilterContext.jsx       # Buy/Rent filter context
│   │   └── ...
│   ├── services/
│   │   ├── propertiesService.js            # Property data service
│   │   ├── propertyDataService.js           # Property discovery service
│   │   └── ...
│   └── App.jsx                              # Main app component
├── server.js                                # Express API server
├── tailwind.config.js                       # Tailwind configuration
├── vite.config.js                           # Vite configuration
└── package.json                             # Dependencies and scripts
```

## 🎨 Theme & Typography System

### Theme System

The dashboard supports two themes:
- **Light**: Default light theme
- **Deep Dark**: Dark theme with gray-900 background

Theme preference is saved in localStorage and persists across sessions. The theme switcher is available in the header on all dashboard pages.

### Typography System

The dashboard uses a consistent typography system matching modern chat interface standards:

- **Font Family**: Inter (with system font fallbacks)
- **Base Font Size**: 14px (optimized for readability)
- **Heading Sizes**:
  - H1: 20px (semibold, 600)
  - H2: 18px (semibold, 600)
  - H3: 16px (semibold, 600)
- **Body Text**: 14px (normal, 400)
- **Captions/Labels**: 12px (normal/medium, 400/500)
- **Buttons**: 14px (medium, 500)

All typography uses optimized letter-spacing and line-height for enhanced readability.

## 🎬 Navigation Animations

The dashboard features smooth animations for enhanced user experience:

- **Click Animations**: Navigation tabs scale to 95% when clicked (300ms duration)
- **Page Transitions**: Smooth fade + slide transitions (200ms) when navigating between pages
- **Easing**: ease-out timing function for natural motion
- **Framer Motion**: Powered by Framer Motion for performant animations

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

Authentication is handled via Supabase Auth. The dashboard integrates with Supabase for:
- User authentication
- Session management
- User profile data
- Property ownership (agent_id)

## 📊 Database Schema

The application uses Supabase PostgreSQL with the following key tables:

- **properties**: Property listings with fields for title, price, location, images, etc.
- **saved_properties**: User saved/favorited properties
- **applied_properties**: Property applications
- **viewed_properties**: Property view tracking
- **profiles**: User profiles with verification status

See `supabase/` directory for migration files.

## 📝 License

MIT License

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

For support, email support@estospaces.com or open an issue in the repository.

---

Built with ❤️ by the Estospaces team
