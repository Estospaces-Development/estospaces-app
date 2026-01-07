import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../contexts/PropertyContext';
import { 
  ArrowLeft, Edit, Trash2, MapPin, Home, Calendar, Copy, Share2, Heart,
  Bed, Bath, Car, Maximize, Building, DollarSign, CheckCircle, X,
  Phone, Mail, Globe, Shield, Star, TrendingUp, Eye, MessageCircle,
  ChevronLeft, ChevronRight, Clock, User, FileText, Verified
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProperty, deleteProperty, formatPrice, formatArea, incrementViews, duplicateProperty } = useProperties();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const property = id ? getProperty(id) : undefined;

  // Increment views on mount
  useEffect(() => {
    if (id) {
      incrementViews(id);
    }
  }, [id, incrementViews]);

  if (!property) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Home className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Property not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Properties
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (id) {
      deleteProperty(id);
      navigate('/properties');
    }
  };

  const handleDuplicate = () => {
    if (id) {
      const duplicate = duplicateProperty(id);
      if (duplicate) {
        navigate(`/properties/edit/${duplicate.id}`);
      }
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = property.title;

    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this property: ${url}`)}`);
        break;
    }
    setShowShareMenu(false);
  };

  // Get images from the property
  const images = property.media?.images?.map(img => img.url) || 
    property.images?.filter((img): img is string => typeof img === 'string') || [];
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      sold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      rented: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      under_contract: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      off_market: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      coming_soon: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    };
    return colors[status] || colors.available;
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Properties
        </button>
        <div className="flex flex-wrap gap-2">
          {/* Favorite */}
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isFavorited 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600' 
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Favorite</span>
          </button>

          {/* Share */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50"
                >
                  {[
                    { id: 'copy', label: 'Copy Link', icon: <FileText className="w-4 h-4" /> },
                    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
                    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleShare(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Duplicate */}
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Copy className="w-5 h-5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => navigate(`/properties/edit/${id}`)}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            <Edit className="w-5 h-5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            {images.length > 0 ? (
              <div className="relative">
                <div 
                  className="aspect-video bg-gray-100 dark:bg-gray-800 cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                >
                  <img
                    src={images[currentImageIndex]}
                    alt={`${property.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
                    {formatStatus(property.status)}
                  </span>
                  {property.featured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4" /> Featured
                    </span>
                  )}
                  {property.verified && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium flex items-center gap-1">
                      <Verified className="w-4 h-4" /> Verified
                    </span>
                  )}
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-purple-400/20 to-pink-400/20 flex items-center justify-center">
                <Home className="w-24 h-24 text-gray-300" />
              </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto custom-scrollbar">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-primary shadow-lg' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            {/* Title & Price */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {property.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {property.location?.addressLine1 || property.address}, {property.location?.city || property.city}, {property.location?.state || property.state}
                  {property.location?.country && `, ${property.location.country}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {property.price?.amount 
                    ? formatPrice(property.price)
                    : property.priceString || 'Price on Request'}
                </p>
                {property.listingType === 'rent' && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">per month</p>
                )}
                {property.price?.negotiable && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Price Negotiable
                  </span>
                )}
              </div>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-200 dark:border-gray-700">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Bed className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {property.rooms?.bedrooms || property.bedrooms || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Bath className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {property.rooms?.bathrooms || property.bathrooms || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bathrooms</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Maximize className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatArea(
                    property.dimensions?.totalArea || property.area || 0,
                    property.dimensions?.areaUnit || 'sqft'
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Area</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Car className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {property.rooms?.parkingSpaces || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Parking</p>
              </div>
            </div>

            {/* Description */}
            <div className="py-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                {property.description || 'No description available.'}
              </p>
            </div>

            {/* Property Details Grid */}
            <div className="py-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Property Type</p>
                  <p className="font-medium text-gray-800 dark:text-white capitalize">
                    {property.propertyType?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Listing Type</p>
                  <p className="font-medium text-gray-800 dark:text-white capitalize">
                    {property.listingType?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                {property.yearBuilt && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Year Built</p>
                    <p className="font-medium text-gray-800 dark:text-white">{property.yearBuilt}</p>
                  </div>
                )}
                {property.furnishing && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Furnishing</p>
                    <p className="font-medium text-gray-800 dark:text-white capitalize">
                      {property.furnishing.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {property.condition && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Condition</p>
                    <p className="font-medium text-gray-800 dark:text-white capitalize">
                      {property.condition.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {property.facing && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Facing</p>
                    <p className="font-medium text-gray-800 dark:text-white capitalize">
                      {property.facing.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {property.dimensions?.floorNumber !== undefined && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Floor</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {property.dimensions.floorNumber} of {property.dimensions.totalFloors}
                    </p>
                  </div>
                )}
                {property.propertyId && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Property ID</p>
                    <p className="font-medium text-gray-800 dark:text-white">{property.propertyId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && (
              <div className="py-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Amenities & Features</h2>
                
                {Object.entries(property.amenities).map(([category, items]) => {
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={category} className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item: string, index: number) => (
                          <span
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Legacy features support */}
                {property.features && property.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Virtual Tour */}
            {(property.virtualTourUrl || property.media?.virtualTourUrl) && (
              <div className="py-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Virtual Tour</h2>
                <a
                  href={property.virtualTourUrl || property.media?.virtualTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  View Virtual Tour
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Contact Agent
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {property.contact?.name || property.contactName || 'Property Manager'}
                </p>
                {property.contact?.company && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{property.contact.company}</p>
                )}
              </div>

              <div className="space-y-2">
                <a
                  href={`tel:${property.contact?.phone || property.phoneNumber}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {property.contact?.phone || property.phoneNumber || 'N/A'}
                  </span>
                </a>

                <a
                  href={`mailto:${property.contact?.email || property.emailAddress}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {property.contact?.email || property.emailAddress || 'N/A'}
                  </span>
                </a>
              </div>

              <button className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Send Message
              </button>

              <button className="w-full py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Viewing
              </button>
            </div>
          </div>

          {/* Analytics Card */}
          {property.analytics && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Property Analytics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{property.analytics.views || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{property.analytics.inquiries || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inquiries</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{property.analytics.favorites || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Favorites</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Share2 className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{property.analytics.shares || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Shares</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info Card */}
          {(property.availableFrom || property.financial?.deposit || property.inclusions || property.exclusions) && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Additional Information
              </h3>
              
              <div className="space-y-3">
                {property.availableFrom && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Available From
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {new Date(property.availableFrom).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {property.financial?.deposit && property.financial.deposit > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Security Deposit
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatPrice({ amount: property.financial.deposit, currency: property.price?.currency || 'USD', negotiable: false })}
                    </span>
                  </div>
                )}
                {property.financial?.maintenanceCharges && property.financial.maintenanceCharges > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Maintenance
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {formatPrice({ amount: property.financial.maintenanceCharges, currency: property.price?.currency || 'USD', negotiable: false })}/mo
                    </span>
                  </div>
                )}
                {property.inclusions && (
                  <div className="py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Inclusions</span>
                    <p className="font-medium text-gray-800 dark:text-white mt-1">{property.inclusions}</p>
                  </div>
                )}
                {property.exclusions && (
                  <div className="py-2">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Exclusions</span>
                    <p className="font-medium text-gray-800 dark:text-white mt-1">{property.exclusions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Listed: {new Date(property.createdAt).toLocaleDateString()}</p>
            <p>Last Updated: {new Date(property.updatedAt).toLocaleDateString()}</p>
            {property.propertyId && <p>ID: {property.propertyId}</p>}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
              }}
              className="absolute left-4 text-white/80 hover:text-white p-2"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            
            <img
              src={images[currentImageIndex]}
              alt={`${property.title} - Full size`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
              }}
              className="absolute right-4 text-white/80 hover:text-white p-2"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            
            <div className="absolute bottom-4 text-white/80 text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-2">Delete Property</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete "{property.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Delete Property
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyView;
