import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Shield,
  MessageCircle,
  Trash2,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationsContext';
import { useToast } from '../../contexts/ToastContext';

const NotificationDropdown = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const toast = useToast();
  const prevNotificationsRef = useRef([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show toast when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0 && prevNotificationsRef.current.length > 0) {
      const prevNotificationIds = new Set(prevNotificationsRef.current.map(n => n.id));
      const newNotifications = notifications.filter(n => !prevNotificationIds.has(n.id));
      
      if (newNotifications.length > 0) {
        // Show toast for the most recent new notification
        const latestNotification = newNotifications[0];
        const notificationType = latestNotification.type || '';
        
        // Determine toast type based on notification type
        let toastMethod = toast.info;
        if (notificationType.includes('error') || notificationType.includes('rejected') || notificationType.includes('failed')) {
          toastMethod = toast.error;
        } else if (notificationType.includes('warning') || notificationType.includes('reminder')) {
          toastMethod = toast.warning;
        } else if (notificationType.includes('approved') || notificationType.includes('verified') || notificationType.includes('success')) {
          toastMethod = toast.success;
        }
        
        toastMethod(latestNotification.message || latestNotification.title, {
          title: latestNotification.title,
          duration: 5000,
          position: 'top-right',
        });
      }
    }
    prevNotificationsRef.current = notifications;
  }, [notifications, toast]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.APPOINTMENT_APPROVED:
        return <CheckCircle size={20} className="text-green-500" />;
      case NOTIFICATION_TYPES.APPOINTMENT_REJECTED:
        return <AlertCircle size={20} className="text-red-500" />;
      case NOTIFICATION_TYPES.APPLICATION_UPDATE:
        return <FileText size={20} className="text-blue-500" />;
      case NOTIFICATION_TYPES.DOCUMENT_VERIFIED:
      case NOTIFICATION_TYPES.PROFILE_VERIFIED:
        return <Shield size={20} className="text-green-500" />;
      case NOTIFICATION_TYPES.TICKET_RESPONSE:
        return <MessageCircle size={20} className="text-purple-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.APPOINTMENT_APPROVED:
      case NOTIFICATION_TYPES.DOCUMENT_VERIFIED:
      case NOTIFICATION_TYPES.PROFILE_VERIFIED:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case NOTIFICATION_TYPES.APPOINTMENT_REJECTED:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case NOTIFICATION_TYPES.APPLICATION_UPDATE:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case NOTIFICATION_TYPES.TICKET_RESPONSE:
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        type="button"
        aria-label="Notifications"
      >
        <Bell size={22} className="text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] overflow-hidden animate-scaleIn">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-white" />
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  We'll notify you about important updates
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold truncate ${
                            !notification.read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={12} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <Clock size={12} />
                          {formatTime(notification.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Link
                to={location.pathname.includes('/manager') ? "/manager/dashboard/notifications" : "/user/dashboard/notifications"}
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;


