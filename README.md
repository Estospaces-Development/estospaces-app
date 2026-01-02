# Estospaces - User Dashboard

A modern, responsive property management dashboard built with React, Tailwind CSS, and Vite.

## 🌟 Features

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
- **Saved Properties**: View saved/favorited properties
- **My Applications**: Track property applications
- **Viewings**: Manage scheduled property viewings
- **Messages**: Chat with brokers and agencies
- **Reviews**: View and manage property reviews
- **Payments**: Manage payments and view payment history
- **Contracts**: View and sign digital contracts
- **Settings**: User settings and preferences
- **Help & Support**: Help center and support resources
- **Profile**: User profile management

### Key Components

#### Property Cards
- Image carousel (max 4 images)
- Property details (beds, baths, area, price)
- Hover effects and skeleton loaders
- Virtual tour integration
- Favorite/save functionality

#### Theme System
- Light and Deep Dark themes
- Theme switcher in header (dashboard only)
- Persistent theme preference (localStorage)
- Fully responsive dark mode styling

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
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

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
- **Context API**: State management (Theme)

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
│   │   └── ThemeContext.jsx           # Theme context provider
│   └── App.jsx                        # Main app component
├── tailwind.config.js                 # Tailwind configuration
├── vite.config.js                     # Vite configuration
└── package.json                       # Dependencies and scripts
```

## 🎨 Theme System

The dashboard supports two themes:
- **Light**: Default light theme
- **Deep Dark**: Dark theme with gray-900 background

Theme preference is saved in localStorage and persists across sessions. The theme switcher is available in the header on the main dashboard page (`/dashboard`).

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
