import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Clock, CheckCircle, Home, Search, MessageSquare } from 'lucide-react';

const ClientHistory: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Mock client data based on ID
    const client = {
        id: id || '1',
        name: 'Rajesh Kumar',
        email: 'client@example.com',
        phone: '+91 98765 43210',
        location: 'Mumbai, India',
        avatar: undefined, // undefined to trigger initial fallback
        memberSince: 'Jan 2024',
        budget: '₹50L - ₹1Cr',
        preferences: '3BHK, Sea View, South Mumbai'
    };

    // Mock Timeline Data
    const activities = [
        {
            id: 1,
            type: 'request',
            title: 'Requested Broker Assistance',
            date: 'Today, 10:30 AM',
            description: 'Emergency request for property viewing at Sunset Villa.',
            icon: Clock,
            color: 'text-yellow-600 bg-yellow-100',
        },
        {
            id: 2,
            type: 'view',
            title: 'Viewed Property: Green Heights',
            date: 'Yesterday, 4:15 PM',
            description: 'Spent 5 minutes viewing details and gallery.',
            icon: Search,
            color: 'text-blue-600 bg-blue-100',
        },
        {
            id: 3,
            type: 'message',
            title: 'Chat with Support',
            date: 'Oct 15, 2024, 2:00 PM',
            description: 'Inquired about loan eligibility criteria.',
            icon: MessageSquare,
            color: 'text-purple-600 bg-purple-100',
        },
        {
            id: 4,
            type: 'visit',
            title: 'Physical Visit Scheduled',
            date: 'Oct 10, 2024, 11:00 AM',
            description: 'Scheduled visit for City Center Apartments.',
            icon: Home,
            color: 'text-green-600 bg-green-100',
        },
        {
            id: 5,
            type: 'signup',
            title: 'Account Created',
            date: 'Jan 12, 2024, 9:00 AM',
            description: 'Joined Estospaces via Web.',
            icon: CheckCircle,
            color: 'text-gray-600 bg-gray-100',
        }
    ];

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
            {/* Header */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Client Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 border-4 border-white dark:border-black shadow-lg">
                                <User className="w-10 h-10 text-gray-400" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{client.name}</h1>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
                                <MapPin className="w-3 h-3" />
                                <span>{client.location}</span>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{client.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{client.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-xs text-gray-500">Member Since</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{client.memberSince}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-left">Preferences</h3>
                                <div className="flex flex-wrap gap-2">
                                    {client.preferences.split(', ').map(pref => (
                                        <span key={pref} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                            {pref}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/manager/dashboard/messages')}
                                className="w-full mt-6 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Timeline */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Activity History</h2>

                        <div className="space-y-8">
                            {activities.map((activity, index) => (
                                <div key={activity.id} className="relative flex gap-4">
                                    {/* Connector Line */}
                                    {index !== activities.length - 1 && (
                                        <div className="absolute top-10 left-5 bottom-[-32px] w-0.5 bg-gray-100 dark:bg-gray-800"></div>
                                    )}

                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${activity.color}`}>
                                        <activity.icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h3>
                                            <span className="text-xs text-gray-500">{activity.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800/50">
                                            {activity.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientHistory;
