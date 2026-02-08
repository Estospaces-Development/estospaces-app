import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export type HealthStatus = 'healthy' | 'warning' | 'critical';

interface SystemHealthBarProps {
    status: HealthStatus;
    message: string;
}

const SystemHealthBar: React.FC<SystemHealthBarProps> = ({ status, message }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'healthy':
                return {
                    icon: CheckCircle2,
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    barColor: 'bg-green-500',
                    textColor: 'text-green-700 dark:text-green-400',
                    iconColor: 'text-green-600 dark:text-green-400',
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
                    barColor: 'bg-orange-500',
                    textColor: 'text-orange-700 dark:text-orange-400',
                    iconColor: 'text-orange-600 dark:text-orange-400',
                };
            case 'critical':
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-100 dark:bg-red-900/30',
                    barColor: 'bg-red-500',
                    textColor: 'text-red-700 dark:text-red-400',
                    iconColor: 'text-red-600 dark:text-red-400',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={`${config.bgColor} border border-gray-200 dark:border-zinc-800 rounded-xl p-6 transition-all duration-500`}>
            <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
                <h3 className={`text-sm font-semibold ${config.textColor}`}>
                    System Health
                </h3>
            </div>

            {/* Health Bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full ${config.barColor} transition-all duration-500`}
                    style={{
                        width: status === 'healthy' ? '100%' : status === 'warning' ? '60%' : '30%'
                    }}
                />
            </div>

            <p className={`text-sm ${config.textColor}`}>{message}</p>
        </div>
    );
};

export default SystemHealthBar;
