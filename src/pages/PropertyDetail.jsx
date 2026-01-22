import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Heart,
  Share2,
  Calendar,
  DollarSign,
  TrendingUp,
  Home,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  User,
  Loader2,
  AlertCircle,
  X,
  FileText,
  Send,
  Star,
  Shield,
  Clock,
  Award,
  MessageCircle,
  ExternalLink,
  Sofa,
  Wrench,
  Layers,
  Wifi,
  ParkingCircle,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import * as propertyDataService from '../services/propertyDataService';
import * as propertiesService from '../services/propertiesService';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { notifyViewingBooked } from '../services/notificationsService';
import ShareModal from '../components/Dashboard/ShareModal';
import VirtualTourViewer from '../components/virtual-tour/VirtualTourViewer';
import { defaultVirtualTour } from '../mocks/virtualTourMock';

const PropertyDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toggleProperty, isPropertySaved } = useSavedProperties();
  const { currentUser, saveProperty, unsaveProperty, trackPropertyView } = useProperties();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState(null);
  const [viewingDate, setViewingDate] = useState('');
  const [viewingTime, setViewingTime] = useState('');
  const [viewingNotes, setViewingNotes] = useState('');
  const [isSchedulingViewing, setIsSchedulingViewing] = useState(false);
  const [viewingSuccess, setViewingSuccess] = useState(false);
  const [viewingError, setViewingError] = useState(null);
  const { user } = useAuth();
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'street'

  // Fetch mock property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use Mock Data Service
        // Import dynamically to avoid circular dependencies if any
        const { getPropertyById } = await import('../services/mockDataService');
        const mockProperty = getPropertyById(id);

        if (mockProperty) {
          setProperty(mockProperty);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Check if purchase action is requested
  useEffect(() => {
    if (searchParams.get('action') === 'buy' && property) {
      setShowPurchaseModal(true);
    }
  }, [searchParams, property]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto dark:bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-orange-500" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto dark:bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-600 dark:text-red-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-2">Property Not Found</h3>
          <p className="text-red-700 dark:text-red-400 mb-4">{error || 'The property you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/user/dashboard/discover')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  // Transform property data
  const images = property.image_urls
    ? (Array.isArray(property.image_urls) ? property.image_urls : JSON.parse(property.image_urls || '[]'))
    : [];
  const hasMultipleImages = images.length > 1;
  const isSaved = isPropertySaved(property.id);

  // Get property features
  const propertyFeatures = property.property_features
    ? (Array.isArray(property.property_features) ? property.property_features : JSON.parse(property.property_features || '[]'))
    : [];

  // Calculate financial metrics
  const calculateFinancialMetrics = () => {
    const price = parseFloat(property.price) || 0;
    const monthlyRent = price * 0.004; // Estimate 0.4% of property value as monthly rent
    const annualRent = monthlyRent * 12;
    const grossYield = price > 0 ? ((annualRent / price) * 100).toFixed(2) : 0;
    const estimatedValue = {
      low: price * 0.85,
      med: price,
      high: price * 1.15,
    };

    return {
      monthlyRent: monthlyRent.toFixed(0),
      annualRent: annualRent.toFixed(0),
      grossYield: parseFloat(grossYield),
      estimatedValue,
    };
  };

  const financialMetrics = calculateFinancialMetrics();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `£${price.toLocaleString('en-GB')}`;
    }
    return price || 'Price on request';
  };

  const handleSave = async () => {
    if (!currentUser) {
      // Show login prompt
      return;
    }
    if (isSaved) {
      await unsaveProperty(property.id);
      toggleProperty(property);
    } else {
      await saveProperty(property.id);
      toggleProperty(property);
    }
  };

  const handlePurchase = () => {
    if (!user) {
      // Show login prompt or navigate to login
      navigate('/user/dashboard/profile');
      return;
    }
    setShowPurchaseModal(true);
  };

  const handleApplySubmit = async () => {
    if (!user || !property) return;

    setIsApplying(true);
    setApplicationError(null);

    try {
      const result = await propertiesService.applyToProperty(property.id, user.id, {
        property_title: property.title,
        property_price: property.price,
        listing_type: property.listing_type || property.property_type,
        applied_at: new Date().toISOString(),
      });

      if (result.error) {
        throw result.error;
      }

      setApplicationSuccess(true);
      // Close modal after 2 seconds and redirect to applications
      setTimeout(() => {
        setShowPurchaseModal(false);
        setApplicationSuccess(false);
        navigate('/user/dashboard/applications');
      }, 2000);
    } catch (err) {
      console.error('Application error:', err);
      setApplicationError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleScheduleViewing = async () => {
    // UPDATED: Check for user (mock auth) instead of Supabase user
    if (!user) {
      setViewingError('You must be logged in to book an appointment');
      // Optionally redirect to login if you want
      // navigate('/login');
      return;
    }
    if (!property || !viewingDate || !viewingTime) {
      setViewingError('Please select a date and time');
      return;
    }

    setIsSchedulingViewing(true);
    setViewingError(null);

    try {
      // MOCK: Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success unconditionally for the demo
      setViewingSuccess(true);

      // Send notification (Mock)
      try {
        const formattedDate = new Date(viewingDate).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        console.log('🔔 Viewing booked notification sent (Mock)', {
          propertyId: property.id,
          date: formattedDate,
          time: viewingTime
        });
      } catch (notifyErr) {
        console.log('⚠️ Could not send notification:', notifyErr);
      }

      setTimeout(() => {
        setShowViewingModal(false);
        setViewingSuccess(false);
        setViewingDate('');
        setViewingTime('');
        setViewingNotes('');
        // Navigate to My Applications so user can track
        navigate('/user/dashboard/applications');
      }, 2500);

    } catch (err) {
      console.error('Booking error:', err);
      setViewingError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSchedulingViewing(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto dark:bg-[#0a0a0a]">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Header Section */}
      <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-orange-500">{property.title || 'Property'}</h1>
              <button
                onClick={handleSave}
                className={`p-2 rounded-full transition-all ${isSaved
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                title={isSaved ? 'Remove from saved' : 'Save property'}
              >
                <Heart size={20} className={isSaved ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                title="Share property"
              >
                <Share2 size={20} />
              </button>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              {property.address_line_1 || property.address || `${property.city || ''} ${property.postcode || ''}`.trim() || 'UK'}
            </p>
            <p className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-4">
              {property.property_type === 'rent' ? `${formatPrice(property.price)}/month` : formatPrice(property.price)}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Bed size={18} />
                <span>{property.bedrooms || 0} Beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath size={18} />
                <span>{property.bathrooms || 0} Baths</span>
              </div>
              {property.property_size_sqm && (
                <div className="flex items-center gap-2">
                  <Maximize size={18} />
                  <span>{property.property_size_sqm} sqm</span>
                </div>
              )}
              {property.year_built && (
                <div className="flex items-center gap-2">
                  <Home size={18} />
                  <span>Built {property.year_built}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowViewingModal(true)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <Calendar size={20} />
              Book an Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative h-80 lg:h-[450px] bg-gray-200 dark:bg-gray-700">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=Property+Image';
                    }}
                  />
                  {/* Image Counter Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft size={24} className="text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight size={24} className="text-gray-700" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                        ? 'border-orange-500 ring-2 ring-orange-500/30'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Property Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-4 flex items-center gap-2">
              <Home size={20} />
              Property Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {property.property_type && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Building2 size={18} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Property Type</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{property.property_type}</p>
                  </div>
                </div>
              )}
              {property.furnishing && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Sofa size={18} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Furnishing</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{property.furnishing}</p>
                  </div>
                </div>
              )}
              {property.condition && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Wrench size={18} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Condition</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{property.condition}</p>
                  </div>
                </div>
              )}
              {property.year_built && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar size={18} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Year Built</p>
                    <p className="font-medium text-gray-900 dark:text-white">{property.year_built}</p>
                  </div>
                </div>
              )}
              {(property.floor_number !== undefined && property.floor_number !== null) && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Layers size={18} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Floor</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {property.floor_number}{property.total_floors ? ` of ${property.total_floors}` : ''}
                    </p>
                  </div>
                </div>
              )}
              {property.parking_spaces > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Car size={18} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Parking</p>
                    <p className="font-medium text-gray-900 dark:text-white">{property.parking_spaces} space{property.parking_spaces > 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && Object.keys(property.amenities).length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(property.amenities).map(([key, value]) => value && (
                    <span
                      key={key}
                      className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      <CheckCircle size={12} />
                      {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Description & Financials */}
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-orange-500 mb-3">Property Description</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {property.description || 'No description available for this property.'}
            </p>

            {/* Real Property Features */}
            {propertyFeatures.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-3">Property Features</h3>
                <div className="flex flex-wrap gap-2">
                  {propertyFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      <CheckCircle size={14} className="text-orange-600 dark:text-orange-400" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Property Details */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {property.energy_rating && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Energy Rating</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{property.energy_rating}</p>
                </div>
              )}
              {property.council_tax_band && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Council Tax Band</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{property.council_tax_band}</p>
                </div>
              )}
              {property.deposit_amount && property.property_type === 'rent' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deposit</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatPrice(property.deposit_amount)}</p>
                </div>
              )}
              {property.viewing_available && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Viewing Available</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">Yes</p>
                </div>
              )}
            </div>
          </div>

          {/* 360° Virtual Tour Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-orange-500 mb-4">360° Virtual Tour</h2>
            {defaultVirtualTour ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Experience this property in an immersive 360° virtual tour. Navigate through different rooms and get a real feel for the space.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{defaultVirtualTour.scenes.length}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Rooms</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">360°</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">View</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">HD</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Quality</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowVirtualTour(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  View 360° Virtual Tour
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">Virtual tour not available for this property</p>
              </div>
            )}
          </div>

          {/* Property Location Section (formerly Google Street View) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-orange-500 flex items-center gap-2">
                <MapPin size={22} className="text-orange-500" />
                Property Location
              </h2>

              {/* View Toggle */}
              <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'map'
                    ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  Satellite Map
                </button>
                <button
                  onClick={() => setViewMode('street')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'street'
                    ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  Street View
                </button>
              </div>
            </div>

            {/* View Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {viewMode === 'map'
                ? 'View the property location and surrounding area from above.'
                : 'Explore the neighborhood from street level. Use controls to navigate.'}
            </p>

            {/* Map/Street View Container */}
            <div className="w-full h-72 md:h-96 bg-gray-900 rounded-xl overflow-hidden relative group">
              {viewMode === 'map' ? (
                /* Satellite Map - Mock Image */
                <div className="absolute inset-0">
                  <img
                    src="/images/satellite_view_mock.png"
                    alt="Satellite view of property location"
                    className="w-full h-full object-cover"
                  />
                  {/* Interactive overlay with zoom controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                    <button className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                      </svg>
                    </button>
                  </div>
                  {/* Directions badge */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-white/90 rounded-lg shadow-lg text-sm">
                      <span className="font-medium text-gray-700">{property.street_view_lat?.toFixed(6) || '51.501364'}°N {Math.abs(property.street_view_lng || -0.14189).toFixed(6)}°W</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${property.street_view_lat || 51.501364},${property.street_view_lng || -0.14189}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <MapPin size={14} />
                      Directions
                    </a>
                  </div>
                  {/* View larger map link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.street_view_lat || 51.501364},${property.street_view_lng || -0.14189}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-16 left-4 text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    View larger map
                  </a>
                  {/* Property marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <MapPin size={32} className="text-red-500 drop-shadow-lg" fill="currentColor" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Street View - Mock Image */
                <div className="absolute inset-0">
                  <img
                    src="/images/street_view_mock.png"
                    alt="Street view of property location"
                    className="w-full h-full object-cover"
                  />
                  {/* Street view compass */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">N</span>
                      </div>
                      <svg className="absolute inset-0" viewBox="0 0 32 32">
                        <polygon points="16,4 20,16 16,14 12,16" fill="#EA4335" />
                        <polygon points="16,28 12,16 16,18 20,16" fill="#9CA3AF" />
                      </svg>
                    </div>
                  </div>
                  {/* Street name overlay */}
                  <div className="absolute top-4 left-4 px-3 py-2 bg-white/90 rounded-lg shadow-lg">
                    <p className="text-sm font-medium text-gray-800">{property.address_line_1 || 'Kensington Gardens'}</p>
                    <p className="text-xs text-gray-600">{property.city || 'London'}</p>
                  </div>
                  {/* Navigation arrows */}
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-4">
                      <button className="p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110">
                        <ChevronLeft size={20} className="text-gray-700" />
                      </button>
                      <div className="w-12 h-12 bg-orange-500/80 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-orange-500 transition-colors">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <button className="p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110">
                        <ChevronRight size={20} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay Controls (only show relevant controls based on mode) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              {/* Navigation Controls (Street View only) */}
              {viewMode === 'street' && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110">
                    <ChevronLeft size={18} className="text-gray-700" />
                  </button>
                  <div className="px-4 py-2 bg-white/90 rounded-full shadow-lg">
                    <span className="text-sm font-medium text-gray-700">Drag to explore</span>
                  </div>
                  <button className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110">
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>
                </div>
              )}

              {/* Open Fullscreen Button */}
              <a
                href={viewMode === 'map'
                  ? `https://www.google.com/maps/search/?api=1&query=${property.street_view_lat || 51.501364},${property.street_view_lng || -0.14189}`
                  : `https://www.google.com/maps/@${property.street_view_lat || 51.501364},${property.street_view_lng || -0.14189},3a,75y,210h,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2 opacity-0 group-hover:opacity-100"
              >
                <Maximize size={16} className="text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Fullscreen</span>
              </a>

              {/* Location Badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg shadow-lg">
                <MapPin size={14} />
                <span className="text-sm font-medium">{property.city || property.postcode || 'UK'}</span>
              </div>
            </div>

            {/* Street View Quick Info */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin size={16} className="text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Street Level</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">360°</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Panoramic</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ExternalLink size={16} className="text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Google Maps</p>
              </div>
            </div>

            {/* Open in Google Maps Button */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address_line_1 || property.address || `${property.city || ''} ${property.postcode || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-white rounded-xl font-medium transition-all border border-gray-300 dark:border-gray-600"
            >
              <ExternalLink size={18} />
              Open Full Map in Google Maps
            </a>
          </div>


          {/* Financial Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-4">Financial Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Property Price</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatPrice(property.price)}
                </p>
              </div>
              {property.property_type === 'rent' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(property.price)}/month
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Annual Rent</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(property.price * 12)}
                    </p>
                  </div>
                </>
              )}
              {property.property_type === 'sale' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Monthly Rent</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(parseFloat(financialMetrics.monthlyRent))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Potential Gross Yield</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {financialMetrics.grossYield}%
                    </p>
                  </div>
                </>
              )}
              {property.created_at && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Listed</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {Math.floor((new Date() - new Date(property.created_at)) / (1000 * 60 * 60 * 24))} days ago
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Potential Value (for sale properties) */}
          {property.property_type === 'sale' && (
            <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-4">Estimated Property Value</h3>
              <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium mb-4">
                Market Estimate
              </span>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Low Estimate</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(financialMetrics.estimatedValue.low)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Market Value</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{formatPrice(financialMetrics.estimatedValue.med)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">High Estimate</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(financialMetrics.estimatedValue.high)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Agent/Broker Information - Enhanced */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User size={20} />
                Property Agent / Broker
              </h3>
            </div>
            <div className="p-6">
              {/* Agent Profile Card */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {(property.contact_name || property.agent_name)
                      ? (property.contact_name || property.agent_name).charAt(0).toUpperCase()
                      : <User size={28} />}
                  </div>
                  {property.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <ShieldCheck size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                      {property.contact_name || property.agent_name || 'Property Agent'}
                    </h4>
                    {property.verified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle size={10} />
                        Verified
                      </span>
                    )}
                  </div>
                  {(property.company || property.agent_company) && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1 mb-2">
                      <Building2 size={14} />
                      {property.company || property.agent_company}
                    </p>
                  )}

                  {/* Agent Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">4.5</span>
                    <span className="text-sm text-gray-500">(128 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Agent Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">45+</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Properties Listed</p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-600">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Years Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">98%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Response Rate</p>
                </div>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                {(property.contact_phone || property.agent_phone) && (
                  <a
                    href={`tel:${property.contact_phone || property.agent_phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Phone className="text-green-600 dark:text-green-400" size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{property.contact_phone || property.agent_phone}</p>
                    </div>
                  </a>
                )}
                {(property.contact_email || property.agent_email) && (
                  <a
                    href={`mailto:${property.contact_email || property.agent_email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Mail className="text-blue-600 dark:text-blue-400" size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">{property.contact_email || property.agent_email}</p>
                    </div>
                  </a>
                )}

                {/* Response Time Badge */}
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                  <Clock size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-400">Usually responds within 1 hour</span>
                </div>

                <button
                  onClick={() => navigate(`/user/dashboard/messages?property=${property.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-orange-500/25"
                >
                  <MessageCircle size={18} />
                  Send Message
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Application Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl animate-scaleIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {property.listing_type === 'rent' ? 'Apply to Rent' : 'Apply to Purchase'}
                </h2>
                <button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setApplicationSuccess(false);
                    setApplicationError(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {applicationSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Application Submitted!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your application has been sent to the agent. They will contact you soon.
                  </p>
                </div>
              ) : (
                <>
                  {/* Property Summary */}
                  <div className="flex gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <img
                      src={images[0] || 'https://via.placeholder.com/100x100'}
                      alt={property.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {property.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {property.address_line_1 || property.city}
                      </p>
                      <p className="text-orange-600 dark:text-orange-400 font-semibold">
                        {property.listing_type === 'rent'
                          ? `${formatPrice(property.price)}/month`
                          : formatPrice(property.price)}
                      </p>
                    </div>
                  </div>

                  {/* Application Info */}
                  <div className="space-y-4 mb-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      By submitting this application, you're expressing interest in this property.
                      The agent will review your profile and contact you to discuss next steps.
                    </p>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 dark:text-orange-300 text-sm mb-2">
                        What happens next?
                      </h4>
                      <ul className="text-xs text-orange-700 dark:text-orange-400 space-y-1">
                        <li>• Agent reviews your application</li>
                        <li>• You'll receive a response within 24-48 hours</li>
                        <li>• Schedule a viewing if approved</li>
                      </ul>
                    </div>
                  </div>

                  {/* Error Message */}
                  {applicationError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">{applicationError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleApplySubmit}
                    disabled={isApplying}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Submit Application
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal - Enhanced */}
      {showViewingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl animate-scaleIn overflow-hidden">
            {/* Modal Header with Gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Book an Appointment
                    </h2>
                    <p className="text-orange-100 text-sm">Schedule your property viewing</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewingModal(false);
                    setViewingSuccess(false);
                    setViewingError(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {viewingSuccess ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                    <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Appointment Submitted!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    The appointment is submitted. We will notify you once the agent approves your appointment.
                  </p>

                  <button
                    onClick={() => {
                      setShowViewingModal(false);
                      setViewingSuccess(false);
                      setViewingDate('');
                      setViewingTime('');
                      setViewingNotes('');
                    }}
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-orange-500/30"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Agent/Broker Info */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-4 border border-gray-100 dark:border-gray-600">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm flex-shrink-0">
                      {(property.contact_name || property.agent_name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {property.contact_name || property.agent_name || 'Property Agent'}
                      </h4>
                      {property.company && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Building2 size={12} />
                          {property.company}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle size={10} />
                          Verified Agent
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property Card */}
                  <div className="flex gap-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="relative">
                      <img
                        src={images[0] || 'https://via.placeholder.com/100x100'}
                        alt={property.title}
                        className="w-24 h-24 rounded-xl object-cover shadow-md"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Home size={12} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <MapPin size={14} />
                        {property.address_line_1 || property.city || 'UK'}
                      </p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {property.listing_type === 'rent'
                          ? `${formatPrice(property.price)}/month`
                          : formatPrice(property.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quick Time Slots */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-orange-500" />
                      Select Preferred Time
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setViewingTime(time)}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${viewingTime === time
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Or select a custom time below
                    </p>
                  </div>

                  {/* Date & Custom Time */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500" />
                        Date *
                      </label>
                      <input
                        type="date"
                        value={viewingDate}
                        onChange={(e) => setViewingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Clock size={14} className="text-orange-500" />
                        Time *
                      </label>
                      <input
                        type="time"
                        value={viewingTime}
                        onChange={(e) => setViewingTime(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FileText size={14} className="text-orange-500" />
                      Additional Notes (optional)
                    </label>
                    <textarea
                      value={viewingNotes}
                      onChange={(e) => setViewingNotes(e.target.value)}
                      rows={3}
                      placeholder="E.g., I'm interested in the garden area, or I have specific questions about..."
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>

                  {/* What to Expect */}
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-3 flex items-center gap-2">
                      <CheckCircle size={16} />
                      What to Expect
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                        <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        Confirmation email within 1 hour
                      </li>
                      <li className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                        <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        Agent contacts you to confirm
                      </li>
                      <li className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                        <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        View property at scheduled time
                      </li>
                    </ul>
                  </div>

                  {/* Error Message */}
                  {viewingError && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                      <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-400">{viewingError}</p>
                    </div>
                  )}

                  {/* Selected Summary */}
                  {viewingDate && viewingTime && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Selected: {new Date(viewingDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at {viewingTime}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleScheduleViewing}
                    disabled={isSchedulingViewing || !viewingDate || !viewingTime}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 disabled:shadow-none"
                  >
                    {isSchedulingViewing ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        Booking Your Appointment...
                      </>
                    ) : (
                      <>
                        <Calendar size={22} />
                        Confirm Appointment
                      </>
                    )}
                  </button>

                  {/* Free Cancellation Note */}
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Free cancellation up to 24 hours before your viewing
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Virtual Tour Modal */}
      {showVirtualTour && defaultVirtualTour && (
        <VirtualTourViewer
          tour={defaultVirtualTour}
          onClose={() => setShowVirtualTour(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
