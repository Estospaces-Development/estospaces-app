import { Zap } from 'lucide-react';
import SatelliteMap from './SatelliteMap';

const RecentActivity = () => {
  const activities = [
    {
      type: 'New Application',
      name: 'Mike Wilson',
      property: 'Modern Downtown apartment',
      date: '1/10/2025',
    },
    {
      type: 'Viewing Scheduled',
      name: 'Sarah Johnson',
      property: 'tommorow',
      date: '',
    },
  ];

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:brightness-105 dark:hover:brightness-110">
      {/* Animated light overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <h3 className="section-heading text-gray-800 dark:text-white transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-light">Recently Activity</h3>
        </div>

      <div className="space-y-4 mb-6">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:scale-[1.02] cursor-pointer group/item">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 transition-all duration-300 group-hover/item:scale-150 group-hover/item:shadow-lg group-hover/item:shadow-blue-500/50"></div>
            <div className="flex-1">
              <p className="body-text font-medium text-gray-800 dark:text-white transition-colors duration-300 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400">{activity.type}</p>
              <p className="body-text text-gray-600 dark:text-gray-400 transition-colors duration-300 group-hover/item:text-gray-800 dark:group-hover/item:text-gray-300">
                {activity.name} - {activity.property}
              </p>
              {activity.date && (
                <p className="caption text-gray-500 dark:text-gray-500 mt-1">{activity.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Satellite Map */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg h-[500px] md:h-[650px] lg:h-[800px] relative overflow-hidden border border-gray-200 dark:border-gray-800">
        <SatelliteMap />
      </div>
      </div>
    </div>
  );
};

export default RecentActivity;
