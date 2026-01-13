import { Star, Home as HomeIcon } from 'lucide-react';
import { Property } from '../../contexts/PropertyContext';

interface PropertyCardProps {
  property: Property | {
    name?: string;
    title?: string;
    address: string;
    beds?: number;
    bedrooms?: number;
    bathrooms: number;
    sqft?: number;
    area?: number;
    rating?: number;
    reviews?: number;
    listedDate?: string;
    createdAt?: string;
    tags?: string[];
    features?: string[];
    image?: string;
    images?: (File | string)[];
    media?: {
      images?: { id: string; url: string; type: string; isPrimary?: boolean; order?: number; uploadedAt: string }[];
      videos?: any[];
      floorPlans?: any[];
      virtualTourUrl?: string;
    };
    status: string;
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  // Type-safe property access
  const title = property.title || ('name' in property ? property.name : undefined) || 'Untitled Property';
  const beds = property.bedrooms || ('beds' in property ? property.beds : undefined) || 0;
  const area = property.area || ('sqft' in property ? property.sqft : undefined) || 0;
  const tags = property.features || ('tags' in property ? property.tags : undefined) || [];
  const listedDate = ('listedDate' in property ? property.listedDate : undefined) || 
    (property.createdAt ? new Date(property.createdAt).toLocaleDateString() : '');
  
  // Extract image URL - support multiple formats
  const getPropertyImage = () => {
    // 1. Check if property has media.images array (structured format)
    if ('media' in property && property.media && Array.isArray(property.media.images) && property.media.images.length > 0) {
      return property.media.images[0].url;
    }
    
    // 2. Check if property has images array (string URLs)
    if ('images' in property && Array.isArray(property.images) && property.images.length > 0) {
      const firstImage = property.images[0];
      // Handle both string URLs and File objects
      if (typeof firstImage === 'string') {
        return firstImage;
      }
    }
    
    // 3. Check legacy image field
    if ('image' in property && property.image) {
      return property.image;
    }
    
    // 4. No image available
    return null;
  };

  const propertyImage = getPropertyImage();
  
  // Get status color based on status value
  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; dot: string }> = {
      online: {
        bg: 'bg-black/60 backdrop-blur-sm',
        text: 'text-white',
        dot: 'bg-emerald-400'
      },
      active: {
        bg: 'bg-black/60 backdrop-blur-sm',
        text: 'text-white',
        dot: 'bg-emerald-400'
      },
      published: {
        bg: 'bg-black/60 backdrop-blur-sm',
        text: 'text-white',
        dot: 'bg-blue-400'
      },
      offline: {
        bg: 'bg-black/60 backdrop-blur-sm',
        text: 'text-white',
        dot: 'bg-gray-400'
      },
      draft: {
        bg: 'bg-black/60 backdrop-blur-sm',
        text: 'text-white',
        dot: 'bg-amber-400'
      },
      under_offer: {
        bg: 'bg-black/60 backdrop-blur-sm',
        text: 'text-white',
        dot: 'bg-orange-400'
      },
      sold: {
        bg: 'bg-black/60 backdrop-blur-sm',
        text: 'text-white',
        dot: 'bg-purple-400'
      },
      let: {
        bg: 'bg-black/60 backdrop-blur-sm',
        text: 'text-white',
        dot: 'bg-indigo-400'
      },
    };
    return colors[status?.toLowerCase()] || colors.online;
  };

  // Format status text (capitalize and replace underscores)
  const formatStatus = (status: string) => {
    if (!status) return 'Online';
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };
  
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden font-sans group relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:brightness-105 dark:hover:brightness-110">
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 dark:group-hover:opacity-15 transition-opacity duration-300 bg-gradient-to-br from-white/50 dark:from-white/30 via-transparent to-transparent z-20"></div>
      
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-3 left-3 z-10">
          {(() => {
            const statusConfig = getStatusColor(property.status);
            return (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border border-white/20`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                {formatStatus(property.status)}
              </span>
            );
          })()}
        </div>
        
        {/* Property Image or Placeholder */}
        {propertyImage ? (
          <img 
            src={propertyImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Placeholder Icon - shown when no image or image fails */}
        <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${propertyImage ? 'hidden' : ''}`}>
          <HomeIcon className="w-16 h-16 text-white opacity-30" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 relative z-10">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-1 transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-light">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-300">{property.address}</p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span>{beds} Beds</span>
          <span>{property.bathrooms} Bathroom</span>
          <span>{area} Sqft</span>
        </div>

        {/* Rating */}
        {('rating' in property && property.rating && 'reviews' in property && property.reviews) && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {property.rating} ({property.reviews})
              </span>
            </div>
          </div>
        )}

        {/* Listed Date */}
        {listedDate && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">Listed {listedDate}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
