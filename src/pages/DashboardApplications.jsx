import React from 'react';
import { FileText, Clock, CheckCircle } from 'lucide-react';

const DashboardApplications = () => {
  const applications = [
    { id: 1, property: 'Modern Downtown Apartment', date: '1/15/2025', status: 'under review' },
    { id: 2, property: 'Luxury Condo with Ocean View', date: '1/15/2025', status: 'scheduled' },
    { id: 3, property: 'Spacious Family Home', date: '1/15/2025', status: 'pending' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-700';
      case 'under review':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track your property applications</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Your Applications</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {applications.map((app) => (
            <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <FileText className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{app.property}</p>
                    <p className="text-sm text-gray-600">Applied on {app.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardApplications;

