import React, { useState } from 'react';
import { Eye, CheckCircle, Shield, Clock, AlertCircle } from 'lucide-react';
import { VirtualTour } from '../../mocks/virtualTourMock';
import VirtualTourViewer from '../virtual-tour/VirtualTourViewer';

interface VirtualTourManagerPanelProps {
    propertyId: string;
    tour: VirtualTour | null;
    onApprove?: () => void;
    onMarkReady?: () => void;
}

const VirtualTourManagerPanel: React.FC<VirtualTourManagerPanelProps> = ({
    propertyId,
    tour,
    onApprove,
    onMarkReady,
}) => {
    const [showPreview, setShowPreview] = useState(false);
    const [tourStatus, setTourStatus] = useState(tour?.status || 'not_added');
    const [experienceReady, setExperienceReady] = useState(tour?.experienceReady || false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const showSuccessToast = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleApprove = () => {
        setTourStatus('approved');
        showSuccessToast('✓ Virtual tour approved successfully!');
        onApprove?.();
    };

    const handleMarkReady = () => {
        setExperienceReady(true);
        showSuccessToast('✓ Property marked as Experience Ready!');
        onMarkReady?.();
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            not_added: {
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                icon: AlertCircle,
                text: 'Not Added',
            },
            pending: {
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: Clock,
                text: 'Pending Review',
            },
            approved: {
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                icon: CheckCircle,
                text: 'Approved',
            },
        };

        const badge = badges[status as keyof typeof badges] || badges.not_added;
        const Icon = badge.icon;

        return (
            <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}
            >
                <Icon className="w-4 h-4" />
                {badge.text}
            </span>
        );
    };

    if (!tour) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        No Virtual Tour Available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        This property does not have a virtual tour yet.
                    </p>
                    <button
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                        onClick={() => alert('Virtual tour upload feature would go here')}
                    >
                        Upload Virtual Tour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                    <h3 className="text-xl font-semibold text-white">Virtual Tour Management</h3>
                    <p className="text-orange-100 text-sm mt-1">{tour.tourName}</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Embedded Virtual Tour Viewer */}
                    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
                        <VirtualTourViewer
                            tour={tour}
                            embedded={true}
                            onClose={() => { }} // No-op since close button is hidden
                        />
                    </div>

                    {/* Status Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Tour Status
                        </label>
                        <div className="flex items-center gap-4">
                            {getStatusBadge(tourStatus)}
                            {experienceReady && (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                                    <Shield className="w-4 h-4" />
                                    Experience Ready
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tour Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Scenes</p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {tour.scenes.length} rooms
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {new Date(tour.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        {tour.approvedAt && (
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {new Date(tour.approvedAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Scene List - Optional: keep it or remove since viewer has its own list. 
                        The viewer's list might be hidden or inside the viewer. 
                        Let's keep this list as a summary but maybe less detailed? 
                        Actually, the user asked for "more" page. 
                        We'll keep it for now. */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Available Scenes Summary
                        </label>
                        <div className="space-y-2">
                            {tour.scenes.map((scene, index) => (
                                <div
                                    key={scene.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <span className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center font-semibold text-sm">
                                        {index + 1}
                                    </span>
                                    <span className="flex-1 font-medium text-gray-800 dark:text-white">
                                        {scene.name}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {scene.hotspots.length} hotspot{scene.hotspots.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">


                        {tourStatus !== 'approved' && (
                            <button
                                onClick={handleApprove}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-lg"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Approve Virtual Tour
                            </button>
                        )}

                        {tourStatus === 'approved' && !experienceReady && (
                            <button
                                onClick={handleMarkReady}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg"
                            >
                                <Shield className="w-5 h-5" />
                                Mark Experience Ready
                            </button>
                        )}

                        {tourStatus === 'approved' && experienceReady && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-green-700 dark:text-green-400 text-sm font-medium text-center">
                                    ✓ This property is fully approved and experience ready
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <VirtualTourViewer
                    tour={tour}
                    onClose={() => setShowPreview(false)}
                />
            )}

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl animate-slide-up">
                    <p className="font-medium">{toastMessage}</p>
                </div>
            )}
        </>
    );
};

export default VirtualTourManagerPanel;
