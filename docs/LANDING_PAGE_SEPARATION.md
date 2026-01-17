# Landing Page Code Separation

This document outlines the separation of landing page components from the webapp components.

## 📁 Folder Structure

### Landing Page Components (`src/components/landing/`)

All landing page-specific components have been moved to the `src/components/landing/` directory:

```
src/components/landing/
├── Navbar.jsx                  # Main navigation bar (used on landing/public pages)
├── Footer.jsx                  # Footer component (used on landing/public pages)
├── Hero.jsx                    # Hero section with video background
├── BigPromise.jsx              # Features/benefits section
├── SneakPeek.jsx               # Sneak peek section with waitlist CTA
├── Problem.jsx                 # Problem statement section
├── Solution.jsx                # Solution showcase section
├── SocialProof.jsx             # Social proof section
├── Testimonials.jsx            # Customer testimonials
├── WhyJoin.jsx                 # Why join section
├── Countdown.jsx               # Countdown timer section
├── FinalCTA.jsx                # Final call-to-action section
├── PropertyCard.jsx            # Property card for landing page
├── PropertiesSection.jsx       # Properties showcase section
├── WaitlistModal.jsx           # Waitlist subscription modal
└── LiveChat/
    ├── ChatWidget.jsx          # Live chat widget
    ├── ChatWindow.jsx          # Chat window component
    ├── MessageBubble.jsx       # Message bubble component
    └── WelcomeForm.jsx         # Welcome form component
```

### Landing Page Pages (`src/pages/`)

The main landing page:
- `src/pages/Home.jsx` - Main landing page that uses all landing components

Public pages that use landing components:
- `src/pages/About.jsx` - About page (uses Navbar & Footer)
- `src/pages/Terms.jsx` - Terms page (uses Navbar & Footer)

### Webapp Components (`src/components/`)

Webapp-specific components remain in their original locations:

- `src/components/Dashboard/` - User/Manager dashboard components
- `src/components/Admin/` - Admin dashboard components
- `src/components/auth/` - Authentication components (shared)
- `src/components/ui/` - Shared UI components
- `src/components/chatbot/` - Chatbot components (for webapp)

### Webapp Pages (`src/pages/`)

All dashboard and protected pages:
- `src/pages/Dashboard*.jsx` - User dashboard pages
- `src/pages/Admin*.jsx` - Admin pages
- `src/pages/PropertiesList.tsx` - Manager properties list
- `src/pages/PropertyDetail.jsx` - Property detail page
- etc.

## 🔄 Import Path Updates

All imports in landing components have been updated to reflect the new folder structure:

### Before:
```javascript
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
```

### After:
```javascript
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
```

### Internal Landing Component Imports

Components within `src/components/landing/` use relative paths:

```javascript
// Within landing folder
import WaitlistModal from './WaitlistModal';  // Same directory
import PropertyCard from './PropertyCard';    // Same directory
```

### External Imports from Landing Components

Landing components import from shared directories using updated paths:

```javascript
// From src/components/landing/ to src/
import useParallax from '../../hooks/useParallax';
import logoIcon from '../../assets/logo-icon.png';
import { useChat } from '../../contexts/ChatContext';
import SearchBar from '../ui/SearchBar';  // Sibling folder
```

## 📊 Component Usage Map

### Landing Page Only (`src/components/landing/`)
- Hero
- BigPromise
- SneakPeek
- Problem
- Solution
- SocialProof
- Testimonials
- WhyJoin
- Countdown
- FinalCTA
- PropertyCard (landing version)
- PropertiesSection
- WaitlistModal

### Shared with Public Pages
- Navbar (used in Home, About, Terms)
- Footer (used in Home, About, Terms)
- LiveChat (used on landing page)

### Shared Components (`src/components/`)
- FAQ component (used on landing and as separate page)
- All UI components (`src/components/ui/`)
- Auth components (`src/components/auth/`)

### Webapp Only
- Dashboard components (`src/components/Dashboard/`)
- Admin components (`src/components/Admin/`)
- Manager dashboard pages (`src/pages/` - manager routes)

## 🎯 Benefits of This Separation

1. **Clear Organization**: Landing page code is now clearly separated from webapp code
2. **Easier Maintenance**: Landing page updates won't affect webapp components
3. **Better Navigation**: Developers can quickly locate landing vs webapp code
4. **Scalability**: Easy to extract landing page into separate package if needed
5. **Reduced Conflicts**: Changes to webapp won't accidentally break landing page

## 📝 Notes

- The FAQ component is still in `src/components/FAQ.jsx` as it's used both on the landing page and as a standalone page
- Auth components remain shared as they're used across both landing and webapp
- UI components remain shared for consistency
- The Navbar and Footer are considered landing components but are also used on public pages (About, Terms)

## 🔍 Finding Components

- **Landing page components**: Look in `src/components/landing/`
- **Webapp dashboard components**: Look in `src/components/Dashboard/` and `src/components/Admin/`
- **Shared UI components**: Look in `src/components/ui/`
- **Authentication**: Look in `src/components/auth/`
