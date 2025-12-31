import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/ui/LoadingState';
import SummaryCard from '../components/ui/SummaryCard';
import AddLeadModal from '../components/ui/AddLeadModal';
import BackButton from '../components/ui/BackButton';
import { useLeads, Lead } from '../contexts/LeadContext';
import { 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Plus, 
  Filter, 
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';

const LeadsClients = () => {
  const navigate = useNavigate();
  const { leads, addLead, updateLead, deleteLead } = useLeads();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.propertyInterested.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLead = () => {
    setEditingLead(null);
    setShowAddLeadModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowAddLeadModal(true);
  };

  const handleSaveLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingLead) {
      updateLead(editingLead.id, leadData);
    } else {
      addLead(leadData);
    }
    setShowAddLeadModal(false);
    setEditingLead(null);
  };

  const handleDeleteLead = (id: string) => {
    deleteLead(id);
    setShowDeleteConfirm(null);
  };

  // Calculate summary statistics
  const newLeadsCount = leads.filter(l => l.status === 'New Lead').length;
  const inProgressCount = leads.filter(l => l.status === 'In Progress').length;
  const approvedCount = leads.filter(l => l.status === 'Approved').length;
  const rejectedCount = leads.filter(l => l.status === 'Rejected').length;
  const totalClientsCount = approvedCount; // Assuming approved leads become clients

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Leads & Clients</h1>
        <p className="text-gray-600">Manage your leads and clients relationships</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard
          title="New Leads"
          value={newLeadsCount}
          icon={UserPlus}
          iconColor="bg-blue-500"
        />
        <SummaryCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          iconColor="bg-yellow-500"
        />
        <SummaryCard
          title="Approved"
          value={approvedCount}
          icon={CheckCircle}
          iconColor="bg-green-500"
        />
        <SummaryCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          iconColor="bg-red-500"
        />
        <SummaryCard
          title="Total Clients"
          value={totalClientsCount}
          icon={Users}
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
          <button 
            onClick={handleAddLead}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Leads Overview Table */}
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
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.propertyInterested}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      lead.status === 'New Lead' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.score}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.budget}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{lead.lastContact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditLead(lead)}
                        className="text-green-600 hover:text-green-900" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => window.location.href = `mailto:${lead.email}`}
                        className="text-gray-600 hover:text-gray-900" 
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => lead.phone && (window.location.href = `tel:${lead.phone}`)}
                        className="text-gray-600 hover:text-gray-900" 
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(lead.id)}
                        className="text-red-600 hover:text-red-900" 
                        title="Delete"
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

      {/* Add/Edit Lead Modal */}
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => {
          setShowAddLeadModal(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        existingLead={editingLead}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Delete Lead</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLead(showDeleteConfirm)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsClients;

