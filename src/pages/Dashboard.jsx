import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Home, Heart, FileText, Map as MapIcon, User } from 'lucide-react';
import PropertyCard from '../components/Dashboard/PropertyCard';
import PropertyCardSkeleton from '../components/Dashboard/PropertyCardSkeleton';
import PromiseBanner from '../components/Dashboard/PromiseBanner';
import MapView from '../components/Dashboard/MapView';
import { useSavedProperties } from '../contexts/SavedPropertiesContext';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { savedProperties } = useSavedProperties();
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const featuredProperties = [
    {
      id: 1,
      title: 'Modern Downtown Apartment',
      location: '123 Main St, Downtown',
      price: 450000,
      type: 'Apartment',
      beds: 2,
      baths: 2,
      area: 1200,
      rating: 4.8,
      reviews: 24,
      listedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      tags: ['Apartment', 'Balcony', 'Gym'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      ],
    },
    {
      id: 2,
      title: 'Luxury Condo with Ocean View',
      location: '456 Ocean Ave, Beachfront',
      price: 675000,
      type: 'Condo',
      beds: 3,
      baths: 2,
      area: 1800,
      rating: 4.9,
      reviews: 32,
      listedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ['Condo', 'Ocean View', 'Pool'],
      images: [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      ],
    },
    {
      id: 3,
      title: 'Spacious Family Home',
      location: '789 Park Blvd, Suburbia',
      price: 520000,
      type: 'House',
      beds: 4,
      baths: 3,
      area: 2400,
      rating: 4.7,
      reviews: 18,
      listedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      tags: ['House', 'Garden', 'Garage'],
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      ],
    },
  ];

  const stats = [
    { label: 'Properties Available', value: '6', color: 'bg-green-500', icon: Home },
    { label: 'Saved Favorites', value: savedProperties.length.toString(), color: 'bg-blue-500', icon: Heart },
    { label: 'Active Applications', value: '2', color: 'bg-purple-500', icon: FileText },
  ];

  const handleViewDetails = (property) => {
    navigate(`/user/dashboard/property/${property.id}`);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) return;

    // Navigation mapping for search
    const navigationMap = {
      'payments': '/user/dashboard/payments',
      'payment': '/user/dashboard/payments',
      'pay': '/user/dashboard/payments',
      'messages': '/user/dashboard/messages',
      'message': '/user/dashboard/messages',
      'chat': '/user/dashboard/messages',
      'contracts': '/user/dashboard/contracts',
      'contract': '/user/dashboard/contracts',
      'applications': '/user/dashboard/applications',
      'application': '/user/dashboard/applications',
      'apply': '/user/dashboard/applications',
      'viewings': '/user/dashboard/viewings',
      'viewing': '/user/dashboard/viewings',
      'schedule': '/user/dashboard/viewings',
      'saved': '/user/dashboard/saved',
      'favorites': '/user/dashboard/saved',
      'favorite': '/user/dashboard/saved',
      'discover': '/user/dashboard/discover',
      'browse': '/user/dashboard/discover',
      'properties': '/user/dashboard/discover',
      'property': '/user/dashboard/discover',
      'search': '/user/dashboard/discover',
      'reviews': '/user/dashboard/reviews',
      'review': '/user/dashboard/reviews',
      'settings': '/user/dashboard/settings',
      'setting': '/user/dashboard/settings',
      'profile': '/user/dashboard/profile',
      'help': '/user/dashboard/help',
      'support': '/user/dashboard/help',
    };

    // Check if query matches any navigation keyword
    for (const [key, path] of Object.entries(navigationMap)) {
      if (query.includes(key)) {
        navigate(path);
        setSearchQuery('');
        return;
      }
    }
  };

  // Mock user data - In production, fetch from authentication context/API
  const userData = {
    name: 'Prajol Annamudu',
    email: 'viewer@estospaces.com',
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-gray-900">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 lg:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome, {userData.name}</h1>
            <p className="text-orange-50 text-sm lg:text-base">
              Logged in as <span className="font-semibold">{userData.email}</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Process & Key Handover Promise Banner */}
      <PromiseBanner />

      {/* Discover Your Dream Home Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">Discover Your Dream Home</h2>
            <p className="text-orange-50 text-sm lg:text-base mb-4">
              Explore premium properties tailored just for you
            </p>
            <div className="flex flex-wrap gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${stat.color} rounded-full`}></div>
                    <span className="text-sm font-medium">{stat.value} {stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Home size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Property Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Search size={32} className="text-orange-600" />
            </div>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">AI-Powered Property Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tell us what you're looking for and let AI find your perfect match
            </p>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Try: payments, messages, contracts, discover..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
                Search
              </button>
              <button type="button" className="px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2">
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map View Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Nearby Properties & Agencies</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Explore properties and agencies on the map</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="h-96 lg:h-[500px]">
            <MapView
              houses={featuredProperties.map((p, idx) => ({
                id: p.id,
                name: p.title,
                lat: 37.7749 + (idx * 0.01),
                lng: -122.4194 + (idx * 0.01),
                price: `$${(p.price / 1000).toFixed(0)}k`,
                address: p.location,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Featured Properties</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Handpicked properties that match your preferences</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
              Map View
            </button>
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
              + Save Search
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
