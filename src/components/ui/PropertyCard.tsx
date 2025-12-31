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
    status: string;
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const title = property.title || property.name || 'Untitled Property';
  const beds = property.bedrooms || property.beds || 0;
  const area = property.area || property.sqft || 0;
  const tags = property.features || property.tags || [];
  const listedDate = property.listedDate || 
    (property.createdAt ? new Date(property.createdAt).toLocaleDateString() : '');
  
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow font-sans">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
            {property.status}
          </span>
        </div>
        {/* Placeholder for property image - you can replace with actual image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <HomeIcon className="w-16 h-16 text-white opacity-30" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{property.address}</p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span>{beds} Beds</span>
          <span>{property.bathrooms} Bathroom</span>
          <span>{area} Sqft</span>
        </div>

        {/* Rating */}
        {property.rating && property.reviews && (
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
