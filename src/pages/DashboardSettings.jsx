import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Lock, 
  CreditCard, 
  Globe, 
  ArrowLeft, 
  Save, 
  Loader2,
  Mail,
  Smartphone,
  MessageSquare,
  Moon,
  Clock,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences 
} from '../services/notificationsService';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

const DashboardSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  // Notification preferences state
  const [preferences, setPreferences] = useState({
    // Email
    email_enabled: true,
    email_viewing_updates: true,
    email_application_updates: true,
    email_message_notifications: true,
    email_price_alerts: true,
    email_property_recommendations: true,
    email_marketing: false,
    // Push
    push_enabled: true,
    push_viewing_updates: true,
    push_application_updates: true,
    push_message_notifications: true,
    push_price_alerts: true,
    // SMS
    sms_enabled: false,
    sms_viewing_reminders: false,
    sms_urgent_updates: false,
    // Quiet Hours
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const prefs = await getNotificationPreferences(user.id);
        if (prefs) {
          setPreferences(prev => ({ ...prev, ...prefs }));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setSaveSuccess(false);
  };

  const handleTimeChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const success = await updateNotificationPreferences(user.id, preferences);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked 
          ? 'bg-orange-500' 
          : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : saveSuccess ? (
                <Check size={18} />
              ) : (
                <Save size={18} />
              )}
              <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive updates via email
                  </p>
                </div>
                <div className="ml-auto">
                  <Toggle
                    checked={preferences.email_enabled}
                    onChange={() => handleToggle('email_enabled')}
                  />
                </div>
              </div>

              <div className={`space-y-4 ${!preferences.email_enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Viewing Updates</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Confirmations, reminders, and changes
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.email_viewing_updates}
                    onChange={() => handleToggle('email_viewing_updates')}
                    disabled={!preferences.email_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Application Updates</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status changes and document requests
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.email_application_updates}
                    onChange={() => handleToggle('email_application_updates')}
                    disabled={!preferences.email_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Messages</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      New messages from agents and landlords
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.email_message_notifications}
                    onChange={() => handleToggle('email_message_notifications')}
                    disabled={!preferences.email_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Price Alerts</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Price drops on saved properties
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.email_price_alerts}
                    onChange={() => handleToggle('email_price_alerts')}
                    disabled={!preferences.email_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Property Recommendations</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      New properties matching your criteria
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.email_property_recommendations}
                    onChange={() => handleToggle('email_property_recommendations')}
                    disabled={!preferences.email_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Marketing & Promotions</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Special offers and news
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.email_marketing}
                    onChange={() => handleToggle('email_marketing')}
                    disabled={!preferences.email_enabled}
                  />
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Bell size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Push Notifications</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive in-app notifications
                  </p>
                </div>
                <div className="ml-auto">
                  <Toggle
                    checked={preferences.push_enabled}
                    onChange={() => handleToggle('push_enabled')}
                  />
                </div>
              </div>

              <div className={`space-y-4 ${!preferences.push_enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Viewing Updates</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Real-time viewing notifications
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.push_viewing_updates}
                    onChange={() => handleToggle('push_viewing_updates')}
                    disabled={!preferences.push_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Application Updates</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Instant application status updates
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.push_application_updates}
                    onChange={() => handleToggle('push_application_updates')}
                    disabled={!preferences.push_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Messages</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Instant message notifications
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.push_message_notifications}
                    onChange={() => handleToggle('push_message_notifications')}
                    disabled={!preferences.push_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Price Alerts</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Instant price drop alerts
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.push_price_alerts}
                    onChange={() => handleToggle('push_price_alerts')}
                    disabled={!preferences.push_enabled}
                  />
                </div>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Smartphone size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SMS Notifications</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive text message alerts
                  </p>
                </div>
                <div className="ml-auto">
                  <Toggle
                    checked={preferences.sms_enabled}
                    onChange={() => handleToggle('sms_enabled')}
                  />
                </div>
              </div>

              <div className={`space-y-4 ${!preferences.sms_enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Viewing Reminders</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      SMS reminder before viewings
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.sms_viewing_reminders}
                    onChange={() => handleToggle('sms_viewing_reminders')}
                    disabled={!preferences.sms_enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Urgent Updates</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Critical updates via SMS
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.sms_urgent_updates}
                    onChange={() => handleToggle('sms_urgent_updates')}
                    disabled={!preferences.sms_enabled}
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Moon size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quiet Hours</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pause notifications during set hours
                  </p>
                </div>
                <div className="ml-auto">
                  <Toggle
                    checked={preferences.quiet_hours_enabled}
                    onChange={() => handleToggle('quiet_hours_enabled')}
                  />
                </div>
              </div>

              <div className={`${!preferences.quiet_hours_enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4 py-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">From</span>
                    <input
                      type="time"
                      value={preferences.quiet_hours_start}
                      onChange={(e) => handleTimeChange('quiet_hours_start', e.target.value)}
                      disabled={!preferences.quiet_hours_enabled}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">To</span>
                    <input
                      type="time"
                      value={preferences.quiet_hours_end}
                      onChange={(e) => handleTimeChange('quiet_hours_end', e.target.value)}
                      disabled={!preferences.quiet_hours_enabled}
                      className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Lock size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
              </div>
              <div className="space-y-4">
                <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white font-medium">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white font-medium">
                  Two-Factor Authentication
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white font-medium">
                  Active Sessions
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CreditCard size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
              </div>
              <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white font-medium">
                Manage Payment Methods
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Globe size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white">
                    <option>UTC+0 (GMT / London)</option>
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+1 (Central European)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white">
                    <option>GBP (£)</option>
                    <option>EUR (€)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DashboardFooter />
    </div>
  );
};

export default DashboardSettings;
