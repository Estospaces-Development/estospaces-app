import { Zap } from 'lucide-react';

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
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-blue-500" />
        <h3 className="section-heading text-gray-800 dark:text-white">Recently Activity</h3>
      </div>

      <div className="space-y-4 mb-6">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="body-text font-medium text-gray-800 dark:text-white">{activity.type}</p>
              <p className="body-text text-gray-600 dark:text-gray-400">
                {activity.name} - {activity.property}
              </p>
              {activity.date && (
                <p className="caption text-gray-500 dark:text-gray-500 mt-1">{activity.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-100 dark:bg-black rounded-lg h-64 relative overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="body-text text-gray-500 dark:text-gray-400">USA Map</p>
        </div>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded-full"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 60 + 20}%`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
