import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Download, Eye, CheckCircle, Clock, AlertCircle, FileCheck,
  Search, Filter, SortAsc, SortDesc, List, Grid, Calendar, MapPin,
  MoreVertical, Copy, Share2, X, ChevronRight, Loader2, TrendingUp, Bell, ArrowLeft
} from 'lucide-react';
import ContractViewer from '../components/Dashboard/ContractViewer';
import SignatureModal from '../components/Dashboard/SignatureModal';
import { useNavigate } from 'react-router-dom';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

const DashboardContracts = () => {
  const navigate = useNavigate();
  const [selectedContract, setSelectedContract] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [signedContracts, setSignedContracts] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'signed', 'pending', 'expired'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'lease', 'purchase', 'other'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [showFilters, setShowFilters] = useState(false);
  const [quickActionMenu, setQuickActionMenu] = useState(null);

  // Load signed contracts from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('signedContracts') || '[]');
    setSignedContracts(stored);
  }, []);

  const contracts = [
    {
      id: 1,
      name: 'Lease Agreement - Modern Downtown Apartment',
      property: 'Modern Downtown Apartment',
      propertyId: 'prop-1',
      type: 'Lease Agreement',
      category: 'lease',
      date: '2024-01-10',
      expirationDate: '2025-01-10',
      status: 'pending',
      priority: 'high',
      amount: 1500,
      currency: 'GBP',
      duration: '12 months',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      location: 'London, UK',
      agentName: 'John Smith',
      agentEmail: 'john.smith@estospaces.com',
      agentPhone: '+44 20 1234 5678',
      description: 'Standard lease agreement for a modern downtown apartment',
      requiresAction: true,
      daysUntilExpiration: 300,
    },
    {
      id: 2,
      name: 'Lease Agreement - Luxury Condo',
      property: 'Luxury Condo with Ocean View',
      propertyId: 'prop-2',
      type: 'Lease Agreement',
      category: 'lease',
      date: '2023-12-15',
      expirationDate: '2024-12-15',
      status: 'pending',
      priority: 'medium',
      amount: 2500,
      currency: 'GBP',
      duration: '12 months',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      location: 'Brighton, UK',
      agentName: 'Sarah Johnson',
      agentEmail: 'sarah.j@estospaces.com',
      agentPhone: '+44 1273 987654',
      description: 'Premium lease agreement with ocean view amenities',
      requiresAction: true,
      daysUntilExpiration: 345,
    },
    {
      id: 3,
      name: 'Lease Agreement - Spacious Family Home',
      property: 'Spacious Family Home',
      propertyId: 'prop-3',
      type: 'Lease Agreement',
      category: 'lease',
      date: '2023-11-20',
      signedDate: '2024-01-03',
      expirationDate: '2025-11-20',
      status: 'signed',
      priority: 'low',
      amount: 1800,
      currency: 'GBP',
      duration: '24 months',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      location: 'Manchester, UK',
      agentName: 'Michael Brown',
      agentEmail: 'm.brown@estospaces.com',
      agentPhone: '+44 161 5551234',
      description: 'Long-term lease for family-friendly spacious home',
      requiresAction: false,
      daysUntilExpiration: 600,
    },
  ];

  const forms = [
    {
      id: 'form-1',
      name: 'Standard Tenant Application Form',
      description: 'Mandatory form for all new tenancy applications.',
      type: 'Application Form',
      category: 'form',
      date: '2024-01-01',
      status: 'available',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      requiresAction: true,
      isMandatory: true
    },
    {
      id: 'form-2',
      name: 'Pet Policy Agreement',
      description: 'Required if you intend to bring pets into the property.',
      type: 'Agreement',
      category: 'form',
      date: '2024-01-01',
      status: 'available',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      requiresAction: false,
      isMandatory: false
    },
    {
      id: 'form-3',
      name: 'Guarantor Reference Form',
      description: 'To be completed by your guarantor if applicable.',
      type: 'Reference Form',
      category: 'form',
      date: '2024-01-01',
      status: 'available',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      requiresAction: false,
      isMandatory: true
    }
  ];

  // Check if contract is signed
  const isSigned = (contractId) => {
    return signedContracts.some((sc) => sc.contractId === contractId) ||
      contracts.find(c => c.id === contractId)?.signedDate;
  };

  const getContractStatus = (contract) => {
    if (isSigned(contract.id) || contract.signedDate) {
      return {
        label: 'Signed',
        icon: CheckCircle,
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
      };
    }
    if (contract.status === 'pending' || contract.status === 'pending_signature') {
      const isUrgent = contract.daysUntilExpiration && contract.daysUntilExpiration < 7;
      return {
        label: isUrgent ? 'Urgent - Signature Required' : 'Pending Signature',
        icon: Clock,
        color: isUrgent
          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        bgColor: isUrgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20',
      };
    }
    if (contract.status === 'expired') {
      return {
        label: 'Expired',
        icon: AlertCircle,
        color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600',
        bgColor: 'bg-gray-50 dark:bg-gray-800',
      };
    }
    return {
      label: 'Active',
      icon: FileCheck,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    };
  };

  // Filter and sort contracts
  const filteredAndSortedContracts = useMemo(() => {
    let filtered = contracts.filter(contract => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          contract.property?.toLowerCase().includes(query) ||
          contract.name?.toLowerCase().includes(query) ||
          contract.type?.toLowerCase().includes(query) ||
          contract.location?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'signed' && !isSigned(contract.id) && !contract.signedDate) return false;
        if (statusFilter === 'pending' && (isSigned(contract.id) || contract.signedDate || contract.status !== 'pending')) return false;
        if (statusFilter === 'expired' && contract.status !== 'expired') return false;
      }

      // Type filter
      if (typeFilter !== 'all' && contract.category !== typeFilter) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.property || '').localeCompare(b.property || '');
          break;
        case 'status':
          const aStatus = getContractStatus(a).label;
          const bStatus = getContractStatus(b).label;
          comparison = aStatus.localeCompare(bStatus);
          break;
        case 'date':
        default:
          comparison = new Date(b.date) - new Date(a.date);
          break;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [contracts, searchQuery, statusFilter, typeFilter, sortBy, sortOrder, signedContracts]);

  // Filter forms
  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return form.name?.toLowerCase().includes(query) || form.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [forms, searchQuery]);

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setShowViewer(true);
  };

  const handleSignContract = (contract) => {
    setSelectedContract(contract);
    setShowSignatureModal(true);
  };

  const handleSigned = (contractId, signature) => {
    // Update signed contracts state
    const updated = [
      ...signedContracts,
      {
        contractId,
        signedAt: new Date().toISOString(),
        signature,
      },
    ];
    setSignedContracts(updated);

    // Also update localStorage (already done in SignatureModal, but refresh state)
    const stored = JSON.parse(localStorage.getItem('signedContracts') || '[]');
    setSignedContracts(stored);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSignedDate = (contractId) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract?.signedDate) return formatDate(contract.signedDate);
    const signed = signedContracts.find((sc) => sc.contractId === contractId);
    return signed ? formatDate(signed.signedAt) : null;
  };

  const handleQuickAction = (contractId, action) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    switch (action) {
      case 'view':
        handleViewContract(contract);
        break;
      case 'details':
        setSelectedContract(contract);
        setShowDetailsModal(true);
        break;
      case 'download':
        downloadContract(contract);
        break;
      case 'sign':
        handleSignContract(contract);
        break;
      case 'share':
        shareContract(contract);
        break;
      case 'copy':
        copyContractLink(contract);
        break;
      case 'property':
        if (contract.propertyId) {
          navigate(`/user/dashboard/property/${contract.propertyId}`);
        }
        break;
      default:
        break;
    }
    setQuickActionMenu(null);
  };

  const handleContractClick = (contract) => {
    setSelectedContract(contract);
    setShowDetailsModal(true);
  };

  const downloadContract = (contract) => {
    const link = document.createElement('a');
    link.href = contract.pdfUrl || '#';
    link.download = `${contract.name || contract.property}.pdf`;
    link.target = '_blank';
    link.click();
  };

  const shareContract = (contract) => {
    const url = `${window.location.origin}/user/dashboard/contracts?contract=${contract.id}`;
    if (navigator.share) {
      navigator.share({
        title: contract.name || contract.property,
        text: `Check out this contract: ${contract.property}`,
        url: url,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url);
      alert('Contract link copied to clipboard!');
    }
  };

  const copyContractLink = (contract) => {
    const url = `${window.location.origin}/user/dashboard/contracts?contract=${contract.id}`;
    navigator.clipboard.writeText(url);
    alert('Contract link copied to clipboard!');
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const pendingContractsCount = filteredAndSortedContracts.filter(c => !isSigned(c.id) && !c.signedDate && c.status === 'pending').length;
  const signedContractsCount = filteredAndSortedContracts.filter(c => isSigned(c.id) || c.signedDate).length;
  const urgentContractsCount = filteredAndSortedContracts.filter(c =>
    !isSigned(c.id) && !c.signedDate && c.daysUntilExpiration && c.daysUntilExpiration < 7
  ).length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto dark:bg-[#0a0a0a] min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate('/user/dashboard')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-orange-500 mb-2">
            Digital Contracts
          </h1>
          <p className="text-gray-600 dark:text-orange-400">
            View, review, and sign your property contracts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contracts</h3>
            <FileText className="text-blue-500 dark:text-blue-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contracts.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Signed</h3>
            <CheckCircle className="text-green-500 dark:text-green-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{signedContractsCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</h3>
            <Clock className="text-yellow-500 dark:text-yellow-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingContractsCount}</p>
        </div>
        {urgentContractsCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-400">Urgent</h3>
              <AlertCircle className="text-red-500 dark:text-red-400" size={20} />
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{urgentContractsCount}</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-1">Requires immediate action</p>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts by property, type, or location..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium transition-colors ${showFilters || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Filter size={18} />
            Filters
            {(statusFilter !== 'all' || typeFilter !== 'all') && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(statusFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Sort */}
          <button
            onClick={() => toggleSort('date')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
            <span className="hidden sm:inline">Sort</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Statuses</option>
                <option value="signed">Signed</option>
                <option value="pending">Pending Signature</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contract Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Types</option>
                <option value="lease">Lease Agreement</option>
                <option value="purchase">Purchase Agreement</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Application Forms Section */}
      {filteredForms.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileCheck size={24} className="text-orange-500" />
            Mandatory Forms & Agreements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow relative p-6"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    {form.isMandatory && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full border border-red-200 dark:border-red-800">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => downloadContract(form)}
                    className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                    title="Download"
                  >
                    <Download size={20} />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate" title={form.name}>
                  {form.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2" title={form.description}>
                  {form.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewContract(form)}
                    className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => downloadContract(form)}
                    className="flex-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contracts List/Grid */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Contracts</h2>
      {filteredAndSortedContracts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-2">
            No contracts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'You don\'t have any contracts yet. Contracts will appear here once you apply for properties.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="px-4 py-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className={`${viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }`}>
          {filteredAndSortedContracts.map((contract) => {
            const status = getContractStatus(contract);
            const StatusIcon = status.icon;
            const signed = isSigned(contract.id);
            const signedDate = getSignedDate(contract.id);
            const isUrgent = contract.daysUntilExpiration && contract.daysUntilExpiration < 7 && !signed;

            if (viewMode === 'grid') {
              return (
                <div
                  key={contract.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow relative"
                  onClick={() => handleContractClick(contract)}
                >
                  {/* Contract Card - Grid View */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {contract.requiresAction && !signed && (
                            <Bell className="text-orange-500 dark:text-orange-400 animate-pulse" size={16} />
                          )}
                          <h3 className="font-semibold text-gray-900 dark:text-orange-500 truncate">
                            {contract.property}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{contract.type}</p>
                        {contract.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <MapPin size={12} />
                            <span>{contract.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickActionMenu(quickActionMenu === contract.id ? null : contract.id);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                        >
                          <MoreVertical size={18} className="text-gray-400 dark:text-gray-500" />
                        </button>

                        {/* Quick Actions Menu for Grid View */}
                        {quickActionMenu === contract.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setQuickActionMenu(null)}
                            />
                            <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-[180px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(contract.id, 'details');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm border-b border-gray-200 dark:border-gray-700 rounded-t-lg"
                              >
                                <FileText size={16} />
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(contract.id, 'view');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm border-b border-gray-200 dark:border-gray-700"
                              >
                                <Eye size={16} />
                                View PDF
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(contract.id, 'download');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm border-b border-gray-200 dark:border-gray-700"
                              >
                                <Download size={16} />
                                Download PDF
                              </button>
                              {contract.propertyId && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAction(contract.id, 'property');
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm border-b border-gray-200 dark:border-gray-700"
                                >
                                  <MapPin size={16} />
                                  View Property
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(contract.id, 'share');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm border-b border-gray-200 dark:border-gray-700"
                              >
                                <Share2 size={16} />
                                Share Contract
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(contract.id, 'copy');
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm rounded-b-lg"
                              >
                                <Copy size={16} />
                                Copy Link
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>

                    {/* Contract Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      {contract.amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(contract.amount, contract.currency)}/month
                          </span>
                        </div>
                      )}
                      {contract.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{contract.duration}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="text-gray-900 dark:text-gray-100">{formatDate(contract.date)}</span>
                      </div>
                      {signedDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Signed:</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">{signedDate}</span>
                        </div>
                      )}
                      {contract.expirationDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                          <span className={`font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                            {formatDate(contract.expirationDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Urgent Warning */}
                    {isUrgent && (
                      <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                          ⚠️ {contract.daysUntilExpiration} days remaining to sign
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                      {!signed ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSignContract(contract);
                          }}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isUrgent
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                        >
                          <FileCheck size={16} />
                          {isUrgent ? 'Sign Urgently' : 'Accept & Sign'}
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium border border-green-200 dark:border-green-800">
                          <CheckCircle size={16} />
                          Signed
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewContract(contract);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadContract(contract);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            }

            // List View
            return (
              <div
                key={contract.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleContractClick(contract)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isUrgent ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-50 dark:bg-orange-900/30'
                      }`}
                  >
                    <FileText className={isUrgent ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'} size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {contract.requiresAction && !signed && (
                            <Bell className="text-orange-500 dark:text-orange-400 animate-pulse flex-shrink-0" size={16} />
                          )}
                          <h3 className="font-semibold text-gray-900 dark:text-orange-500 truncate">
                            {contract.property}
                          </h3>
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium border border-red-200 dark:border-red-800">
                              <AlertCircle size={10} />
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{contract.type}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Created {formatDate(contract.date)}
                          </span>
                          {contract.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {contract.location}
                            </span>
                          )}
                          {contract.amount && (
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {formatCurrency(contract.amount, contract.currency)}/month
                            </span>
                          )}
                          {signedDate && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                              <CheckCircle size={12} />
                              Signed {signedDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${status.color}`}
                        >
                          <StatusIcon size={14} />
                          {status.label}
                        </span>
                        <button
                          onClick={() => setQuickActionMenu(quickActionMenu === contract.id ? null : contract.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors relative"
                        >
                          <MoreVertical size={18} className="text-gray-400 dark:text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Urgent Warning */}
                    {isUrgent && (
                      <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                          ⚠️ This contract expires in {contract.daysUntilExpiration} days. Please sign immediately to avoid expiration.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewContract(contract);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye size={16} />
                        View PDF
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadContract(contract);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      {contract.propertyId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/dashboard/property/${contract.propertyId}`);
                          }}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          <MapPin size={16} />
                          View Property
                        </button>
                      )}
                      {!signed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSignContract(contract);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUrgent
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                        >
                          <FileCheck size={16} />
                          {isUrgent ? 'Sign Urgently' : 'Accept & Sign'}
                        </button>
                      )}
                      {signed && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
                          <CheckCircle size={16} />
                          Signed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract Viewer Modal */}
      {showViewer && selectedContract && (
        <ContractViewer
          contract={selectedContract}
          onClose={() => {
            setShowViewer(false);
            setSelectedContract(null);
          }}
        />
      )}

      {/* Signature Modal */}
      {showSignatureModal && selectedContract && (
        <SignatureModal
          contract={selectedContract}
          onClose={() => {
            setShowSignatureModal(false);
            setSelectedContract(null);
          }}
          onSign={handleSigned}
        />
      )}

      {/* Contract Details Modal */}
      {showDetailsModal && selectedContract && (
        <ContractDetailsModal
          contract={selectedContract}
          isSigned={isSigned(selectedContract.id)}
          signedDate={getSignedDate(selectedContract.id)}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedContract(null);
          }}
          onSign={() => {
            setShowDetailsModal(false);
            handleSignContract(selectedContract);
          }}
          onViewProperty={() => {
            if (selectedContract.propertyId) {
              navigate(`/user/dashboard/property/${selectedContract.propertyId}`);
            }
          }}
        />
      )}

      {/* Click outside to close quick action menu */}
      {quickActionMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setQuickActionMenu(null)}
        />
      )}

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

// Contract Details Modal Component
const ContractDetailsModal = ({ contract, isSigned, signedDate, onClose, onSign, onViewProperty }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isUrgent = contract.daysUntilExpiration && contract.daysUntilExpiration < 7 && !isSigned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <FileText className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-orange-500">{contract.property}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{contract.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isUrgent && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300 mb-1">Urgent Action Required</p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This contract expires in {contract.daysUntilExpiration} days. Please sign immediately to avoid expiration.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-4">Contract Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Property</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{contract.property}</p>
                {contract.propertyId && (
                  <button
                    onClick={onViewProperty}
                    className="mt-1 text-sm text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <MapPin size={14} />
                    View Property Details
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Contract Type</label>
                <p className="text-gray-900 dark:text-gray-100">{contract.type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Location</label>
                <p className="text-gray-900 dark:text-gray-100">{contract.location || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Created Date</label>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(contract.date)}</p>
              </div>

              {isSigned && signedDate && (
                <div>
                  <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Signed Date</label>
                  <p className="text-green-700 dark:text-green-400 font-medium">{signedDate}</p>
                </div>
              )}

              {contract.expirationDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Expiration Date</label>
                  <p className={`font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {formatDate(contract.expirationDate)}
                  </p>
                  {contract.daysUntilExpiration && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {contract.daysUntilExpiration} days remaining
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Financial & Terms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-4">Financial Details</h3>

              {contract.amount && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Monthly Amount</label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(contract.amount, contract.currency)}
                  </p>
                </div>
              )}

              {contract.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Duration</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{contract.duration}</p>
                </div>
              )}

              {contract.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                  <p className="text-gray-900 dark:text-gray-100 text-sm">{contract.description}</p>
                </div>
              )}

              {/* Agent Information */}
              {(contract.agentName || contract.agentEmail || contract.agentPhone) && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Agent Contact</h4>
                  {contract.agentName && (
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">{contract.agentName}</p>
                  )}
                  {contract.agentEmail && (
                    <a
                      href={`mailto:${contract.agentEmail}`}
                      className="text-sm text-orange-600 dark:text-orange-400 hover:underline block mb-1"
                    >
                      {contract.agentEmail}
                    </a>
                  )}
                  {contract.agentPhone && (
                    <a
                      href={`tel:${contract.agentPhone}`}
                      className="text-sm text-orange-600 dark:text-orange-400 hover:underline block"
                    >
                      {contract.agentPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = contract.pdfUrl || '#';
              link.download = `${contract.name || contract.property}.pdf`;
              link.target = '_blank';
              link.click();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button
            onClick={() => {
              onClose();
              const contractViewer = document.querySelector('[data-contract-viewer]');
              if (contractViewer) {
                // Trigger contract viewer
              }
              // For now, open in new tab
              window.open(contract.pdfUrl || '#', '_blank');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            <Eye size={18} />
            View Contract
          </button>
          {!isSigned && (
            <button
              onClick={onSign}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white ${isUrgent
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-500 hover:bg-orange-600'
                }`}
            >
              <FileCheck size={18} />
              {isUrgent ? 'Sign Urgently' : 'Accept & Sign'}
            </button>
          )}
          {isSigned && (
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium border border-green-200 dark:border-green-800">
              <CheckCircle size={18} />
              Contract Signed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContracts;
