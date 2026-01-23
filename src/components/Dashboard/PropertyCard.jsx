import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Bookmark,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Star,
  Share2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Eye,
  Loader2
} from 'lucide-react';
import VirtualTourModal from './VirtualTourModal';
import ShareModal from './ShareModal';
import { useSavedProperties } from '../../contexts/SavedPropertiesContext';
import { useProperties } from '../../contexts/PropertiesContext';
import { useApplications } from '../../contexts/ApplicationsContext';

const PropertyCard = ({ property, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplySuccess, setShowApplySuccess] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('');
  const { toggleProperty, isPropertySaved } = useSavedProperties();
  const { saveProperty, unsaveProperty, applyToProperty, trackPropertyView, currentUser } = useProperties();
  const applicationsContext = useApplications();
  const createApplication = applicationsContext?.createApplication;
  const allApplications = applicationsContext?.allApplications || [];
  const navigate = useNavigate();

  // Check saved status from SavedPropertiesContext (source of truth)
  const isSaved = isPropertySaved(property.id);
  // Check if already applied to this property
  const existingApplication = allApplications.find(app => app.propertyId === property.id);
  const isApplied = existingApplication || property.is_applied || false;
  const applicationStatus = existingApplication?.status || property.application_status || null;
  const viewCount = property.view_count || 0;

  const handleViewDetails = (e) => {
    e?.stopPropagation();
    // Track view if user is authenticated
    if (currentUser) {
      trackPropertyView(property.id);
    }
    if (onViewDetails) {
      onViewDetails(property);
    } else {
      navigate(`/user/dashboard/property/${property.id}`);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    console.log('[PropertyCard] Save button clicked for property:', property.id, property.title);
    console.log('[PropertyCard] Current isSaved status:', isSaved);

    const wasAlreadySaved = isSaved;
    setIsSaving(true);

    try {
      // Toggle property in SavedPropertiesContext (handles both local and Supabase)
      console.log('[PropertyCard] Calling toggleProperty...');
      await toggleProperty(property);
      console.log('[PropertyCard] toggleProperty completed');

      // Show toast notification
      const message = wasAlreadySaved ? 'Property removed from saved' : 'Property saved successfully!';
      console.log('[PropertyCard] Showing toast:', message);
      setSaveToastMessage(message);
      setShowSaveToast(true);

      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowSaveToast(false);
      }, 3000);
    } catch (err) {
      console.error('[PropertyCard] Error saving property:', err);
      setSaveToastMessage('Failed to save property');
      setShowSaveToast(true);
      setTimeout(() => {
        setShowSaveToast(false);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // If already applied, go to applications
    if (isApplied) {
      navigate('/user/dashboard/applications');
      return;
    }

    setIsApplying(true);
    try {
      const applicationData = {
        property_id: property.id,
        property_title: property.title,
        property_address: property.location || property.address || 'UK',
        property_price: property.price,
        property_type: property.property_type || 'apartment',
        listing_type: property.listing_type || (property.type?.toLowerCase() === 'rent' ? 'rent' : 'sale'),
        agent_name: property.agent_name || property.contact_name || 'Agent',
        agent_email: property.agent_email || property.contact_email || '',
        agent_phone: property.agent_phone || property.contact_phone || '',
        agent_company: property.agent_company || property.company || '',
      };

      const result = await createApplication(applicationData);

      if (result.success) {
        setShowApplySuccess(true);
        // Navigate to applications after brief delay
        setTimeout(() => {
          navigate('/user/dashboard/applications');
        }, 1500);
      } else {
        console.error('Failed to create application:', result.error);
      }
    } catch (err) {
      console.error('Error applying to property:', err);
    } finally {
      setIsApplying(false);
    }
  };

  // Handle images - support multiple field name variations from database
  // Priority: images (array) -> image (single) -> image_url -> thumbnail_url -> photo
  const getPropertyImages = () => {
    // If images array exists and is not empty (support both images and image_urls)
    const imagesList = property.images || property.image_urls;
    if (imagesList && Array.isArray(imagesList) && imagesList.length > 0) {
      return imagesList.slice(0, 4);
    }

    // If images is a JSON string, parse it
    if (typeof property.images === 'string') {
      try {
        const parsed = JSON.parse(property.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 4);
        }
      } catch {
        // Not valid JSON, might be a single URL
        if (property.images.startsWith('http')) {
          return [property.images];
        }
      }
    }

    // Fallback to other possible field names
    const singleImage = property.image || property.image_url || property.thumbnail_url ||
      property.photo || property.main_image;

    if (singleImage) {
      return [singleImage].filter(Boolean);
    }

    return [];
  };

  const images = getPropertyImages();
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      const formatted = `£${price.toLocaleString('en-GB')}`;
      // Check if it's a rent property (property_type === 'rent')
      if (property.property_type === 'rent' || property.type?.toLowerCase() === 'rent') {
        return `${formatted}/month`;
      }
      return formatted;
    }
    return price;
  };

  const formatListedDate = (date) => {
    if (!date) return '';
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Listed today';
    if (days === 1) return 'Listed 1 day ago';
    if (days < 7) return `Listed ${days} days ago`;
    if (days < 14) return 'Listed 1 week ago';
    return `Listed ${Math.floor(days / 7)} weeks ago`;
  };

  // Toast component to be rendered via portal
  const ToastNotification = () => {
    if (!showSaveToast) return null;

    return ReactDOM.createPortal(
      <div
        className="fixed bottom-8 left-1/2 z-[99999] pointer-events-auto"
        style={{ transform: 'translateX(-50%)' }}
      >
        <div
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ${saveToastMessage.includes('removed') || saveToastMessage.includes('Failed')
            ? 'bg-gray-900 text-white'
            : 'bg-green-500 text-white'
            }`}
          style={{
            animation: 'slideUp 0.3s ease-out',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
          }}
        >
          {saveToastMessage.includes('removed') ? (
            <Heart size={24} className="text-white flex-shrink-0" />
          ) : saveToastMessage.includes('Failed') ? (
            <span className="text-xl">⚠️</span>
          ) : (
            <CheckCircle size={24} className="text-white flex-shrink-0" />
          )}
          <span className="font-bold text-base whitespace-nowrap">{saveToastMessage}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSaveToast(false);
            }}
            className="ml-3 text-white/80 hover:text-white transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* Save Toast Notification - Rendered via Portal */}
      <ToastNotification />

      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-1.5 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all duration-300 group cursor-pointer">
        {/* Image Carousel */}
        <div className="relative h-56 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // If image fails to load, try to use a default property placeholder
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
                }}
              />

              {/* Image Navigation */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <ChevronLeft size={16} className="text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <ChevronRight size={16} className="text-gray-700" />
                  </button>

                  {/* Image Dots */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`h-1.5 rounded-full transition-all ${index === currentImageIndex
                          ? 'bg-white w-4'
                          : 'bg-white/50 w-1.5 hover:bg-white/75'
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-gray-500 font-manager font-medium">No Image</span>
            </div>
          )}

          {/* Property Type Badge */}
          {property.type && (
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-manager font-bold shadow-sm ${property.type?.toLowerCase() === 'rent'
                ? 'bg-blue-500 text-white'
                : property.type?.toLowerCase() === 'sale'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/95 backdrop-blur-sm text-gray-800'
                }`}>
                {property.type === 'Sale' ? 'For Sale' : property.type === 'Rent' ? 'For Rent' : property.type}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-white/90 text-gray-700 dark:text-gray-800 hover:bg-white dark:hover:bg-white'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isSaved ? 'Remove from saved' : 'Save property'}
              title={isSaved ? 'Saved' : 'Save property'}
            >
              <Heart size={16} className={isSaved ? 'fill-current' : ''} />
            </button>
            {isApplied && (
              <button
                className="p-2 rounded-full backdrop-blur-sm bg-green-500 text-white"
                title={`Applied - ${applicationStatus}`}
              >
                <CheckCircle size={16} className="fill-current" />
              </button>
            )}
            {viewCount > 0 && (
              <div className="p-2 rounded-full backdrop-blur-sm bg-blue-500 text-white flex items-center gap-1" title={`Viewed ${viewCount} time${viewCount > 1 ? 's' : ''}`}>
                <Eye size={14} />
                <span className="text-xs font-medium">{viewCount}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-md font-manager font-bold text-lg">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{property.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
            <MapPin size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </p>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            {property.beds && (
              <div className="flex items-center gap-1">
                <Bed size={16} className="text-gray-400 dark:text-gray-500" />
                <span>{property.beds} Bed{property.beds > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center gap-1">
                <Bath size={16} className="text-gray-400 dark:text-gray-500" />
                <span>{property.baths} Bath{property.baths > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1">
                <Maximize size={16} className="text-gray-400 dark:text-gray-500" />
                <span>{property.area} sqft</span>
              </div>
            )}
          </div>

          {/* Rating */}
          {property.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-900">{property.rating}</span>
              </div>
              {property.reviews && (
                <span className="text-sm text-gray-500 dark:text-gray-700">({property.reviews})</span>
              )}
              {property.listedDate && (
                <span className="text-sm text-gray-400 dark:text-gray-600 ml-auto">
                  {formatListedDate(property.listedDate)}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {property.tags && property.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {property.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-200 text-gray-700 dark:text-gray-800 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleViewDetails}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            >
              View Details
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVirtualTour(true);
              }}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
            >
              Virtual Tour
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="p-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl transition-all duration-200"
              title="Share property"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Virtual Tour Modal */}
      {showVirtualTour && (
        <VirtualTourModal
          property={property}
          onClose={() => setShowVirtualTour(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          property={property}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default PropertyCard;

