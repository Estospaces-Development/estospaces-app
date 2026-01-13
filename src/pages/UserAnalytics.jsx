import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
    LogOut, 
    Users, 
    Eye, 
    Globe, 
    TrendingUp, 
    RefreshCw, 
    Monitor, 
    Smartphone, 
    Tablet, 
    Clock, 
    BarChart3, 
    Shield,
    LayoutDashboard,
    Activity,
    MapPin,
    Zap,
    PieChart,
    LineChart,
    Calendar
} from 'lucide-react';

const UserAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7');
    const [analytics, setAnalytics] = useState({
        totalUsers: 0,
        totalSessions: 0,
        totalPageViews: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        demographics: [],
        referrers: [],
        deviceBreakdown: [],
        browserBreakdown: [],
        recentEvents: [],
    });

    useEffect(() => {
        loadAnalytics();
    }, [dateRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            if (!supabase) {
                console.error('Supabase not initialized');
                setLoading(false);
                return;
            }

            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

            const { data: allEvents, error } = await supabase
                .from('analytics_events')
                .select('*')
                .gte('created_at', daysAgo.toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching analytics:', error);
                setAnalytics({
                    totalUsers: 0,
                    totalSessions: 0,
                    totalPageViews: 0,
                    avgSessionDuration: 0,
                    bounceRate: 0,
                    topPages: [],
                    demographics: [],
                    referrers: [],
                    deviceBreakdown: [],
                    browserBreakdown: [],
                    recentEvents: [],
                });
                setLoading(false);
                return;
            }

            if (!allEvents || allEvents.length === 0) {
                setAnalytics({
                    totalUsers: 0,
                    totalSessions: 0,
                    totalPageViews: 0,
                    avgSessionDuration: 0,
                    bounceRate: 0,
                    topPages: [],
                    demographics: [],
                    referrers: [],
                    deviceBreakdown: [],
                    browserBreakdown: [],
                    recentEvents: [],
                });
                setLoading(false);
                return;
            }

            const uniqueUsers = new Set(allEvents.map(e => e.user_agent)).size;
            const uniqueSessions = new Set(allEvents.filter(e => e.session_id).map(e => e.session_id)).size;

            const pageViewsMap = {};
            allEvents.forEach(event => {
                if (event.page_url) {
                    pageViewsMap[event.page_url] = (pageViewsMap[event.page_url] || 0) + 1;
                }
            });
            const topPages = Object.entries(pageViewsMap)
                .map(([url, count]) => ({ url, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const demographicsMap = {};
            allEvents.forEach(event => {
                const key = `${event.language || 'Unknown'} - ${event.timezone || 'Unknown'}`;
                demographicsMap[key] = (demographicsMap[key] || 0) + 1;
            });
            const demographics = Object.entries(demographicsMap)
                .map(([demo, count]) => ({ demo, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const referrersMap = {};
            allEvents.forEach(event => {
                if (event.referrer && event.referrer !== 'direct') {
                    referrersMap[event.referrer] = (referrersMap[event.referrer] || 0) + 1;
                }
            });
            const referrers = Object.entries(referrersMap)
                .map(([source, count]) => ({ source, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const deviceMap = {};
            allEvents.forEach(event => {
                const device = event.device_type || 'Unknown';
                deviceMap[device] = (deviceMap[device] || 0) + 1;
            });
            const deviceBreakdown = Object.entries(deviceMap)
                .map(([device, count]) => ({ device, count }))
                .sort((a, b) => b.count - a.count);

            const browserMap = {};
            allEvents.forEach(event => {
                const browser = event.browser || 'Unknown';
                browserMap[browser] = (browserMap[browser] || 0) + 1;
            });
            const browserBreakdown = Object.entries(browserMap)
                .map(([browser, count]) => ({ browser, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const sessionPageCounts = {};
            allEvents.forEach(event => {
                if (event.session_id) {
                    sessionPageCounts[event.session_id] = (sessionPageCounts[event.session_id] || 0) + 1;
                }
            });
            const singlePageSessions = Object.values(sessionPageCounts).filter(count => count === 1).length;
            const bounceRate = uniqueSessions > 0 ? ((singlePageSessions / uniqueSessions) * 100).toFixed(1) : 0;

            setAnalytics({
                totalUsers: uniqueUsers,
                totalSessions: uniqueSessions,
                totalPageViews: allEvents.length,
                avgSessionDuration: 0,
                bounceRate,
                topPages,
                demographics,
                referrers,
                deviceBreakdown,
                browserBreakdown,
                recentEvents: allEvents.slice(0, 10),
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
            navigate('/admin/login');
            window.location.href = '/admin/login';
        } catch (error) {
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
            navigate('/admin/login');
            window.location.href = '/admin/login';
        }
    };

    const getDeviceIcon = (device) => {
        switch (device.toLowerCase()) {
            case 'mobile': return <Smartphone size={20} className="text-blue-500" />;
            case 'tablet': return <Tablet size={20} className="text-purple-500" />;
            case 'desktop': return <Monitor size={20} className="text-green-500" />;
            default: return <Monitor size={20} className="text-gray-500" />;
        }
    };

    const getDeviceColor = (device) => {
        switch (device.toLowerCase()) {
            case 'mobile': return 'from-blue-500 to-cyan-500';
            case 'tablet': return 'from-purple-500 to-pink-500';
            case 'desktop': return 'from-green-500 to-emerald-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    // Stats cards config - ALL REAL DATA, NO MOCK TRENDS
    const statsCards = [
        { 
            label: 'Total Visitors', 
            value: analytics.totalUsers, 
            icon: Users, 
            color: 'from-blue-500 to-indigo-500',
            bg: 'bg-blue-50'
        },
        { 
            label: 'Sessions', 
            value: analytics.totalSessions, 
            icon: Activity, 
            color: 'from-purple-500 to-pink-500',
            bg: 'bg-purple-50'
        },
        { 
            label: 'Page Views', 
            value: analytics.totalPageViews, 
            icon: Eye, 
            color: 'from-green-500 to-emerald-500',
            bg: 'bg-green-50'
        },
        { 
            label: 'Avg. Pages/Session', 
            value: analytics.totalSessions > 0 ? (analytics.totalPageViews / analytics.totalSessions).toFixed(1) : 0, 
            icon: LineChart, 
            color: 'from-orange-500 to-red-500',
            bg: 'bg-orange-50'
        },
        { 
            label: 'Bounce Rate', 
            value: `${analytics.bounceRate}%`, 
            icon: Zap, 
            color: 'from-red-500 to-rose-500',
            bg: 'bg-red-50'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl shadow-lg shadow-blue-500/25">
                                <BarChart3 size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Analytics Dashboard
                                </h1>
                                <p className="text-xs text-gray-500">Real-time user insights</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Date Range Filter */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                                <Calendar size={16} className="text-gray-500" />
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                                >
                                    <option value="1">Last 24 hours</option>
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                </select>
                            </div>
                            
                            <button
                                onClick={loadAnalytics}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all font-medium disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            
                            <button
                                onClick={() => navigate('/admin/chat')}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors font-medium"
                            >
                                <LayoutDashboard size={18} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            
                            <button
                                onClick={() => navigate('/admin/verifications')}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors font-medium"
                            >
                                <Shield size={18} />
                                <span className="hidden sm:inline">Verifications</span>
                            </button>
                            
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-full transition-all font-medium"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
                            <BarChart3 size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" />
                        </div>
                        <p className="mt-4 text-gray-500 font-medium">Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards - REAL DATA ONLY */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                            {statsCards.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div 
                                        key={index}
                                        className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                                                <Icon size={22} className="text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Device & Browser Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Device Breakdown */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                                        <PieChart size={18} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Device Breakdown</h3>
                                </div>
                                <div className="p-6">
                                    {analytics.deviceBreakdown.length > 0 ? (
                                        <div className="space-y-4">
                                            {analytics.deviceBreakdown.map((item, index) => {
                                                const percentage = analytics.totalPageViews > 0 
                                                    ? ((item.count / analytics.totalPageViews) * 100).toFixed(1) 
                                                    : 0;
                                                return (
                                                    <div key={index} className="group">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg bg-gradient-to-r ${getDeviceColor(item.device)} shadow-sm`}>
                                                                    {getDeviceIcon(item.device)}
                                                                </div>
                                                                <span className="text-gray-700 font-semibold capitalize">{item.device}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-gray-900 font-bold">{item.count}</span>
                                                                <span className="text-gray-500 text-sm ml-1">({percentage}%)</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-2 rounded-full bg-gradient-to-r ${getDeviceColor(item.device)} transition-all duration-500 group-hover:opacity-80`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Monitor size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No device data yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Browser Breakdown */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                                        <Globe size={18} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Browser Usage</h3>
                                </div>
                                <div className="p-6">
                                    {analytics.browserBreakdown.length > 0 ? (
                                        <div className="space-y-3">
                                            {analytics.browserBreakdown.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                                                            <span className="text-lg">{getBrowserEmoji(item.browser)}</span>
                                                        </div>
                                                        <span className="text-gray-700 font-medium">{item.browser}</span>
                                                    </div>
                                                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                                                        {item.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Globe size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No browser data yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Pages & Traffic Sources */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Top Pages */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                            <Eye size={18} className="text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Top Pages</h3>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        Most viewed
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {analytics.topPages.length > 0 ? (
                                        analytics.topPages.map((page, index) => (
                                            <div key={index} className="px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-gray-700 font-medium truncate">{page.url}</span>
                                                </div>
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold ml-2">
                                                    {page.count}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Eye size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No page views yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Traffic Sources */}
                            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                                            <TrendingUp size={18} className="text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Traffic Sources</h3>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        Referrers
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {analytics.referrers.length > 0 ? (
                                        analytics.referrers.map((ref, index) => (
                                            <div key={index} className="px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                                                <span className="text-gray-700 font-medium truncate flex-1">{ref.source}</span>
                                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold ml-2">
                                                    {ref.count}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <TrendingUp size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">All traffic is direct</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Demographics */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                                    <MapPin size={18} className="text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">User Demographics</h3>
                            </div>
                            <div className="p-6">
                                {analytics.demographics.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {analytics.demographics.map((demo, index) => (
                                            <div key={index} className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100 hover:shadow-md transition-all">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-700 font-medium">{demo.demo}</span>
                                                    <span className="bg-violet-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                        {demo.count}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No demographic data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg">
                                        <Clock size={18} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                </div>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    Live feed
                                </span>
                            </div>
                            {analytics.recentEvents.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Page</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Device</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Browser</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {analytics.recentEvents.map((event, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(event.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{event.page_url}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-2 capitalize text-sm">
                                                            {getDeviceIcon(event.device_type || 'unknown')}
                                                            {event.device_type || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">{event.browser || 'Unknown'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">{event.timezone || 'Unknown'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Activity size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

// Helper function for browser emoji
const getBrowserEmoji = (browser) => {
    const browserLower = browser.toLowerCase();
    if (browserLower.includes('chrome')) return '🌐';
    if (browserLower.includes('firefox')) return '🦊';
    if (browserLower.includes('safari')) return '🧭';
    if (browserLower.includes('edge')) return '🔷';
    if (browserLower.includes('opera')) return '🔴';
    return '🌍';
};

export default UserAnalytics;
