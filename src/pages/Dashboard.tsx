import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../contexts/PropertyContext';
import WelcomeBanner from '../components/ui/WelcomeBanner';
import KPICard from '../components/ui/KPICard';
import TabBar from '../components/ui/TabBar';
import RecentActivity from '../components/ui/RecentActivity';
import TopProperties from '../components/ui/TopProperties';
import PropertyCard from '../components/ui/PropertyCard';
import LakshmiChatbot from '../components/chatbot/LakshmiChatbot';
import BrokerResponseWidget from '../components/manager/BrokerResponse/BrokerResponseWidget';
import { DollarSign, Building2, Eye, UserCheck, Filter, Download, Plus, Home, Mail, Phone, Users, FileText, CheckCircle, Clock, XCircle, Trash2, Search, MessageSquare, Edit, MoreVertical, TrendingUp, Target, Bot, TrendingDown, AlertCircle, Lightbulb, Share2, FileDown, FileSpreadsheet } from 'lucide-react';
import PieChart from '../components/ui/PieChart';
import BarChart from '../components/ui/BarChart';
import LineChart from '../components/ui/LineChart';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { getDashboardStats } from '../services/dashboardStatsService';
import { getLeads, updateLeadStatus } from '../services/leadsService';
import { getApplications, updateApplicationStatus, deleteApplication } from '../services/applicationsService';
import { getAnalyticsData } from '../services/analyticsService';

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

  // Debug: Log property image data in development
  useEffect(() => {
    if (import.meta.env.DEV && properties.length > 0) {
      // eslint-disable-next-line no-console
      console.log('Dashboard properties image data:', properties.slice(0, 3).map(p => ({
        id: p.id,
        title: p.title,
        images: p.images,
        media: p.media,
        imageCount: p.images?.length || 0
      })));
    }
  }, [properties]);

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

  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({
    monthlyRevenue: '45250.00',
    monthlyRevenueChange: '+12.5%',
    activeProperties: 12,
    activeListingsChange: '+2',
    totalViews: '3,450',
    totalViewsChange: '+18.2%',
    conversionRate: '2.8%',
    conversionRateChange: '+0.4%',
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const result = await getDashboardStats();
        if (result.data) {
          setDashboardStats(result.data);
        } else if (result.error) {
          // Handle error silently, keep default values
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      setLeadsLoading(true);
      setLeadsError(null);
      try {
        const result = await getLeads();
        if (result.data) {
          setLeads(result.data);
        } else if (result.error) {
          setLeadsError(result.error);
          setLeads([]);
        }
      } catch (error) {
        setLeadsError('Failed to load leads');
        setLeads([]);
      } finally {
        setLeadsLoading(false);
      }
    };

    fetchLeads();
    // Refresh leads every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const result = await getAnalyticsData();
        if (result.data) {
          setAnalyticsData(result.data);
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Real leads data from API
  const leadsList: Lead[] = leads || [];

  // Fetch applications from API
  const [applicationsList, setApplicationsList] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setApplicationsLoading(true);
      setApplicationsError(null);
      try {
        const result = await getApplications();
        if (result.data) {
          setApplicationsList(result.data);
        } else if (result.error) {
          setApplicationsError(result.error);
          setApplicationsList([]);
        }
      } catch (error) {
        setApplicationsError('Failed to load applications');
        setApplicationsList([]);
      } finally {
        setApplicationsLoading(false);
      }
    };

    fetchApplications();
    // Refresh applications every 30 seconds
    const interval = setInterval(fetchApplications, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleDeleteApplication = async (id: string) => {
    try {
      const result = await deleteApplication(id);
      if (result.error) {
        alert(`Failed to delete application: ${result.error}`);
        return;
      }
      // Refresh applications list
      const appsResult = await getApplications();
      if (appsResult.data) {
        setApplicationsList(appsResult.data);
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      alert('Failed to delete application');
    }
  };

  const handleApproveApplication = async (id: string) => {
    try {
      const result = await updateApplicationStatus(id, 'Approved');
      if (result.error) {
        alert(`Failed to approve application: ${result.error}`);
        return;
      }
      // Refresh applications list
      const appsResult = await getApplications();
      if (appsResult.data) {
        setApplicationsList(appsResult.data);
      }
    } catch (error) {
      alert('Failed to approve application');
    }
  };

  const handleRejectApplication = async (id: string) => {
    try {
      const result = await updateApplicationStatus(id, 'Rejected');
      if (result.error) {
        alert(`Failed to reject application: ${result.error}`);
        return;
      }
      // Refresh applications list
      const appsResult = await getApplications();
      if (appsResult.data) {
        setApplicationsList(appsResult.data);
      }
    } catch (error) {
      alert('Failed to reject application');
    }
  };

  // Export functions
  const handleExportLeads = (format: 'pdf' | 'excel') => {
    const dataToExport = selectedLeads.length > 0
      ? leadsList.filter(l => selectedLeads.includes(l.id))
      : leadsList;

    const exportData = {
      title: 'Leads Report',
      headers: ['Name', 'Email', 'Property', 'Status', 'Score', 'Budget', 'Last Contact'],
      rows: dataToExport.map(l => [l.name, l.email, l.propertyInterested, l.status, l.score, l.budget, l.lastContact])
    };

    if (format === 'pdf') {
      exportToPDF(exportData, 'leads');
    } else {
      exportToExcel(exportData, 'leads');
    }
    setShowLeadExportMenu(false);
  };

  const handleExportProperties = (format: 'pdf' | 'excel') => {
    const dataToExport = selectedProperties.length > 0
      ? properties.filter(p => selectedProperties.includes(p.id))
      : properties;

    const exportData = {
      title: 'Properties Report',
      headers: ['Title', 'Address', 'Type', 'Status', 'Bedrooms', 'Bathrooms'],
      rows: dataToExport.map(p => [
        p.title || '',
        p.address || p.location?.addressLine1 || '',
        p.propertyType || '',
        p.status || '',
        p.rooms?.bedrooms || p.bedrooms || 0,
        p.rooms?.bathrooms || p.bathrooms || 0
      ])
    };

    if (format === 'pdf') {
      exportToPDF(exportData, 'properties');
    } else {
      exportToExcel(exportData, 'properties');
    }
    setShowPropertyExportMenu(false);
  };

  const handleExportApplications = (format: 'pdf' | 'excel') => {
    const dataToExport = selectedApplications.length > 0
      ? applicationsList.filter(a => selectedApplications.includes(a.id))
      : applicationsList;

    const exportData = {
      title: 'Applications Report',
      headers: ['Name', 'Email', 'Property', 'Status', 'Score', 'Budget', 'Submitted Date'],
      rows: dataToExport.map(a => [a.name, a.email, a.propertyInterested, a.status, a.score, a.budget, a.submittedDate])
    };

    if (format === 'pdf') {
      exportToPDF(exportData, 'applications');
    } else {
      exportToExcel(exportData, 'applications');
    }
    setShowApplicationExportMenu(false);
  };

  // Toggle selection functions
  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectProperty = (id: string) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectApplication = (id: string) => {
    setSelectedApplications(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Share functions
  const handleShareLead = async (lead: Lead) => {
    const shareData = {
      title: `Lead: ${lead.name}`,
      text: `Lead details: ${lead.name} - ${lead.email} - Budget: ${lead.budget}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled or failed - silently handle
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
      alert('Lead details copied to clipboard!');
    }
  };

  const handleShareProperty = async (property: any) => {
    const shareData = {
      title: `Property: ${property.title || property.name}`,
      text: `Property: ${property.title || property.name} - ${property.address}`,
      url: `${window.location.origin}/manager/dashboard/properties/${property.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled or failed - silently handle
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      alert('Property link copied to clipboard!');
    }
  };

  const handleShareApplication = async (app: Application) => {
    const shareData = {
      title: `Application: ${app.name}`,
      text: `Application from ${app.name} - ${app.email} - Property: ${app.propertyInterested}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled or failed - silently handle
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
      alert('Application details copied to clipboard!');
    }
  };


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
          value={statsLoading ? '...' : `$${parseFloat(dashboardStats.monthlyRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={dashboardStats.monthlyRevenueChange}
          icon={DollarSign}
          iconColor="bg-green-500"
          trendColor="text-green-600"
        />
        <KPICard
          title="Active Listings"
          value={statsLoading ? '...' : dashboardStats.activeProperties.toString()}
          change={dashboardStats.activeListingsChange}
          icon={Building2}
          iconColor="bg-blue-500"
          trendColor="text-blue-600"
        />
        <KPICard
          title="Total Views"
          value={statsLoading ? '...' : dashboardStats.totalViews}
          change={dashboardStats.totalViewsChange}
          icon={Eye}
          iconColor="bg-purple-500"
          trendColor="text-purple-600"
        />
        <KPICard
          title="Conversion Rate"
          value={statsLoading ? '...' : dashboardStats.conversionRate}
          change={dashboardStats.conversionRateChange}
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
          {/* Broker Response Widget - USP Feature */}
          <div className="mb-6">
            <BrokerResponseWidget />
          </div>

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
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    {leadsLoading ? '...' : leadsList.length}
                  </p>
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
                    {leadsLoading ? '...' : leadsList.filter((l) => l.status === 'New Lead').length}
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
                    {leadsLoading ? '...' : leadsList.filter((l) => l.status === 'In Progress').length}
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
                    {leadsLoading ? '...' : leadsList.filter((l) => l.status === 'Approved').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {leadsError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-400">Error loading leads: {leadsError}</p>
            </div>
          )}

          {/* Loading State */}
          {leadsLoading && !leadsError && (
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading leads...</p>
            </div>
          )}

          {/* Empty State */}
          {!leadsLoading && !leadsError && leadsList.length === 0 && (
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No leads found</p>
            </div>
          )}

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
                <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
                  {!leadsLoading && !leadsError && leadsList.map((lead) => (
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
                          className={`px-2 py-1 caption font-medium rounded-full ${lead.status === 'New Lead'
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
      )
      }

      {/* Properties Tab Content */}
      {
        activeTab === 'properties' && (
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
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="section-heading text-gray-800 dark:text-white mb-4">Properties Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{properties.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Properties</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                      {properties.filter((p) => p.status === 'available').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-1">
                      {properties.filter((p) => p.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400 mb-1">
                      {properties.filter((p) => p.status === 'sold' || p.status === 'rented').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sold/Rented</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }

      {/* Application Tab Content */}
      {
        activeTab === 'application' && (
          <div className="space-y-6">
            {/* Application Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-primary/20 dark:border-primary/30 p-4 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Total Applications</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{applicationsList.length}</p>
                  </div>
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                    <FileText className="w-6 h-6 text-primary dark:text-primary-light" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-green-500/20 dark:border-green-500/30 p-4 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{approvedApplications.length}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-yellow-500/20 dark:border-yellow-500/30 p-4 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{pendingApplications.length}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-500/20 dark:border-red-500/30 p-4 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="secondary-label text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {applicationsList.filter((app) => app.status === 'Rejected').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/10 dark:bg-red-500/20 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
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
                  <thead className="bg-primary/5 dark:bg-primary/10 border-b border-primary/20 dark:border-primary/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Property</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
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
                            className={`px-2 py-1 text-xs font-medium rounded-full ${app.status === 'Approved'
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
          </div >
        )
      }

      {/* Analytics Tab Content */}
      {
        activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">247</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary rounded-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{properties.length || 120}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">14.7%</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">18.2%</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
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

              {/* Loading State */}
              {analyticsLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading revenue data...</p>
                </div>
              ) : analyticsData?.revenueTrend && analyticsData.revenueTrend.length > 0 ? (
                /* Real Data from Analytics Service */
                (() => {
                  // Revenue values are already in thousands from the service
                  const revenueData = analyticsData.revenueTrend.map((item: { label: string; value: number }) => ({
                    month: item.label,
                    value: item.value * 1000, // Convert back to actual values for display
                  }));

                  const totalRevenue = revenueData.reduce((sum: number, item: { value: number }) => sum + item.value, 0);
                  const averageRevenue = revenueData.length > 0 ? Math.round(totalRevenue / revenueData.length) : 0;
                  const bestMonth = revenueData.reduce((max: { month: string; value: number }, item: { month: string; value: number }) => (item.value > max.value ? item : max), revenueData[0] || { month: '-', value: 0 });
                  const firstValue = revenueData[0]?.value || 1;
                  const lastValue = revenueData[revenueData.length - 1]?.value || 0;
                  const growthRate = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">${totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(0) + 'k' : totalRevenue.toFixed(0)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{revenueData.length} months</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Monthly</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-400">${averageRevenue >= 1000 ? (averageRevenue / 1000).toFixed(0) + 'k' : averageRevenue.toFixed(0)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Per month</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Month</p>
                          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{bestMonth.month}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">${bestMonth.value >= 1000 ? (bestMonth.value / 1000).toFixed(0) + 'k' : bestMonth.value.toFixed(0)}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Growth Rate</p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Since {revenueData[0]?.month || '-'}</p>
                        </div>
                      </div>

                      {/* Bar Chart */}
                      <div className="mb-6">
                        <div className="flex items-end justify-between gap-4 h-48">
                          {revenueData.map((item: { month: string; value: number }, index: number) => {
                            const maxValue = Math.max(...revenueData.map((d: { value: number }) => d.value), 1);
                            const height = (item.value / maxValue) * 100;
                            const prevValue = index > 0 ? revenueData[index - 1].value : item.value;
                            const change = prevValue > 0 && index > 0 ? ((item.value - prevValue) / prevValue) * 100 : 0;

                            return (
                              <div key={index} className="flex-1 flex flex-col items-center group">
                                <div className="w-full flex flex-col items-center mb-2 relative">
                                  <div
                                    className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative"
                                    style={{ height: `${Math.max(height, 2)}%` }}
                                  >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                      ${item.value >= 1000 ? (item.value / 1000).toFixed(0) + 'k' : item.value.toFixed(0)}
                                      {index > 0 && (
                                        <span className={`ml-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          ({change >= 0 ? '+' : ''}{change.toFixed(1)}%)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium text-gray-800 dark:text-white mt-2">${item.value >= 1000 ? (item.value / 1000).toFixed(0) + 'k' : item.value.toFixed(0)}</p>
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
                            {revenueData.map((item: { month: string; value: number }, index: number) => {
                              const prevValue = index > 0 ? revenueData[index - 1].value : item.value;
                              const change = prevValue > 0 && index > 0 ? ((item.value - prevValue) / prevValue) * 100 : 0;
                              const vsAverage = averageRevenue > 0 ? ((item.value - averageRevenue) / averageRevenue) * 100 : 0;

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
                          {totalRevenue > 0 ? (
                            <>
                              <li>• Revenue has grown by <span className={`font-semibold ${growthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%</span> over the past {revenueData.length} months</li>
                              <li>• <span className="font-semibold">{bestMonth.month}</span> was the best performing month with ${bestMonth.value >= 1000 ? (bestMonth.value / 1000).toFixed(0) + 'k' : bestMonth.value.toFixed(0)} in revenue</li>
                              <li>• Average monthly revenue is <span className="font-semibold">${averageRevenue >= 1000 ? (averageRevenue / 1000).toFixed(0) + 'k' : averageRevenue.toFixed(0)}</span></li>
                              <li>• Current trend shows <span className={`font-semibold ${growthRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{growthRate >= 0 ? 'positive momentum' : 'declining trend'}</span></li>
                            </>
                          ) : (
                            <li>• No revenue recorded yet. Revenue is calculated from approved applications.</li>
                          )}
                        </ul>
                      </div>
                    </>
                  );
                })()
              ) : (
                /* Empty State - No Revenue Data */
                <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Revenue Data Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Revenue data will appear here once you have approved applications.
                    Revenue is calculated based on the property prices of approved applications.
                  </p>
                </div>
              )}
            </div>

            {/* Future Property Rate Analysis - Removed: No real prediction API available */}

            {/* Charts Row 1: Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Application Status Distribution */}
              <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Application Status Distribution</h2>
                {applicationsLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : (
                  <PieChart
                    data={[
                      { label: 'Approved', value: approvedApplications.length, color: '#10b981' },
                      { label: 'Pending', value: pendingApplications.length, color: '#f59e0b' },
                      { label: 'Rejected', value: applicationsList.filter((app) => app.status === 'Rejected').length, color: '#ef4444' },
                    ]}
                    size={200}
                  />
                )}
              </div>

              {/* Lead Status Distribution */}
              <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Lead Status Distribution</h2>
                {leadsLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : (
                  <PieChart
                    data={[
                      { label: 'New Leads', value: leadsList.filter((l) => l.status === 'New Lead').length, color: '#3b82f6' },
                      { label: 'In Progress', value: leadsList.filter((l) => l.status === 'In Progress').length, color: '#f59e0b' },
                      { label: 'Approved', value: leadsList.filter((l) => l.status === 'Approved').length, color: '#10b981' },
                    ]}
                    size={200}
                  />
                )}
              </div>
            </div>

            {/* Charts Row 2: Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Performance Bar Chart */}
              <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Property Performance Comparison</h2>
                {analyticsLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : analyticsData?.propertyPerformance && analyticsData.propertyPerformance.length > 0 ? (
                  <BarChart
                    data={analyticsData.propertyPerformance.slice(0, 5).map((p, idx) => ({
                      label: p.property.length > 20 ? p.property.substring(0, 20) + '...' : p.property,
                      value: p.views,
                      color: ['#FF6B35', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][idx % 5],
                    }))}
                    title="Property Views"
                    height={200}
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                  </div>
                )}
              </div>

              {/* Applications by Property */}
              <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Applications by Property</h2>
                {analyticsLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : analyticsData?.applicationsByProperty && analyticsData.applicationsByProperty.length > 0 ? (
                  <BarChart
                    data={analyticsData.applicationsByProperty.slice(0, 5).map((p, idx) => ({
                      label: p.label.length > 20 ? p.label.substring(0, 20) + '...' : p.label,
                      value: p.value,
                      color: ['#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'][idx % 5],
                    }))}
                    title="Applications Received"
                    height={200}
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charts Row 3: Line Chart and Property Performance Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Line Chart */}
              <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Revenue Trend (Line Chart)</h2>
                {analyticsLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : analyticsData?.revenueTrend && analyticsData.revenueTrend.length > 0 ? (
                  <LineChart
                    data={analyticsData.revenueTrend}
                    height={200}
                    color="#FF6B35"
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                  </div>
                )}
              </div>

              {/* Property Performance Table */}
              <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Property Performance</h2>
                {analyticsLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : analyticsData?.propertyPerformance && analyticsData.propertyPerformance.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Property</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Views</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applications</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Conversion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {analyticsData.propertyPerformance.slice(0, 5).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.property}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.views}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.applications}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${item.conversionRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">{item.conversionRate}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charts Row 4: Lead Analytics and Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Analytic */}
              <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Lead Analytic</h2>
                {analyticsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : analyticsData?.leadAnalytics ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Leads</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">{analyticsData.leadAnalytics.totalLeads}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Properties</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">{analyticsData.leadAnalytics.totalProperties}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">{analyticsData.leadAnalytics.conversionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">{analyticsData.leadAnalytics.passed}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No data available</p>
                )}
              </div>

              {/* Monthly Applications Trend */}
              <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Monthly Applications Trend</h2>
                {analyticsLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : analyticsData?.monthlyApplicationsTrend && analyticsData.monthlyApplicationsTrend.length > 0 ? (
                  <LineChart
                    data={analyticsData.monthlyApplicationsTrend}
                    height={200}
                    color="#3b82f6"
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Application Confirmation Modal */}
      {
        showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
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
        )
      }

      {/* Delete Property Confirmation Modal */}
      {
        showPropertyDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
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
        )
      }

      {/* Lakshmi Chatbot */}
      <LakshmiChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div >
  );
};

export default Dashboard;
