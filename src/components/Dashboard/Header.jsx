import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const Header = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith('/user/dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'New property available', message: 'A new property matches your criteria', time: '2m ago' },
    { id: 2, title: 'Payment received', message: 'Your payment has been processed', time: '1h ago' },
    { id: 3, title: 'Contract updated', message: 'Your contract has been updated', time: '3h ago' },
  ];

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center gap-4">
          <div><h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Welcome, Prajol Annamudu</h1><p className="text-xs text-gray-500 dark:text-gray-400">viewer@estospaces.com</p></div>
        </div>

        {/* Right side - Search, Notifications, User */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const query = searchQuery.toLowerCase().trim();
              if (!query) return;

              // Navigation mapping for search
              const navigationMap = {
                'payments': '/user/dashboard/payments',
                'payment': '/user/dashboard/payments',
                'pay': '/user/dashboard/payments',
                'messages': '/user/dashboard/messages',
                'message': '/user/dashboard/messages',
                'chat': '/user/dashboard/messages',
                'contracts': '/user/dashboard/contracts',
                'contract': '/user/dashboard/contracts',
                'applications': '/user/dashboard/applications',
                'application': '/user/dashboard/applications',
                'apply': '/user/dashboard/applications',
                'viewings': '/user/dashboard/viewings',
                'viewing': '/user/dashboard/viewings',
                'schedule': '/user/dashboard/viewings',
                'saved': '/user/dashboard/saved',
                'favorites': '/user/dashboard/saved',
                'favorite': '/user/dashboard/saved',
                'discover': '/user/dashboard/discover',
                'browse': '/user/dashboard/discover',
                'properties': '/user/dashboard/discover',
                'property': '/user/dashboard/discover',
                'search': '/user/dashboard/discover',
                'reviews': '/user/dashboard/reviews',
                'review': '/user/dashboard/reviews',
                'settings': '/user/dashboard/settings',
                'setting': '/user/dashboard/settings',
                'profile': '/user/dashboard/profile',
                'help': '/user/dashboard/help',
                'support': '/user/dashboard/help',
              };

              // Check if query matches any navigation keyword
              for (const [key, path] of Object.entries(navigationMap)) {
                if (query.includes(key)) {
                  navigate(path);
                  setSearchQuery('');
                  return;
                }
              }
            }}
            className="hidden md:flex items-center max-w-md flex-1"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search: payments, messages, contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </form>

          {/* Theme Switcher - Only show on dashboard */}
          {isDashboard && <ThemeSwitcher />}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>

            {/* Notifications dropdown */}
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{notification.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">{notification.time}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-600 dark:text-gray-300 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Property Viewer</div>
                    <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">viewer@estospaces.com</div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Account Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Help & Support
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
