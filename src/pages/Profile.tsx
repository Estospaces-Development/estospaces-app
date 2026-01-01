import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, BadgeCheck } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    name: 'Property Manager',
    email: 'manager@estospaces.com',
    phone: '+1 (555) 123-4567',
    address: '123 Property Management St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    joinDate: 'January 15, 2024',
    role: 'Property Manager',
    verified: true,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    // Handle password change
    console.log('Changing password...');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password changed successfully');
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      // In a real app, this would initiate 2FA setup
      const confirm = window.confirm('This will enable Two-Factor Authentication. Do you want to continue?');
      if (confirm) {
        setTwoFactorEnabled(true);
        alert('Two-Factor Authentication enabled successfully');
      }
    } else {
      const confirm = window.confirm('Are you sure you want to disable Two-Factor Authentication?');
      if (confirm) {
        setTwoFactorEnabled(false);
        alert('Two-Factor Authentication disabled');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your profile information and settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-orange-600 p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-primary" />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{formData.name}</h2>
                {formData.verified && (
                  <BadgeCheck className="w-6 h-6 text-white" />
                )}
              </div>
              <p className="text-orange-100">{formData.role}</p>
              <p className="text-sm text-orange-100 mt-1">Member since {formData.joinDate}</p>
            </div>
            <div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Personal Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{formData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{formData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{formData.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                  <span>{formData.role}</span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Address Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{formData.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="text-gray-900 dark:text-white">{formData.city}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="text-gray-900 dark:text-white">{formData.state}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ZIP Code
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="text-gray-900 dark:text-white">{formData.zipCode}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="text-gray-900 dark:text-white">{formData.country}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Member Since
                </label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>{formData.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Change Password</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your password to keep your account secure</p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Change Password
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
              </p>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`px-4 py-2 rounded-lg transition-colors ${
                twoFactorEnabled
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
