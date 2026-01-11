import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import VirtualTourModal from './VirtualTourModal';
import ShareModal from './ShareModal';
import { useSavedProperties } from '../../contexts/SavedPropertiesContext';
import { useProperties } from '../../contexts/PropertiesContext';

const PropertyCard = ({ property, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toggleProperty, isPropertySaved } = useSavedProperties();
  const { saveProperty, unsaveProperty, applyToProperty, trackPropertyView, currentUser } = useProperties();
  const navigate = useNavigate();
  
  // Check saved status from both contexts
  const isSaved = property.is_saved !== undefined ? property.is_saved : isPropertySaved(property.id);
  const isApplied = property.is_applied || false;
  const applicationStatus = property.application_status || null;
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
    if (!currentUser) {
      // Show login prompt or navigate to login
      return;
    }

    setIsSaving(true);
    if (isSaved) {
      await unsaveProperty(property.id);
      toggleProperty(property); // Also update SavedPropertiesContext
    } else {
      await saveProperty(property.id);
      toggleProperty(property); // Also update SavedPropertiesContext
    }
    setIsSaving(false);
  };

  const handleBuy = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      // Show login prompt
      return;
    }

    // Navigate to property detail page with buy action
    navigate(`/user/dashboard/property/${property.id}?action=buy`);
  };

  // Handle images - support multiple field name variations from database
  // Priority: images (array) -> image (single) -> image_url -> thumbnail_url -> photo
  const getPropertyImages = () => {
    // If images array exists and is not empty
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      return property.images.slice(0, 4);
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

  return (
    <>
      <div className="bg-white dark:bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-300 hover:shadow-lg transition-all duration-300 group">
        {/* Image Carousel */}
        <div className="relative h-56 bg-gray-200 overflow-hidden">
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
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentImageIndex
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
              <span className="text-gray-500">No Image</span>
            </div>
          )}

          {/* Property Type Badge */}
          {property.type && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-2.5 py-1 rounded-md text-sm font-medium">
                {property.type}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                isSaved
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
            <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-md font-semibold text-lg">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-700 mb-3 flex items-center gap-1">
            <MapPin size={14} className="text-gray-400 dark:text-gray-600" />
            <span className="line-clamp-1">{property.location}</span>
          </p>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-700 mb-3">
            {property.beds && (
              <div className="flex items-center gap-1">
                <Bed size={16} className="text-gray-400 dark:text-gray-600" />
                <span>{property.beds} Bed{property.beds > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center gap-1">
                <Bath size={16} className="text-gray-400 dark:text-gray-600" />
                <span>{property.baths} Bath{property.baths > 1 ? 'room' : ''}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1">
                <Maximize size={16} className="text-gray-400 dark:text-gray-600" />
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
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              View Details
            </button>
            
            {/* Buy Now button for all properties */}
            {!isApplied && (
              <button
                onClick={handleBuy}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Buy Now
              </button>
            )}
            {isApplied && (
              <button
                onClick={() => navigate('/user/dashboard/applications')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                View Application
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVirtualTour(true);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-100 text-gray-700 dark:text-gray-800 rounded-lg text-sm font-medium transition-colors"
            >
              Virtual Tour
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="p-2 border border-gray-300 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-100 text-gray-700 dark:text-gray-800 rounded-lg transition-colors"
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

