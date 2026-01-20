import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Clock,
    MapPin,
    ChevronRight,
    Activity,
    FileText,
    Calendar,
    Loader2,
    Home,
    Eye,
    MessageCircle,
    BadgeCheck,
    ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

// ============================================================================
// MOCK DATA - Clean, Minimal Design
// ============================================================================

const MOCK_APPLICATIONS = [
    {
        id: 'app-1',
        type: 'buy',
        currentStage: 'Document Verification',
        currentStageNumber: 2,
        totalStages: 5,
        progress: 40,
        property: {
            id: 'prop-1',
            title: 'Modern 3BR Apartment',
            city: 'Canary Wharf, London',
            price: 450000,
            image_urls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400']
        },
        broker: {
            name: 'Sarah Mitchell',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
        },
        stages: [
            { name: 'Application Submitted', status: 'completed' },
            { name: 'Document Verification', status: 'current' },
            { name: 'Property Inspection', status: 'upcoming' },
            { name: 'Offer Negotiation', status: 'upcoming' },
            { name: 'Completion', status: 'upcoming' }
        ]
    },
    {
        id: 'app-2',
        type: 'rent',
        currentStage: 'Viewing Scheduled',
        currentStageNumber: 3,
        totalStages: 4,
        progress: 75,
        property: {
            id: 'prop-2',
            title: 'Luxury Studio Flat',
            city: 'Manchester City Centre',
            price: 1500,
            image_urls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400']
        },
        broker: {
            name: 'James Wilson',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'
        },
        stages: [
            { name: 'Interest Registered', status: 'completed' },
            { name: 'Documents Submitted', status: 'completed' },
            { name: 'Viewing Scheduled', status: 'current' },
            { name: 'Tenancy Agreement', status: 'upcoming' }
        ]
    }
];

const MOCK_LISTINGS = [
    {
        id: 'list-1',
        type: 'sell',
        currentStage: 'Published & Live',
        currentStageNumber: 3,
        totalStages: 5,
        progress: 60,
        property: {
            id: 'prop-3',
            title: 'Victorian Townhouse',
            city: 'Cotswolds',
            price: 850000,
            image_urls: ['https://images.unsplash.com/photo-1499696010180-ea84dfb20984?w=400']
        },
        stats: { views: 127, inquiries: 8 }
    }
];

// ============================================================================
// COMPONENT - Minimal Orange Theme
// ============================================================================

const ApplicationTimelineWidget = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('applications');
    const [expandedId, setExpandedId] = useState(null);

    const dataToShow = activeTab === 'applications' ? MOCK_APPLICATIONS : MOCK_LISTINGS;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Minimal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <Activity size={20} className="text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Real-Time Tracking
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Live
                                </span>
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Track your property journey</p>
                        </div>
                    </div>

                    {/* Tab Switcher - Orange Theme */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'applications'
                                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            My Applications ({MOCK_APPLICATIONS.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'listings'
                                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            My Listings ({MOCK_LISTINGS.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {dataToShow.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No active {activeTab}</p>
                    </div>
                ) : (
                    dataToShow.map((item) => (
                        <div key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            {/* Main Row */}
                            <div
                                className="px-6 py-4 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Property Image */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={item.property?.image_urls?.[0]}
                                            alt={item.property?.title}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                        <span className={`absolute -bottom-1 -left-1 px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${item.type === 'buy' ? 'bg-orange-500 text-white' :
                                                item.type === 'rent' ? 'bg-orange-400 text-white' :
                                                    'bg-orange-300 text-orange-900'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                            {item.property?.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <MapPin size={12} />
                                            {item.property?.city}
                                        </p>

                                        {/* Progress */}
                                        <div className="mt-2 flex items-center gap-3">
                                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                                {item.currentStage}
                                            </span>
                                            <div className="flex-1 max-w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                Step {item.currentStageNumber}/{item.totalStages}
                                            </span>
                                        </div>

                                        {/* Broker */}
                                        {item.broker && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <img src={item.broker.avatar} alt="" className="w-5 h-5 rounded-full" />
                                                <span className="text-xs text-gray-500">Managed by <span className="font-medium text-gray-700 dark:text-gray-300">{item.broker.name}</span></span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price & Arrow */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            £{item.property?.price?.toLocaleString()}
                                            {item.type === 'rent' && <span className="text-sm font-normal text-gray-500">/mo</span>}
                                        </p>
                                        <ChevronRight
                                            size={18}
                                            className={`text-gray-400 mt-1 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Timeline */}
                            {expandedId === item.id && (
                                <div className="px-6 pb-4 animate-fadeIn">
                                    <div className="ml-20 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
                                        {item.stages?.map((stage, idx) => (
                                            <div key={idx} className="relative flex items-center gap-3">
                                                <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 ${stage.status === 'completed' ? 'bg-orange-500 border-orange-500' :
                                                        stage.status === 'current' ? 'bg-white border-orange-500 ring-4 ring-orange-100 dark:ring-orange-900/30' :
                                                            'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                                                    }`} />
                                                <span className={`text-sm ${stage.status === 'current' ? 'font-medium text-orange-600 dark:text-orange-400' :
                                                        stage.status === 'completed' ? 'text-gray-700 dark:text-gray-300' :
                                                            'text-gray-400'
                                                    }`}>
                                                    {stage.name}
                                                </span>
                                                {stage.status === 'completed' && (
                                                    <CheckCircle2 size={14} className="text-orange-500" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 ml-20 flex gap-3">
                                        <button
                                            onClick={() => navigate(`/user/dashboard/property/${item.property?.id}`)}
                                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            View Details
                                        </button>
                                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                                            Contact Broker
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
                <button
                    onClick={() => navigate('/user/dashboard/applications')}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium inline-flex items-center gap-1"
                >
                    View all {activeTab}
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default ApplicationTimelineWidget;
