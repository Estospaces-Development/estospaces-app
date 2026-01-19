import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MonitorMetricCardProps {
    icon: LucideIcon;
    value: number;
    label: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const MonitorMetricCard: React.FC<MonitorMetricCardProps> = ({
    icon: Icon,
    value,
    label,
    color = 'blue'
}) => {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    };

    return (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 animate-pulse">
                    {value}
                </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
};

export default MonitorMetricCard;
