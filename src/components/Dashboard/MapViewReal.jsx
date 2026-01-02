import React, { useState } from 'react';
import { Home, Building2 } from 'lucide-react';

/**
 * Real Mapbox Integration Component
 * 
 * To use this component:
 * 1. Install: npm install react-map-gl mapbox-gl
 * 2. Get Mapbox token from: https://account.mapbox.com/
 * 3. Add to .env: REACT_APP_MAPBOX_TOKEN=your_token_here
 * 4. Replace MapView with MapViewReal in Dashboard
 * 
 * Note: Make sure to import mapbox-gl CSS in your main CSS file:
 * @import 'mapbox-gl/dist/mapbox-gl.css';
 */

// Uncomment when Mapbox is installed:
// import Map, { Marker, Popup } from 'react-map-gl';

const MapViewReal = ({ houses = [], agencies = [] }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 13,
  });

  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
        <div className="text-center p-4">
          <p className="text-gray-600 mb-2">Mapbox token required</p>
          <p className="text-sm text-gray-500">
            Add REACT_APP_MAPBOX_TOKEN to your .env file
          </p>
        </div>
      </div>
    );
  }

  // Mock data
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

  // Uncomment when react-map-gl is installed:
  /*
  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {defaultHouses.map((house) => (
        <Marker
          key={`house-${house.id}`}
          longitude={house.lng}
          latitude={house.lat}
          anchor="bottom"
          onClick={() => setSelectedMarker({ ...house, type: 'house' })}
        >
          <div className="cursor-pointer transform hover:scale-110 transition-transform">
            <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
          </div>
        </Marker>
      ))}

      {defaultAgencies.map((agency) => (
        <Marker
          key={`agency-${agency.id}`}
          longitude={agency.lng}
          latitude={agency.lat}
          anchor="bottom"
          onClick={() => setSelectedMarker({ ...agency, type: 'agency' })}
        >
          <div className="cursor-pointer transform hover:scale-110 transition-transform">
            <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
          </div>
        </Marker>
      ))}

      {selectedMarker && (
        <Popup
          longitude={selectedMarker.lng}
          latitude={selectedMarker.lat}
          anchor="bottom"
          onClose={() => setSelectedMarker(null)}
          closeButton={true}
          closeOnClick={false}
        >
          <div className="p-2">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {selectedMarker.name}
            </h4>
            <p className="text-xs text-gray-600 mb-1">{selectedMarker.address}</p>
            {selectedMarker.type === 'house' && (
              <p className="text-sm font-bold text-gray-900">{selectedMarker.price}</p>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
  */

  // Placeholder until Mapbox is installed
  return (
    <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
      <div className="text-center p-4">
        <p className="text-gray-600 mb-2">Install react-map-gl to enable map</p>
        <p className="text-sm text-gray-500">npm install react-map-gl mapbox-gl</p>
      </div>
    </div>
  );
};

export default MapViewReal;

