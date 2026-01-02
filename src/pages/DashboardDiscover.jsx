import React from 'react';
import { Search, Filter, MapPin } from 'lucide-react';

const DashboardDiscover = () => {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Discover Properties</h1>
        <p className="text-gray-600">Find your perfect property</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter location"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>All Types</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Condo</option>
              <option>Studio</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Property {item}</h3>
              <p className="text-sm text-gray-600 mb-2">123 Main St, City, State</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">$2,450/month</span>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardDiscover;

