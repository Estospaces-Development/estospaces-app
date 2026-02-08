import React, { useState, useEffect } from 'react';
import { Activity, Building2, Zap, Eye, FileCheck, AlertCircle } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import MonitorMetricCard from '../../components/manager/MonitorMetricCard';
import SystemHealthBar, { HealthStatus } from '../../components/manager/SystemHealthBar';
import LiveActivityFeed from '../../components/manager/LiveActivityFeed';
import {
    LiveMetrics,
    ActivityItem,
    initialMetrics,
    initialActivityFeed,
    generateRandomActivity,
    varyMetrics,
} from '../../mocks/monitoringData';

const MonitoringDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics);
    const [activities, setActivities] = useState<ActivityItem[]>(initialActivityFeed);
    const [healthStatus, setHealthStatus] = useState<HealthStatus>('healthy');
    const [healthMessage, setHealthMessage] = useState<string>('All systems operational');

    // Calculate health status based on metrics and activities
    useEffect(() => {
        const criticalActivities = activities.filter(a => a.severity === 'critical').length;
        const warningActivities = activities.filter(a => a.severity === 'warning').length;

        if (criticalActivities > 0 || metrics.pendingActions > 5) {
            setHealthStatus('critical');
            setHealthMessage(`Critical: ${criticalActivities} critical issues require immediate attention`);
        } else if (warningActivities > 3 || metrics.pendingActions > 2) {
            setHealthStatus('warning');
            setHealthMessage(`Warning: ${warningActivities} items need attention`);
        } else {
            setHealthStatus('healthy');
            setHealthMessage('All systems operational - platform running smoothly');
        }
    }, [activities, metrics]);

    // Simulate real-time metric updates (every 10-15 seconds)
    useEffect(() => {
        const metricsInterval = setInterval(() => {
            setMetrics(prev => varyMetrics(prev));
        }, 12000); // 12 seconds

        return () => clearInterval(metricsInterval);
    }, []);

    // Simulate real-time activity feed updates (every 8-12 seconds)
    useEffect(() => {
        const activityInterval = setInterval(() => {
            const newActivity = generateRandomActivity();
            setActivities(prev => [newActivity, ...prev].slice(0, 20)); // Keep only latest 20
        }, 10000); // 10 seconds

        return () => clearInterval(activityInterval);
    }, []);

    // Handle activity click
    const handleActivityClick = (activity: ActivityItem) => {
        // Show toast notification (simple alert for now, can be replaced with a toast library)
        const severityEmoji = activity.severity === 'critical' ? '🚨' : activity.severity === 'warning' ? '⚠️' : 'ℹ️';
        alert(`${severityEmoji} ${activity.message}`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <BackButton />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Real-Time Monitoring</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Live operational view of property & deal activity
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MonitorMetricCard
                    icon={Building2}
                    value={metrics.activeProperties}
                    label="Active Properties"
                    color="blue"
                />
                <MonitorMetricCard
                    icon={Zap}
                    value={metrics.fastTrackActive}
                    label="Fast Track Cases"
                    color="purple"
                />
                <MonitorMetricCard
                    icon={Eye}
                    value={metrics.viewingsToday}
                    label="Viewings Today"
                    color="green"
                />
                <MonitorMetricCard
                    icon={FileCheck}
                    value={metrics.dealsReady}
                    label="Deals Ready"
                    color="green"
                />
                <MonitorMetricCard
                    icon={AlertCircle}
                    value={metrics.pendingActions}
                    label="Pending Actions"
                    color={metrics.pendingActions > 5 ? 'red' : metrics.pendingActions > 2 ? 'orange' : 'blue'}
                />
            </div>

            {/* System Health Bar */}
            <SystemHealthBar status={healthStatus} message={healthMessage} />

            {/* Live Activity Feed */}
            <LiveActivityFeed activities={activities} onActivityClick={handleActivityClick} />
        </div>
    );
};

export default MonitoringDashboard;
