import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  MessageSquare,
  CreditCard,
  User,
  HelpCircle,
  ShoppingBag,
  Home,
  Heart,
  Settings,
} from 'lucide-react';
import { useMessages } from '../../contexts/MessagesContext';
import { usePropertyFilter } from '../../contexts/PropertyFilterContext';
import { useSavedProperties } from '../../contexts/SavedPropertiesContext';

// Helper component for unread count badge
const UnreadCountBadge = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <span className="ml-1.5 bg-orange-500 text-white text-xs font-medium rounded-full min-w-[18px] h-5 px-1.5 flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
};

const HorizontalNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalUnreadCount } = useMessages();
  const { activeTab, setActiveTab } = usePropertyFilter();
  const { savedProperties } = useSavedProperties();
  const [clickedTab, setClickedTab] = useState(null);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/user/dashboard' },
    { icon: Heart, label: 'Saved Properties', path: '/user/dashboard/saved', showBadge: true, badgeCount: savedProperties?.length || 0 },
    { icon: FileText, label: 'My Applications', path: '/user/dashboard/applications' },
    { icon: Calendar, label: 'Viewings', path: '/user/dashboard/viewings' },
    { icon: MessageSquare, label: 'Messages', path: '/user/dashboard/messages', showBadge: true, badgeCount: totalUnreadCount },
    { icon: CreditCard, label: 'Payments', path: '/user/dashboard/payments' },
    { icon: FileText, label: 'Contracts', path: '/user/dashboard/contracts' },
    { icon: User, label: 'Profile', path: '/user/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/user/dashboard/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/user/dashboard/help' },
  ];

  const isActive = (path) => {
    if (path === '/user/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Check if Buy or Rent is active based on URL
  const isBuyActive = () => {
    if (location.pathname === '/user/dashboard/discover') {
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      const tab = searchParams.get('tab');
      // Active if type=buy OR tab=buy OR no type/tab specified (default to buy)
      return type === 'buy' || tab === 'buy' || (!type && !tab);
    }
    return false;
  };

  const isRentActive = () => {
    if (location.pathname === '/user/dashboard/discover') {
      const searchParams = new URLSearchParams(location.search);
      const type = searchParams.get('type');
      const tab = searchParams.get('tab');
      return type === 'rent' || tab === 'rent';
    }
    return false;
  };

  // Handle Buy/Rent clicks with animation
  const handleBuyClick = (e) => {
    e?.preventDefault();
    setActiveTab('buy', true); // Pass true to trigger navigation
  };

  const handleRentClick = (e) => {
    e?.preventDefault();
    setActiveTab('rent', true); // Pass true to trigger navigation
  };

  // Handle navigation link clicks with animation
  const handleNavClick = (path) => {
    setClickedTab(path);
    // Animation duration matches CSS transition
    setTimeout(() => setClickedTab(null), 300);
  };

  // Handle Buy button click with animation
  const handleBuyClickWithAnimation = (e) => {
    e?.preventDefault();
    setClickedTab('buy');
    handleBuyClick(e);
    setTimeout(() => setClickedTab(null), 300);
  };

  // Handle Rent button click with animation
  const handleRentClickWithAnimation = (e) => {
    e?.preventDefault();
    setClickedTab('rent');
    handleRentClick(e);
    setTimeout(() => setClickedTab(null), 300);
  };

  return (
    <nav 
      className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="px-4 lg:px-6">
        {/* Desktop: Horizontal tabs - Centered */}
        <div className="hidden md:flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {/* Dashboard */}
          {navItems.slice(0, 1).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out
                  border-b-2 border-transparent
                  ${active
                    ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20 active:text-orange-700 dark:active:text-orange-300 active:bg-orange-100 dark:active:bg-orange-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:text-gray-900 dark:active:text-gray-100 active:bg-gray-100 dark:active:bg-gray-700'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform active:scale-90' : 'scale-100'}
                  whitespace-nowrap cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={18} 
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    active 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  } ${clickedTab === item.path ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}`} 
                />
                <span>{item.label}</span>
                {item.showBadge && item.badgeCount > 0 && (
                  <UnreadCountBadge count={item.badgeCount} />
                )}
              </Link>
            );
          })}
          
          {/* Buy and Rent Buttons - Desktop */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleBuyClickWithAnimation}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out
                border-b-2 border-transparent
                ${isBuyActive()
                  ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20 active:text-orange-700 dark:active:text-orange-300 active:bg-orange-100 dark:active:bg-orange-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:text-gray-900 dark:active:text-gray-100 active:bg-gray-100 dark:active:bg-gray-700'
                }
                ${clickedTab === 'buy' ? 'scale-95 transform active:scale-90' : 'scale-100'}
                whitespace-nowrap cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
              `}
              aria-label="Filter by Buy"
            >
              <ShoppingBag 
                size={18} 
                className={`flex-shrink-0 transition-transform duration-300 ${
                  isBuyActive()
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-gray-500 dark:text-gray-400'
                } ${clickedTab === 'buy' ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}`} 
              />
              <span>Buy</span>
            </button>
            <button
              onClick={handleRentClickWithAnimation}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out
                border-b-2 border-transparent
                ${isRentActive()
                  ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20 active:text-orange-700 dark:active:text-orange-300 active:bg-orange-100 dark:active:bg-orange-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:text-gray-900 dark:active:text-gray-100 active:bg-gray-100 dark:active:bg-gray-700'
                }
                ${clickedTab === 'rent' ? 'scale-95 transform active:scale-90' : 'scale-100'}
                whitespace-nowrap cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
              `}
              aria-label="Filter by Rent"
            >
              <Home 
                size={18} 
                className={`flex-shrink-0 transition-transform duration-300 ${
                  isRentActive()
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-gray-500 dark:text-gray-400'
                } ${clickedTab === 'rent' ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}`} 
              />
              <span>Rent</span>
            </button>
          </div>
          
          {/* Saved Properties - After Rent */}
          {navItems.slice(1, 2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out
                  border-b-2 border-transparent
                  ${active
                    ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20 active:text-orange-700 dark:active:text-orange-300 active:bg-orange-100 dark:active:bg-orange-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:text-gray-900 dark:active:text-gray-100 active:bg-gray-100 dark:active:bg-gray-700'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform active:scale-90' : 'scale-100'}
                  whitespace-nowrap cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={18} 
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    active 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  } ${clickedTab === item.path ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}`} 
                />
                <span>{item.label}</span>
                {item.showBadge && item.badgeCount > 0 && (
                  <UnreadCountBadge count={item.badgeCount} />
                )}
              </Link>
            );
          })}
          
          {/* Rest of navigation items */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out
                  border-b-2 border-transparent
                  ${active
                    ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20 active:text-orange-700 dark:active:text-orange-300 active:bg-orange-100 dark:active:bg-orange-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 active:text-gray-900 dark:active:text-gray-100 active:bg-gray-100 dark:active:bg-gray-700'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform active:scale-90' : 'scale-100'}
                  whitespace-nowrap cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={18} 
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    active 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  } ${clickedTab === item.path ? 'rotate-12 scale-110' : 'rotate-0 scale-100'}`} 
                />
                <span>{item.label}</span>
                {item.showBadge && item.badgeCount > 0 && (
                  <UnreadCountBadge count={item.badgeCount} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile: Scrollable pill-style buttons - Centered */}
        <div className="md:hidden flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4">
          {/* Dashboard */}
          {navItems.slice(0, 1).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ease-out
                  flex-shrink-0 cursor-pointer
                  ${active
                    ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform active:scale-90' : 'scale-100'}
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={16} 
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    clickedTab === item.path ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                  }`} 
                />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.showBadge && item.badgeCount > 0 && (
                  <UnreadCountBadge count={item.badgeCount} />
                )}
              </Link>
            );
          })}
          
          {/* Buy and Rent Buttons - Mobile */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={handleBuyClickWithAnimation}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ease-out
                flex-shrink-0 cursor-pointer
                ${isBuyActive()
                  ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm active:bg-orange-600 dark:active:bg-orange-700 active:text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 active:text-gray-900 dark:active:text-gray-100'
                }
                ${clickedTab === 'buy' ? 'scale-95 transform active:scale-90' : 'scale-100'}
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              `}
              aria-label="Filter by Buy"
            >
              <ShoppingBag 
                size={16} 
                className={`flex-shrink-0 transition-transform duration-300 ${
                  clickedTab === 'buy' ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                }`} 
              />
              <span className="whitespace-nowrap">Buy</span>
            </button>
            <button
              onClick={handleRentClickWithAnimation}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ease-out
                flex-shrink-0 cursor-pointer
                ${isRentActive()
                  ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm active:bg-orange-600 dark:active:bg-orange-700 active:text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 active:text-gray-900 dark:active:text-gray-100'
                }
                ${clickedTab === 'rent' ? 'scale-95 transform active:scale-90' : 'scale-100'}
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              `}
              aria-label="Filter by Rent"
            >
              <Home 
                size={16} 
                className={`flex-shrink-0 transition-transform duration-300 ${
                  clickedTab === 'rent' ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                }`} 
              />
              <span className="whitespace-nowrap">Rent</span>
            </button>
          </div>
          
          {/* Saved Properties - Mobile - After Rent */}
          {navItems.slice(1, 2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ease-out
                  flex-shrink-0 cursor-pointer
                  ${active
                    ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm active:bg-orange-600 dark:active:bg-orange-700 active:text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 active:text-gray-900 dark:active:text-gray-100'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform active:scale-90' : 'scale-100'}
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={16} 
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    clickedTab === item.path ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                  }`} 
                />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.showBadge && item.badgeCount > 0 && (
                  <UnreadCountBadge count={item.badgeCount} />
                )}
              </Link>
            );
          })}
          
          {/* Rest of navigation items - Mobile */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ease-out
                  flex-shrink-0 cursor-pointer
                  ${active
                    ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm active:bg-orange-600 dark:active:bg-orange-700 active:text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 active:text-gray-900 dark:active:text-gray-100'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform active:scale-90' : 'scale-100'}
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={16} 
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    clickedTab === item.path ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                  }`} 
                />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.showBadge && item.badgeCount > 0 && (
                  <UnreadCountBadge count={item.badgeCount} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default HorizontalNavigation;

