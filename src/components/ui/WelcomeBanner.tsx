import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomeBanner = () => {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="page-title text-gray-800 dark:text-white mb-2">Welcome Prajol</h2>
          <p className="body-text text-gray-600 dark:text-gray-400">
            Manage Your Properties, ideas, and grow your business with powerful insight
          </p>
        </div>
        <button
          onClick={() => navigate('/manager/dashboard/properties/add')}
          className="btn-primary bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="secondary-label text-gray-700 dark:text-gray-300">3 Active Properties</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="secondary-label text-gray-700 dark:text-gray-300">6 Active Leads</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="secondary-label text-gray-700 dark:text-gray-300">6 Applications</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
