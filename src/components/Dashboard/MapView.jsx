import React, { useState } from 'react';
import { MapPin, Home, Building2, X } from 'lucide-react';

// Note: To use this component, install: npm install react-map-gl mapbox-gl
// For MVP, this uses a placeholder. Uncomment the Mapbox code when ready.
// Mapbox token: Replace 'YOUR_MAPBOX_TOKEN' with your actual token

const MapView = ({ houses = [], agencies = [] }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Mock data if none provided
  const defaultHouses = houses.length > 0 ? houses : [
    { id: 1, name: 'Modern Downtown Apartment', lat: 37.7749, lng: -122.4194, price: '$450k', address: '123 Main St' },
    { id: 2, name: 'Luxury Condo', lat: 37.7849, lng: -122.4094, price: '$675k', address: '456 Ocean Ave' },
    { id: 3, name: 'Spacious Family Home', lat: 37.7649, lng: -122.4294, price: '$520k', address: '789 Park Blvd' },
  ];

  const defaultAgencies = agencies.length > 0 ? agencies : [
    { id: 1, name: 'Prime Realty Group', lat: 37.7799, lng: -122.4144, address: '100 Market St' },
    { id: 2, name: 'Elite Properties', lat: 37.7699, lng: -122.4244, address: '200 Broadway' },
    { id: 3, name: 'City View Realty', lat: 37.7599, lng: -122.4344, address: '300 Mission St' },
  ];

  const handleMarkerClick = (item, type) => {
    setSelectedMarker({ ...item, type });
  };

  const closePopup = () => {
    setSelectedMarker(null);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
      {/* Placeholder Map Background */}
      <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Center Message */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white/80 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg">
            <MapPin size={48} className="mx-auto mb-2 text-orange-500" />
            <p className="text-gray-700 font-medium text-lg">Interactive Map View</p>
            <p className="text-sm text-gray-500 mt-1">Click markers to view details</p>
          </div>
        </div>

        {/* Markers Container */}
        <div className="absolute inset-0">
          {/* House Markers */}
          {defaultHouses.map((house, idx) => {
            // Simple positioning - distribute markers across the map
            const positions = [
              { left: '25%', top: '35%' },
              { left: '65%', top: '45%' },
              { left: '45%', top: '65%' },
            ];
            const pos = positions[idx] || positions[0];

            return (
              <div
                key={`house-${house.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={pos}
              >
                <button
                  onClick={() => handleMarkerClick(house, 'house')}
                  className="relative group"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <Home size={20} className="text-white" />
                  </div>
                  {selectedMarker?.id === house.id && selectedMarker?.type === 'house' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 bg-white rounded-lg shadow-xl p-4 z-20 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{house.name}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closePopup();
                          }}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{house.address}</p>
                      <p className="text-sm font-bold text-gray-900">{house.price}</p>
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          {/* Agency Markers */}
          {defaultAgencies.map((agency, idx) => {
            // Simple positioning - distribute markers across the map
            const positions = [
              { left: '50%', top: '30%' },
              { left: '30%', top: '60%' },
              { left: '70%', top: '55%' },
            ];
            const pos = positions[idx] || positions[0];

            return (
              <div
                key={`agency-${agency.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={pos}
              >
                <button
                  onClick={() => handleMarkerClick(agency, 'agency')}
                  className="relative group"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <Building2 size={20} className="text-white" />
                  </div>
                  {selectedMarker?.id === agency.id && selectedMarker?.type === 'agency' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 bg-white rounded-lg shadow-xl p-4 z-20 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{agency.name}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closePopup();
                          }}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600">{agency.address}</p>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-10">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Properties</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Agencies</span>
            </div>
          </div>
        </div>

        {/* Click outside to close popup */}
        {selectedMarker && (
          <div
            className="absolute inset-0 z-0"
            onClick={closePopup}
          />
        )}
      </div>
    </div>
  );
};

export default MapView;
