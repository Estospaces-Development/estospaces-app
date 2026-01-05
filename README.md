# Estospaces - User Dashboard

A modern, responsive property management dashboard built with React, Tailwind CSS, and Vite.

## 🌟 Features

### Recent Updates
- ✅ **Property Detail Page**: Comprehensive property information with market insights and analytics (orange theme)
- ✅ **Welcome Card**: Personalized welcome message with user name and email integrated into Discover Your Dream Home banner
- ✅ **Smart Search Navigation**: Search bars navigate to relevant pages based on keywords
- ✅ **User Verification Badge**: Verified indicator displayed in sidebar for authenticated users
- ✅ **Global Chatbot Access**: Lakshmi AI Assistant available on all dashboard pages
- ✅ **Theme Switcher**: Available on all dashboard pages (not just main dashboard)
- ✅ **Orange Theme**: Property Detail page uses consistent orange branding matching dashboard theme

### User Dashboard
- **Responsive Dashboard Layout**: Clean, modern SaaS-style dashboard with sidebar navigation and top header
- **Property Management**: Browse, search, and manage properties with detailed property cards
- **AI Assistant (Lakshmi)**: Integrated AI assistant for property search, navigation help, and FAQs
- **Dark Mode Theme**: Deep dark theme support with theme switcher in the header
- **Digital Contracts**: View, sign, and manage property contracts digitally with e-signature functionality
- **Payments**: Pay rent and utility bills with payment history tracking (Stripe placeholder integration)
- **Messaging**: Real-time messaging system to communicate with brokers/agencies
- **Map View**: Interactive map showing nearby properties and agencies (Mapbox-ready)
- **Virtual Tours**: View property virtual tours with embedded video/360 iframe support

### Dashboard Pages
- **Dashboard Home**: Main dashboard with featured properties, map view, and quick stats
- **Discover Properties**: Browse and search properties
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
- **Help & Support**: Help center and support resources
- **Profile**: User profile management with verified badge

### Key Components

#### Property Cards
- Image carousel (max 4 images)
- Property details (beds, baths, area, price)
- Hover effects and skeleton loaders
- Virtual tour integration
- Favorite/save functionality with global state management
- Save properties from Featured Properties or Browse Properties pages
- Saved properties persist in localStorage
- "View Details" button navigates to comprehensive property detail page

#### Property Detail Page
- Full property information display with orange theme (buttons, badges, text, charts)
- Image carousel with navigation
- Financial metrics and market analytics
- Market insights dashboard with interactive charts:
  - Price history and growth trends
  - Bedroom distribution charts
  - Yield and vacancy rate analytics
  - Demographic data visualization
- Agent contact information
- Inspection times with calendar integration
- Map view with street view and directions
- Save/favorite functionality integrated

#### Search Functionality
- **Header Search Bar**: Universal search available on all dashboard pages
- **Dashboard Search Bar**: AI-powered property search with navigation
- **Smart Navigation**: Search keywords automatically navigate to relevant pages:
  - `payments`, `payment`, `pay` → Payments page
  - `messages`, `message`, `chat` → Messages page
  - `contracts`, `contract` → Contracts page
  - `applications`, `application`, `apply` → Applications page
  - `viewings`, `viewing`, `schedule` → Viewings page
  - `saved`, `favorites`, `favorite` → Saved Properties page
  - `discover`, `browse`, `properties`, `property` → Discover page
  - `reviews`, `review` → Reviews page
  - `settings`, `setting` → Settings page
  - `profile` → Profile page
  - `help`, `support` → Help page

#### Theme System
- Light and Deep Dark themes
- Theme switcher in header (all dashboard pages)
- Persistent theme preference (localStorage)
- Fully responsive dark mode styling

#### User Profile & Verification
- Verified badge displayed in sidebar
- Green checkmark indicator on user avatar
- Verification status shown next to username
- Professional user identification

#### AI Assistant (Lakshmi)
- Chat bubble interface (bottom-right)
- Property search assistance
- Navigation help
- FAQ responses
- API-ready structure for future AI integration

#### Digital Contracts
- PDF contract viewer
- Canvas-based e-signature
- Signature confirmation modal
- Local storage persistence
- Signed contract tracking

#### Payments
- Pay rent functionality
- Pay utility bills
- Payment history table
- Upcoming payments reminders
- Stripe placeholder integration (ready for real integration)

#### Messaging
- Chat list with online/offline indicators
- Message window with timestamps
- Real-time message updates (mock implementation)
- Attachment support
- WebSocket-ready structure

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Estospaces/estospaces-app.git
   cd estospaces-app
   ```

2. **Checkout the user-dashboard branch**
   ```bash
   git checkout user-dashboard
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Set up environment variables** (if needed)
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173/user/dashboard` (or the port shown in your terminal)

### Dashboard URLs

After starting the development server, access the dashboard at:
- **Main Dashboard**: `http://localhost:5173/user/dashboard`
- **Discover Properties**: `http://localhost:5173/user/dashboard/discover`
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

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **Lucide React**: Icon library
- **Context API**: State management (Theme, Saved Properties)

## 📁 Project Structure

```
estospaces-app/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── DashboardLayout.jsx    # Main dashboard layout
│   │   │   ├── Sidebar.jsx            # Sidebar navigation
│   │   │   ├── Header.jsx             # Top header with search, notifications
│   │   │   ├── ThemeSwitcher.jsx      # Theme toggle component
│   │   │   ├── PropertyCard.jsx       # Property card component
│   │   │   ├── PropertyCardSkeleton.jsx # Loading skeleton
│   │   │   ├── PromiseBanner.jsx      # 24-hour process banner
│   │   │   ├── MapView.jsx            # Map view component
│   │   │   ├── LakshmiAssistant.jsx   # AI assistant chat widget
│   │   │   ├── ContractViewer.jsx     # PDF contract viewer
│   │   │   ├── SignatureModal.jsx     # E-signature modal
│   │   │   └── Messaging/             # Messaging components
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.jsx              # Main dashboard page
│   │   ├── DashboardDiscover.jsx      # Discover properties
│   │   ├── DashboardMessages.jsx      # Messaging page
│   │   ├── DashboardPayments.jsx      # Payments page
│   │   ├── DashboardContracts.jsx     # Contracts page
│   │   └── ...
│   ├── contexts/
│   │   ├── ThemeContext.jsx           # Theme context provider
│   │   └── SavedPropertiesContext.jsx # Saved properties context provider
│   └── App.jsx                        # Main app component
├── tailwind.config.js                 # Tailwind configuration
├── vite.config.js                     # Vite configuration
└── package.json                       # Dependencies and scripts
```

## 🎨 Theme System

The dashboard supports two themes:
- **Light**: Default light theme
- **Deep Dark**: Dark theme with gray-900 background

Theme preference is saved in localStorage and persists across sessions. The theme switcher is available in the header on the main dashboard page (`/user/dashboard`).

## 🗺️ Map Integration

The map view component is ready for Mapbox integration. To enable:

1. Install Mapbox packages:
   ```bash
   npm install react-map-gl mapbox-gl
   ```

2. Add your Mapbox token to `.env.local`:
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

2. Add Stripe keys to `.env.local`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   ```

3. Update `DashboardPayments.jsx` with real Stripe Elements.

## 🔐 Authentication

Authentication setup is not included in this branch. Add authentication as needed for your use case.

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contributing guidelines here]

## 📞 Support

For support, email [your-email] or open an issue in the repository.

---

Built with ❤️ by the Estospaces team
