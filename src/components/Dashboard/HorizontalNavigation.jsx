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
} from 'lucide-react';
import { useMessages } from '../../contexts/MessagesContext';
import { usePropertyFilter } from '../../contexts/PropertyFilterContext';

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
  const [clickedTab, setClickedTab] = useState(null);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/user/dashboard' },
    { icon: FileText, label: 'My Applications', path: '/user/dashboard/applications' },
    { icon: Calendar, label: 'Viewings', path: '/user/dashboard/viewings' },
    { icon: MessageSquare, label: 'Messages', path: '/user/dashboard/messages', showBadge: true, badgeCount: totalUnreadCount },
    { icon: CreditCard, label: 'Payments', path: '/user/dashboard/payments' },
    { icon: FileText, label: 'Contracts', path: '/user/dashboard/contracts' },
    { icon: User, label: 'Profile', path: '/user/dashboard/profile' },
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
      return searchParams.get('type') === 'buy';
    }
    return false;
  };

  const isRentActive = () => {
    if (location.pathname === '/user/dashboard/discover') {
      const searchParams = new URLSearchParams(location.search);
      return searchParams.get('type') === 'rent';
    }
    return false;
  };

  // Handle Buy/Rent clicks with animation
  const handleBuyClick = (e) => {
    e.preventDefault();
    setClickedTab('buy');
    setTimeout(() => setClickedTab(null), 300);
    setActiveTab('buy');
    navigate('/user/dashboard/discover?type=buy');
  };

  const handleRentClick = (e) => {
    e.preventDefault();
    setClickedTab('rent');
    setTimeout(() => setClickedTab(null), 300);
    setActiveTab('rent');
    navigate('/user/dashboard/discover?type=rent');
  };

  // Handle navigation link clicks with animation
  const handleNavClick = (path) => {
    setClickedTab(path);
    setTimeout(() => setClickedTab(null), 300);
  };

  return (
    <nav 
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-20 shadow-sm"
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
                    ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform' : 'scale-100'}
                  whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={18} 
                  className={`flex-shrink-0 ${
                    active 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} 
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
              onClick={handleBuyClick}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out
                border-b-2 border-transparent
                ${isBuyActive()
                  ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
                ${clickedTab === 'buy' ? 'scale-95 transform' : 'scale-100'}
                whitespace-nowrap
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
              `}
              aria-label="Filter by Buy"
            >
              <ShoppingBag 
                size={18} 
                className={`flex-shrink-0 ${
                  isBuyActive()
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} 
              />
              <span>Buy</span>
            </button>
            <button
              onClick={handleRentClick}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out
                border-b-2 border-transparent
                ${isRentActive()
                  ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
                ${clickedTab === 'rent' ? 'scale-95 transform' : 'scale-100'}
                whitespace-nowrap
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
              `}
              aria-label="Filter by Rent"
            >
              <Home 
                size={18} 
                className={`flex-shrink-0 ${
                  isRentActive()
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} 
              />
              <span>Rent</span>
            </button>
          </div>
          
          {/* Rest of navigation items */}
          {navItems.slice(1).map((item) => {
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
                    ? 'text-orange-600 dark:text-orange-400 border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform' : 'scale-100'}
                  whitespace-nowrap
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={18} 
                  className={`flex-shrink-0 ${
                    active 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} 
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
                  flex-shrink-0
                  ${active
                    ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform' : 'scale-100'}
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={16} 
                  className="flex-shrink-0" 
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
              onClick={handleBuyClick}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ease-out
                flex-shrink-0
                ${isBuyActive()
                  ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
                ${clickedTab === 'buy' ? 'scale-95 transform' : 'scale-100'}
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              `}
              aria-label="Filter by Buy"
            >
              <ShoppingBag size={16} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Buy</span>
            </button>
            <button
              onClick={handleRentClick}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ease-out
                flex-shrink-0
                ${isRentActive()
                  ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
                ${clickedTab === 'rent' ? 'scale-95 transform' : 'scale-100'}
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              `}
              aria-label="Filter by Rent"
            >
              <Home size={16} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Rent</span>
            </button>
          </div>
          
          {/* Rest of navigation items - Mobile */}
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ease-out
                  flex-shrink-0
                  ${active
                    ? 'bg-orange-500 dark:bg-orange-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                  ${clickedTab === item.path ? 'scale-95 transform' : 'scale-100'}
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                `}
                aria-current={active ? 'page' : undefined}
              >
                <Icon 
                  size={16} 
                  className="flex-shrink-0" 
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

