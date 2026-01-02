import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Search, 
  Heart,
  FileText,
  Calendar,
  MessageSquare,
  Star,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Browse Properties', path: '/dashboard/discover' },
    { icon: Heart, label: 'Saved Properties', path: '/dashboard/saved' },
    { icon: FileText, label: 'My Applications', path: '/dashboard/applications' },
    { icon: Calendar, label: 'Viewings', path: '/dashboard/viewings' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages' },
    { icon: CreditCard, label: 'Payments', path: '/dashboard/payments' },
    { icon: FileText, label: 'Contracts', path: '/dashboard/contracts' },
    { icon: Star, label: 'Reviews', path: '/dashboard/reviews' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              {isOpen && (
                <span className="text-xl font-bold text-orange-600 dark:text-orange-500 whitespace-nowrap">
                  Estospaces
                </span>
              )}
            </div>
            {isOpen && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Property Viewer</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">viewer@estospaces.com</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 min-h-0">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      active
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`flex-shrink-0 ${
                        active ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`}
                    />
                    {isOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section - Profile, Help & Support, Sign Out */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 px-3 pb-4 flex-shrink-0 space-y-1">
            {/* Profile */}
            <Link
              to="/dashboard/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                location.pathname === '/dashboard/profile'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              } ${!isOpen && 'justify-center'}`}
            >
              <User
                size={20}
                className={`flex-shrink-0 ${
                  location.pathname === '/dashboard/profile'
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}
              />
              {isOpen && <span className="text-sm whitespace-nowrap">Profile</span>}
            </Link>

            {/* Help & Support */}
            <Link
              to="/dashboard/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                location.pathname === '/dashboard/help'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              } ${!isOpen && 'justify-center'}`}
            >
              <HelpCircle
                size={20}
                className={`flex-shrink-0 ${
                  location.pathname === '/dashboard/help'
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}
              />
              {isOpen && <span className="text-sm whitespace-nowrap">Help & Support</span>}
            </Link>

            {/* Sign Out */}
            <button
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400 group ${
                !isOpen && 'justify-center'
              }`}
            >
              <LogOut size={20} className="flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              {isOpen && <span className="text-sm whitespace-nowrap">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
