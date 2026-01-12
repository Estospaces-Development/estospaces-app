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
} from 'lucide-react';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import * as propertyDataService from '../services/propertyDataService';
import * as propertiesService from '../services/propertiesService';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import ShareModal from '../components/Dashboard/ShareModal';

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

  // Fetch real property data
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
        const result = await propertyDataService.getPropertyById(id, currentUser?.id);
        
        if (result.error) {
          setError(result.error.message || 'Failed to load property');
          setLoading(false);
          return;
        }

        if (result.data) {
          setProperty(result.data);
          // Track view is already handled in getPropertyById
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, currentUser]);

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
    if (!currentUser) {
      // Show login prompt or navigate to login
      navigate('/user/dashboard/profile');
      return;
    }
    setShowPurchaseModal(true);
  };

  const handleApplySubmit = async () => {
    if (!currentUser || !property) return;

    setIsApplying(true);
    setApplicationError(null);

    try {
      const result = await propertiesService.applyToProperty(property.id, currentUser.id, {
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
    if (!user || !property || !viewingDate || !viewingTime) {
      setViewingError('Please select a date and time');
      return;
    }

    if (!isSupabaseAvailable()) {
      setViewingError('Database not available');
      return;
    }

    setIsSchedulingViewing(true);
    setViewingError(null);

    try {
      const { error } = await supabase
        .from('viewings')
        .insert({
          user_id: user.id,
          property_id: property.id,
          viewing_date: viewingDate,
          viewing_time: viewingTime,
          notes: viewingNotes,
          status: 'pending',
        });

      if (error) throw error;

      setViewingSuccess(true);
      setTimeout(() => {
        setShowViewingModal(false);
        setViewingSuccess(false);
        setViewingDate('');
        setViewingTime('');
        setViewingNotes('');
        navigate('/user/dashboard/viewings');
      }, 2000);
    } catch (err) {
      console.error('Viewing scheduling error:', err);
      setViewingError(err.message || 'Failed to schedule viewing. Please try again.');
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
                className={`p-2 rounded-full transition-all ${
                  isSaved
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
            {(property.listing_type === 'sale' || property.property_type === 'sale' || property.type?.toLowerCase() === 'sale') && (
              <button 
                onClick={handlePurchase}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <FileText size={20} />
                Apply to Buy
              </button>
            )}
            {(property.listing_type === 'rent' || property.property_type === 'rent' || property.type?.toLowerCase() === 'rent') && (
              <button 
                onClick={handlePurchase}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <FileText size={20} />
                Apply to Rent
              </button>
            )}
            <button 
              onClick={() => setShowViewingModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Calendar size={20} />
              Schedule Viewing
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Image Carousel */}
          <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 overflow-hidden">
            <div className="relative h-96 lg:h-[500px] bg-gray-200 dark:bg-gray-200">
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
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-[#0a0a0a]/70 hover:bg-white dark:hover:bg-gray-900 p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-[#0a0a0a]/70 hover:bg-white dark:hover:bg-gray-900 p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight size={24} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-white w-8'
                              : 'bg-white/50 w-2 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
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

          {/* Real Agent Information */}
          {(property.agent_name || property.agent_email || property.agent_phone || property.agent_company) && (
            <div className="bg-white dark:bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-300 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-4">Contact Agent</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-xl font-semibold text-orange-600 dark:text-orange-400">
                  {property.agent_name ? property.agent_name.charAt(0).toUpperCase() : <User size={24} />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{property.agent_name || 'Agent'}</p>
                  {property.agent_company && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Building2 size={14} />
                      {property.agent_company}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {property.agent_phone && (
                  <a
                    href={`tel:${property.agent_phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Phone className="text-orange-600 dark:text-orange-400" size={20} />
                    <span className="text-gray-900 dark:text-gray-100">{property.agent_phone}</span>
                  </a>
                )}
                {property.agent_email && (
                  <a
                    href={`mailto:${property.agent_email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Mail className="text-orange-600 dark:text-orange-400" size={20} />
                    <span className="text-gray-900 dark:text-gray-100">{property.agent_email}</span>
                  </a>
                )}
                <button
                  onClick={() => navigate(`/user/dashboard/messages?property=${property.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors mt-2"
                >
                  Message Agent
                </button>
              </div>
            </div>
          )}

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

      {/* Schedule Viewing Modal */}
      {showViewingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl animate-scaleIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Schedule a Viewing
                </h2>
                <button
                  onClick={() => {
                    setShowViewingModal(false);
                    setViewingSuccess(false);
                    setViewingError(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {viewingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Viewing Scheduled!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your viewing request has been submitted. The agent will confirm shortly.
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

                  {/* Date & Time Selection */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        value={viewingDate}
                        onChange={(e) => setViewingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Preferred Time *
                      </label>
                      <input
                        type="time"
                        value={viewingTime}
                        onChange={(e) => setViewingTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        value={viewingNotes}
                        onChange={(e) => setViewingNotes(e.target.value)}
                        rows={2}
                        placeholder="Any specific requirements or questions..."
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {viewingError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-400">{viewingError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleScheduleViewing}
                    disabled={isSchedulingViewing || !viewingDate || !viewingTime}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSchedulingViewing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar size={20} />
                        Schedule Viewing
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
