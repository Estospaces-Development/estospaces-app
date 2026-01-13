import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  MessageCircle,
  Calendar,
  Home,
  DollarSign,
  Trash2,
  CheckCheck,
  Clock,
  Filter,
  ArrowLeft,
  Settings,
  Search,
  X,
  Inbox,
} from 'lucide-react';
import { useNotifications, NOTIFICATION_TYPES } from '../contexts/NotificationsContext';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

type FilterType = 'all' | 'unread' | 'read';
type CategoryType = 'all' | 'appointments' | 'applications' | 'messages' | 'system';

const DashboardNotifications: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('all');
  const [category, setCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification: any) => {
      // Read/unread filter
      if (filter === 'unread' && notification.read) return false;
      if (filter === 'read' && !notification.read) return false;

      // Category filter
      if (category !== 'all') {
        const typeCategories: Record<CategoryType, string[]> = {
          appointments: [
            NOTIFICATION_TYPES.APPOINTMENT_APPROVED,
            NOTIFICATION_TYPES.APPOINTMENT_REJECTED,
          ],
          applications: [NOTIFICATION_TYPES.APPLICATION_UPDATE],
          messages: [NOTIFICATION_TYPES.TICKET_RESPONSE],
          system: [
            NOTIFICATION_TYPES.DOCUMENT_VERIFIED,
            NOTIFICATION_TYPES.PROFILE_VERIFIED,
            NOTIFICATION_TYPES.SYSTEM,
          ],
          all: [],
        };
        if (!typeCategories[category].includes(notification.type)) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [notifications, filter, category, searchQuery]);

  const getNotificationIcon = (type: string) => {
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
      case 'property_saved':
        return <Home size={20} className="text-orange-500" />;
      case 'price_drop':
        return <DollarSign size={20} className="text-green-500" />;
      case 'viewing_booked':
        return <Calendar size={20} className="text-blue-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case NOTIFICATION_TYPES.APPOINTMENT_APPROVED:
      case NOTIFICATION_TYPES.DOCUMENT_VERIFIED:
      case NOTIFICATION_TYPES.PROFILE_VERIFIED:
      case 'price_drop':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case NOTIFICATION_TYPES.APPOINTMENT_REJECTED:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case NOTIFICATION_TYPES.APPLICATION_UPDATE:
      case 'viewing_booked':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case NOTIFICATION_TYPES.TICKET_RESPONSE:
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'property_saved':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data?.propertyId) {
      navigate(`/user/dashboard/property/${notification.data.propertyId}`);
    } else if (notification.data?.applicationId) {
      navigate('/user/dashboard/applications');
    } else if (notification.data?.viewingId) {
      navigate('/user/dashboard/viewings');
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n: any) => n.id));
    }
  };

  const handleDeleteSelected = () => {
    selectedNotifications.forEach((id) => deleteNotification(id));
    setSelectedNotifications([]);
  };

  const handleMarkSelectedAsRead = () => {
    selectedNotifications.forEach((id) => markAsRead(id));
    setSelectedNotifications([]);
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    filteredNotifications.forEach((notification: any) => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week';
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Month';
      } else {
        groupKey = 'Older';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/user/dashboard')}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Bell className="text-orange-500" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Stay updated with your property activities
              </p>
            </div>
            <button
              onClick={() => navigate('/user/dashboard/settings')}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              <Settings size={18} />
              <span>Preferences</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Bell size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {notifications.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {unreadCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Unread</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {notifications.length - unreadCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Read</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-700 dark:text-gray-300"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Categories</option>
                <option value="appointments">Appointments</option>
                <option value="applications">Applications</option>
                <option value="messages">Messages</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      {(selectedNotifications.length > 0 || unreadCount > 0) && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotifications.length > 0
                    ? `${selectedNotifications.length} selected`
                    : 'Select all'}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              {selectedNotifications.length > 0 ? (
                <>
                  <button
                    onClick={handleMarkSelectedAsRead}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <CheckCheck size={16} />
                    <span>Mark read</span>
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </>
              ) : unreadCount > 0 ? (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                >
                  <CheckCheck size={16} />
                  <span>Mark all as read</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || filter !== 'all' || category !== 'all'
                ? 'No matching notifications'
                : 'No notifications yet'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery || filter !== 'all' || category !== 'all'
                ? 'Try adjusting your search or filters.'
                : "We'll notify you when something important happens with your properties."}
            </p>
            {(searchQuery || filter !== 'all' || category !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setCategory('all');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupOrder.map((groupName) => {
              const groupNotifications = groupedNotifications[groupName];
              if (!groupNotifications?.length) return null;

              return (
                <div key={groupName}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    {groupName}
                  </h3>
                  <div className="space-y-2">
                    {groupNotifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`bg-white dark:bg-gray-800 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                          !notification.read
                            ? 'border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-4 p-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectNotification(notification.id);
                            }}
                            className="mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />

                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${getNotificationColor(
                              notification.type
                            )}`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div
                            className="flex-1 min-w-0"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                className={`font-semibold ${
                                  !notification.read
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                )}
                                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                  {formatTime(notification.created_at)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            {notification.data?.propertyTitle && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <Home size={12} />
                                <span>{notification.data.propertyTitle}</span>
                              </div>
                            )}
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DashboardFooter />
    </div>
  );
};

export default DashboardNotifications;
