import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, ChevronDown } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import logoIcon from '../../assets/logo-icon.png';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, getDisplayName, signOut } = useAuth();
  const isDashboard = location.pathname.startsWith('/user/dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const logoRef = React.useRef(null);

  // Get user display name and email
  const displayName = getDisplayName ? getDisplayName() : (user?.email?.split('@')[0] || 'User');
  const userEmail = user?.email || '';

  const notifications = [
    { id: 1, title: 'New property available', message: 'A new property matches your criteria', time: '2m ago' },
    { id: 2, title: 'Payment received', message: 'Your payment has been processed', time: '1h ago' },
    { id: 3, title: 'Contract updated', message: 'Your contract has been updated', time: '3h ago' },
  ];

  return (
    <header className="h-16 bg-primary dark:bg-[#0a0a0a] sticky top-0 z-30 shadow-sm border-b border-primary/80 dark:border-gray-800">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side - Logo */}
        <button
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center gap-1.5 hover:opacity-90 transition-opacity duration-200 cursor-pointer"
          aria-label="Navigate to dashboard"
        >
          <img 
            ref={logoRef}
            src={logoIcon} 
            alt="Estospaces Logo" 
            className="h-8 w-auto object-contain transition-all duration-300"
            style={{ 
              filter: 'brightness(0) saturate(100%) invert(77%) sepia(95%) saturate(2500%) hue-rotate(345deg) brightness(1.6) contrast(1.2) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
              WebkitFilter: 'brightness(0) saturate(100%) invert(77%) sepia(95%) saturate(2500%) hue-rotate(345deg) brightness(1.6) contrast(1.2) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
            }}
          />
          <span className="text-xl font-bold text-white dark:text-orange-500 transition-colors duration-300" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Estospaces
          </span>
        </button>

        {/* Right side - Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell size={20} className="text-white dark:text-gray-200" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-primary"></span>
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
              className="flex items-center gap-2 p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="w-8 h-8 bg-white/20 dark:bg-gray-700 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 dark:border-gray-600">
                <User size={18} className="text-white dark:text-gray-200" />
              </div>
              <ChevronDown
                size={16}
                className={`text-white dark:text-gray-200 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
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
                    <div className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</div>
                    <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">{userEmail}</div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                    <button 
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/user/dashboard/settings');
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Account Settings
                    </button>
                    <button 
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/user/dashboard/help');
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Help & Support
                    </button>
                    <button 
                      onClick={async () => {
                        setUserMenuOpen(false);
                        // Handle logout
                        try {
                          if (signOut) {
                            await signOut();
                          } else if (isSupabaseAvailable()) {
                            await supabase.auth.signOut();
                          }
                          // Navigate to home page after logout
                          navigate('/');
                        } catch (error) {
                          console.error('Error signing out:', error);
                          // Fallback navigation
                          navigate('/');
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                    >
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
