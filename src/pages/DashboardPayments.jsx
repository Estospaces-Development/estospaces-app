import React, { useState, useEffect } from 'react';
import {
  CreditCard, Calendar, CheckCircle, Clock, AlertCircle, ArrowLeft,
  Download, Eye, X, ChevronRight, Home, Shield, Sparkles, TrendingUp,
  CreditCardIcon, Building, Receipt, Search, Filter, Plus, Trash2,
  MoreVertical, FileText, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardFooter from '../components/Dashboard/DashboardFooter';
import { MOCK_PAYMENTS } from '../services/mockDataService';

// Toast notification
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[100] bg-white border border-gray-200 shadow-xl px-5 py-4 rounded-xl flex items-center gap-3 animate-slideDown">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-green-100' : 'bg-orange-100'}`}>
        {type === 'success' ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-orange-600" />}
      </div>
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};

const DashboardPayments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedHistoryPayment, setSelectedHistoryPayment] = useState(null);

  // Filters for History Tab
  const [historyFilter, setHistoryFilter] = useState('all'); // all, rent, utilities
  const [searchQuery, setSearchQuery] = useState('');

  // Property images for visual appeal
  const propertyImages = {
    'Luxury Studio Flat': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    'Modern 2-Bedroom Apartment': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    'Charming 3-Bedroom Cottage': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    'Immaculate Victorian Townhouse': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'
  };

  // Utility type labels and icons
  const getTypeConfig = (type) => {
    const configs = {
      deposit: { label: 'Deposit', icon: Shield, color: 'text-purple-600 bg-purple-100' },
      rent: { label: 'Rent', icon: Home, color: 'text-blue-600 bg-blue-100' },
      service_fee: { label: 'Service Fee', icon: FileText, color: 'text-gray-600 bg-gray-100' },
      electric: { label: 'Electric Bill', icon: Sparkles, color: 'text-yellow-600 bg-yellow-100' },
      water: { label: 'Water Bill', icon: Sparkles, color: 'text-cyan-600 bg-cyan-100' },
      gas: { label: 'Gas Bill', icon: Sparkles, color: 'text-orange-600 bg-orange-100' },
      internet: { label: 'Internet', icon: Sparkles, color: 'text-indigo-600 bg-indigo-100' },
      council_tax: { label: 'Council Tax', icon: Building, color: 'text-red-600 bg-red-100' },
    };
    return configs[type] || { label: 'Payment', icon: CreditCard, color: 'text-gray-600 bg-gray-100' };
  };

  // Mock Data Formatting
  const allPayments = MOCK_PAYMENTS.map(p => ({
    ...p,
    typeLabel: getTypeConfig(p.type).label,
    iconConfig: getTypeConfig(p.type),
    image: propertyImages[p.property_title] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    isUtility: ['electric', 'water', 'gas', 'internet', 'council_tax'].includes(p.type)
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  const upcomingPayments = allPayments.filter(p => ['due_soon', 'upcoming', 'pending'].includes(p.status)).reverse(); // Show soonest due first
  const paymentHistory = allPayments.filter(p => ['completed', 'paid'].includes(p.status));

  // Stats
  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = upcomingPayments.filter(p => p.status === 'due_soon' || p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const nextPayment = upcomingPayments[0];

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowConfirmModal(false);
    showToast(`Payment of £${selectedPayment.amount.toLocaleString()} successful!`);
    setSelectedPayment(null);
    // In a real app, you'd update the payment status here
  };

  const formatCurrency = (amount) => `£${amount.toLocaleString('en-GB')}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Filtered History
  const filteredHistory = paymentHistory.filter(payment => {
    const matchesFilter = historyFilter === 'all' ||
      (historyFilter === 'rent' && payment.type === 'rent') ||
      (historyFilter === 'utilities' && payment.isUtility);

    const matchesSearch = payment.property_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate('/user/dashboard')}
              className="flex items-center gap-2 text-gray-500 hover:text-orange-600 text-sm mb-3 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">Manage payments, view history, and update methods</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm">
              <Shield size={16} className="text-green-500" />
              Secure Payments
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'history', label: 'History' },
            { id: 'methods', label: 'Payment Methods' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id
                  ? 'text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Paid */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Paid (All Time)</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalPaid)}</h3>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <TrendingUp size={20} className="text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded-lg">
                  <ArrowUpRight size={14} />
                  <span>12% from last month</span>
                </div>
              </div>

              {/* Due Soon */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-full -mr-8 -mt-8 opacity-50" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Due Soon</p>
                      <h3 className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(totalPending)}</h3>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                      <Clock size={20} className="text-orange-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 w-fit px-2 py-1 rounded-lg">
                    <AlertCircle size={14} />
                    <span>{upcomingPayments.length} Pending Payments</span>
                  </div>
                </div>
              </div>

              {/* Next Payment Hero */}
              {nextPayment ? (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-sm text-white relative overflow-hidden group hover:shadow-lg transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-medium backdrop-blur-sm">Next Payment</span>
                      {getDaysUntilDue(nextPayment.date) <= 5 && (
                        <span className="flex items-center gap-1 text-orange-300 text-xs font-bold animate-pulse">
                          <Clock size={12} /> Due Soon
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{formatCurrency(nextPayment.amount)}</h3>
                    <p className="text-gray-300 text-sm mb-4">{nextPayment.typeLabel} • {nextPayment.property_title}</p>
                    <button
                      onClick={() => handlePayNow(nextPayment)}
                      className="w-full py-2.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      Pay Now <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle size={24} className="text-green-500" />
                  </div>
                  <p className="font-medium text-gray-900">All caught up!</p>
                  <p className="text-sm text-gray-500">No upcoming payments.</p>
                </div>
              )}
            </div>

            {/* Recent Activity Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {allPayments.slice(0, 4).map((payment) => (
                    <div key={payment.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${payment.iconConfig.color}`}>
                        <payment.iconConfig.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{payment.typeLabel}</p>
                        <p className="text-xs text-gray-500 truncate">{payment.property_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className={`text-xs font-medium ${['completed', 'paid'].includes(payment.status) ? 'text-green-600' :
                            payment.status === 'due_soon' ? 'text-orange-600' : 'text-gray-500'
                          }`}>{payment.status === 'due_soon' ? 'Due Soon' : ['completed', 'paid'].includes(payment.status) ? 'Paid' : 'Pending'}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                    <button onClick={() => setActiveTab('history')} className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
                      View Full History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {['all', 'rent', 'utilities'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${historyFilter === filter
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search property or ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">Payment Type</th>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${payment.iconConfig.color}`}>
                                <payment.iconConfig.icon size={16} />
                              </div>
                              <span className="font-medium text-gray-900">{payment.typeLabel}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600 block max-w-xs truncate">{payment.property_title}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {formatDate(payment.date)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{payment.reference}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedHistoryPayment(payment);
                                  setShowDetailModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => showToast('Receipt downloaded')}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          No payments found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="animate-fadeIn max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Saved Cards</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
                  <Plus size={16} /> Add Card
                </button>
              </div>
              <div className="space-y-4">
                {/* Mock Card 1 */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-800 rounded mx-auto flex items-center justify-center text-white text-[10px] font-bold tracking-widest">VISA</div>
                    <div>
                      <p className="font-medium text-gray-900">Visa ending in 4242</p>
                      <p className="text-xs text-gray-500">Expires 12/28</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                {/* Mock Card 2 */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-blue-600 rounded mx-auto flex items-center justify-center text-white text-[10px] font-bold tracking-widest italic">AMEX</div>
                    <div>
                      <p className="font-medium text-gray-900">Amex ending in 1001</p>
                      <p className="text-xs text-gray-500">Expires 09/25</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Default</span>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Bank Accounts</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  <Plus size={16} /> Add Bank
                </button>
              </div>
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Building size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No bank accounts linked for Direct Debit.</p>
              </div>
            </div>
          </div>
        )}

        {/* MODALS */}

        {/* Payment Modal */}
        {showPaymentModal && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
              {/* Property Header */}
              <div className="relative h-32 overflow-hidden">
                <img src={selectedPayment.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-white transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-4 left-5">
                  <p className="text-white font-semibold">{selectedPayment.property_title}</p>
                  <p className="text-white/80 text-sm">{selectedPayment.typeLabel} Payment</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Amount */}
                <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                  <p className="text-4xl font-bold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                  <p className="text-sm text-orange-600 mt-1 font-medium">Due {formatDate(selectedPayment.date)}</p>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedMethod('card')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'card'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                        }`}
                    >
                      <CreditCardIcon size={20} />
                      <span className="font-medium">Card</span>
                    </button>
                    <button
                      onClick={() => setSelectedMethod('bank')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'bank'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                        }`}
                    >
                      <Building size={20} />
                      <span className="font-medium">Bank</span>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setShowConfirmModal(true);
                    }}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors shadow-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-slideUp">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h3>
              <p className="text-gray-500 mb-6">
                You're about to pay <span className="font-semibold text-gray-900">{formatCurrency(selectedPayment.amount)}</span> for {selectedPayment.property_title} using your {selectedMethod === 'card' ? 'Card' : 'Bank Account'}.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowPaymentModal(true);
                  }}
                  disabled={isProcessing}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </>
                  ) : (
                    <>
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedHistoryPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(selectedHistoryPayment.amount)}</p>
                <p className="text-green-100 text-sm mt-1">Payment Successful</p>
              </div>
              <div className="p-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Property</span>
                    <span className="font-medium text-gray-900 truncate max-w-[200px]">{selectedHistoryPayment.property_title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900">{selectedHistoryPayment.typeLabel}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900">{formatDate(selectedHistoryPayment.date)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-xs text-gray-900">{selectedHistoryPayment.reference}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      showToast('Receipt downloaded');
                      setShowDetailModal(false);
                    }}
                    className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <DashboardFooter />
      </div>
    </div>
  );
};

export default DashboardPayments;
