import { useState, useEffect } from 'react';
import { MapPinned, Shield, CheckCircle } from 'lucide-react';
import StreetViewViewer from './StreetViewViewer';
import LocationInsights from './LocationInsights';
import LocationVerificationActions from './LocationVerificationActions';
import { PropertyLocation, getLocationOrDefault, getStatusDisplayInfo } from '../../mocks/locationMock';
import Toast from '../ui/Toast';

interface StreetViewPanelProps {
    propertyId: string;
}

const StreetViewPanel = ({ propertyId }: StreetViewPanelProps) => {
    const [location, setLocation] = useState<PropertyLocation>(() => getLocationOrDefault(propertyId));
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false,
    });

    // Update location when propertyId changes
    useEffect(() => {
        setLocation(getLocationOrDefault(propertyId));
    }, [propertyId]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type, visible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    const handleStatusChange = (updatedLocation: PropertyLocation) => {
        setLocation(updatedLocation);
    };

    const statusInfo = getStatusDisplayInfo(location.verificationStatus);
    const isVerified = location.verificationStatus === 'verified';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center">
                                <MapPinned className="w-5 h-5 text-white" />
                            </div>
                            Location & Street View
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Verify property surroundings for trust & faster decisions
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        {isVerified && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span className="text-green-700 dark:text-green-400 font-semibold">Location Verified</span>
                            </div>
                        )}
                        {!isVerified && (
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content - Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left - Street View */}
                <div className="space-y-4">
                    <StreetViewViewer
                        streetViewUrl={location.streetViewUrl}
                        address={location.address}
                        latitude={location.latitude}
                        longitude={location.longitude}
                    />

                    {/* Trust Indicators */}
                    <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-xl p-4 border border-primary/20">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white text-sm">Why Verify Locations?</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Verified locations build buyer/renter trust, reduce disputes, and help properties close faster.
                                    Confirm road access, landmarks, and neighborhood quality.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Insights & Actions */}
                <div className="space-y-6">
                    <LocationInsights location={location} />
                    <LocationVerificationActions
                        location={location}
                        onStatusChange={handleStatusChange}
                        onToast={showToast}
                    />
                </div>
            </div>

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={hideToast}
                duration={3000}
            />
        </div>
    );
};

export default StreetViewPanel;
