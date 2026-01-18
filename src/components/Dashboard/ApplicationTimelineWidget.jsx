import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    CheckCircle2,
    Clock,
    MapPin,
    ChevronRight,
    Activity,
    FileText,
    User,
    Calendar,
    DollarSign,
    Loader2,
    Home
} from 'lucide-react';
import { format } from 'date-fns';

const ApplicationTimelineWidget = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'listings'
    const [applications, setApplications] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const fetchData = async () => {
        if (!user) return;
        try {
            // Fetch Applications
            const appResponse = await fetch(`/api/user/applications?userId=${user.id}`);
            const appResult = await appResponse.json();
            if (appResult.data && appResult.data.length > 0) {
                setApplications(appResult.data);
            } else {
                // FALLBACK MOCK DATA FOR "BUY" JOURNEY
                setApplications([
                    {
                        id: 'mock-app-1',
                        currentStage: 'Verification',
                        lastUpdate: new Date().toISOString(),
                        progress: 25,
                        property: {
                            title: 'Modern Apartment in London',
                            city: 'Canary Wharf',
                            price: 450000,
                            image_urls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400']
                        },
                        timeline: [
                            { stage: 'Verification', timestamp: new Date().toISOString(), description: 'Documents under review' },
                            { stage: 'Application Submitted', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Initial application' }
                        ]
                    },
                    {
                        id: 'mock-app-2',
                        currentStage: 'Site Visit Scheduled',
                        lastUpdate: new Date(Date.now() - 3600000).toISOString(),
                        progress: 50,
                        property: {
                            title: 'Luxury Villa',
                            city: 'Manchester',
                            price: 1200000,
                            image_urls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400']
                        },
                        timeline: [
                            { stage: 'Site Visit Scheduled', timestamp: new Date().toISOString(), description: 'Visit confirmed for tomorrow 10am' },
                            { stage: 'Broker Assigned', timestamp: new Date(Date.now() - 172800000).toISOString(), description: 'Sarah J. assigned' }
                        ]
                    }
                ]);
            }

            // Fetch Listings
            const listResponse = await fetch(`/api/user/listings?userId=${user.id}`);
            const listResult = await listResponse.json();
            if (listResult.data && listResult.data.length > 0) {
                setListings(listResult.data);
            } else {
                // FALLBACK MOCK DATA FOR "SELL" JOURNEY
                setListings([
                    {
                        id: 'mock-list-1',
                        stage: 'Published',
                        currentStage: 'Published',
                        updated_at: new Date().toISOString(),
                        progress: 60,
                        title: 'Cozy Cottage',
                        city: 'Cotswolds',
                        image_urls: ['https://images.unsplash.com/photo-1499696010180-ea84dfb20984?w=400'],
                        timeline: [
                            { stage: 'Published', timestamp: new Date().toISOString(), description: 'Live on marketplace' },
                            { stage: 'Under Review', timestamp: new Date(Date.now() - 43200000).toISOString(), description: 'Admin approval granted' }
                        ]
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching timeline data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [user]);

    if (!user) return null;

    const dataToShow = activeTab === 'applications' ? applications : listings;
    const emptyMessage = activeTab === 'applications'
        ? "No Active Applications"
        : "No Active Listings";
    const emptySubtext = activeTab === 'applications'
        ? "Start your property journey by applying to a property."
        : "You haven't listed any properties for sale or rent yet.";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-fadeIn my-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-violet-600" />
                        Track Your Journey
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Real-time updates on your properties</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 self-start sm:self-auto">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'applications'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'listings'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        My Listings
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                        <Loader2 className="animate-spin mb-2" />
                        Loading timeline...
                    </div>
                ) : dataToShow.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        {activeTab === 'applications' ? (
                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        ) : (
                            <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{emptyMessage}</h3>
                        <p className="text-sm text-gray-500 mb-4">{emptySubtext}</p>
                    </div>
                ) : (
                    dataToShow.map((item) => (
                        <div key={item.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden transition-all hover:shadow-md">
                            {/* Header Card */}
                            <div
                                className="p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer flex items-center justify-between"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <img
                                        src={
                                            (item.property?.image_urls?.[0] || item.image_urls?.[0]) ||
                                            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100'
                                        }
                                        alt="Property"
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {item.property?.title || item.title || 'Untitled Property'}
                                        </h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={10} />
                                            {item.property?.city || item.city || 'Unknown Location'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium text-violet-600 dark:text-violet-400">
                                            {item.currentStage || item.stage}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Updated {format(new Date(item.lastUpdate || item.updated_at), 'MMM d')}
                                        </div>
                                    </div>
                                    <ChevronRight
                                        size={20}
                                        className={`text-gray-400 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${activeTab === 'applications'
                                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                        }`}
                                    style={{ width: `${item.progress || 10}%` }}
                                />
                            </div>

                            {/* Expanded Timeline Details */}
                            {expandedId === item.id && (
                                <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Activity Timeline</h4>
                                    <div className="relative pl-4 space-y-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-700">
                                        {(item.timeline && item.timeline.length > 0 ? item.timeline : [{
                                            stage: item.currentStage || item.stage,
                                            timestamp: item.lastUpdate || item.updated_at,
                                            description: 'Status updated'
                                        }]).map((event, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className={`
                                                    absolute left-0 w-3.5 h-3.5 rounded-full border-2 
                                                    ${idx === 0
                                                        ? (activeTab === 'applications' ? 'bg-violet-600 border-violet-600' : 'bg-blue-600 border-blue-600') + ' scale-110'
                                                        : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                                                    }
                                                `} />
                                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                                                    <span className={`font-medium text-sm ${idx === 0 ? (activeTab === 'applications' ? 'text-violet-600' : 'text-blue-600') : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {event.stage}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                {event.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ApplicationTimelineWidget;
