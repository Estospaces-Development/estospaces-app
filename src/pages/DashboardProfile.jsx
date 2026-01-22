import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ArrowLeft, Shield, CheckCircle, Loader2, Home, Upload, X, Camera, Edit3 } from 'lucide-react';
import * as postcodeService from '../services/postcodeService';
import { supabase } from '../lib/supabase';
import { useProperties } from '../contexts/PropertiesContext';
import VerificationSection from '../components/Dashboard/VerificationSection';
import DashboardFooter from '../components/Dashboard/DashboardFooter';
import DocumentUpload from '../components/Dashboard/Applications/DocumentUpload';

const DashboardProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useProperties();
  const fileInputRef = useRef(null);

  // Refs for form field navigation
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const postcodeRef = useRef(null);
  const addressRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: 'Thomas Anderson',
    email: 'thomas@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, San Francisco, CA 94102',
    postcode: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressTimer, setAddressTimer] = useState(null);

  // Define the order of fields for Enter key navigation
  const fieldOrder = [
    { ref: fullNameRef, name: 'fullName' },
    { ref: emailRef, name: 'email' },
    { ref: phoneRef, name: 'phone' },
    { ref: postcodeRef, name: 'postcode' },
    { ref: addressRef, name: 'address' },
  ];

  // Handle Enter key to move to next field
  const handleKeyDown = (e, currentFieldName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = fieldOrder.findIndex(field => field.name === currentFieldName);
      if (currentIndex !== -1 && currentIndex < fieldOrder.length - 1) {
        const nextField = fieldOrder[currentIndex + 1];
        if (nextField.ref.current) {
          nextField.ref.current.focus();
        }
      }
    }
  };

  // Fetch addresses when postcode changes
  useEffect(() => {
    const fetchAddresses = async () => {
      let postcodeToSearch = formData.postcode?.trim();
      if (postcodeToSearch && postcodeService.isValidPostcode(postcodeToSearch)) {
        setLoadingAddresses(true);
        setShowAddressSuggestions(false);
        try {
          const addresses = await postcodeService.getAddressesByPostcode(postcodeToSearch);
          setAddressSuggestions(addresses);
          if (addresses.length > 0) {
            setShowAddressSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setAddressSuggestions([]);
          setShowAddressSuggestions(false);
        } finally {
          setLoadingAddresses(false);
        }
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    };

    if (addressTimer) {
      clearTimeout(addressTimer);
    }

    if (formData.postcode && formData.postcode.length >= 5) {
      const timer = setTimeout(() => {
        fetchAddresses();
      }, 300);
      setAddressTimer(timer);
      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
  }, [formData.postcode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressSelect = (address) => {
    setFormData(prev => ({
      ...prev,
      address: address.fullAddress,
      postcode: address.postcode,
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  // Load user profile data including image
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      try {
        const { MOCK_USER_PROFILE } = await import('../services/mockDataService');
        const profileData = MOCK_USER_PROFILE;
        setFormData({
          fullName: profileData.full_name || '',
          email: profileData.email || currentUser.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          postcode: profileData.postcode || '',
        });
        if (profileData.avatar_url) {
          setProfileImagePreview(profileData.avatar_url);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (currentUser) {
          setFormData(prev => ({
            ...prev,
            email: currentUser.email,
            fullName: currentUser.user_metadata?.full_name || '',
          }));
          if (currentUser.user_metadata?.avatar_url) {
            setProfileImagePreview(currentUser.user_metadata.avatar_url);
          }
        }
      }
    };
    loadProfile();
  }, [currentUser]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!profileImage || !currentUser) {
      alert('Please select an image first');
      return;
    }
    setUploadingImage(true);
    try {
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: true,
        });
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      if (publicUrl) {
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: currentUser.id,
              avatar_url: publicUrl,
              updated_at: new Date().toISOString(),
            });
          if (updateError) {
            const { error: metadataError } = await supabase.auth.updateUser({
              data: { avatar_url: publicUrl },
            });
            if (metadataError) {
              console.warn('Could not update profile image in database:', metadataError);
            }
          }
        } catch (err) {
          console.warn('Error updating profile:', err);
        }
      }
      setProfileImagePreview(publicUrl);
      setProfileImage(null);
      alert('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) {
      alert('Please log in to save your profile');
      return;
    }
    setSavingProfile(true);
    setSaveSuccess(false);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          postcode: formData.postcode,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
        return;
      }
      if (profileImage) {
        await handleImageUpload();
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/user/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>

        {/* Header Section - Modern & Minimal */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account settings and personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile Image & Stats */}
          <div className="lg:col-span-4 space-y-5">
            {/* Profile Image Card - Clean & Minimal */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col items-center">
                {/* Profile Image - Subtle Design */}
                <div className="relative mb-5 group">
                  {profileImagePreview ? (
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Camera overlay on hover */}
                      <label
                        htmlFor="profile-image-upload"
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Camera size={24} className="text-white" />
                      </label>
                      {/* Remove button */}
                      <button
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 rounded-full p-1.5 shadow-sm transition-all"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="profile-image-upload"
                      className="relative w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 cursor-pointer group-hover:border-gray-300 dark:group-hover:border-gray-500 transition-all"
                    >
                      <User size={48} className="text-gray-400 dark:text-gray-500" />
                      {/* Camera icon overlay */}
                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                      </div>
                    </label>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{formData.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{formData.email}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-2">
                  <CheckCircle size={12} className="text-green-500" />
                  <span>Member since Jan 2024</span>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="profile-image-upload"
                />

                {/* Upload Button - Minimal Style */}
                <div className="w-full mt-5">
                  <label
                    htmlFor="profile-image-upload"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        <span>{profileImagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Stats - Clean Design */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4 text-sm">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">12</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Properties</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">8</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Contracts</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">24</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Messages</div>
                </div>
              </div>
            </div>

            {/* My Documents Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">My Documents</h3>
                <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">For verification</span>
              </div>
              <DocumentUpload
                documents={[]}
                onUpload={() => { }}
                onDelete={() => { }}
                onReplace={() => { }}
              />
            </div>
          </div>

          {/* Right Column - Personal Information & Verification */}
          <div className="lg:col-span-8 space-y-5">
            {/* Personal Information Section - Clean Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header - Minimal Design */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Update your contact details and address</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <Edit3 size={18} className="text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      ref={fullNameRef}
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleKeyDown(e, 'fullName')}
                      autoComplete="name"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      ref={emailRef}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleKeyDown(e, 'email')}
                      autoComplete="email"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      ref={phoneRef}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleKeyDown(e, 'phone')}
                      autoComplete="tel"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all text-sm"
                      placeholder="+44 20 1234 5678"
                    />
                  </div>
                  {/* Postcode Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Postcode <span className="text-gray-400 font-normal">(UK)</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={postcodeRef}
                        type="text"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleKeyDown(e, 'postcode')}
                        placeholder="e.g., SW1A 1AA"
                        autoComplete="postal-code"
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all uppercase text-sm"
                      />
                      {loadingAddresses && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" size={18} />
                      )}
                    </div>

                    {/* Address Suggestions Dropdown */}
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {addressSuggestions.length} addresses found
                          </span>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {addressSuggestions.map((address, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAddressSelect(address)}
                              className="w-full text-left px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-b-0 text-sm"
                            >
                              <p className="font-medium">{address.line1}</p>
                              {address.line2 && (
                                <p className="text-xs text-gray-500 mt-0.5">{address.line2}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">
                                {address.city}, {address.postcode}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address Field - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Address
                    </label>
                    <input
                      ref={addressRef}
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveProfile();
                        }
                      }}
                      placeholder="Your full address"
                      autoComplete="street-address"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Success Message */}
                {saveSuccess && (
                  <div className="mt-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300 text-sm">Profile Updated!</p>
                      <p className="text-xs text-green-700 dark:text-green-400">Your changes have been saved successfully.</p>
                    </div>
                  </div>
                )}

                {/* Save Button - Minimal Style */}
                <div className="pt-5 mt-5 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:cursor-not-allowed shadow-sm"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <VerificationSection userId={currentUser?.id} currentUser={currentUser} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
};

export default DashboardProfile;
