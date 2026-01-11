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
  
  // Refs for form field navigation
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const postcodeRef = useRef(null);
  const addressRef = useRef(null);
  
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
                  ref={fullNameRef}
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'fullName')}
                  disabled={!isEditing}
                  autoComplete="name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'email')}
                  disabled={!isEditing}
                  autoComplete="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  ref={phoneRef}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, 'phone')}
                  disabled={!isEditing}
                  autoComplete="tel"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                />
              </div>
              
              {/* Postcode Field with Address Lookup */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Postcode
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Enter postcode to find addresses)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    ref={postcodeRef}
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleKeyDown(e, 'postcode')}
                    disabled={!isEditing}
                    placeholder="e.g., PR1 1AA, SW1A 1AA"
                    autoComplete="postal-code"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed uppercase"
                  />
                  {loadingAddresses && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-orange-500" size={18} />
                  )}
                </div>
                
                {/* Address Suggestions Dropdown - Shows directly below postcode */}
                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div className="mt-3 bg-white dark:bg-gray-800 border-2 border-orange-400 dark:border-orange-500 rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-orange-50 dark:bg-orange-900/30 px-4 py-3 border-b border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2">
                        <Home size={18} className="text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          {addressSuggestions.length} addresses found for {formData.postcode.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
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
                            <div className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                              <Home size={14} className="text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
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
                              <CheckCircle size={16} className="text-orange-500" />
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

              {/* Address Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    ref={addressRef}
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Last field - trigger save if editing
                        if (isEditing) {
                          handleSaveProfile();
                        }
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="Your full address will appear here"
                    autoComplete="street-address"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  />
                </div>
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
              {/* Profile Image with Camera Overlay */}
              <div className="relative mb-4 group">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-orange-500"
                    />
                    {/* Camera overlay - always visible on hover */}
                    <label
                      htmlFor="profile-image-upload"
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera size={24} className="text-white" />
                    </label>
                    {/* Remove button */}
                    <button
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="profile-image-upload"
                    className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center border-4 border-orange-500 cursor-pointer group-hover:from-orange-600 group-hover:to-orange-700 transition-all"
                  >
                    <User size={48} className="text-white" />
                    {/* Camera overlay */}
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </label>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-orange-500 mb-1">{formData.fullName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Member since Jan 2024</p>
              
              {/* Hidden file input - always available */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="profile-image-upload"
              />
              
              {/* Upload Photo Button - always visible */}
              <div className="w-full space-y-2">
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
                      <Camera size={18} />
                      <span>Change Photo</span>
                    </>
                  )}
                </label>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Click or hover on photo to change
                </p>
                {profileImage && !uploadingImage && (
                  <button
                    onClick={handleImageUpload}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle size={18} />
                    <span>Save Photo</span>
                  </button>
                )}
              </div>
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

          {/* My Documents Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-orange-500">My Documents</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">For verification</span>
            </div>
            
            <div className="space-y-3">
              {/* ID Document */}
              <DocumentUploadItem
                label="ID Document"
                description="Passport or Driving License"
                accept="image/*,.pdf"
                icon={<User size={18} className="text-orange-500" />}
              />
              
              {/* Proof of Address */}
              <DocumentUploadItem
                label="Proof of Address"
                description="Utility bill or bank statement"
                accept="image/*,.pdf"
                icon={<Home size={18} className="text-orange-500" />}
              />
              
              {/* Employment Proof */}
              <DocumentUploadItem
                label="Employment Proof"
                description="Payslip or employment letter"
                accept="image/*,.pdf"
                icon={<Mail size={18} className="text-orange-500" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Upload Item Component
const DocumentUploadItem = ({ label, description, accept, icon }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Simulate upload
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        setUploaded(true);
      }, 1500);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploaded(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`p-3 rounded-lg border transition-all ${
      uploaded 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-orange-300'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${uploaded ? 'bg-green-100' : 'bg-orange-100'}`}>
          {uploaded ? <CheckCircle size={18} className="text-green-600" /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${uploaded ? 'text-green-700' : 'text-gray-800 dark:text-gray-200'}`}>
            {label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {uploaded ? file?.name : description}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`doc-${label.replace(/\s/g, '-').toLowerCase()}`}
        />
        {uploading ? (
          <Loader2 size={18} className="animate-spin text-orange-500" />
        ) : uploaded ? (
          <button
            onClick={handleRemove}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove"
          >
            <X size={16} />
          </button>
        ) : (
          <label
            htmlFor={`doc-${label.replace(/\s/g, '-').toLowerCase()}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            <Upload size={14} />
            Upload
          </label>
        )}
      </div>
    </div>
  );
};

export default DashboardProfile;
