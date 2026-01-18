import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ArrowLeft, Shield, CheckCircle, Loader2, Home, Upload, X, Camera } from 'lucide-react';
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
      
      // Find current field index
      const currentIndex = fieldOrder.findIndex(field => field.name === currentFieldName);
      
      // Move to next field if available
      if (currentIndex !== -1 && currentIndex < fieldOrder.length - 1) {
        const nextField = fieldOrder[currentIndex + 1];
        if (nextField.ref.current) {
          nextField.ref.current.focus();
        }
      } else if (currentIndex === fieldOrder.length - 1) {
        // Last field - optionally trigger save
        // You could call handleSaveProfile() here if desired
      }
    }
  };

  // Fetch addresses when postcode changes
  useEffect(() => {
    const fetchAddresses = async () => {
      let postcodeToSearch = formData.postcode?.trim();
      
      // Only search if we have a valid UK postcode
      if (postcodeToSearch && postcodeService.isValidPostcode(postcodeToSearch)) {
        setLoadingAddresses(true);
        setShowAddressSuggestions(false); // Hide while loading
        
        try {
          const addresses = await postcodeService.getAddressesByPostcode(postcodeToSearch);
          setAddressSuggestions(addresses);
          // Automatically show suggestions when addresses are found
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
        // Clear suggestions if postcode is invalid or empty
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    };

    // Clear any existing timer
    if (addressTimer) {
      clearTimeout(addressTimer);
    }

    // Only fetch if postcode has at least 5 characters (minimum valid UK postcode length)
    if (formData.postcode && formData.postcode.length >= 5) {
      const timer = setTimeout(() => {
        fetchAddresses();
      }, 300); // Debounce for 300ms (faster response)

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

    setSavingProfile(true);
    setSaveSuccess(false);

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

      // Show success message
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
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/user/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile Image & Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Image Card - Modern & Prominent */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex flex-col items-center">
                {/* Profile Image with Enhanced Design */}
                <div className="relative mb-6 group">
                  {profileImagePreview ? (
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg ring-4 ring-orange-100 dark:ring-orange-900/30">
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Camera overlay on hover */}
                      <label
                        htmlFor="profile-image-upload"
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                      >
                        <div className="text-center">
                          <Camera size={28} className="text-white mx-auto mb-1" />
                          <span className="text-white text-xs font-medium">Change</span>
                        </div>
                      </label>
                      {/* Remove button */}
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="profile-image-upload"
                      className="relative w-32 h-32 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-full flex items-center justify-center border-4 border-orange-500 cursor-pointer group-hover:scale-105 transition-transform shadow-lg ring-4 ring-orange-100 dark:ring-orange-900/30"
                    >
                      <User size={56} className="text-white" />
                      {/* Camera icon overlay */}
                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={28} className="text-white" />
                      </div>
                    </label>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{formData.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{formData.email}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-6">
                  <CheckCircle size={14} className="text-green-500" />
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
                
                {/* Upload Button */}
                <div className="w-full space-y-3">
                  <label
                    htmlFor="profile-image-upload"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={18} />
                        <span>{profileImagePreview ? 'Change Photo' : 'Upload Photo'}</span>
                      </>
                    )}
                  </label>
                  {profileImage && !uploadingImage && (
                    <button
                      onClick={handleImageUpload}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                    >
                      <CheckCircle size={18} />
                      <span>Save Photo</span>
                    </button>
                  )}
                </div>
                </div>
              </div>

            {/* Account Stats - Modern Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Properties</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Contracts</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Messages</div>
                </div>
              </div>
            </div>

            {/* My Documents Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">My Documents</h3>
                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">For verification</span>
              </div>
              <DocumentUpload
                documents={[]}
                onUpload={() => {}}
                onDelete={() => {}}
                onReplace={() => {}}
              />
            </div>
          </div>

          {/* Right Column - Personal Information & Verification */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information Section - Always Editable */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Personal Information</h2>
                    <p className="text-orange-100 text-sm mt-1">Update your contact details and address</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User size={16} className="text-orange-500" />
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
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-orange-500" />
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
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-orange-500" />
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
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                    placeholder="+44 20 1234 5678"
                  />
                </div>
                {/* Postcode Field with Address Lookup */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-orange-500" />
                    Postcode
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(UK postcode)</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={postcodeRef}
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      onKeyDown={(e) => handleKeyDown(e, 'postcode')}
                      placeholder="e.g., PR1 1AA, SW1A 1AA"
                      autoComplete="postal-code"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all uppercase"
                    />
                    {loadingAddresses && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-orange-500" size={20} />
                    )}
                  </div>
                
                  {/* Address Suggestions Dropdown - Modern Design */}
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <div className="mt-3 bg-white dark:bg-gray-800 border-2 border-orange-400 dark:border-orange-500 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Home size={18} className="text-white" />
                          <span className="text-sm font-semibold text-white">
                            {addressSuggestions.length} addresses found for {formData.postcode.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-orange-100 mt-1">
                          Click to select your address
                        </p>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {addressSuggestions.map((address, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAddressSelect(address)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                                <Home size={16} className="text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                  {address.line1}
                                </p>
                                {address.line2 && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{address.line2}</p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {address.city}{address.county ? `, ${address.county}` : ''}, {address.postcode}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle size={18} className="text-orange-500" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                
                {/* Loading state message */}
                {loadingAddresses && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Searching for addresses...</span>
                  </div>
                )}
                
                {/* No results message */}
                {formData.postcode && !loadingAddresses && addressSuggestions.length === 0 && postcodeService.isValidPostcode(formData.postcode) && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin size={12} />
                    No addresses found for this postcode. Enter your address manually below.
                  </p>
                )}
                
                {/* Invalid postcode hint */}
                {formData.postcode && formData.postcode.length >= 3 && !postcodeService.isValidPostcode(formData.postcode) && !loadingAddresses && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <MapPin size={12} />
                    Enter a complete UK postcode (e.g., SW1A 1AA) to find addresses
                  </p>
                )}
                </div>

                {/* Address Field - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Home size={16} className="text-orange-500" />
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
                    placeholder="Your full address will appear here or enter manually"
                    autoComplete="street-address"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                  />
                </div>
              </div>
              
              {/* Success Message */}
              {saveSuccess && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300">Profile Updated!</p>
                    <p className="text-sm text-green-700 dark:text-green-400">Your changes have been saved successfully.</p>
                  </div>
                </div>
              )}

              {/* Save Button - Always Visible */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            </div>

            {/* Verification Section - Enhanced */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
