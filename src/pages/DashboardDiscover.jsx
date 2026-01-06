import React, { useState } from 'react';
import { Search, Filter, MapPin, Home, DollarSign, Bed, Bath } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/Dashboard/PropertyCard';

const DashboardDiscover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [propertyType, setPropertyType] = useState('All Types');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [beds, setBeds] = useState('Any');
  const [baths, setBaths] = useState('Any');
  
  const navigate = useNavigate();

  const properties = [
    { 
      id: 1, 
      title: 'Modern Apartment', 
      location: '123 Main St, Downtown', 
      price: 2450, 
      type: 'Apartment',
      beds: 2,
      baths: 2,
      area: 1200,
      rating: 4.8,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60',
      description: 'A beautiful modern apartment in the heart of downtown.'
    },
    { 
      id: 2, 
      title: 'Cozy House', 
      location: '456 Oak Ave, Suburbs', 
      price: 1800, 
      type: 'House',
      beds: 3,
      baths: 2,
      area: 1800,
      rating: 4.5,
      reviews: 12,
      image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60',
      description: 'Perfect family home with a large backyard.'
    },
    { 
      id: 3, 
      title: 'Luxury Condo', 
      location: '789 Pine Ln, Waterfront', 
      price: 3200, 
      type: 'Condo',
      beds: 2,
      baths: 2,
      area: 1500,
      rating: 4.9,
      reviews: 36,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
      description: 'Stunning waterfront views and luxury amenities.'
    },
    { 
      id: 4, 
      title: 'Studio Loft', 
      location: '101 Maple Dr, Arts District', 
      price: 2100, 
      type: 'Studio',
      beds: 1,
      baths: 1,
      area: 800,
      rating: 4.6,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=60',
      description: 'Open concept loft in the trendy arts district.'
    },
    { 
      id: 5, 
      title: 'Family Home', 
      location: '202 Cedar Ct, Residential', 
      price: 2750, 
      type: 'House',
      beds: 4,
      baths: 3,
      area: 2200,
      rating: 4.7,
      reviews: 15,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&auto=format&fit=crop&q=60',
      description: 'Spacious family home in a quiet neighborhood.'
    },
    { 
      id: 6, 
      title: 'Penthouse', 
      location: '303 Birch Blvd, City Center', 
      price: 4950, 
      type: 'Apartment',
      beds: 3,
      baths: 3,
      area: 3000,
      rating: 5.0,
      reviews: 8,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
      description: 'Exclusive penthouse with panoramic city views.'
    },
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          property.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = property.location.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesType = propertyType === 'All Types' || property.type === propertyType;
    const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
    const matchesBeds = beds === 'Any' || property.beds >= parseInt(beds);
    const matchesBaths = baths === 'Any' || property.baths >= parseInt(baths);

    return matchesSearch && matchesLocation && matchesType && matchesPrice && matchesBeds && matchesBaths;
  });

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Discover Properties</h1>
        <p className="text-gray-600">Find your perfect property with our smart search</p>
      </div>

      {/* Smart Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        {/* Main Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search properties by keyword, title, or description..."
            className="w-full pl-10 pr-4 py-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter location"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select 
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              >
                <option>All Types</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Condo</option>
                <option>Studio</option>
              </select>
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                  placeholder="Min"
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 100000 })}
                  placeholder="Max"
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Beds & Baths Filter */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Beds</label>
              <div className="relative">
                <Bed className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-sm"
                >
                  <option value="Any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Baths</label>
              <div className="relative">
                <Bath className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  value={baths}
                  onChange={(e) => setBaths(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-sm"
                >
                  <option value="Any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onViewDetails={(p) => navigate(`/dashboard/property/${p.id}`)}
          />
        ))}
        {filteredProperties.length === 0 && (
          <div className="col-span-full text-center py-10">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="text-gray-400" size={32} />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
             <p className="text-gray-500 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
             <button 
               onClick={() => {
                 setSearchQuery('');
                 setLocationQuery('');
                 setPropertyType('All Types');
                 setPriceRange({ min: 0, max: 10000 });
                 setBeds('Any');
                 setBaths('Any');
               }}
               className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
             >
               Clear all filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDiscover;
