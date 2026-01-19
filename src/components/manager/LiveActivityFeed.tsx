import React, { useEffect, useRef } from 'react';
import {
    Zap,
    Eye,
    FileCheck,
    CheckCircle,
    Handshake,
    Info,
    AlertTriangle,
    AlertOctagon
} from 'lucide-react';
import { ActivityItem, ActivityType, ActivitySeverity } from '../../mocks/monitoringData';
import { formatDistanceToNow } from 'date-fns';

interface LiveActivityFeedProps {
    activities: ActivityItem[];
    onActivityClick?: (activity: ActivityItem) => void;
}

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ activities, onActivityClick }) => {
    const feedRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to newest items
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = 0;
        }
    }, [activities]);

    const getActivityIcon = (type: ActivityType) => {
        switch (type) {
            case 'fast_track':
                return Zap;
            case 'viewing':
                return Eye;
            case 'document':
                return FileCheck;
            case 'approval':
                return CheckCircle;
            case 'deal':
                return Handshake;
            default:
                return Info;
        }
    };

    const getSeverityConfig = (severity: ActivitySeverity) => {
        switch (severity) {
            case 'info':
                return {
                    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                    border: 'border-blue-200 dark:border-blue-800',
                    icon: Info,
                };
            case 'warning':
                return {
                    badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                    border: 'border-yellow-200 dark:border-yellow-800',
                    icon: AlertTriangle,
                };
            case 'critical':
                return {
                    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                    border: 'border-red-200 dark:border-red-800',
                    icon: AlertOctagon,
                };
        }
    };

    return (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Live Activity Feed
            </h3>

            <div
                ref={feedRef}
                className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
            >
                {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const severityConfig = getSeverityConfig(activity.severity);
                    const SeverityIcon = severityConfig.icon;

                    return (
                        <div
                            key={activity.id}
                            onClick={() => onActivityClick?.(activity)}
                            className={`p-4 rounded-lg border ${severityConfig.border} hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-top-2`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${severityConfig.badge} flex-shrink-0`}>
                                    <Icon className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                                        {activity.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${severityConfig.badge}`}>
                                            <SeverityIcon className="w-3 h-3" />
                                            {activity.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LiveActivityFeed;
