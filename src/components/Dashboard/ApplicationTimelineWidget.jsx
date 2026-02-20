import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Clock,
    MapPin,
    ChevronRight,
    ChevronDown,
    Activity,
    FileText,
    Calendar,
    Loader2,
    Home,
    Eye,
    MessageCircle,
    BadgeCheck,
    ArrowRight,
    Phone,
    FileCheck,
    Search,
    HandshakeIcon,
    Key,
    ClipboardCheck,
    Send,
    UserCheck,
    PenTool,
    Sparkles,
    AlertCircle,
    Info,
    ExternalLink
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// ============================================================================
// DETAILED STAGES WITH DESCRIPTIONS
// ============================================================================

const BUY_STAGES = [
    {
        name: 'Application Submitted',
        description: 'Your buying application has been received and is being processed.',
        icon: Send,
        color: 'blue',
        tips: ['Ensure all documents are ready', 'Check your email for updates']
    },
    {
        name: 'Document Verification',
        description: 'We are verifying your identity, income, and financial documents.',
        icon: FileCheck,
        color: 'purple',
        tips: ['Upload clear copies of ID', 'Bank statements (last 3 months)', 'Proof of funds or mortgage approval'],
        requiredDocs: ['Government ID', 'Bank Statements', 'Proof of Funds']
    },
    {
        name: 'Property Inspection',
        description: 'Schedule and complete a property viewing or virtual tour.',
        icon: Search,
        color: 'orange',
        tips: ['Check structural integrity', 'Review neighborhood amenities', 'Take photos and notes']
    },
    {
        name: 'Offer Negotiation',
        description: 'Your offer is being reviewed and negotiated with the seller.',
        icon: HandshakeIcon,
        color: 'yellow',
        tips: ['Be prepared to negotiate', 'Consider market conditions', 'Set your maximum budget']
    },
    {
        name: 'Completion & Handover',
        description: 'Finalize contracts, transfer funds, and receive your keys!',
        icon: Key,
        color: 'green',
        tips: ['Sign final contracts', 'Transfer remaining funds', 'Collect keys and documents']
    }
];

const RENT_STAGES = [
    {
        name: 'Interest Registered',
        description: 'You have shown interest in this rental property.',
        icon: Sparkles,
        color: 'blue',
        tips: ['Property has been saved to your list', 'Broker will contact you shortly']
    },
    {
        name: 'Documents Submitted',
        description: 'Your rental application documents are being reviewed.',
        icon: FileCheck,
        color: 'purple',
        tips: ['ID verification', 'Employment proof', 'References from previous landlords'],
        requiredDocs: ['Government ID', 'Employment Letter', 'References']
    },
    {
        name: 'Viewing Scheduled',
        description: 'Property viewing has been arranged.',
        icon: Calendar,
        color: 'orange',
        tips: ['Check the property thoroughly', 'Ask about utilities and maintenance', 'Verify move-in date flexibility']
    },
    {
        name: 'Tenancy Agreement',
        description: 'Review and sign your rental agreement.',
        icon: PenTool,
        color: 'green',
        tips: ['Read all terms carefully', 'Clarify deposit conditions', 'Confirm move-in date']
    }
];

const SELL_STAGES = [
    {
        name: 'Property Listed',
        description: 'Your property listing is being prepared.',
        icon: ClipboardCheck,
        color: 'blue'
    },
    {
        name: 'Photos & Valuation',
        description: 'Professional photos and valuation in progress.',
        icon: Eye,
        color: 'purple'
    },
    {
        name: 'Published & Live',
        description: 'Your property is live and visible to buyers.',
        icon: Sparkles,
        color: 'green'
    },
    {
        name: 'Viewings & Offers',
        description: 'Buyers are viewing and making offers.',
        icon: HandshakeIcon,
        color: 'orange'
    },
    {
        name: 'Sale Completed',
        description: 'Congratulations! Your sale is complete.',
        icon: Key,
        color: 'green'
    }
];

// ============================================================================
// MOCK DATA - Enhanced with detailed timeline
// ============================================================================

const MOCK_APPLICATIONS = [
    {
        id: 'app-1',
        type: 'buy',
        currentStage: 'Document Verification',
        currentStageNumber: 2,
        totalStages: 5,
        progress: 40,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        nextAction: 'Upload remaining documents',
        estimatedCompletion: '3-5 business days',
        property: {
            id: 'prop-1',
            title: 'Modern 3BR Apartment',
            city: 'Canary Wharf, London',
            price: 450000,
            image_urls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400']
        },
        broker: {
            name: 'Sarah Mitchell',
            phone: '+44 7700 900123',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'
        },
        stages: BUY_STAGES.map((stage, idx) => ({
            ...stage,
            status: idx < 1 ? 'completed' : idx === 1 ? 'current' : 'upcoming',
            completedAt: idx < 1 ? new Date(Date.now() - (5 - idx) * 24 * 60 * 60 * 1000) : null
        })),
        timeline: [
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), event: 'Application submitted', type: 'milestone' },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), event: 'Broker assigned: Sarah Mitchell', type: 'info' },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), event: 'Document verification started', type: 'milestone' },
            { date: new Date(Date.now() - 2 * 60 * 60 * 1000), event: 'Awaiting: Proof of funds document', type: 'action' }
        ]
    },
    {
        id: 'app-2',
        type: 'rent',
        currentStage: 'Viewing Scheduled',
        currentStageNumber: 3,
        totalStages: 4,
        progress: 75,
        lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        nextAction: 'Attend scheduled viewing',
        viewingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        estimatedCompletion: '1-2 weeks',
        property: {
            id: 'prop-2',
            title: 'Luxury Studio Flat',
            city: 'Manchester City Centre',
            price: 1500,
            image_urls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400']
        },
        broker: {
            name: 'James Wilson',
            phone: '+44 7700 900456',
            avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100'
        },
        stages: RENT_STAGES.map((stage, idx) => ({
            ...stage,
            status: idx < 2 ? 'completed' : idx === 2 ? 'current' : 'upcoming',
            completedAt: idx < 2 ? new Date(Date.now() - (4 - idx) * 24 * 60 * 60 * 1000) : null
        })),
        timeline: [
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), event: 'Interest registered', type: 'milestone' },
            { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), event: 'Documents submitted', type: 'milestone' },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), event: 'Documents verified successfully', type: 'success' },
            { date: new Date(Date.now() - 30 * 60 * 1000), event: 'Viewing scheduled for tomorrow at 2:00 PM', type: 'action' }
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
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
        nextAction: 'Review incoming inquiries',
        property: {
            id: 'prop-3',
            title: 'Victorian Townhouse',
            city: 'Cotswolds',
            price: 850000,
            image_urls: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=400&auto=format&fit=crop']
        },
        stats: { views: 127, inquiries: 8, saved: 23 },
        stages: SELL_STAGES.map((stage, idx) => ({
            ...stage,
            status: idx < 2 ? 'completed' : idx === 2 ? 'current' : 'upcoming',
            completedAt: idx < 2 ? new Date(Date.now() - (5 - idx) * 24 * 60 * 60 * 1000) : null
        })),
        timeline: [
            { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), event: 'Property listed', type: 'milestone' },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), event: 'Professional photos uploaded', type: 'milestone' },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), event: 'Property went live', type: 'success' },
            { date: new Date(Date.now() - 1 * 60 * 60 * 1000), event: '8 new inquiries received', type: 'info' }
        ]
    }
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const StageIcon = ({ stage, size = 20 }) => {
    const IconComponent = stage.icon || CheckCircle2;
    return <IconComponent size={size} />;
};

const TimelineEvent = ({ event }) => {
    const typeStyles = {
        milestone: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
        action: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        info: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    };

    return (
        <div className="flex items-start gap-3 text-sm">
            <div className="flex-shrink-0 w-20 text-right text-xs text-gray-400 pt-0.5">
                {formatDistanceToNow(event.date, { addSuffix: true })}
            </div>
            <div className={`flex-1 px-3 py-2 rounded-lg border ${typeStyles[event.type] || typeStyles.info}`}>
                {event.event}
            </div>
        </div>
    );
};

// ============================================================================
// SKELETON LOADER
// ============================================================================

const TimelineSkeleton = () => {
    return (
        <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex items-start gap-5">
                        {/* Image Skeleton */}
                        <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

                        <div className="flex-1 min-w-0 space-y-3">
                            {/* Title and Price */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                                </div>
                                <div className="space-y-2 text-right">
                                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                                </div>
                            </div>

                            {/* Stage Progress */}
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ApplicationTimelineWidget = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('applications');
    const [expandedId, setExpandedId] = useState(null);
    const [showTimeline, setShowTimeline] = useState({});
    const [loading, setLoading] = useState(true);

    // Remove artificial delay
    useEffect(() => {
        setLoading(false);
    }, []);

    const dataToShow = activeTab === 'applications' ? MOCK_APPLICATIONS : MOCK_LISTINGS;

    const getStageColor = (status, color) => {
        if (status === 'completed') return 'bg-green-500 border-green-500 text-white';
        if (status === 'current') {
            const colors = {
                blue: 'bg-blue-500 border-blue-500',
                purple: 'bg-purple-500 border-purple-500',
                orange: 'bg-orange-500 border-orange-500',
                yellow: 'bg-yellow-500 border-yellow-500',
                green: 'bg-green-500 border-green-500'
            };
            return `${colors[color] || colors.orange} text-white ring-4 ring-orange-100 dark:ring-orange-900/30`;
        }
        return 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400';
    };

    return (
        <div id="realtime-tracking-widget" className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="px-8 py-8 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <Activity size={28} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                Real-Time Tracking
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold rounded-full">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Live
                                </span>
                            </h2>
                            <p className="text-base text-gray-600 dark:text-gray-300 mt-1">
                                Track every step of your property journey in real-time
                            </p>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5">
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'applications'
                                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            My Applications ({MOCK_APPLICATIONS.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'listings'
                                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            My Listings ({MOCK_LISTINGS.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center gap-6 text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Status:</span>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600 dark:text-gray-300">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-200 dark:ring-orange-800"></span>
                    <span className="text-gray-600 dark:text-gray-300">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span className="text-gray-600 dark:text-gray-300">Upcoming</span>
                </div>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                    <TimelineSkeleton />
                ) : dataToShow.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No active {activeTab}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Start your property journey today</p>
                        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                            Browse Properties
                        </button>
                    </div>
                ) : (
                    dataToShow.map((item) => (
                        <div key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            {/* Main Row */}
                            <div
                                className="px-6 py-5 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            >
                                <div className="flex items-start gap-5">
                                    {/* Property Image */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={item.property?.image_urls?.[0]}
                                            alt={item.property?.title}
                                            className="w-20 h-20 rounded-xl object-cover shadow-sm bg-gray-100 dark:bg-gray-700"
                                            loading="eager"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.property?.title || 'Property')}&size=200&background=f97316&color=ffffff&bold=true`;
                                            }}
                                        />
                                        <span className={`absolute -bottom-1 -left-1 px-2 py-0.5 text-[10px] font-bold rounded-md uppercase shadow-sm ${item.type === 'buy' ? 'bg-blue-500 text-white' :
                                            item.type === 'rent' ? 'bg-purple-500 text-white' :
                                                'bg-green-500 text-white'
                                            }`}>
                                            {item.type}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                    {item.property?.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                    <MapPin size={14} />
                                                    {item.property?.city}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl text-gray-900 dark:text-white">
                                                    £{item.property?.price?.toLocaleString()}
                                                    {item.type === 'rent' && <span className="text-sm font-normal text-gray-500">/mo</span>}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Updated {formatDistanceToNow(item.lastUpdated, { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Current Stage Highlight */}
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.progress >= 75 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                        'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                                        }`}>
                                                        {item.progress >= 75 ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {item.currentStage}
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        Step {item.currentStageNumber} of {item.totalStages}
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                    {/* Step markers */}
                                                    <div className="absolute inset-0 flex justify-between px-0.5">
                                                        {Array.from({ length: item.totalStages }).map((_, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`w-1 h-full ${idx < item.currentStageNumber ? 'bg-orange-300' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Next Action */}
                                        {item.nextAction && (
                                            <div className="mt-3 flex items-center gap-2 p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                                                <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />
                                                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                                    Next: {item.nextAction}
                                                </span>
                                                {item.viewingDate && (
                                                    <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                                                        {format(item.viewingDate, 'MMM d, h:mm a')}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Broker & Stats Row */}
                                        <div className="mt-3 flex items-center justify-between">
                                            {item.broker && (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={item.broker.avatar}
                                                        alt=""
                                                        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.broker.name || 'Broker')}&size=48&background=6366f1&color=ffffff`;
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-500">
                                                        Managed by <span className="font-medium text-gray-700 dark:text-gray-300">{item.broker.name}</span>
                                                    </span>
                                                </div>
                                            )}
                                            {item.stats && (
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="flex items-center gap-1 text-gray-500">
                                                        <Eye size={14} /> {item.stats.views} views
                                                    </span>
                                                    <span className="flex items-center gap-1 text-gray-500">
                                                        <MessageCircle size={14} /> {item.stats.inquiries} inquiries
                                                    </span>
                                                </div>
                                            )}
                                            <ChevronDown
                                                size={20}
                                                className={`text-gray-400 transition-transform duration-200 ${expandedId === item.id ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === item.id && (
                                <div className="px-6 pb-6 animate-fadeIn">
                                    {/* Full Stage Pipeline */}
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 mb-5">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Activity size={16} className="text-orange-500" />
                                            Complete Journey Progress
                                        </h4>

                                        <div className="relative">
                                            {/* Connection Line */}
                                            <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

                                            <div className="space-y-4">
                                                {item.stages?.map((stage, idx) => (
                                                    <div key={idx} className="relative flex items-start gap-4">
                                                        {/* Stage Icon */}
                                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${getStageColor(stage.status, stage.color)}`}>
                                                            {stage.status === 'completed' ? (
                                                                <CheckCircle2 size={18} />
                                                            ) : stage.status === 'current' ? (
                                                                <Loader2 size={18} className="animate-spin" />
                                                            ) : (
                                                                <StageIcon stage={stage} size={16} />
                                                            )}
                                                        </div>

                                                        {/* Stage Content */}
                                                        <div className={`flex-1 pb-4 ${stage.status === 'current' ? '' : ''}`}>
                                                            <div className="flex items-center justify-between">
                                                                <h5 className={`font-semibold ${stage.status === 'current' ? 'text-orange-600 dark:text-orange-400' :
                                                                    stage.status === 'completed' ? 'text-gray-900 dark:text-white' :
                                                                        'text-gray-400'
                                                                    }`}>
                                                                    {stage.name}
                                                                </h5>
                                                                {stage.completedAt && (
                                                                    <span className="text-xs text-gray-400">
                                                                        {format(stage.completedAt, 'MMM d, yyyy')}
                                                                    </span>
                                                                )}
                                                                {stage.status === 'current' && (
                                                                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full">
                                                                        In Progress
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className={`text-sm mt-1 ${stage.status === 'upcoming' ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'
                                                                }`}>
                                                                {stage.description}
                                                            </p>

                                                            {/* Tips for current stage */}
                                                            {stage.status === 'current' && stage.tips && (
                                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
                                                                        <Info size={12} /> Tips for this stage:
                                                                    </p>
                                                                    <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                                                                        {stage.tips.map((tip, tipIdx) => (
                                                                            <li key={tipIdx} className="flex items-center gap-2">
                                                                                <CheckCircle2 size={10} />
                                                                                {tip}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {/* Required docs */}
                                                            {stage.status === 'current' && stage.requiredDocs && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {stage.requiredDocs.map((doc, docIdx) => (
                                                                        <span key={docIdx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                                                            📄 {doc}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Activity Timeline */}
                                    {item.timeline && (
                                        <div className="mb-5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowTimeline(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                                }}
                                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <Clock size={16} />
                                                    Activity Timeline ({item.timeline.length} events)
                                                </span>
                                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showTimeline[item.id] ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showTimeline[item.id] && (
                                                <div className="mt-3 space-y-2 pl-2">
                                                    {item.timeline.map((event, idx) => (
                                                        <TimelineEvent key={idx} event={event} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Estimated Completion */}
                                    {item.estimatedCompletion && (
                                        <div className="mb-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                            <p className="text-sm text-green-800 dark:text-green-300">
                                                <span className="font-semibold">Estimated completion:</span> {item.estimatedCompletion}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => navigate(`/user/dashboard/property/${item.property?.id}`)}
                                            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            View Property
                                            <ExternalLink size={14} />
                                        </button>
                                        {item.broker && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `tel:${item.broker.phone}`;
                                                }}
                                                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <Phone size={14} />
                                                Call {item.broker.name.split(' ')[0]}
                                            </button>
                                        )}
                                        <button className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
                                            <MessageCircle size={14} />
                                            Send Message
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 text-center">
                <button
                    onClick={() => navigate('/user/dashboard/applications')}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
                >
                    View all {activeTab}
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ApplicationTimelineWidget;
