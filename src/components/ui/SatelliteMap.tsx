import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Home, 
  Building2, 
  Wrench, 
  ShoppingCart, 
  UtensilsCrossed, 
  Zap, 
  Car, 
  Sofa,
  Filter,
  X
} from 'lucide-react';

// Fix for default marker icons in React-Leaflet
// @ts-ignore - Leaflet image imports
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore - Leaflet image imports
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// @ts-ignore - Leaflet image imports
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const createCustomIcon = (color: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
      ">${symbol}</div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

interface Location {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
}

// Dummy data for different location types
const dummyLocations: Location[] = [
  // Properties
  { id: '1', name: 'Modern Downtown Apartment', type: 'property', lat: 40.7128, lng: -74.0060, address: '123 Main St, New York, NY' },
  { id: '2', name: 'Luxury Condo', type: 'property', lat: 34.0522, lng: -118.2437, address: '456 Oak Ave, Los Angeles, CA' },
  { id: '3', name: 'Spacious Penthouse', type: 'property', lat: 41.8781, lng: -87.6298, address: '789 Lake Shore Dr, Chicago, IL' },
  { id: '4', name: 'City View Apartment', type: 'property', lat: 37.7749, lng: -122.4194, address: '321 Market St, San Francisco, CA' },
  { id: '5', name: 'Downtown Loft', type: 'property', lat: 29.7604, lng: -95.3698, address: '654 Main St, Houston, TX' },
  
  // Estate Agents
  { id: '6', name: 'Prime Real Estate', type: 'estate_agent', lat: 40.7589, lng: -73.9851, address: '100 Broadway, New York, NY', phone: '(555) 123-4567' },
  { id: '7', name: 'Elite Properties', type: 'estate_agent', lat: 34.0522, lng: -118.2479, address: '200 Sunset Blvd, Los Angeles, CA', phone: '(555) 234-5678' },
  { id: '8', name: 'City Homes Realty', type: 'estate_agent', lat: 41.8781, lng: -87.6358, address: '300 Michigan Ave, Chicago, IL', phone: '(555) 345-6789' },
  
  // Locksmiths
  { id: '9', name: '24/7 Locksmith Services', type: 'locksmith', lat: 40.7128, lng: -74.0080, address: '50 Park Ave, New York, NY', phone: '(555) 111-2222' },
  { id: '10', name: 'Quick Lock & Key', type: 'locksmith', lat: 34.0522, lng: -118.2490, address: '60 Vine St, Los Angeles, CA', phone: '(555) 222-3333' },
  
  // Supermarkets (ASDA equivalent - using Walmart/Target)
  { id: '11', name: 'Walmart Supercenter', type: 'supermarket', lat: 40.7505, lng: -73.9934, address: '700 6th Ave, New York, NY', phone: '(555) 333-4444' },
  { id: '12', name: 'Target Store', type: 'supermarket', lat: 34.0522, lng: -118.2510, address: '8500 Sunset Blvd, Los Angeles, CA', phone: '(555) 444-5555' },
  { id: '13', name: 'Whole Foods Market', type: 'supermarket', lat: 37.7749, lng: -122.4210, address: '1765 California St, San Francisco, CA', phone: '(555) 555-6666' },
  
  // Restaurants
  { id: '14', name: 'The Grill House', type: 'restaurant', lat: 40.7614, lng: -73.9776, address: '123 5th Ave, New York, NY', phone: '(555) 666-7777' },
  { id: '15', name: 'Coastal Bistro', type: 'restaurant', lat: 34.0522, lng: -118.2530, address: '456 Ocean Dr, Los Angeles, CA', phone: '(555) 777-8888' },
  { id: '16', name: 'Downtown Diner', type: 'restaurant', lat: 41.8781, lng: -87.6378, address: '789 State St, Chicago, IL', phone: '(555) 888-9999' },
  { id: '17', name: 'Gourmet Kitchen', type: 'restaurant', lat: 37.7749, lng: -122.4230, address: '321 Market St, San Francisco, CA', phone: '(555) 999-0000' },
  
  // Electrical Shops
  { id: '18', name: 'Tech Electronics', type: 'electrical', lat: 40.7505, lng: -73.9954, address: '150 7th Ave, New York, NY', phone: '(555) 101-2020' },
  { id: '19', name: 'Electric Depot', type: 'electrical', lat: 34.0522, lng: -118.2550, address: '250 Main St, Los Angeles, CA', phone: '(555) 202-3030' },
  
  // Mechanic Shops
  { id: '20', name: 'Auto Repair Center', type: 'mechanic', lat: 40.7589, lng: -73.9871, address: '350 Broadway, New York, NY', phone: '(555) 303-4040' },
  { id: '21', name: 'City Auto Service', type: 'mechanic', lat: 34.0522, lng: -118.2570, address: '450 Pico Blvd, Los Angeles, CA', phone: '(555) 404-5050' },
  { id: '22', name: 'Quick Fix Auto', type: 'mechanic', lat: 41.8781, lng: -87.6398, address: '550 Wacker Dr, Chicago, IL', phone: '(555) 505-6060' },
  
  // Furniture Shops
  { id: '23', name: 'Home Furnishings', type: 'furniture', lat: 40.7614, lng: -73.9796, address: '600 6th Ave, New York, NY', phone: '(555) 606-7070' },
  { id: '24', name: 'Modern Living Store', type: 'furniture', lat: 34.0522, lng: -118.2590, address: '700 Melrose Ave, Los Angeles, CA', phone: '(555) 707-8080' },
  { id: '25', name: 'Comfort Furniture', type: 'furniture', lat: 37.7749, lng: -122.4250, address: '800 Valencia St, San Francisco, CA', phone: '(555) 808-9090' },
  
  // Household Shops
  { id: '26', name: 'Home Essentials', type: 'household', lat: 40.7505, lng: -73.9974, address: '900 8th Ave, New York, NY', phone: '(555) 909-1010' },
  { id: '27', name: 'House & Garden', type: 'household', lat: 34.0522, lng: -118.2610, address: '1000 Beverly Blvd, Los Angeles, CA', phone: '(555) 010-1111' },
  { id: '28', name: 'Home Improvement Store', type: 'household', lat: 41.8781, lng: -87.6418, address: '1100 N State St, Chicago, IL', phone: '(555) 111-1212' },
];

const filterOptions = [
  { id: 'property', label: 'Properties', icon: Home, color: '#3b82f6' },
  { id: 'estate_agent', label: 'Estate Agents', icon: Building2, color: '#10b981' },
  { id: 'locksmith', label: 'Locksmiths', icon: Wrench, color: '#f59e0b' },
  { id: 'supermarket', label: 'Supermarkets', icon: ShoppingCart, color: '#ef4444' },
  { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed, color: '#8b5cf6' },
  { id: 'electrical', label: 'Electrical Shops', icon: Zap, color: '#ec4899' },
  { id: 'mechanic', label: 'Mechanic Shops', icon: Car, color: '#06b6d4' },
  { id: 'furniture', label: 'Furniture Shops', icon: Sofa, color: '#84cc16' },
  { id: 'household', label: 'Household Shops', icon: ShoppingCart, color: '#f97316' },
];

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

const SatelliteMap = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(['property', 'estate_agent']);
  const [showFilters, setShowFilters] = useState(true);
  const [mapCenter] = useState<[number, number]>([40.7128, -74.0060]); // New York
  
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };
  
  const filteredLocations = dummyLocations.filter(loc => activeFilters.includes(loc.type));
  
  const getIconForType = (type: string) => {
    const filter = filterOptions.find(f => f.id === type);
    if (!filter) return DefaultIcon;
    
    const symbols: Record<string, string> = {
      property: '🏠',
      estate_agent: '🏢',
      locksmith: '🔒',
      supermarket: '🛒',
      restaurant: '🍽️',
      electrical: '⚡',
      mechanic: '🔧',
      furniture: '🛋️',
      household: '🏪'
    };
    
    return createCustomIcon(filter.color, symbols[type] || '📍');
  };
  
  return (
    <div className="relative w-full h-full">
      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-xs max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Filters</h3>
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilters.includes(filter.id);
              const count = dummyLocations.filter(loc => loc.type === filter.id).length;
              
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-700 border-2 border-primary'
                      : 'bg-transparent border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: isActive ? filter.color : '#e5e7eb' }}
                  >
                    <Icon 
                      className="w-4 h-4" 
                      style={{ color: isActive ? 'white' : '#6b7280' }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                      {filter.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {count} locations
                    </div>
                  </div>
                  {isActive && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: filter.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Toggle Filters Button */}
      {!showFilters && (
        <button
          onClick={() => setShowFilters(true)}
          className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
        </button>
      )}
      
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={5}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={mapCenter} />
        
        {/* Satellite Tile Layer (Esri World Imagery) */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        {/* Markers */}
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={getIconForType(location.type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-800 mb-1">{location.name}</h3>
                {location.address && (
                  <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                )}
                {location.phone && (
                  <p className="text-sm text-gray-600">{location.phone}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SatelliteMap;

