import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Users, Eye, Globe, TrendingUp, RefreshCw, MessageSquare, Monitor, Smartphone, Tablet, Clock, BarChart3 } from 'lucide-react';

const UserAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7'); // days
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
                return;
            }

            // Calculate date filter
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

            // Get events within date range
            const { data: allEvents } = await supabase
                .from('analytics_events')
                .select('*')
                .gte('created_at', daysAgo.toISOString())
                .order('created_at', { ascending: false });

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

            // Calculate unique users and sessions
            const uniqueUsers = new Set(allEvents.map(e => e.user_agent)).size;
            const uniqueSessions = new Set(allEvents.filter(e => e.session_id).map(e => e.session_id)).size;

            // Calculate page views by URL
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

            // Calculate demographics
            const demographicsMap = {};
            allEvents.forEach(event => {
                const key = `${event.language || 'Unknown'} - ${event.timezone || 'Unknown'}`;
                demographicsMap[key] = (demographicsMap[key] || 0) + 1;
            });
            const demographics = Object.entries(demographicsMap)
                .map(([demo, count]) => ({ demo, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Calculate referrers
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

            // Calculate device breakdown
            const deviceMap = {};
            allEvents.forEach(event => {
                const device = event.device_type || 'Unknown';
                deviceMap[device] = (deviceMap[device] || 0) + 1;
            });
            const deviceBreakdown = Object.entries(deviceMap)
                .map(([device, count]) => ({ device, count }))
                .sort((a, b) => b.count - a.count);

            // Calculate browser breakdown
            const browserMap = {};
            allEvents.forEach(event => {
                const browser = event.browser || 'Unknown';
                browserMap[browser] = (browserMap[browser] || 0) + 1;
            });
            const browserBreakdown = Object.entries(browserMap)
                .map(([browser, count]) => ({ browser, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Calculate bounce rate (sessions with only 1 page view)
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
                avgSessionDuration: 0, // Would need timestamp tracking for accurate calculation
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
        if (supabase) {
            await supabase.auth.signOut();
            navigate('/admin/login');
        }
    };

    const getDeviceIcon = (device) => {
        switch (device.toLowerCase()) {
            case 'mobile': return <Smartphone size={20} className="text-blue-600" />;
            case 'tablet': return <Tablet size={20} className="text-purple-600" />;
            case 'desktop': return <Monitor size={20} className="text-green-600" />;
            default: return <Monitor size={20} className="text-gray-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
                        <p className="text-sm text-gray-600">Advanced cookie tracking & user behavior insights</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Date Range Filter */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="1">Last 24 hours</option>
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                        <button
                            onClick={loadAnalytics}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            <RefreshCw size={18} />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={() => navigate('/admin/chat')}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            <MessageSquare size={18} />
                            <span>Chat Dashboard</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Users className="text-blue-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
                                <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <Clock className="text-purple-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">Sessions</h3>
                                <p className="text-3xl font-bold text-gray-900">{analytics.totalSessions}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Eye className="text-green-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">Page Views</h3>
                                <p className="text-3xl font-bold text-gray-900">{analytics.totalPageViews}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-orange-100 p-3 rounded-lg">
                                        <TrendingUp className="text-orange-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">Avg. Pages/Session</h3>
                                <p className="text-3xl font-bold text-gray-900">
                                    {analytics.totalSessions > 0 ? (analytics.totalPageViews / analytics.totalSessions).toFixed(1) : 0}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-red-100 p-3 rounded-lg">
                                        <BarChart3 className="text-red-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">Bounce Rate</h3>
                                <p className="text-3xl font-bold text-gray-900">{analytics.bounceRate}%</p>
                            </div>
                        </div>

                        {/* Device & Browser Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Device Breakdown */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Device Breakdown</h3>
                                {analytics.deviceBreakdown.length > 0 ? (
                                    <div className="space-y-4">
                                        {analytics.deviceBreakdown.map((item, index) => {
                                            const percentage = ((item.count / analytics.totalPageViews) * 100).toFixed(1);
                                            return (
                                                <div key={index}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {getDeviceIcon(item.device)}
                                                            <span className="text-gray-700 font-medium capitalize">{item.device}</span>
                                                        </div>
                                                        <span className="text-gray-900 font-semibold">{item.count} ({percentage}%)</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No device data yet</p>
                                )}
                            </div>

                            {/* Browser Breakdown */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Browser Breakdown</h3>
                                {analytics.browserBreakdown.length > 0 ? (
                                    <div className="space-y-3">
                                        {analytics.browserBreakdown.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-gray-700 font-medium">{item.browser}</span>
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {item.count} visits
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No browser data yet</p>
                                )}
                            </div>
                        </div>

                        {/* Top Pages & Demographics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Top Pages */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Pages</h3>
                                {analytics.topPages.length > 0 ? (
                                    <div className="space-y-3">
                                        {analytics.topPages.map((page, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-gray-700 font-medium">{page.url}</span>
                                                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                    {page.count} views
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No page views yet</p>
                                )}
                            </div>

                            {/* Demographics */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">User Demographics</h3>
                                {analytics.demographics.length > 0 ? (
                                    <div className="space-y-3">
                                        {analytics.demographics.map((demo, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-gray-700 font-medium">{demo.demo}</span>
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {demo.count} users
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No demographic data yet</p>
                                )}
                            </div>
                        </div>

                        {/* Traffic Sources */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic Sources</h3>
                            {analytics.referrers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {analytics.referrers.map((ref, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700 font-medium truncate">{ref.source}</span>
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold ml-2">
                                                {ref.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No referrer data yet (all direct traffic)</p>
                            )}
                        </div>

                        {/* Recent Events */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                            {analytics.recentEvents.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Browser</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {analytics.recentEvents.map((event, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {new Date(event.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{event.page_url}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className="inline-flex items-center gap-1 capitalize">
                                                            {getDeviceIcon(event.device_type || 'unknown')}
                                                            {event.device_type || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{event.browser || 'Unknown'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{event.timezone || 'Unknown'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No events tracked yet</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserAnalytics;
