import { Search, Bell, User, Palette, Shield, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import * as managerVerificationService from '../../services/managerVerificationService';
import type { VerificationStatus } from '../../services/managerVerificationService';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  const themes = [
    { value: 'light' as const, label: 'Light' },
    { value: 'dark' as const, label: 'Dark' },
  ];

  // Fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user?.id) return;

      try {
        const result = await managerVerificationService.getManagerProfile(user.id);
        if (result.data) {
          setVerificationStatus(result.data.verification_status);
        }
      } catch (err) {
        console.error('Error fetching verification status:', err);
      }
    };

    fetchVerificationStatus();
  }, [user?.id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeSelect = (selectedTheme: typeof themes[number]['value']) => {
    setTheme(selectedTheme);
    setShowThemeDropdown(false);
  };

  const handleNotificationClick = (id: string, read: boolean) => {
    if (!read) markAsRead(id);
  };

  return (
    <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 font-sans transition-colors duration-300">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-6 flex-1">


            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="AI-powered search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white dark:focus:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Selector */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors duration-300"
                title="Theme"
              >
                <Palette className="w-6 h-6" />
              </button>

              {showThemeDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-2 z-50 transition-colors duration-300">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Select Theme</p>
                  </div>
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => handleThemeSelect(themeOption.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 active:bg-gray-200 dark:active:bg-gray-800 active:text-gray-900 dark:active:text-gray-100 transition-colors duration-300 flex items-center justify-between ${theme === themeOption.value ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium active:text-primary dark:active:text-primary' : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      <span>{themeOption.label}</span>
                      {theme === themeOption.value && (
                        <span className="text-primary">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Status Badge */}
            <HeaderVerificationBadge
              status={verificationStatus}
              onClick={() => navigate('/manager/dashboard/verification')}
            />

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300 ${showNotifications ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 transition-all duration-300">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.map((notification: any) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative cursor-pointer ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                            onClick={() => handleNotificationClick(notification.id, notification.read)}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-0.5 p-1.5 rounded-lg ${notification.read ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-primary/20 text-primary'}`}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <p className={`text-sm ${!notification.read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                    {notification.title}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <button
              onClick={() => navigate('/manager/dashboard/profile')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
              title="Profile"
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Verification badge for header
const HeaderVerificationBadge = ({
  status,
  onClick
}: {
  status: VerificationStatus | null;
  onClick: () => void;
}) => {
  if (!status) return null;

  const getConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Verified',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      case 'submitted':
      case 'under_review':
        return {
          icon: Clock,
          label: 'Pending',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-700 dark:text-yellow-400',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          label: 'Rejected',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-700 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800',
        };
      case 'verification_required':
        return {
          icon: AlertCircle,
          label: 'Update Required',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          textColor: 'text-orange-700 dark:text-orange-400',
          borderColor: 'border-orange-200 dark:border-orange-800',
        };
      default:
        return {
          icon: Shield,
          label: 'Verify Now',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-700 dark:text-gray-400',
          borderColor: 'border-gray-200 dark:border-gray-700',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
        ${config.bgColor} ${config.textColor} border ${config.borderColor}
        hover:opacity-80 transition-opacity
      `}
      title="View verification status"
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
};

export default Header;
