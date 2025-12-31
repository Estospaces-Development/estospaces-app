import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../contexts/PropertyContext';
import WelcomeBanner from '../components/ui/WelcomeBanner';
import KPICard from '../components/ui/KPICard';
import TabBar from '../components/ui/TabBar';
import RecentActivity from '../components/ui/RecentActivity';
import TopProperties from '../components/ui/TopProperties';
import PropertyCard from '../components/ui/PropertyCard';
import LakshmiChatbot from '../components/chatbot/LakshmiChatbot';
import { DollarSign, Building2, Eye, UserCheck, Filter, Download, Plus, Home, Mail, Phone, Users, FileText, CheckCircle, Clock, XCircle, Trash2, Search, MessageSquare, Edit, MoreVertical, TrendingUp, Target, Bot } from 'lucide-react';
import PieChart from '../components/ui/PieChart';
import BarChart from '../components/ui/BarChart';
import LineChart from '../components/ui/LineChart';

interface Lead {
  id: string;
  name: string;
  email: string;
  propertyInterested: string;
  status: string;
  score: number;
  budget: string;
  lastContact: string;
  phone?: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  propertyInterested: string;
  status: string;
  score: number;
  budget: string;
  submittedDate: string;
  lastContact: string;
  phone?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { properties, deleteProperty } = useProperties();
  const [activeTab, setActiveTab] = useState('overview');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');
  const [showPropertyDeleteConfirm, setShowPropertyDeleteConfirm] = useState<string | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sample leads data
  const leads: Lead[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      propertyInterested: 'Modern Downtown Apartment',
      status: 'New Lead',
      score: 85,
      budget: '$2,500/mo',
      lastContact: '2 days ago',
      phone: '+1 (555) 123-4567',
    },
    {
      id: '2',
      name: 'Michel Chen',
      email: 'michel.chen@email.com',
      propertyInterested: 'Luxury Condo with City View',
      status: 'In Progress',
      score: 92,
      budget: '$3,200/mo',
      lastContact: '1 day ago',
      phone: '+1 (555) 234-5678',
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
      phone: '+1 (555) 345-6789',
    },
    {
      id: '4',
      name: 'David Smith',
      email: 'david.smith@email.com',
      propertyInterested: 'Modern Downtown Apartment',
      status: 'New Lead',
      score: 88,
      budget: '$2,800/mo',
      lastContact: '5 hours ago',
      phone: '+1 (555) 456-7890',
    },
    {
      id: '5',
      name: 'Jessica Williams',
      email: 'jessica.williams@email.com',
      propertyInterested: 'Luxury Condo with City View',
      status: 'In Progress',
      score: 90,
      budget: '$3,500/mo',
      lastContact: '12 hours ago',
      phone: '+1 (555) 567-8901',
    },
  ];

  // Sample applications data
  const [applicationsList, setApplicationsList] = useState<Application[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      propertyInterested: 'Modern Downtown Apartment',
      status: 'Approved',
      score: 85,
      budget: '$2,500/mo',
      submittedDate: '2025-01-10',
      lastContact: '2 days ago',
      phone: '+1 (555) 123-4567',
    },
    {
      id: '2',
      name: 'Michel Chen',
      email: 'michel.chen@email.com',
      propertyInterested: 'Luxury Condo with City View',
      status: 'Pending',
      score: 92,
      budget: '$3,200/mo',
      submittedDate: '2025-01-12',
      lastContact: '1 day ago',
      phone: '+1 (555) 234-5678',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      propertyInterested: 'Spacious Penthouse',
      status: 'Approved',
      score: 78,
      budget: '$4,500/mo',
      submittedDate: '2025-01-08',
      lastContact: '3 days ago',
      phone: '+1 (555) 345-6789',
    },
    {
      id: '4',
      name: 'David Smith',
      email: 'david.smith@email.com',
      propertyInterested: 'Modern Downtown Apartment',
      status: 'Pending',
      score: 88,
      budget: '$2,800/mo',
      submittedDate: '2025-01-13',
      lastContact: '5 hours ago',
      phone: '+1 (555) 456-7890',
    },
    {
      id: '5',
      name: 'Jessica Williams',
      email: 'jessica.williams@email.com',
      propertyInterested: 'Luxury Condo with City View',
      status: 'Rejected',
      score: 65,
      budget: '$3,500/mo',
      submittedDate: '2025-01-05',
      lastContact: '1 week ago',
      phone: '+1 (555) 567-8901',
    },
    {
      id: '6',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      propertyInterested: 'Spacious Penthouse',
      status: 'Approved',
      score: 95,
      budget: '$5,000/mo',
      submittedDate: '2025-01-09',
      lastContact: '4 days ago',
      phone: '+1 (555) 678-9012',
    },
  ]);

  // Filter applications based on search and status
  const filteredApplications = applicationsList.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(applicationSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(applicationSearch.toLowerCase()) ||
      app.propertyInterested.toLowerCase().includes(applicationSearch.toLowerCase());
    const matchesStatus = applicationStatusFilter === 'all' || app.status === applicationStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedApplications = filteredApplications.filter((app) => app.status === 'Approved');
  const pendingApplications = filteredApplications.filter((app) => app.status === 'Pending');
  const allApplications = filteredApplications.sort((a, b) => 
    new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
  );

  const handleDeleteApplication = (id: string) => {
    setApplicationsList((prev) => prev.filter((app) => app.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleApproveApplication = (id: string) => {
    setApplicationsList((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'Approved' } : app))
    );
  };

  const handleRejectApplication = (id: string) => {
    setApplicationsList((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'Rejected' } : app))
    );
  };

  const mockProperties = [
    {
      name: 'Modern Downtown Apartment',
      address: '123 Main St.Downtown',
      beds: 2,
      bathrooms: 2,
      sqft: 1200,
      rating: 4.8,
      reviews: 24,
      listedDate: '2 weeks ago',
      tags: ['Apartment', 'Balcony', 'Gym'],
      image: '',
      status: 'Available',
    },
    {
      name: 'Luxury condo with City',
      address: '456, High St.Midtown',
      beds: 3,
      bathrooms: 2,
      sqft: 1500,
      rating: 4.9,
      reviews: 18,
      listedDate: '1 weeks ago',
      tags: ['Condo', 'Water view', 'Conciongo'],
      image: '',
      status: 'Available',
    },
    {
      name: 'Spacious Penthouse',
      address: '321 Sky, tower, Uptown',
      beds: 3,
      bathrooms: 3,
      sqft: 2200,
      rating: 4.9,
      reviews: 31,
      listedDate: '5 days ago',
      tags: ['Penthhouse', 'Terrance', 'City view'],
      image: '',
      status: 'Available',
    },
  ];

  return (
    <div className="space-y-6 font-sans relative">
      {/* Chatbot Toggle Button */}
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-3 z-40 transition-all duration-300 hover:scale-105"
          title="Ask Lakshmi"
        >
          <Bot className="w-5 h-5" />
          <span className="btn-primary">Ask Lakshmi</span>
        </button>
      )}

      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Monthly Revenue"
          value="$15,000.00"
          change="+8.5%"
          icon={DollarSign}
          iconColor="bg-green-500"
          trendColor="text-green-600"
        />
        <KPICard
          title="Active Listings"
          value="8"
          change="+5%"
          icon={Building2}
          iconColor="bg-blue-500"
          trendColor="text-blue-600"
        />
        <KPICard
          title="Total Views"
          value="2450"
          change="+15.2%"
          icon={Eye}
          iconColor="bg-purple-500"
          trendColor="text-purple-600"
        />
        <KPICard
          title="Conversion Rate"
          value="12.2%"
          change="+5%"
          icon={UserCheck}
          iconColor="bg-primary"
          trendColor="text-primary"
        />
      </div>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <>
          {/* Recent Activity and Top Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity />
            <TopProperties />
          </div>

          {/* Your Properties Section */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                <h3 className="section-heading text-gray-800 dark:text-white">Your Properties</h3>
              </div>
              <div className="flex items-center gap-3">
                <button className="btn-secondary flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                <button className="btn-secondary flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => navigate('/properties/add')}
                  className="btn-primary bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Property</span>
                </button>
              </div>
            </div>

            {/* Property Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.length > 0 ? (
                properties.map((property) => (
                  <PropertyCard key={property.id} property={property as any} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No properties yet</p>
                  <button
                    onClick={() => navigate('/properties/add')}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Add Your First Property
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Leads Tab Content */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          {/* Leads Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Total Leads</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{leads.length}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">New Leads</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {leads.filter((l) => l.status === 'New Lead').length}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {leads.filter((l) => l.status === 'In Progress').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {leads.filter((l) => l.status === 'Approved').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="section-heading text-gray-800 dark:text-white">Leads Overview</h2>
              <button
                onClick={() => navigate('/leads')}
                className="btn-secondary text-primary hover:text-primary-dark"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-black">
                  <tr>
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">Lead Name</th>
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">Property Interested</th>
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">Score</th>
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">Last Contact</th>
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="body-text font-medium text-gray-900 dark:text-white">{lead.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="body-text text-gray-900 dark:text-white">{lead.email}</div>
                        {lead.phone && (
                          <div className="caption text-gray-500 dark:text-gray-400">{lead.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="body-text text-gray-900 dark:text-white">{lead.propertyInterested}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 caption font-medium rounded-full ${
                            lead.status === 'New Lead'
                              ? 'bg-blue-100 text-blue-800'
                              : lead.status === 'In Progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : lead.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="body-text text-gray-900 dark:text-white">{lead.score}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="body-text text-gray-900 dark:text-white">{lead.budget}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="caption text-gray-500 dark:text-gray-400">{lead.lastContact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap body-text font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Email"
                            onClick={() => window.location.href = `mailto:${lead.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {lead.phone && (
                            <button
                              className="text-green-600 hover:text-green-900"
                              title="Call"
                              onClick={() => window.location.href = `tel:${lead.phone}`}
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate('/leads')}
                            className="text-primary hover:text-primary-dark"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
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
      )}

      {/* Properties Tab Content */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              <h3 className="section-heading text-gray-800 dark:text-white">Your Properties</h3>
            </div>
            <button
              onClick={() => navigate('/properties/add')}
              className="btn-primary bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties by name, address, or city..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={propertyStatusFilter}
                onChange={(e) => setPropertyStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">More Filters</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Recently Added Properties */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="section-heading text-gray-800 dark:text-white mb-4">Recently Added Properties</h2>
            
            {(() => {
              // Filter and sort properties
              const filteredProperties = properties
                .filter((property) => {
                  const matchesSearch =
                    property.title?.toLowerCase().includes(propertySearch.toLowerCase()) ||
                    property.address?.toLowerCase().includes(propertySearch.toLowerCase()) ||
                    property.city?.toLowerCase().includes(propertySearch.toLowerCase());
                  const matchesStatus = propertyStatusFilter === 'all' || property.status === propertyStatusFilter;
                  return matchesSearch && matchesStatus;
                })
                .sort((a, b) => {
                  // Sort by creation date (newest first)
                  const dateA = new Date(a.createdAt || 0).getTime();
                  const dateB = new Date(b.createdAt || 0).getTime();
                  return dateB - dateA;
                });

              if (filteredProperties.length === 0) {
                return (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      {properties.length === 0
                        ? 'No properties yet'
                        : 'No properties match your search criteria'}
                    </p>
                    {properties.length === 0 && (
                      <button
                        onClick={() => navigate('/properties/add')}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Add Your First Property
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="relative group">
                      <PropertyCard property={property as any} />
                      {/* Management Actions Overlay */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/properties/${property.id}`)}
                          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => navigate(`/properties/edit/${property.id}`)}
                          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => setShowPropertyDeleteConfirm(property.id)}
                          className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Properties Summary */}
          {properties.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="section-heading text-gray-800 dark:text-white mb-4">Properties Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{properties.length}</div>
                  <div className="text-sm text-gray-600">Total Properties</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {properties.filter((p) => p.status === 'Available').length}
                  </div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700 mb-1">
                    {properties.filter((p) => p.status === 'Pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 mb-1">
                    {properties.filter((p) => p.status === 'Sold' || p.status === 'Rented').length}
                  </div>
                  <div className="text-sm text-gray-600">Sold/Rented</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Application Tab Content */}
      {activeTab === 'application' && (
        <div className="space-y-6">
          {/* Application Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Total Applications</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{applicationsList.length}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{approvedApplications.length}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{pendingApplications.length}</p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {applicationsList.filter((app) => app.status === 'Rejected').length}
                  </p>
                </div>
                <div className="p-3 bg-red-500 rounded-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications by name, email, or property..."
                  value={applicationSearch}
                  onChange={(e) => setApplicationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={applicationStatusFilter}
                onChange={(e) => setApplicationStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">More Filters</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Approved Applications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Approved Applications ({approvedApplications.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.propertyInterested}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
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
                        <div className="text-sm text-gray-500">
                          {new Date(app.submittedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                            onClick={() => navigate('/application')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Message"
                            onClick={() => navigate('/messages')}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Email"
                            onClick={() => window.location.href = `mailto:${app.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {app.status === 'Pending' && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                                onClick={() => handleApproveApplication(app.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                                onClick={() => handleRejectApplication(app.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            onClick={() => setShowDeleteConfirm(app.id)}
                          >
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

          {/* Pending Applications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Pending Applications ({pendingApplications.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.propertyInterested}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
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
                        <div className="text-sm text-gray-500">
                          {new Date(app.submittedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                            onClick={() => navigate('/application')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Message"
                            onClick={() => navigate('/messages')}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Email"
                            onClick={() => window.location.href = `mailto:${app.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {app.status === 'Pending' && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                                onClick={() => handleApproveApplication(app.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                                onClick={() => handleRejectApplication(app.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            onClick={() => setShowDeleteConfirm(app.id)}
                          >
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

          {/* Application History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Application History</h2>
              <button
                onClick={() => navigate('/application')}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.propertyInterested}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            app.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : app.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
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
                        <div className="text-sm text-gray-500">
                          {new Date(app.submittedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{app.lastContact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                            onClick={() => navigate('/application')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Message"
                            onClick={() => navigate('/messages')}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Email"
                            onClick={() => window.location.href = `mailto:${app.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {app.status === 'Pending' && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                                onClick={() => handleApproveApplication(app.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                                onClick={() => handleRejectApplication(app.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            onClick={() => setShowDeleteConfirm(app.id)}
                          >
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
      )}

      {/* Analytics Tab Content */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">247</h3>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{properties.length || 120}</h3>
              <p className="text-sm text-gray-600">Total Properties</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">14.7%</h3>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">18.2%</h3>
              <p className="text-sm text-gray-600">Growth Rate</p>
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue Trend</h2>
              <button
                onClick={() => navigate('/analytics')}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                View Full Analytics →
              </button>
            </div>
            <div className="flex items-end justify-between gap-4 h-48">
              {[
                { month: 'Jan', value: 15000, height: '40%' },
                { month: 'Feb', value: 18000, height: '50%' },
                { month: 'Mar', value: 22000, height: '60%' },
                { month: 'Apr', value: 25000, height: '70%' },
                { month: 'May', value: 28000, height: '80%' },
                { month: 'Jun', value: 32000, height: '95%' },
              ].map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center mb-2">
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: item.height }}
                    ></div>
                    <p className="text-sm font-medium text-gray-800 mt-2">${(item.value / 1000).toFixed(0)}k</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{item.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Row 1: Pie Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Application Status Distribution</h2>
              <PieChart
                data={[
                  { label: 'Approved', value: approvedApplications.length, color: '#10b981' },
                  { label: 'Pending', value: pendingApplications.length, color: '#f59e0b' },
                  { label: 'Rejected', value: applicationsList.filter((app) => app.status === 'Rejected').length, color: '#ef4444' },
                ]}
                size={200}
              />
            </div>

            {/* Lead Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Lead Status Distribution</h2>
              <PieChart
                data={[
                  { label: 'New Leads', value: leads.filter((l) => l.status === 'New Lead').length, color: '#3b82f6' },
                  { label: 'In Progress', value: leads.filter((l) => l.status === 'In Progress').length, color: '#f59e0b' },
                  { label: 'Approved', value: leads.filter((l) => l.status === 'Approved').length, color: '#10b981' },
                ]}
                size={200}
              />
            </div>
          </div>

          {/* Charts Row 2: Bar Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Performance Bar Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Property Performance Comparison</h2>
              <BarChart
                data={[
                  { label: 'Modern Downtown', value: 45, color: '#FF6B35' },
                  { label: 'Luxury Condo', value: 38, color: '#3b82f6' },
                  { label: 'Spacious Penthouse', value: 52, color: '#10b981' },
                ]}
                title="Property Views"
                height={200}
              />
            </div>

            {/* Applications by Property */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Applications by Property</h2>
              <BarChart
                data={[
                  { label: 'Modern Downtown', value: 12, color: '#8b5cf6' },
                  { label: 'Luxury Condo', value: 8, color: '#f59e0b' },
                  { label: 'Spacious Penthouse', value: 15, color: '#ef4444' },
                ]}
                title="Applications Received"
                height={200}
              />
            </div>
          </div>

          {/* Charts Row 3: Line Chart and Property Performance Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Line Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Revenue Trend (Line Chart)</h2>
              <LineChart
                data={[
                  { label: 'Jan', value: 15000 },
                  { label: 'Feb', value: 18000 },
                  { label: 'Mar', value: 22000 },
                  { label: 'Apr', value: 25000 },
                  { label: 'May', value: 28000 },
                  { label: 'Jun', value: 32000 },
                ]}
                height={200}
                color="#FF6B35"
              />
            </div>

            {/* Property Performance Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { property: 'Modern Downtown Apartment', views: 45, applications: 12, conversionRate: 26.7 },
                      { property: 'Luxury Condo with City View', views: 38, applications: 8, conversionRate: 21.1 },
                      { property: 'Spacious Penthouse', views: 52, applications: 15, conversionRate: 28.8 },
                    ].map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.property}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.views}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.applications}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${item.conversionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{item.conversionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Charts Row 4: Lead Analytics and Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Analytic */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Analytic</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Leads</span>
                  <span className="text-lg font-semibold text-gray-800">247</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Properties</span>
                  <span className="text-lg font-semibold text-gray-800">{properties.length || 120}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-lg font-semibold text-gray-800">14.7%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Passed</span>
                  <span className="text-lg font-semibold text-gray-800">36</span>
                </div>
              </div>
            </div>

            {/* Monthly Applications Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Monthly Applications Trend</h2>
              <LineChart
                data={[
                  { label: 'Jan', value: 8 },
                  { label: 'Feb', value: 12 },
                  { label: 'Mar', value: 15 },
                  { label: 'Apr', value: 18 },
                  { label: 'May', value: 22 },
                  { label: 'Jun', value: 25 },
                ]}
                height={200}
                color="#3b82f6"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Application</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this application? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteApplication(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Property Confirmation Modal */}
      {showPropertyDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Property</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPropertyDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showPropertyDeleteConfirm) {
                    deleteProperty(showPropertyDeleteConfirm);
                    setShowPropertyDeleteConfirm(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lakshmi Chatbot */}
      <LakshmiChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
};

export default Dashboard;
