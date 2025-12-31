import { LucideIcon, TrendingUp } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  trendColor: string;
}

const KPICard = ({ title, value, change, icon: Icon, iconColor, trendColor }: KPICardProps) => {
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">{change}</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{value}</h3>
      <p className="secondary-label text-gray-600 dark:text-gray-400">{title}</p>
    </div>
  );
};

export default KPICard;
