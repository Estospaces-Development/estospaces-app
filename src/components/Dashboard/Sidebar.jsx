import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  CreditCard,
  CheckCircle,
  Shield
} from 'lucide-react';
import { useMessages } from '../../contexts/MessagesContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserVerificationStatus } from '../../services/verificationService';

// Helper component to get unread count badge
const UnreadCountBadge = ({ isOpen }) => {
  const { totalUnreadCount } = useMessages();

  if (totalUnreadCount === 0) return null;

  if (isOpen) {
    return (
      <span className="ml-auto bg-orange-500 text-white text-xs font-medium rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
      </span>
    );
  } else {
    return (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900" />
    );
  }
};

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingVerification, setLoadingVerification] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/user/dashboard' },
    { icon: Search, label: 'Browse Properties', path: '/user/dashboard/discover' },
    { icon: FileText, label: 'My Applications', path: '/user/dashboard/applications' },
    { icon: Calendar, label: 'Viewings', path: '/user/dashboard/viewings' },
    { icon: MessageSquare, label: 'Messages', path: '/user/dashboard/messages', showBadge: true },
    { icon: CreditCard, label: 'Payments', path: '/user/dashboard/payments' },
    { icon: FileText, label: 'Contracts', path: '/user/dashboard/contracts' },
  ];

  const isActive = (path) => {
    if (path === '/user/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      if (signOut) {
        await signOut();
      } else {
        // Fallback: clear localStorage and sign out from Supabase
        await supabase.auth.signOut();
        localStorage.removeItem('managerVerified');
        localStorage.removeItem('leads');
      }
      // Navigate to home page after signout
      navigate('/');
      // Force a page reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      // On error, still clear storage and navigate
      localStorage.removeItem('managerVerified');
      localStorage.removeItem('leads');
      navigate('/');
      window.location.href = '/';
    } finally {
      setSigningOut(false);
    }
  };

  // Get current user and verification status
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase?.auth.getSession();
        setCurrentUser(session?.user || null);

        if (session?.user) {
          // Fetch verification status
          setLoadingVerification(true);
          const verificationResult = await getUserVerificationStatus(session.user.id);
          if (verificationResult && verificationResult.data) {
            setIsVerified(verificationResult.data.is_verified || false);
          }
          setLoadingVerification(false);
        } else {
          setLoadingVerification(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setLoadingVerification(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(async (event, session) => {
      setCurrentUser(session?.user || null);

      if (session?.user) {
        setLoadingVerification(true);
        const verificationResult = await getUserVerificationStatus(session.user.id);
        if (verificationResult && verificationResult.data) {
          setIsVerified(verificationResult.data.is_verified || false);
        }
        setLoadingVerification(false);
      } else {
        setIsVerified(false);
        setLoadingVerification(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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

      <aside
        id="sidebar-nav"
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 relative">
                  <User size={16} className="text-gray-600 dark:text-gray-300" />
                  {isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <CheckCircle size={10} className="text-white" fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Property Viewer</p>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium border border-green-200 dark:border-green-800 whitespace-nowrap">
                        <Shield size={10} className="flex-shrink-0" />
                        Verified
                      </span>
                    )}
                    {!isVerified && !loadingVerification && (
                      <CheckCircle size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentUser?.email || 'viewer@estospaces.com'}
                  </p>
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
                    id={item.label === 'Messages' ? 'messages-badge' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${active
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <Icon
                      size={20}
                      className={`flex-shrink-0 ${active ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                        }`}
                    />
                    {isOpen && <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>}
                    {item.showBadge && <UnreadCountBadge isOpen={isOpen} />}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section - Profile, Help & Support, Sign Out */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 px-3 pb-4 flex-shrink-0 space-y-1">
            {/* Profile */}
            <Link
              to="/user/dashboard/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${location.pathname === '/user/dashboard/profile'
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                } ${!isOpen && 'justify-center'}`}
            >
              <User
                size={20}
                className={`flex-shrink-0 ${location.pathname === '/user/dashboard/profile'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
              />
              {isOpen && <span className="text-xs font-medium whitespace-nowrap">Profile</span>}
            </Link>

            {/* Help & Support */}
            <Link
              to="/user/dashboard/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${location.pathname === '/user/dashboard/help'
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                } ${!isOpen && 'justify-center'}`}
            >
              <HelpCircle
                size={20}
                className={`flex-shrink-0 ${location.pathname === '/user/dashboard/help'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
              />
              {isOpen && <span className="text-xs font-medium whitespace-nowrap">Help & Support</span>}
            </Link>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400 group disabled:opacity-50 disabled:cursor-not-allowed ${!isOpen && 'justify-center'
                }`}
            >
              <LogOut size={20} className={`flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 ${signingOut ? 'animate-spin' : ''}`} />
              {isOpen && <span className="text-xs font-medium whitespace-nowrap">{signingOut ? 'Signing out...' : 'Sign Out'}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
