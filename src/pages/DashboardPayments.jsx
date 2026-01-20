import React, { useState } from 'react';
import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle, Receipt, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

const DashboardPayments = () => {
  const navigate = useNavigate();
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Use mock payments
  import { MOCK_PAYMENTS } from '../services/mockDataService';

  // Process mock payments for display
  const upcomingPayments = MOCK_PAYMENTS
    .filter(p => ['due_soon', 'upcoming', 'pending'].includes(p.status))
    .map(p => ({
      id: p.id,
      type: p.type === 'deposit' ? 'Deposit' : (p.type === 'rent' ? 'Rent' : 'Utility Bill'),
      property: p.property_title,
      amount: p.amount,
      dueDate: p.date,
      status: p.status === 'pending' ? 'due_soon' : 'upcoming' // Map status for UI
    }));

  const paymentHistory = MOCK_PAYMENTS
    .filter(p => ['completed', 'paid'].includes(p.status))
    .map(p => ({
      id: p.id,
      date: p.date,
      type: p.type === 'deposit' ? 'Deposit' : (p.type === 'rent' ? 'Rent' : 'Utility Bill'),
      property: p.property_title,
      amount: p.amount,
      status: 'paid',
      transactionId: p.reference
    }));

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowStripeModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = due - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock size={14} />
            Pending
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle size={14} />
            Due Soon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <Clock size={14} />
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/user/dashboard')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-orange-500 mb-2">Payments</h1>
        <p className="text-gray-600 dark:text-orange-400">Manage your rent and utility bill payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Paid</h3>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">$5,120</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            <Clock className="text-yellow-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">$2,450</p>
          <p className="text-sm text-gray-500 mt-1">Due in 5 days</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Upcoming</h3>
            <Calendar className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">$210</p>
          <p className="text-sm text-gray-500 mt-1">Next 2 weeks</p>
        </div>
      </div>

      {/* Pay Rent & Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pay Rent */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="text-orange-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pay Rent</h2>
              <p className="text-sm text-gray-600">Monthly rent payment</p>
            </div>
          </div>

          <div className="space-y-4">
            {upcomingPayments
              .filter((p) => p.type === 'Rent')
              .map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{payment.property}</p>
                      <p className="text-sm text-gray-600">Due {formatDate(payment.dueDate)}</p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                    <button
                      onClick={() => handlePayNow(payment)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      Pay Now
                    </button>
                  </div>
                  {payment.status === 'due_soon' && (
                    <p className="text-xs text-red-600 mt-2">
                      Due in {getDaysUntilDue(payment.dueDate)} days
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Pay Utility Bills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pay Utility Bills</h2>
              <p className="text-sm text-gray-600">Electricity, water, and more</p>
            </div>
          </div>

          <div className="space-y-4">
            {upcomingPayments
              .filter((p) => p.type === 'Utility Bill')
              .map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{payment.property}</p>
                      <p className="text-sm text-gray-600">Due {formatDate(payment.dueDate)}</p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                    <button
                      onClick={() => handlePayNow(payment)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Upcoming Payments Card */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Upcoming Payments</h3>
            <p className="text-sm text-gray-600">Payments due in the next 30 days</p>
          </div>
          <Calendar className="text-orange-600" size={24} />
        </div>
        <div className="space-y-3">
          {upcomingPayments.map((payment) => {
            const daysUntilDue = getDaysUntilDue(payment.dueDate);
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-gray-900">{payment.property}</p>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                      {payment.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Due {formatDate(payment.dueDate)} • {daysUntilDue} days remaining
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                </div>
                <button
                  onClick={() => handlePayNow(payment)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Pay Now
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property/Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.property}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(payment.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {payment.transactionId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe Modal Placeholder */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedPayment && formatCurrency(selectedPayment.amount)}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">For</p>
                <p className="font-medium text-gray-900">{selectedPayment?.property}</p>
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Stripe Payment Integration</p>
                <p className="text-xs text-gray-500">
                  This is a placeholder. In production, Stripe checkout would be integrated here.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStripeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Payment processed (mock)');
                    setShowStripeModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardPayments;
