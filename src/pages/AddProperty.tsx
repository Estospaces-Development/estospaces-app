import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProperties, Property } from '../contexts/PropertyContext';
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Bold,
  Italic,
  Underline,
  List,
  Link as LinkIcon,
  CheckCircle,
} from 'lucide-react';

const AddProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { addProperty, updateProperty, getProperty } = useProperties();
  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Property>>({
    // Basic Info
    title: '',
    propertyType: '',
    rentalType: '',
    price: '',
    status: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    // Property Details
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    yearBuilt: 0,
    propertyId: '',
    description: '',
    // Media & Features
    images: [],
    virtualTourUrl: '',
    videos: [],
    features: [],
    // Contact & Publish
    availableDate: '',
    deposit: '',
    inclusions: '',
    exclusions: '',
    contactName: '',
    phoneNumber: '',
    emailAddress: '',
    published: false,
    draft: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode && id) {
      const property = getProperty(id);
      if (property) {
        setFormData(property);
        // Convert image/video URLs to previews if they exist
        if (property.images && property.images.length > 0) {
          setImagePreviews(property.images as string[]);
        }
        if (property.videos && property.videos.length > 0) {
          setVideoPreviews(property.videos as string[]);
        }
      }
    }
  }, [id, isEditMode, getProperty]);

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Property Details' },
    { number: 3, title: 'Media & Features' },
    { number: 4, title: 'Contact & Publish' },
  ];

  const propertyTypes = ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa', 'Penthouse'];
  const rentalTypes = ['Rent', 'Sale', 'Lease'];
  const statusOptions = ['Available', 'Pending', 'Sold', 'Rented'];
  const featuresList = [
    'Balcony',
    'Garden',
    'Swimming pool',
    'Gym / Fitness Center',
    'Parking',
    'Security',
    'Elevator',
    'AC',
    'Central heating',
    'Wifi included',
    'Near shopping',
    'Near school',
    'Near Hospital',
    'Near Airport',
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title?.trim()) newErrors.title = 'Property title is required';
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
      if (!formData.rentalType) newErrors.rentalType = 'Rental type is required';
      if (!formData.price?.trim()) newErrors.price = 'Price is required';
      if (!formData.status) newErrors.status = 'Status is required';
      if (!formData.address?.trim()) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode?.trim()) newErrors.zipCode = 'Zip code is required';
    } else if (step === 2) {
      if (!formData.bedrooms || formData.bedrooms <= 0) newErrors.bedrooms = 'Bedrooms is required';
      if (!formData.bathrooms || formData.bathrooms <= 0) newErrors.bathrooms = 'Bathrooms is required';
      if (!formData.area || formData.area <= 0) newErrors.area = 'Area is required';
      if (!formData.yearBuilt || formData.yearBuilt <= 0) newErrors.yearBuilt = 'Year built is required';
      if (!formData.description?.trim()) newErrors.description = 'Description is required';
    } else if (step === 3) {
      if (!formData.images || (formData.images as any[]).length === 0) {
        newErrors.images = 'At least one image is required';
      }
    } else if (step === 4) {
      if (!formData.contactName?.trim()) newErrors.contactName = 'Contact name is required';
      if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.emailAddress?.trim()) {
        newErrors.emailAddress = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
        newErrors.emailAddress = 'Please enter a valid email';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: string[] = [];
    const newFiles: File[] = [];

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      newFiles.push(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews]);
            setFormData((prev) => ({
              ...prev,
              images: [...(prev.images as any[]), ...newFiles],
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: string[] = [];
    const newFiles: File[] = [];

    files.forEach((file) => {
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 50MB.`);
        return;
      }
      newFiles.push(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === files.length) {
            setVideoPreviews((prev) => [...prev, ...newPreviews]);
            setFormData((prev) => ({
              ...prev,
              videos: [...(prev.videos as any[]), ...newFiles],
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: (prev.images as any[]).filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (index: number) => {
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      videos: (prev.videos as any[]).filter((_, i) => i !== index),
    }));
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const currentFeatures = prev.features || [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter((f) => f !== feature)
        : [...currentFeatures, feature];
      return { ...prev, features: newFeatures };
    });
  };

  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  const handleSaveDraft = async () => {
    let processedData = { ...formData };
    
    // Convert File objects to base64 strings for storage
    if (processedData.images && Array.isArray(processedData.images)) {
      const fileImages = processedData.images.filter((img): img is File => img instanceof File);
      const stringImages = processedData.images.filter((img): img is string => typeof img === 'string');
      if (fileImages.length > 0) {
        const base64Images = await convertFilesToBase64(fileImages);
        processedData.images = [...stringImages, ...base64Images];
      }
    }
    
    if (processedData.videos && Array.isArray(processedData.videos)) {
      const fileVideos = processedData.videos.filter((vid): vid is File => vid instanceof File);
      const stringVideos = processedData.videos.filter((vid): vid is string => typeof vid === 'string');
      if (fileVideos.length > 0) {
        const base64Videos = await convertFilesToBase64(fileVideos);
        processedData.videos = [...stringVideos, ...base64Videos];
      }
    }

    if (isEditMode && id) {
      updateProperty(id, { ...processedData, draft: true, published: false });
    } else {
      addProperty({ ...processedData, draft: true, published: false } as any);
    }
    navigate('/properties');
  };

  const handlePublish = async () => {
    if (validateStep(4)) {
      let processedData = { ...formData };
      
      // Convert File objects to base64 strings for storage
      if (processedData.images && Array.isArray(processedData.images)) {
        const fileImages = processedData.images.filter((img): img is File => img instanceof File);
        const stringImages = processedData.images.filter((img): img is string => typeof img === 'string');
        if (fileImages.length > 0) {
          const base64Images = await convertFilesToBase64(fileImages);
          processedData.images = [...stringImages, ...base64Images];
        }
      }
      
      if (processedData.videos && Array.isArray(processedData.videos)) {
        const fileVideos = processedData.videos.filter((vid): vid is File => vid instanceof File);
        const stringVideos = processedData.videos.filter((vid): vid is string => typeof vid === 'string');
        if (fileVideos.length > 0) {
          const base64Videos = await convertFilesToBase64(fileVideos);
          processedData.videos = [...stringVideos, ...base64Videos];
        }
      }

      if (isEditMode && id) {
        updateProperty(id, { ...processedData, published: true, draft: false });
      } else {
        addProperty({ ...processedData, published: true, draft: false } as any);
      }
      navigate('/properties');
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-gray-600">Create and manage your property listing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              Publish Property
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base flex-shrink-0 ${
                      currentStep >= step.number
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium text-center ${
                      currentStep >= step.number ? 'text-primary' : 'text-gray-500'
                    }`}
                  >
                    <span className="hidden md:inline">{step.title}</span>
                    <span className="md:hidden">{step.number}</span>
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1 md:mx-2 hidden sm:block ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter property title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    value={formData.propertyType || ''}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.propertyType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.propertyType && (
                    <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Type *
                  </label>
                  <select
                    value={formData.rentalType || ''}
                    onChange={(e) => handleInputChange('rentalType', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.rentalType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select rental type</option>
                    {rentalTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.rentalType && (
                    <p className="text-red-500 text-xs mt-1">{errors.rentalType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="text"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter price"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Location Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <select
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select city</option>
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Houston">Houston</option>
                    <option value="Phoenix">Phoenix</option>
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select state</option>
                    <option value="NY">New York</option>
                    <option value="CA">California</option>
                    <option value="IL">Illinois</option>
                    <option value="TX">Texas</option>
                    <option value="AZ">Arizona</option>
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
                  <input
                    type="text"
                    value={formData.zipCode || ''}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter zip code"
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Specification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms || ''}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.bedrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.bedrooms && (
                    <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.bathrooms && (
                    <p className="text-red-500 text-xs mt-1">{errors.bathrooms}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (Sqft) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.area || ''}
                    onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.area ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Built *</label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.yearBuilt || ''}
                    onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.yearBuilt ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.yearBuilt && (
                    <p className="text-red-500 text-xs mt-1">{errors.yearBuilt}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property ID</label>
                  <input
                    type="text"
                    value={formData.propertyId || ''}
                    onChange={(e) => handleInputChange('propertyId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter property ID"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Description</h2>
              <div className="border border-gray-300 rounded-lg">
                {/* Rich Text Editor Toolbar */}
                <div className="border-b border-gray-300 p-2 flex gap-2 flex-wrap">
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Underline className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <List className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter property description..."
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Media & Features */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Images</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-700 font-medium mb-1">Click to upload images</p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB each</p>
                </label>
              </div>
              {errors.images && (
                <p className="text-red-500 text-xs mt-1">{errors.images}</p>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Virtual Tour URL (Optional)
              </h2>
              <input
                type="url"
                value={formData.virtualTourUrl || ''}
                onChange={(e) => handleInputChange('virtualTourUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://yourwebsite.com/virtual-tour"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Videos</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="video-upload"
                  multiple
                  accept="video/mp4,video/mov,video/avi"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-700 font-medium mb-1">Click to upload videos</p>
                  <p className="text-sm text-gray-500">MP4, MOV, AVI up to 50MB each</p>
                </label>
              </div>

              {/* Video Previews */}
              {videoPreviews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <video
                        src={preview}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {featuresList.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.features?.includes(feature)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Contact & Publish */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Date
                  </label>
                  <input
                    type="date"
                    value={formData.availableDate || ''}
                    onChange={(e) => handleInputChange('availableDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deposit</label>
                  <input
                    type="text"
                    value={formData.deposit || ''}
                    onChange={(e) => handleInputChange('deposit', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter deposit amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Inclusions
                  </label>
                  <input
                    type="text"
                    value={formData.inclusions || ''}
                    onChange={(e) => handleInputChange('inclusions', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter inclusions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Exclusions
                  </label>
                  <input
                    type="text"
                    value={formData.exclusions || ''}
                    onChange={(e) => handleInputChange('exclusions', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter exclusions"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName || ''}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.contactName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter contact name"
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.emailAddress || ''}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.emailAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.emailAddress && (
                    <p className="text-red-500 text-xs mt-1">{errors.emailAddress}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">Ready to Publish?</p>
                <p className="text-green-700 text-sm mt-1">
                  Your property listing is ready to be published! Review your property details and
                  publish when ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-4 sm:px-6 py-2 border border-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              currentStep === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {currentStep === 2 && 'Previous Basic Info'}
              {currentStep === 3 && 'Previous Property Details'}
              {currentStep === 4 && 'Previous Media & Features'}
            </span>
            <span className="sm:hidden">Previous</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              {currentStep === 1 && 'Next Property Details'}
              {currentStep === 2 && 'Next Media & Features'}
              {currentStep === 3 && 'Next Contact & Publish'}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={handlePublish}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                Publish Property
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Link */}
      {currentStep === 4 && (
        <div className="mt-4 text-center">
          <a href="/properties" className="text-primary hover:underline text-sm">
            Preview - manager dashboard
          </a>
        </div>
      )}
    </div>
  );
};

export default AddProperty;

