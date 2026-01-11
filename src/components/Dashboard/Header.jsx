import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, User, ChevronDown, Loader2, LogOut, Settings, HelpCircle } from 'lucide-react';
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const logoRef = React.useRef(null);

  // Get user display name and email
  const displayName = getDisplayName ? getDisplayName() : (user?.email?.split('@')[0] || 'User');
  const userEmail = user?.email || '';
  const firstName = profile?.first_name || displayName?.split(' ')[0] || 'there';

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const notifications = [
    { id: 1, title: 'New property available', message: 'A new property matches your criteria', time: '2m ago' },
    { id: 2, title: 'Payment received', message: 'Your payment has been processed', time: '1h ago' },
    { id: 3, title: 'Contract updated', message: 'Your contract has been updated', time: '3h ago' },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setUserMenuOpen(false);
    
    // Create a timeout promise to ensure we redirect even if sign out hangs
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
    
    const signOutPromise = (async () => {
      try {
        // Try to sign out via AuthContext first
        if (signOut) {
          await signOut();
        } else if (isSupabaseAvailable()) {
          // Fallback to direct Supabase sign out
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error signing out:', error);
      }
    })();
    
    // Wait for either sign out to complete or timeout (whichever comes first)
    await Promise.race([signOutPromise, timeoutPromise]);
    
    // Clear any local storage auth data
    try {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-yydtsteyknbpfpxjtlxe-auth-token');
      sessionStorage.clear();
    } catch (e) {
      // Ignore storage errors
    }
    
    // Force redirect to landing page
    window.location.href = '/';
  };

  return (
    <header className="h-16 bg-primary dark:bg-[#0a0a0a] sticky top-0 z-30 shadow-sm border-b border-primary/80 dark:border-gray-800">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side - Logo - Clickable to go to dashboard */}
        <div className="flex items-center gap-6">
          <Link
            to="/user/dashboard"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity duration-200 cursor-pointer no-underline"
            aria-label="Navigate to dashboard"
          >
            <img 
              ref={logoRef}
              src={logoIcon} 
              alt="Estospaces Logo" 
              className="h-8 w-auto object-contain transition-all duration-300"
              style={{ 
                filter: 'brightness(0) invert(1)',
                WebkitFilter: 'brightness(0) invert(1)'
              }}
            />
            <span className="text-xl font-bold text-white dark:text-orange-500 transition-colors duration-300 hover:text-white/90" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              Estospaces
            </span>
          </Link>

          {/* Welcome Message */}
          <div className="hidden md:flex flex-col">
            <span className="text-white/90 text-sm font-medium">
              {getGreeting()}, <span className="text-white font-semibold capitalize">{firstName}</span>! 👋
            </span>
            <span className="text-white/60 text-xs">
              Find your perfect home today
            </span>
          </div>
        </div>

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
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{displayName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{userEmail}</div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/user/dashboard/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Settings size={18} className="text-gray-400" />
                      Account Settings
                    </button>
                    <button 
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/user/dashboard/help');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <HelpCircle size={18} className="text-gray-400" />
                      Help & Support
                    </button>
                  </div>
                  
                  {/* Sign Out */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                    <button 
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningOut ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <LogOut size={18} />
                      )}
                      {isSigningOut ? 'Signing Out...' : 'Log Out'}
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
