import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, BadgeCheck, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/ui/BackButton';
import { useAuth } from '../contexts/AuthContext';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  company_name: string;
  role: string;
  avatar_url: string;
  is_verified: boolean;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { 
    user, 
    profile, 
    loading, 
    profileLoading, 
    error, 
    isAuthenticated,
    isSupabaseConfigured,
    updateProfile,
    signOut,
    getDisplayName,
    getRole,
    getAvatarUrl,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    company_name: '',
    role: 'user',
    avatar_url: '',
    is_verified: false,
    created_at: '',
  });

  // Populate form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        role: profile.role || 'user',
        avatar_url: profile.avatar_url || '',
        is_verified: profile.is_verified || false,
        created_at: profile.created_at || '',
      });
    } else if (user) {
      // Fallback to user metadata if profile doesn't exist
      setFormData({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        location: '',
        bio: '',
        company_name: '',
        role: user.user_metadata?.role || 'user',
        avatar_url: user.user_metadata?.avatar_url || '',
        is_verified: false,
        created_at: user.created_at || '',
      });
    }
  }, [profile, user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const result = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        company_name: formData.company_name,
      });

      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
    // Reset form data to current profile
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        role: profile.role || 'user',
        avatar_url: profile.avatar_url || '',
        is_verified: profile.is_verified || false,
        created_at: profile.created_at || '',
      });
    }
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

  const handleSignOut = async () => {
    const confirm = window.confirm('Are you sure you want to sign out?');
    if (confirm) {
      await signOut();
      navigate('/auth/login');
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      user: 'User',
      manager: 'Property Manager',
      admin: 'Administrator',
    };
    return labels[role] || role;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Not Signed In</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your profile.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show Supabase not configured warning
  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Configuration Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Supabase is not configured. Please check your environment variables.
          </p>
        </div>
      </div>
    );
  }

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

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <BadgeCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300">Profile updated successfully!</span>
        </div>
      )}

      {(saveError || error) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{saveError || error}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-orange-600 p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {getAvatarUrl() ? (
                  <img 
                    src={getAvatarUrl() || undefined} 
                    alt={getDisplayName()} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-primary" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 text-white text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-bold">{getDisplayName()}</h2>
                {formData.is_verified && (
                  <BadgeCheck className="w-6 h-6 text-white" />
                )}
              </div>
              <p className="text-orange-100">{getRoleLabel(getRole())}</p>
              <p className="text-sm text-orange-100 mt-1">
                {user?.email}
              </p>
              <p className="text-sm text-orange-100 mt-1">
                Member since {formatDate(formData.created_at || user?.created_at || undefined)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
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
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          {profileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
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
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{formData.full_name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{user?.email || formData.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
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
                      placeholder="+1 (555) 000-0000"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{formData.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                    <span>{getRoleLabel(formData.role)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Additional Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City, Country"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{formData.location || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your company or agency"
                    />
                  ) : (
                    <div className="text-gray-900 dark:text-white">
                      {formData.company_name || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="text-gray-900 dark:text-white">
                      {formData.bio || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{formatDate(formData.created_at || user?.created_at || undefined)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
