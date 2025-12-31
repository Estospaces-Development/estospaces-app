import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../components/ui/SummaryCard';
import BackButton from '../components/ui/BackButton';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileCheck, 
  Plus, 
  Filter, 
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';

interface Application {
  id: string;
  name: string;
  email: string;
  propertyInterested: string;
  status: string;
  score: number;
  budget: string;
  lastContact: string;
}

const Application = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const applications: Application[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      propertyInterested: 'Modern Downtown Apartment',
      status: 'New Application',
      score: 85,
      budget: '$2,500/mo',
      lastContact: '2 days ago',
    },
    {
      id: '2',
      name: 'Michel Chen',
      email: 'michel.chen@email.com',
      propertyInterested: 'Luxury Condo with City View',
      status: 'In Review',
      score: 92,
      budget: '$3,200/mo',
      lastContact: '1 day ago',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      propertyInterested: 'Spacious Penthouse',
      status: 'Approved',
      score: 78,
      budget: '$4,500/mo',
      lastContact: '3 days ago',
    },
  ];

  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.propertyInterested.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Application</h1>
        <p className="text-gray-600">Review and manage client applications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard
          title="New Applications"
          value={1}
          icon={FileText}
          iconColor="bg-blue-500"
        />
        <SummaryCard
          title="In Review"
          value={1}
          icon={Clock}
          iconColor="bg-yellow-500"
        />
        <SummaryCard
          title="Approved"
          value={1}
          icon={CheckCircle}
          iconColor="bg-green-500"
        />
        <SummaryCard
          title="Rejected"
          value={1}
          icon={XCircle}
          iconColor="bg-red-500"
        />
        <SummaryCard
          title="Total"
          value={0}
          icon={FileCheck}
          iconColor="bg-purple-500"
        />
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Leads"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">More Filters</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add New Application</span>
          </button>
        </div>
      </div>

      {/* Applications Overview Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Leads Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Interested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.name}</div>
                      <div className="text-sm text-gray-500">{app.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.propertyInterested}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      app.status === 'New Application' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.score}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.budget}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{app.lastContact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Call">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Application;

