import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Square, Download, Share2, Heart, Home, Video, Map } from 'lucide-react';
import VirtualTourViewer3D from '../components/virtual-tour/VirtualTourViewer3D';
import { getTourByPropertyId } from '../mocks/virtualTourMock';
import StreetViewPanel from '../components/manager/StreetViewPanel';
import Toast from '../components/ui/Toast';

const BrokerPropertyDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' });
    const [activeTab, setActiveTab] = useState<'overview' | 'virtual-tour' | 'location'>('overview');

    // Virtual Tour State
    const tour = getTourByPropertyId(id || 'default');
    const [currentSceneId, setCurrentSceneId] = useState(tour?.scenes[0].id);
    const currentScene = tour?.scenes.find(s => s.id === currentSceneId) || tour?.scenes[0];

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const handleContactOwner = () => {
        showToast('Contact request sent to owner! They will reply shortly.', 'success');
    };

    const handleScheduleViewing = () => {
        showToast('Viewing request submitted! Checking availability...', 'success');
    };

    const handleDownloadBrochure = () => {
        showToast('Brochure download started...', 'success');
        // Simulate download
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = 'data:text/plain;charset=utf-8,Mock%20Brochure%20Data';
            link.download = 'property-brochure.txt';
            link.click();
        }, 1000);
    };

    const handleHotspotClick = (targetSceneId: string) => {
        setCurrentSceneId(targetSceneId);
    };

    return (
        <div className="space-y-6">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
            </button>

            {/* Property Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Luxury Sea View Apartment</h1>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>Palm Jumeirah, Dubai (Mock Location) - ID: {id}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button onClick={handleContactOwner} className="btn-primary">
                        Contact Owner
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'overview'
                            ? 'text-primary'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    <Home className="w-4 h-4" />
                    Overview
                    {activeTab === 'overview' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('virtual-tour')}
                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'virtual-tour'
                            ? 'text-primary'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    <Video className="w-4 h-4" />
                    Virtual Tour
                    {activeTab === 'virtual-tour' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('location')}
                    className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'location'
                            ? 'text-primary'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    <Map className="w-4 h-4" />
                    Location & Street View
                    {activeTab === 'location' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Image Gallery Mock */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px]">
                        <div className="md:col-span-2 h-full bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden relative group">
                            <img
                                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2000&auto=format&fit=crop"
                                alt="Main Property"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                                For Sale
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col gap-4 h-full">
                            <div className="h-1/2 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=800&auto=format&fit=crop"
                                    alt="Interior 1"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="h-1/2 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop"
                                    alt="Interior 2"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col gap-4 h-full">
                            <div className="h-1/2 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop"
                                    alt="Exterior"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="h-1/2 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity">
                                <img
                                    src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop"
                                    alt="More"
                                    className="w-full h-full object-cover blur-sm"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                                    +5 More
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Key Features */}
                            <div className="bg-white dark:bg-black p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Overview</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <Bed className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-gray-500">Bedrooms</p>
                                            <p className="font-semibold dark:text-white">4 Beds</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <Bath className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-gray-500">Bathrooms</p>
                                            <p className="font-semibold dark:text-white">3 Baths</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <Square className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-gray-500">Area</p>
                                            <p className="font-semibold dark:text-white">2,500 sqft</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <Home className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-gray-500">Type</p>
                                            <p className="font-semibold dark:text-white">Apartment</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-black p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Description</h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Experience luxury living at its finest in this stunning 4-bedroom apartment located in the heart of Palm Jumeirah.
                                    Featuring panoramic sea views, a state-of-the-art kitchen, and spacious living areas, this property is perfect for families
                                    and professionals alike. The building offers world-class amenities including a swimming pool, gym, and 24/7 security.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-black p-6 rounded-xl border border-gray-200 dark:border-gray-800 sticky top-24">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                                    <h3 className="text-3xl font-bold text-primary">$1,250,000</h3>
                                </div>
                                <button onClick={handleScheduleViewing} className="w-full btn-primary mb-3">Schedule Viewing</button>
                                <button onClick={handleDownloadBrochure} className="w-full btn-secondary border border-gray-200 dark:border-gray-700">Download Brochure</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Virtual Tour Tab */}
            {activeTab === 'virtual-tour' && (
                <div className="w-full h-[600px] bg-black rounded-xl overflow-hidden relative">
                    {currentScene ? (
                        <VirtualTourViewer3D
                            scene={currentScene}
                            onHotspotClick={handleHotspotClick}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            Virtual Tour Mock Data Not Available
                        </div>
                    )}
                </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
                <StreetViewPanel propertyId={id || 'default'} />
            )}
        </div>
    );
};

export default BrokerPropertyDetail;
