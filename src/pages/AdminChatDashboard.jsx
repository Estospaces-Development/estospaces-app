import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
    LogOut, 
    TrendingUp, 
    Shield,
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    Bell,
    Search,
    ChevronRight,
    Activity,
    CheckCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    Loader2,
    UserPlus,
    FileCheck,
    Home
} from 'lucide-react';

const AdminChatDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        pendingVerifications: 0,
        approvedManagers: 0,
        totalUsers: 0,
        activeProperties: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [adminName, setAdminName] = useState('Admin');

    // Fetch all dashboard data
    const fetchDashboardData = useCallback(async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            // Get current admin name
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                if (profile?.full_name) {
                    setAdminName(profile.full_name);
                }
            }

            // Fetch verification counts
            const [pendingResult, approvedResult] = await Promise.all([
                supabase
                    .from('manager_profiles')
                    .select('id', { count: 'exact', head: true })
                    .in('verification_status', ['submitted', 'under_review']),
                supabase
                    .from('manager_profiles')
                    .select('id', { count: 'exact', head: true })
                    .eq('verification_status', 'approved'),
            ]);

            // Fetch total users count
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true });

            // Fetch active properties count
            const { count: activeProperties } = await supabase
                .from('properties')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'online');

            setStats({
                pendingVerifications: pendingResult.count || 0,
                approvedManagers: approvedResult.count || 0,
                totalUsers: totalUsers || 0,
                activeProperties: activeProperties || 0,
            });

            // Fetch recent activity from audit log
            const { data: auditLogs } = await supabase
                .from('manager_verification_audit_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            // Fetch recent manager profiles for activity
            const { data: recentManagers } = await supabase
                .from('manager_profiles')
                .select('id, profile_type, verification_status, submitted_at, updated_at')
                .order('updated_at', { ascending: false })
                .limit(5);

            // Fetch recent properties
            const { data: recentProperties } = await supabase
                .from('properties')
                .select('id, title, city, created_at')
                .order('created_at', { ascending: false })
                .limit(3);

            // Combine and format activity
            const activities = [];

            // Add audit log activities
            if (auditLogs && auditLogs.length > 0) {
                auditLogs.forEach(log => {
                    const actionMessages = {
                        'status_change': 'Verification status updated',
                        'document_uploaded': 'New document uploaded',
                        'profile_updated': 'Manager profile updated',
                        'approved': 'Manager approved',
                        'rejected': 'Manager rejected',
                        'revoked': 'Approval revoked',
                    };
                    activities.push({
                        type: 'verification',
                        message: actionMessages[log.action] || `Action: ${log.action}`,
                        time: formatTimeAgo(log.created_at),
                        icon: Shield,
                        timestamp: new Date(log.created_at).getTime(),
                    });
                });
            }

            // Add recent manager submissions
            if (recentManagers && recentManagers.length > 0) {
                recentManagers.forEach(manager => {
                    if (manager.verification_status === 'submitted') {
                        activities.push({
                            type: 'user',
                            message: `New ${manager.profile_type} verification submitted`,
                            time: formatTimeAgo(manager.submitted_at || manager.updated_at),
                            icon: UserPlus,
                            timestamp: new Date(manager.submitted_at || manager.updated_at).getTime(),
                        });
                    }
                });
            }

            // Add recent properties
            if (recentProperties && recentProperties.length > 0) {
                recentProperties.forEach(property => {
                    activities.push({
                        type: 'property',
                        message: `New property listed: ${property.title || 'Untitled'} in ${property.city || 'Unknown'}`,
                        time: formatTimeAgo(property.created_at),
                        icon: Home,
                        timestamp: new Date(property.created_at).getTime(),
                    });
                });
            }

            // Sort by timestamp and take top 6
            activities.sort((a, b) => b.timestamp - a.timestamp);
            setRecentActivity(activities.slice(0, 6));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
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

    // Quick stats for dashboard (REAL DATA)
    const quickStats = [
        { 
            label: 'Pending Verifications', 
            value: stats.pendingVerifications, 
            icon: Clock, 
            color: 'yellow',
        },
        { 
            label: 'Approved Managers', 
            value: stats.approvedManagers, 
            icon: CheckCircle, 
            color: 'green',
        },
        { 
            label: 'Total Users', 
            value: stats.totalUsers, 
            icon: Users, 
            color: 'blue',
        },
        { 
            label: 'Active Properties', 
            value: stats.activeProperties, 
            icon: Building2, 
            color: 'purple',
        },
    ];

    // Navigation cards with real stats
    const navCards = [
        {
            title: 'Broker Verification',
            description: 'Review and approve manager verification requests',
            icon: Shield,
            color: 'from-orange-500 to-red-500',
            path: '/admin/verifications',
            stats: stats.pendingVerifications > 0 ? `${stats.pendingVerifications} pending` : 'No pending'
        },
        {
            title: 'Analytics Dashboard',
            description: 'View user analytics, traffic insights and behavior',
            icon: TrendingUp,
            color: 'from-blue-500 to-indigo-500',
            path: '/admin/analytics',
            stats: 'Real-time data'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl shadow-lg shadow-orange-500/25">
                                <LayoutDashboard size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Admin Dashboard
                                </h1>
                                <p className="text-xs text-gray-500">Estospaces Management</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Refresh */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all font-medium disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            
                            {/* Settings */}
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <Settings size={20} className="text-gray-600" />
                            </button>
                            
                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-full transition-all font-medium"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
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
                            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500"></div>
                            <LayoutDashboard size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" />
                        </div>
                        <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
                    </div>
                ) : (
                    <>
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {adminName}! 👋</h2>
                            <p className="text-gray-600">Here's what's happening with your platform today.</p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {quickStats.map((stat, index) => {
                                const Icon = stat.icon;
                                const colorClasses = {
                                    yellow: 'from-yellow-400 to-orange-500 shadow-yellow-500/25',
                                    green: 'from-green-400 to-emerald-500 shadow-green-500/25',
                                    blue: 'from-blue-400 to-indigo-500 shadow-blue-500/25',
                                    purple: 'from-purple-400 to-pink-500 shadow-purple-500/25',
                                };
                                return (
                                    <div 
                                        key={index}
                                        className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[stat.color]} shadow-lg`}>
                                                <Icon size={24} className="text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Navigation Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {navCards.map((card, index) => {
                                const Icon = card.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => navigate(card.path)}
                                        className="group bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-r ${card.color} shadow-lg`}>
                                                <Icon size={28} className="text-white" />
                                            </div>
                                            <ChevronRight 
                                                size={24} 
                                                className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{card.title}</h3>
                                        <p className="text-gray-500 mb-4">{card.description}</p>
                                        <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                            <Activity size={14} />
                                            {card.stats}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                <button 
                                    onClick={() => navigate('/admin/verifications')}
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    View all
                                </button>
                            </div>
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {recentActivity.map((activity, index) => {
                                        const Icon = activity.icon;
                                        return (
                                            <div key={index} className="px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-center gap-4">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Icon size={18} className="text-gray-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700">{activity.message}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300" />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center">
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

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

export default AdminChatDashboard;
