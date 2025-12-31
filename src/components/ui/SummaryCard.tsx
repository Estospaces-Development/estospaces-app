import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  bgColor?: string;
}

const SummaryCard = ({ title, value, icon: Icon, iconColor, bgColor = 'bg-white dark:bg-black' }: SummaryCardProps) => {
  return (
    <div className={`${bgColor} rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
        <div className={`${iconColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;

