import React, { useState, useEffect } from 'react';
import {
  CreditCard, Calendar, CheckCircle, Clock, AlertCircle, ArrowLeft,
  Download, Eye, X, ChevronRight, Home, Shield, Sparkles, TrendingUp,
  CreditCardIcon, Building, Receipt
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedHistoryPayment, setSelectedHistoryPayment] = useState(null);

  // Property images for visual appeal
  const propertyImages = {
    'Luxury Studio Flat': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    'Modern 2-Bedroom Apartment': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
  };

  // Utility type labels
  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Deposit',
      rent: 'Rent',
      service_fee: 'Service Fee',
      electric: 'Electric Bill',
      water: 'Water Bill',
      gas: 'Gas Bill',
      internet: 'Internet',
      council_tax: 'Council Tax',
    };
    return labels[type] || 'Payment';
  };

  // Category for grouping
  const getCategory = (type) => {
    if (['electric', 'water', 'gas', 'internet', 'council_tax'].includes(type)) {
      return 'utility';
    }
    return 'property';
  };

  // Process mock payments
  const upcomingPayments = MOCK_PAYMENTS
    .filter(p => ['due_soon', 'upcoming', 'pending'].includes(p.status))
    .map(p => ({
      id: p.id,
      type: getTypeLabel(p.type),
      rawType: p.type,
      category: getCategory(p.type),
      property: p.property_title,
      provider: p.provider || null,
      image: propertyImages[p.property_title] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      amount: p.amount,
      dueDate: p.date,
      status: p.status === 'pending' ? 'upcoming' : p.status,
    }));

  const paymentHistory = MOCK_PAYMENTS
    .filter(p => ['completed', 'paid'].includes(p.status))
    .map(p => ({
      id: p.id,
      date: p.date,
      type: getTypeLabel(p.type),
      rawType: p.type,
      category: getCategory(p.type),
      property: p.property_title,
      provider: p.provider || null,
      image: propertyImages[p.property_title] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
      amount: p.amount,
      status: 'paid',
      transactionId: p.reference,
    }));

  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = upcomingPayments.filter(p => p.status === 'due_soon').reduce((sum, p) => sum + p.amount, 0);
  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);

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
  };

  const handleViewDetails = (payment) => {
    setSelectedHistoryPayment(payment);
    setShowDetailModal(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/user/dashboard')}
              className="flex items-center gap-2 text-gray-500 hover:text-orange-600 text-sm mb-3 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">Manage and track all your property payments</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
              <Shield size={16} className="text-green-500" />
              Secure Payments
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Total Paid */}
          <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-50 rounded-full -mr-8 -mt-8 opacity-60" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Total Paid</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
              <p className="text-sm text-gray-400 mt-1">This month</p>
            </div>
          </div>

          {/* Due Soon */}
          <div className="relative bg-white rounded-2xl p-6 border border-orange-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full -mr-8 -mt-8 opacity-60" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Due Soon</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalPending)}</p>
              <p className="text-sm text-orange-400 mt-1">Action required</p>
            </div>
          </div>

          {/* Upcoming */}
          <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full -mr-8 -mt-8 opacity-60" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Upcoming</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalUpcoming)}</p>
              <p className="text-sm text-gray-400 mt-1">Next 30 days</p>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        {upcomingPayments.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Receipt size={20} className="text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {upcomingPayments.length}
              </span>
            </div>
            <div className="grid gap-4">
              {upcomingPayments.map((payment) => {
                const days = getDaysUntilDue(payment.dueDate);
                const isUrgent = days <= 5;
                return (
                  <div
                    key={payment.id}
                    className={`flex items-center gap-5 bg-white rounded-2xl p-5 border transition-all hover:shadow-lg cursor-pointer group ${isUrgent ? 'border-orange-200 hover:border-orange-300' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    onClick={() => handlePayNow(payment)}
                  >
                    {/* Property Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                      <img src={payment.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{payment.property}</h3>
                        {isUrgent && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full animate-pulse">
                            <AlertCircle size={12} />
                            Due Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {payment.type} • Due {formatDate(payment.dueDate)}
                        {isUrgent && <span className="text-orange-600 font-medium ml-1">({days} days left)</span>}
                      </p>
                    </div>

                    {/* Amount & Action */}
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayNow(payment);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
                      >
                        Pay Now
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment History */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={20} className="text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {paymentHistory.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-500">No payment history yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    {/* Property Image */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={payment.image} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{payment.property}</p>
                      <p className="text-sm text-gray-500">{payment.type} • {formatDate(payment.date)}</p>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                        <CheckCircle size={12} />
                        Paid
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => showToast('Receipt downloaded')}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Receipt"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
                  <p className="text-white font-semibold">{selectedPayment.property}</p>
                  <p className="text-white/80 text-sm">{selectedPayment.type} Payment</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Amount */}
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                  <p className="text-sm text-orange-600 mt-1">Due {formatDate(selectedPayment.dueDate)}</p>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedMethod('card')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'card'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                    >
                      <CreditCardIcon size={20} />
                      <span className="font-medium">Card</span>
                    </button>
                    <button
                      onClick={() => setSelectedMethod('bank')}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'bank'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
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
                You're about to pay <span className="font-semibold text-gray-900">{formatCurrency(selectedPayment.amount)}</span> for {selectedPayment.property}
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
                      Processing
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
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
                    <span className="font-medium text-gray-900">{selectedHistoryPayment.property}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900">{selectedHistoryPayment.type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900">{formatDate(selectedHistoryPayment.date)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-mono text-xs text-gray-900">{selectedHistoryPayment.transactionId}</span>
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

        <div className="mt-16">
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
};

export default DashboardPayments;
