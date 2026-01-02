import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import VirtualTourModal from './VirtualTourModal';

const PropertyCard = ({ property, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  const images = property.images || [property.image].filter(Boolean).slice(0, 4);
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
      return `$${price.toLocaleString()}${property.rent ? '/month' : ''}`;
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
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
        {/* Image Carousel */}
        <div className="relative h-56 bg-gray-200 overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Property+Image';
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
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-2.5 py-1 rounded-md text-xs font-medium">
                {property.type}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                isSaved
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-md font-bold text-lg">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
            <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
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
                <span>{property.baths} Bath{property.baths > 1 ? 'room' : ''}</span>
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
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{property.rating}</span>
              </div>
              {property.reviews && (
                <span className="text-sm text-gray-500 dark:text-gray-400">({property.reviews})</span>
              )}
              {property.listedDate && (
                <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
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
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onViewDetails) onViewDetails(property);
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVirtualTour(true);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Virtual Tour
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle share
              }}
              className="p-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
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
    </>
  );
};

export default PropertyCard;

