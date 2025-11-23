import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, Users, Eye, Globe, TrendingUp, Calendar, RefreshCw, MessageSquare } from 'lucide-react';

const UserAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalUsers: 0,
        totalPageViews: 0,
        topPages: [],
        demographics: [],
        referrers: [],
        recentEvents: [],
    });

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            if (!supabase) {
                console.error('Supabase not initialized');
                return;
            }

            // Get total users (unique user agents)
            const { data: allEvents } = await supabase
                .from('analytics_events')
                .select('*')
                .order('created_at', { ascending: false });

            if (!allEvents) {
                setAnalytics({
                    totalUsers: 0,
                    totalPageViews: 0,
                    topPages: [],
                    demographics: [],
                    referrers: [],
                    recentEvents: [],
                });
                return;
            }

            // Calculate unique users
            const uniqueUsers = new Set(allEvents.map(e => e.user_agent)).size;

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

            // Calculate demographics (language + timezone)
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

            setAnalytics({
                totalUsers: uniqueUsers,
                totalPageViews: allEvents.length,
                topPages,
                demographics,
                referrers,
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

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
                        <p className="text-sm text-gray-600">Cookie tracking & user behavior insights</p>
                    </div>
                    <div className="flex items-center gap-3">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Eye className="text-green-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">Page Views</h3>
                                <p className="text-3xl font-bold text-gray-900">{analytics.totalPageViews}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <Globe className="text-purple-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">Traffic Sources</h3>
                                <p className="text-3xl font-bold text-gray-900">{analytics.referrers.length}</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-orange-100 p-3 rounded-lg">
                                        <TrendingUp className="text-orange-600" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">Avg. Pages/User</h3>
                                <p className="text-3xl font-bold text-gray-900">
                                    {analytics.totalUsers > 0 ? (analytics.totalPageViews / analytics.totalUsers).toFixed(1) : 0}
                                </p>
                            </div>
                        </div>

                        {/* Data Tables */}
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
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolution</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {analytics.recentEvents.map((event, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {new Date(event.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{event.page_url}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{event.language}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{event.screen_resolution}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{event.platform}</td>
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
