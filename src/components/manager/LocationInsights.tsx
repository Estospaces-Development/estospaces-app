import { MapPin, Building2, Car, Volume2, Landmark } from 'lucide-react';
import { PropertyLocation } from '../../mocks/locationMock';

interface LocationInsightsProps {
    location: PropertyLocation;
}

const LocationInsights = ({ location }: LocationInsightsProps) => {
    const getRoadAccessColor = (access: string) => {
        switch (access) {
            case 'Excellent':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
            case 'Good':
                return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            case 'Average':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
            case 'Poor':
                return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
        }
    };

    const getNoiseLevelColor = (level: string) => {
        switch (level) {
            case 'Low':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
            case 'Moderate':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
            case 'High':
                return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
        }
    };

    const getNeighborhoodColor = (type: string) => {
        switch (type) {
            case 'Residential':
                return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
            case 'Commercial':
                return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
            case 'Mixed-Use':
                return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            case 'Industrial':
                return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location Insights
            </h3>

            {/* Address */}
            <div className="mb-5 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Address</p>
                <p className="text-gray-800 dark:text-white font-medium">{location.address}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Coordinates: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                </p>
            </div>

            {/* Property Attributes Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {/* Neighborhood Type */}
                <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${getNeighborhoodColor(location.neighborhoodType)}`}>
                        <Building2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Neighborhood</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{location.neighborhoodType}</p>
                </div>

                {/* Road Access */}
                <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${getRoadAccessColor(location.roadAccess)}`}>
                        <Car className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Road Access</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{location.roadAccess}</p>
                </div>

                {/* Noise Level */}
                <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${getNoiseLevelColor(location.noiseLevel)}`}>
                        <Volume2 className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Noise Level</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{location.noiseLevel}</p>
                </div>
            </div>

            {/* Nearby Landmarks */}
            <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-primary" />
                    Nearby Landmarks
                </h4>

                {location.nearbyLandmarks.length > 0 ? (
                    <div className="space-y-2">
                        {location.nearbyLandmarks.map((landmark, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm"
                            >
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{landmark}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No landmarks recorded for this location.
                    </p>
                )}
            </div>
        </div>
    );
};

export default LocationInsights;
