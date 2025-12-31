# Estospaces Manager Dashboard

A comprehensive property management dashboard built with React, TypeScript, and Tailwind CSS. This dashboard provides property managers with tools to manage properties, leads, applications, appointments, analytics, billing, and more.

## Features

### 🎨 UI/UX Improvements

- **Dark Theme Implementation**
  - Deep black dark theme (#000000) for optimal visual experience
  - Full dark mode support across all components and pages
  - Theme switcher in header with Light and Dark options
  - Theme preference saved in localStorage for persistence

- **Typography System**
  - Page/Dashboard Titles: 30px, Bold (700)
  - Section/Card Headings: 19px, Semi-bold (600)
  - Primary Buttons/Menu Items: 16px, Medium (500)
  - Secondary Buttons/Labels: 14px, Regular (400)
  - Body Text/Table Content: 15px, Regular (400)
  - Captions/Timestamps: 12px, Regular (400)
  - Consistent typography across the entire application

- **Modern Font Styling**
  - Arial, Helvetica font stack matching modern design standards
  - Responsive font sizes and weights
  - Improved readability and visual hierarchy

### 📊 Dashboard Features

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
  - Monthly revenue trends with bar charts
  - Property performance metrics
  - Lead analytics with pie charts
  - Monthly applications line chart
  - Comprehensive data visualizations

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

### 🤖 AI Features

- **Lakshmi Chatbot**
  - AI-powered assistant ("Ask Lakshmi")
  - Voice recognition support
  - Smart responses about properties, dashboard insights, and analytics
  - Navigation commands (e.g., "take me to the application")
  - Integrated into main dashboard

### 🔧 Technical Implementation

- **Framework & Libraries**
  - React 18 with TypeScript
  - React Router for navigation
  - Tailwind CSS for styling
  - Lucide React for icons
  - Vite for build tooling

- **State Management**
  - React Context API for global state
  - PropertyContext for property data management
  - LeadContext for lead data management
  - ThemeContext for theme management
  - localStorage for data persistence

- **Components**
  - Reusable UI components
  - Layout components (Sidebar, Header, MainLayout)
  - Chart components (Pie Chart, Bar Chart, Line Chart)
  - Form components with validation
  - Modal components for user interactions

- **Responsive Design**
  - Mobile-first approach
  - Responsive grid layouts
  - Adaptive typography
  - Mobile-friendly navigation

## Recent Updates & Changes

### Version 1.0.0 (Latest)

#### Theme & Styling
- ✅ Implemented deep black dark theme across entire application
- ✅ Added theme switcher in header (Light/Dark options)
- ✅ Fixed text visibility issues in dark mode
- ✅ Updated sidebar hover states for better visibility (black text on light gray background in dark mode)
- ✅ Applied consistent typography system throughout the application
- ✅ Improved color contrast and readability

#### UI Components
- ✅ Updated all card components with dark mode support
- ✅ Fixed billing page text visibility (Total Revenue, Pending Payments, Overdue)
- ✅ Improved table styling for dark mode
- ✅ Updated button styles for better visibility
- ✅ Enhanced sidebar navigation with proper dark mode support

#### Features
- ✅ Changed search bar placeholder to "AI-powered search"
- ✅ Removed "Property manager Dashboard" text from sidebar (only "Estospaces" shown)
- ✅ Added back button navigation to all pages
- ✅ Improved chatbot integration ("Ask Lakshmi")
- ✅ Enhanced profile page with verification system

#### Code Quality
- ✅ Improved TypeScript type safety
- ✅ Better component organization
- ✅ Consistent naming conventions
- ✅ Optimized component rendering

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Estospaces/estospaces-app.git
cd estospaces-app
git checkout Dashboards
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── chatbot/          # AI chatbot components
│   ├── layout/           # Layout components (Sidebar, Header)
│   └── ui/               # Reusable UI components
├── contexts/             # React Context providers
├── layouts/              # Page layout wrappers
├── pages/                # Page components
├── App.tsx               # Main app component
├── index.css             # Global styles and theme definitions
└── main.tsx              # Application entry point
```

## Key Files

- `src/index.css` - Global styles, theme definitions, typography system
- `src/contexts/ThemeContext.tsx` - Theme management
- `src/contexts/PropertyContext.tsx` - Property data management
- `src/contexts/LeadContext.tsx` - Lead data management
- `src/components/layout/Sidebar.tsx` - Navigation sidebar
- `src/components/layout/Header.tsx` - Top header with search and theme switcher
- `src/pages/Dashboard.tsx` - Main dashboard page

## Configuration

### Tailwind CSS

The project uses Tailwind CSS with custom configuration:
- Primary color: Orange (#FF6B35)
- Custom font family: Arial, Helvetica, system fonts
- Dark mode: Class-based (`dark:` prefix)

### Theme System

The application supports two themes:
- **Light**: Default theme with white backgrounds
- **Dark**: Deep black theme (#000000) with light text

Theme preference is saved in localStorage and persists across sessions.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, email manager@estospaces.com or visit the Help & Support page in the dashboard.

---

**Branch**: Dashboards  
**Repository**: https://github.com/Estospaces/estospaces-app  
**Latest Commit**: See commit history for details
