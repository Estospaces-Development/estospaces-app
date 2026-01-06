import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleProperty, isPropertySaved } = useSavedProperties();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock property data - In production, fetch from API using the id
  const property = {
    id: parseInt(id) || 1,
    title: 'Modern Downtown Apartment',
    address: '123 Main St, Downtown, City, State 12345',
    location: '123 Main St, Downtown',
    price: 450000,
    type: 'Apartment',
    beds: 2,
    baths: 2,
    parking: 1,
    area: 1200,
    rating: 4.8,
    reviews: 24,
    listedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    tags: ['Apartment', 'Balcony', 'Gym', 'Parking'],
    description: 'Snap Up This Great Investment. This stunning modern apartment offers the perfect blend of comfort and style. Located in the heart of downtown, this property features spacious rooms, modern amenities, and breathtaking views. The open-plan living area flows seamlessly into a gourmet kitchen with stainless steel appliances. The master bedroom boasts a walk-in closet and ensuite bathroom. With easy access to shopping, dining, and entertainment, this is the perfect place to call home.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    ],
    agent: {
      name: 'Helen Bond',
      agency: 'Ray White Inner North',
      phone: '+61 2 1234 5678',
      email: 'helen.bond@raywhite.com',
    },
    inspectionTimes: [
      { date: 'Saturday, 7 Aug', time: '1:00pm - 1:40pm' },
      { date: 'Sunday, 8 Aug', time: '2:00pm - 2:30pm' },
    ],
  };

  const marketInsights = {
    medianPrice: 410000,
    weeklyRent: 390,
    cashflow: 20280,
    grossYield: 5.2,
    vacancyRate: 0.6,
    daysListed: 14,
    priceHistory: [
      { year: 2017, price: 320000, growth: 3.2 },
      { year: 2018, price: 350000, growth: 4.1 },
      { year: 2019, price: 375000, growth: 4.8 },
      { year: 2020, price: 395000, growth: 5.0 },
      { year: 2021, price: 410000, growth: 5.2 },
    ],
    avgBedrooms: 4,
    bedroomDistribution: [
      { beds: 1, percentage: 10 },
      { beds: 2, percentage: 25 },
      { beds: 3, percentage: 15 },
      { beds: 4, percentage: 7.8 },
      { beds: 5, percentage: 6.2 },
      { beds: '6+', percentage: 30 },
    ],
    grossYieldHistory: [
      { year: 2017, yield: 4.8, vacancy: 2.1 },
      { year: 2018, yield: 4.2, vacancy: 3.5 },
      { year: 2019, yield: 4.0, vacancy: 4.2 },
      { year: 2020, yield: 4.3, vacancy: 3.8 },
      { year: 2021, yield: 4.5, vacancy: 2.5 },
    ],
    avgAge: 29,
    ageDistribution: [
      { range: '0-14', percentage: 28 },
      { range: '15-65', percentage: 8 },
      { range: '65+', percentage: 64 },
    ],
    valueRange: {
      low: 340000,
      med: 365000,
      high: 395000,
      confidence: 'High Confidence',
    },
  };

  const isSaved = isPropertySaved(property.id);
  const images = property.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price) => {
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto dark:bg-gray-900">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Property</h1>
              <button
                onClick={() => toggleProperty(property)}
                className={`p-2 rounded-full transition-all ${
                  isSaved
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Heart size={20} className={isSaved ? 'fill-current' : ''} />
              </button>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">{property.address}</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4">
              Offers from {formatPrice(property.price)}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Bed size={18} />
                <span>{property.beds} Beds</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath size={18} />
                <span>{property.baths} Baths</span>
              </div>
              <div className="flex items-center gap-2">
                <Car size={18} />
                <span>{property.parking} Parks</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize size={18} />
                <span>{property.area} sqft</span>
              </div>
            </div>
          </div>
          <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors">
            PURCHASE THIS PROPERTY
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Image Carousel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative h-96 lg:h-[500px] bg-gray-200 dark:bg-gray-700">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-900 p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-900 p-2 rounded-full shadow-lg transition-all"
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Snap Up This Great Investment
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {property.description}
            </p>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Property Features</h3>
                <div className="flex flex-wrap gap-2">
                    {property.tags.map((tag, index) => (
                    <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                        <CheckCircle size={14} className="text-orange-600 dark:text-orange-400" />
                        {tag}
                    </span>
                    ))}
                </div>
            </div>
            <button className="text-orange-600 dark:text-orange-400 font-medium hover:underline">
              Read more
            </button>
          </div>

          {/* Financial Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Financial Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Median Price</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(marketInsights.medianPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Weekly median rent</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ${marketInsights.weeklyRent}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Potential cashflow</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(marketInsights.cashflow)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Potential gross yield</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {marketInsights.grossYield}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vacancy rate</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {marketInsights.vacancyRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Listed</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {property.listedDate ? `${Math.floor((new Date() - new Date(property.listedDate)) / (1000 * 60 * 60 * 24))} DAYS AGO` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Potential Value */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Potential value</h3>
            <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium mb-4">
              {marketInsights.valueRange.confidence}
            </span>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Low Range</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(marketInsights.valueRange.low)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Med Range</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(marketInsights.valueRange.med)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">High Range</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(marketInsights.valueRange.high)}</span>
              </div>
            </div>
          </div>

          {/* Agent Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Agent Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">
                {property.agent.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{property.agent.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{property.agent.agency}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="font-medium">Phone:</span> {property.agent.phone}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="font-medium">Email:</span> {property.agent.email}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
