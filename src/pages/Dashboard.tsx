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
import { DollarSign, Building2, Eye, UserCheck, Filter, Download, Plus, Home, Mail, Phone, Users, FileText, CheckCircle, Clock, XCircle, Trash2, Search, MessageSquare, Edit, MoreVertical, TrendingUp, Target, Bot, TrendingDown, AlertCircle, Lightbulb, Share2, FileDown, FileSpreadsheet } from 'lucide-react';
import PieChart from '../components/ui/PieChart';
import BarChart from '../components/ui/BarChart';
import LineChart from '../components/ui/LineChart';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

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
  const [showPropertyFilters, setShowPropertyFilters] = useState(false);
  const [showPropertyExportMenu, setShowPropertyExportMenu] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showLeadFilters, setShowLeadFilters] = useState(false);
  const [showLeadExportMenu, setShowLeadExportMenu] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showApplicationFilters, setShowApplicationFilters] = useState(false);
  const [showApplicationExportMenu, setShowApplicationExportMenu] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

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
          {/* Recent Activity - Full Width for Better Map View */}
          <div className="mb-6">
            <RecentActivity />
          </div>

          {/* Top Properties */}
          <div>
            <TopProperties />
          </div>

          {/* Your Properties Section */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:brightness-105 dark:hover:brightness-110">
            {/* Animated light overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <h3 className="section-heading text-gray-800 dark:text-white transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-light">Your Properties</h3>
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
                    onClick={() => navigate('/manager/dashboard/properties/add')}
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
                      onClick={() => navigate('/manager/dashboard/properties/add')}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Add Your First Property
                    </button>
                  </div>
                )}
              </div>
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

          {/* Search and Filter Bar for Leads */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowLeadFilters(!showLeadFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">More Filters</span>
                </button>
                {showLeadFilters && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10 min-w-[250px]">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
                          <option value="all">All Status</option>
                          <option value="New Lead">New Lead</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score Range</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowLeadFilters(false)}
                        className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowLeadExportMenu(!showLeadExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                  {selectedLeads.length > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      {selectedLeads.length}
                    </span>
                  )}
                </button>
                {showLeadExportMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px]">
                    <button
                      onClick={() => handleExportLeads('pdf')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExportLeads('excel')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export as Excel
                    </button>
                  </div>
                )}
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
                    <th className="px-6 py-3 text-left caption text-gray-500 dark:text-gray-400 uppercase">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
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
                    <tr key={lead.id} className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:scale-[1.01] cursor-pointer hover:shadow-sm">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleSelectLead(lead.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
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
                          <button
                            onClick={() => handleShareLead(lead)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
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
              onClick={() => navigate('/manager/dashboard/properties/add')}
              className="btn-primary bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties by name, address, or city..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={propertyStatusFilter}
                onChange={(e) => setPropertyStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>
              <div className="relative">
                <button
                  onClick={() => setShowPropertyFilters(!showPropertyFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">More Filters</span>
                </button>
                {showPropertyFilters && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10 min-w-[250px]">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
                          <option value="all">All</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                        </select>
                      </div>
                      <button
                        onClick={() => setShowPropertyFilters(false)}
                        className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowPropertyExportMenu(!showPropertyExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                  {selectedProperties.length > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      {selectedProperties.length}
                    </span>
                  )}
                </button>
                {showPropertyExportMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px]">
                    <button
                      onClick={() => handleExportProperties('pdf')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExportProperties('excel')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export as Excel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recently Added Properties */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:brightness-105 dark:hover:brightness-110">
            {/* Animated light overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
            
            <div className="relative z-10">
            <h2 className="section-heading text-gray-800 dark:text-white mb-4 transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-light">Recently Added Properties</h2>
            
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
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {properties.length === 0
                        ? 'No properties yet'
                        : 'No properties match your search criteria'}
                    </p>
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
                          onClick={() => navigate(`/manager/dashboard/properties/${property.id}`)}
                          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => navigate(`/manager/dashboard/properties/edit/${property.id}`)}
                          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </button>
                        <button
                          onClick={() => handleShareProperty(property)}
                          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </button>
                        <button
                          onClick={() => setShowPropertyDeleteConfirm(property.id)}
                          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            </div>
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
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications by name, email, or property..."
                  value={applicationSearch}
                  onChange={(e) => setApplicationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={applicationStatusFilter}
                onChange={(e) => setApplicationStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="relative">
                <button
                  onClick={() => setShowApplicationFilters(!showApplicationFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">More Filters</span>
                </button>
                {showApplicationFilters && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10 min-w-[250px]">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score Range</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowApplicationFilters(false)}
                        className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowApplicationExportMenu(!showApplicationExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                  {selectedApplications.length > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      {selectedApplications.length}
                    </span>
                  )}
                </button>
                {showApplicationExportMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[180px]">
                    <button
                      onClick={() => handleExportApplications('pdf')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExportApplications('excel')}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export as Excel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Approved Applications */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative group transition-all duration-300 hover:shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-light">Approved Applications ({approvedApplications.length})</h2>
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
                <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                  {approvedApplications.map((app) => (
                    <tr key={app.id} className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:scale-[1.01] cursor-pointer hover:shadow-sm">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(app.id)}
                          onChange={() => toggleSelectApplication(app.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{app.email}</div>
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
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative group transition-all duration-300 hover:shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-light">Pending Applications ({pendingApplications.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                  {pendingApplications.map((app) => (
                    <tr key={app.id} className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:scale-[1.01] cursor-pointer hover:shadow-sm">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(app.id)}
                          onChange={() => toggleSelectApplication(app.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{app.propertyInterested}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{app.score}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{app.budget}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(app.submittedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="View"
                            onClick={() => navigate('/application')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            title="Message"
                            onClick={() => navigate('/messages')}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            title="Email"
                            onClick={() => window.location.href = `mailto:${app.email}`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShareApplication(app)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {app.status === 'Pending' && (
                            <>
                              <button
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                title="Approve"
                                onClick={() => handleApproveApplication(app.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                title="Reject"
                                onClick={() => handleRejectApplication(app.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative group transition-all duration-300 hover:shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-light">Application History</h2>
              <button
                onClick={() => navigate('/application')}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                  {allApplications.map((app) => (
                    <tr key={app.id} className="transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:scale-[1.01] cursor-pointer hover:shadow-sm">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(app.id)}
                          onChange={() => toggleSelectApplication(app.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{app.propertyInterested}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            app.status === 'Approved'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              : app.status === 'Pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{app.score}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{app.budget}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(app.submittedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{app.lastContact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="View"
                            onClick={() => navigate('/application')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            title="Message"
                            onClick={() => navigate('/messages')}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShareApplication(app)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
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
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Monthly Revenue Trend</h2>
              <button
                onClick={() => navigate('/analytics')}
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                View Full Analytics →
              </button>
            </div>

            {/* Summary Cards */}
            {(() => {
              const revenueData = [
                { month: 'Jan', value: 15000 },
                { month: 'Feb', value: 18000 },
                { month: 'Mar', value: 22000 },
                { month: 'Apr', value: 25000 },
                { month: 'May', value: 28000 },
                { month: 'Jun', value: 32000 },
              ];
              
              const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0);
              const averageRevenue = Math.round(totalRevenue / revenueData.length);
              const bestMonth = revenueData.reduce((max, item) => (item.value > max.value ? item : max), revenueData[0]);
              const growthRate = ((revenueData[revenueData.length - 1].value - revenueData[0].value) / revenueData[0].value) * 100;
              
              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">${(totalRevenue / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">6 months</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Monthly</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">${(averageRevenue / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Per month</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Month</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{bestMonth.month}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">${(bestMonth.value / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Growth Rate</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">+{growthRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Since Jan</p>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="mb-6">
                    <div className="flex items-end justify-between gap-4 h-48">
                      {revenueData.map((item, index) => {
                        const maxValue = Math.max(...revenueData.map(d => d.value));
                        const height = (item.value / maxValue) * 100;
                        const prevValue = index > 0 ? revenueData[index - 1].value : item.value;
                        const change = index > 0 ? ((item.value - prevValue) / prevValue) * 100 : 0;
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group">
                            <div className="w-full flex flex-col items-center mb-2 relative">
                              <div
                                className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative"
                                style={{ height: `${height}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                  ${(item.value / 1000).toFixed(0)}k
                                  {index > 0 && (
                                    <span className={`ml-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      ({change >= 0 ? '+' : ''}{change.toFixed(1)}%)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm font-medium text-gray-800 dark:text-white mt-2">${(item.value / 1000).toFixed(0)}k</p>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{item.month}</p>
                            {index > 0 && (
                              <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Monthly Breakdown Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Month</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trend</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">vs Average</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                        {revenueData.map((item, index) => {
                          const prevValue = index > 0 ? revenueData[index - 1].value : item.value;
                          const change = index > 0 ? ((item.value - prevValue) / prevValue) * 100 : 0;
                          const vsAverage = ((item.value - averageRevenue) / averageRevenue) * 100;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.month}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">${item.value.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm">
                                {index > 0 ? (
                                  <span className={`font-medium ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {index > 0 && (
                                  <span className={`inline-flex items-center ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`font-medium ${vsAverage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {vsAverage >= 0 ? '+' : ''}{vsAverage.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Insights */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Key Insights</h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Revenue has grown by <span className="font-semibold text-green-600 dark:text-green-400">{growthRate.toFixed(1)}%</span> over the past 6 months</li>
                      <li>• <span className="font-semibold">{bestMonth.month}</span> was the best performing month with ${(bestMonth.value / 1000).toFixed(0)}k in revenue</li>
                      <li>• Average monthly revenue is <span className="font-semibold">${(averageRevenue / 1000).toFixed(0)}k</span>, indicating consistent growth</li>
                      <li>• Current trend shows <span className="font-semibold text-green-600 dark:text-green-400">positive momentum</span> with steady month-over-month increases</li>
                    </ul>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Future Property Analysis */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Future Property Rate Analysis & Predictions</h2>
            </div>

            {(() => {
              // Sample property data with predictions
              const propertyPredictions = [
                {
                  id: '1',
                  name: 'Modern Downtown Apartment',
                  currentRate: 450000,
                  predictedRate1Month: 465000,
                  predictedRate2Months: 480000,
                  trend: 'increasing',
                  location: 'Downtown',
                  propertyType: 'Apartment'
                },
                {
                  id: '2',
                  name: 'Luxury Condo with City View',
                  currentRate: 3500,
                  predictedRate1Month: 3625,
                  predictedRate2Months: 3750,
                  trend: 'increasing',
                  location: 'City Center',
                  propertyType: 'Condo'
                },
                {
                  id: '3',
                  name: 'Spacious Penthouse',
                  currentRate: 6500,
                  predictedRate1Month: 6300,
                  predictedRate2Months: 6100,
                  trend: 'decreasing',
                  location: 'Uptown',
                  propertyType: 'Penthouse'
                },
                {
                  id: '4',
                  name: 'Suburban Family Home',
                  currentRate: 320000,
                  predictedRate1Month: 332000,
                  predictedRate2Months: 345000,
                  trend: 'increasing',
                  location: 'Suburbs',
                  propertyType: 'House'
                },
                {
                  id: '5',
                  name: 'Beachfront Villa',
                  currentRate: 850000,
                  predictedRate1Month: 880000,
                  predictedRate2Months: 910000,
                  trend: 'increasing',
                  location: 'Coastal',
                  propertyType: 'Villa'
                }
              ];

              // Calculate overall statistics
              const totalProperties = propertyPredictions.length;
              const increasingProperties = propertyPredictions.filter(p => p.trend === 'increasing').length;
              const decreasingProperties = propertyPredictions.filter(p => p.trend === 'decreasing').length;
              const avgIncrease1Month = propertyPredictions.reduce((sum, p) => {
                const change = ((p.predictedRate1Month - p.currentRate) / p.currentRate) * 100;
                return sum + change;
              }, 0) / totalProperties;
              const avgIncrease2Months = propertyPredictions.reduce((sum, p) => {
                const change = ((p.predictedRate2Months - p.currentRate) / p.currentRate) * 100;
                return sum + change;
              }, 0) / totalProperties;

              return (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Properties Increasing</p>
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">{increasingProperties}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">of {totalProperties} properties</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Properties Decreasing</p>
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-400">{decreasingProperties}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">of {totalProperties} properties</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Increase (1 Month)</p>
                        <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">+{avgIncrease1Month.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Next month</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Increase (2 Months)</p>
                        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">+{avgIncrease2Months.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">In 2 months</p>
                    </div>
                  </div>

                  {/* Prediction Chart */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Rate Prediction Trend (Next 2 Months)</h3>
                    <LineChart
                      data={[
                        { label: 'Current', value: propertyPredictions[0].currentRate / 1000 },
                        { label: '+1 Month', value: propertyPredictions[0].predictedRate1Month / 1000 },
                        { label: '+2 Months', value: propertyPredictions[0].predictedRate2Months / 1000 },
                      ]}
                      height={200}
                      color="#FF6B35"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">Sample: {propertyPredictions[0].name}</p>
                  </div>

                  {/* Property Predictions Table */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Property Rate Predictions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Property</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Current Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">+1 Month</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">+2 Months</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trend</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recommendation</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                          {propertyPredictions.map((property) => {
                            const change1Month = ((property.predictedRate1Month - property.currentRate) / property.currentRate) * 100;
                            const change2Months = ((property.predictedRate2Months - property.currentRate) / property.currentRate) * 100;
                            const isRental = property.currentRate < 10000;
                            
                            return (
                              <tr key={property.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{property.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{property.location} • {property.propertyType}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {isRental ? `$${property.currentRate.toLocaleString()}/mo` : `$${property.currentRate.toLocaleString()}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {isRental ? `$${property.predictedRate1Month.toLocaleString()}/mo` : `$${property.predictedRate1Month.toLocaleString()}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {isRental ? `$${property.predictedRate2Months.toLocaleString()}/mo` : `$${property.predictedRate2Months.toLocaleString()}`}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="space-y-1">
                                    <span className={`font-medium ${change1Month >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {change1Month >= 0 ? '+' : ''}{change1Month.toFixed(1)}% (1M)
                                    </span>
                                    <br />
                                    <span className={`font-medium ${change2Months >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {change2Months >= 0 ? '+' : ''}{change2Months.toFixed(1)}% (2M)
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {property.trend === 'increasing' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                      <TrendingUp className="w-3 h-3" />
                                      Increasing
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                      <TrendingDown className="w-3 h-3" />
                                      Decreasing
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {property.trend === 'increasing' ? (
                                    <div className="text-xs">
                                      <p className="text-green-600 dark:text-green-400 font-medium">
                                        Increase by {change2Months.toFixed(1)}%
                                      </p>
                                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        Suggested: {isRental 
                                          ? `$${Math.round(property.currentRate * (1 + change2Months / 100)).toLocaleString()}/mo`
                                          : `$${Math.round(property.currentRate * (1 + change2Months / 100)).toLocaleString()}`
                                        }
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="text-xs">
                                      <p className="text-red-600 dark:text-red-400 font-medium">
                                        Consider holding
                                      </p>
                                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        Market may recover
                                      </p>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Agent Recommendations */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-orange-100 dark:from-primary/20 dark:to-orange-900/20 rounded-lg border border-primary/20 dark:border-primary/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Recommendations for Estate Agents</h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>
                              <strong>Next 2 Months Strategy:</strong> Based on market predictions, you can increase rates by an average of <strong className="text-green-600 dark:text-green-400">{avgIncrease2Months.toFixed(1)}%</strong> across {increasingProperties} properties.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>
                              <strong>Immediate Action (1 Month):</strong> Consider increasing rates by <strong className="text-blue-600 dark:text-blue-400">{avgIncrease1Month.toFixed(1)}%</strong> for properties showing upward trends to maximize revenue.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>
                              <strong>Properties to Focus On:</strong> {propertyPredictions.filter(p => p.trend === 'increasing').map(p => p.name).join(', ')} show strong growth potential.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>
                              <strong>Market Timing:</strong> The predicted {avgIncrease2Months > 0 ? 'increase' : 'decrease'} suggests this is an {avgIncrease2Months > 0 ? 'optimal' : 'cautious'} time to adjust rates. Monitor market conditions weekly.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
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
