import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Star, Clock, Zap, Eye, Loader2 } from 'lucide-react';
import PropertyCard from './PropertyCard';
import PropertyCardSkeleton from './PropertyCardSkeleton';

const PropertyDiscoverySection = ({
  title,
  description,
  icon: Icon,
  properties = [],
  loading = false,
  error = null,
  badge = null,
  viewAllLink = '/user/dashboard/discover',
  emptyMessage = 'No properties found in this section.',
  limit = 6,
}) => {
  const navigate = useNavigate();

  // Transform property for card display
  const transformPropertyForCard = (property) => {
    if (!property) return null;

    let images = [];
    if (property.image_urls) {
      if (Array.isArray(property.image_urls)) {
        images = property.image_urls;
      } else if (typeof property.image_urls === 'string') {
        try {
          images = JSON.parse(property.image_urls);
        } catch (e) {
          images = [];
        }
      }
    }

    const locationParts = [
      property.address_line_1,
      property.city,
      property.postcode,
    ].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'UK';

    return {
      id: property.id,
      title: property.title || 'Property',
      location: location,
      price: property.price || 0,
      type: property.property_type === 'rent' ? 'Rent' : property.property_type === 'sale' ? 'Sale' : 'Property',
      property_type: property.property_type,
      beds: property.bedrooms || 0,
      baths: property.bathrooms || 0,
      area: property.property_size_sqm || null,
      image: images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      description: property.description || '',
      is_saved: property.is_saved || false,
      is_applied: property.is_applied || false,
      application_status: property.application_status || null,
      view_count: property.view_count || 0,
      latitude: property.latitude,
      longitude: property.longitude,
      listedDate: property.created_at ? new Date(property.created_at) : new Date(),
      featured: property.featured || false,
      // Additional metadata
      trending: property.trending || false,
      recently_added: property.recently_added || false,
      high_demand: property.high_demand || false,
      applications_count: property.applications_count || 0,
      days_since_listed: property.days_since_listed || null,
    };
  };

  const handleViewDetails = (property) => {
    navigate(`/user/dashboard/property/${property.id}`);
  };

  // Limit properties to display
  const displayedProperties = useMemo(() => {
    return (properties || []).slice(0, limit).map(transformPropertyForCard).filter(Boolean);
  }, [properties, limit]);

  // Render badge based on section type
  const renderBadge = () => {
    if (!badge) return null;

    switch (badge.type) {
      case 'trending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-semibold">
            <TrendingUp size={12} />
            Trending
          </span>
        );
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
            <Clock size={12} />
            New
          </span>
        );
      case 'high-demand':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
            <Zap size={12} />
            High Demand
          </span>
        );
      case 'most-viewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
            <Eye size={12} />
            Most Viewed
          </span>
        );
      case 'featured':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
            <Star size={12} />
            Featured
          </span>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 lg:mb-12">
      {/* Section Header */}
      <div className="flex items-start justify-between mb-4 lg:mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Icon className="text-orange-600 dark:text-orange-400" size={20} />
              </div>
            )}
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {badge && renderBadge()}
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {displayedProperties.length > 0 && (
          <button
            onClick={() => navigate(viewAllLink)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedProperties.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-8 lg:p-12 text-center">
          <div className="max-w-md mx-auto">
            {Icon && (
              <div className="mb-4 flex justify-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Icon className="text-gray-400 dark:text-gray-500" size={32} />
                </div>
              </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Properties Found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {emptyMessage}
            </p>
            <button
              onClick={() => navigate(viewAllLink)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Browse All Properties
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {!loading && displayedProperties.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {displayedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={() => handleViewDetails(property)}
              />
            ))}
          </div>

          {/* Mobile View All Button */}
          {displayedProperties.length >= limit && (
            <div className="mt-4 sm:hidden">
              <button
                onClick={() => navigate(viewAllLink)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                <span>View All Properties</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyDiscoverySection;

