import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit, ArrowLeft, Shield, CheckCircle, Loader2, Home, Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import * as postcodeService from '../services/postcodeService';
import { supabase } from '../lib/supabase';
import { useProperties } from '../contexts/PropertiesContext';
import VerificationSection from '../components/Dashboard/VerificationSection';

const DashboardProfile = () => {
  const navigate = useNavigate();
  const { currentUser } = useProperties();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
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
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressTimer, setAddressTimer] = useState(null);

  // Extract postcode from address or handle postcode input
  useEffect(() => {
    const fetchAddresses = async () => {
      // Check if user entered a postcode (either in postcode field or at end of address)
      let postcodeToSearch = formData.postcode;
      
      if (!postcodeToSearch && formData.address) {
        // Try to extract postcode from address (UK postcode pattern)
        const postcodeMatch = formData.address.match(/\b([A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})\b/i);
        if (postcodeMatch) {
          postcodeToSearch = postcodeMatch[1];
        }
      }

      if (postcodeToSearch && postcodeService.isValidPostcode(postcodeToSearch)) {
        setLoadingAddresses(true);
        try {
          const addresses = await postcodeService.getAddressesByPostcode(postcodeToSearch);
          setAddressSuggestions(addresses);
          setShowAddressSuggestions(addresses.length > 0);
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

    const timer = setTimeout(() => {
      fetchAddresses();
    }, 500); // Debounce for 500ms

    setAddressTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData.postcode, formData.address]);

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
        // Load from Supabase profiles table or auth metadata
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if user has profile image in metadata
          if (user.user_metadata?.avatar_url) {
            setProfileImagePreview(user.user_metadata.avatar_url);
          }
          
          // Load other profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            setFormData(prev => ({
              ...prev,
              fullName: profile.full_name || prev.fullName,
              email: user.email || prev.email,
              phone: profile.phone || prev.phone,
              address: profile.address || prev.address,
              postcode: profile.postcode || prev.postcode,
            }));
            if (profile.avatar_url) {
              setProfileImagePreview(profile.avatar_url);
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setProfileImage(file);

    // Create preview
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
      // Upload to Supabase Storage
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        // If bucket doesn't exist, try creating it or use a fallback
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata or profiles table
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
            // If profiles table doesn't exist, update auth metadata
            const { error: metadataError } = await supabase.auth.updateUser({
              data: { avatar_url: publicUrl },
            });

            if (metadataError) {
              console.warn('Could not update profile image in database:', metadataError);
              // Still show the preview even if database update fails
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

    try {
      // Save profile data to Supabase
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

      // Upload image if selected
      if (profileImage) {
        await handleImageUpload();
      }

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-orange-500 mb-2">Profile</h1>
        <p className="text-gray-600 dark:text-orange-400">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Personal Information & Verification */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-orange-500">Personal Information</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
              >
                <Edit size={18} />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
              
              {/* Postcode Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Postcode
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Enter postcode to find addresses)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., PR1 1AA, SW1A 1AA"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                  {loadingAddresses && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-orange-500" size={18} />
                  )}
                </div>
              </div>

              {/* Address Field with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    onFocus={() => {
                      if (addressSuggestions.length > 0) {
                        setShowAddressSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowAddressSuggestions(false), 200);
                    }}
                    placeholder="Enter postcode above to see address options"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                  
                  {/* Address Suggestions Dropdown */}
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        Select an address:
                      </div>
                      {addressSuggestions.map((address, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAddressSelect(address)}
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-start gap-2">
                            <Home size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{address.line1}</p>
                              {address.line2 && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">{address.line2}</p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {address.city}, {address.postcode}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.postcode && !loadingAddresses && addressSuggestions.length === 0 && postcodeService.isValidPostcode(formData.postcode) && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    No addresses found for this postcode. You can still enter your address manually.
                  </p>
                )}
              </div>
              
              {/* Save Button */}
              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Verification Section - Comprehensive */}
          <VerificationSection userId={currentUser?.id} currentUser={currentUser} />
        </div>

        {/* Right Sidebar - Profile Summary and Settings */}
        <div className="space-y-6">
          {/* Profile Image Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center">
              {/* Profile Image */}
              <div className="relative mb-4">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
                    />
                    {isEditing && (
                      <button
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center border-4 border-orange-500">
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-orange-500 mb-1">{formData.fullName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Member since Jan 2024</p>
              
              {/* Upload Photo Button */}
              {isEditing && (
                <div className="w-full space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Choose from device or gallery (mobile: tap to access camera)
                  </p>
                  {profileImage && !uploadingImage && (
                    <button
                      onClick={handleImageUpload}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <CheckCircle size={18} />
                      <span>Save Image</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>


          {/* Account Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-orange-500 mb-4">Account Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Properties</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Contracts</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Messages</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">24</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;
