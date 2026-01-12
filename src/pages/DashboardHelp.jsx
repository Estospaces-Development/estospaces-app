import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Book, Mail, Send, X, CheckCircle, Clock, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardFooter from '../components/Dashboard/DashboardFooter';

const DashboardHelp = () => {
  const navigate = useNavigate();
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'General Inquiry',
    message: ''
  });

  const helpTopics = [
    { 
      icon: Book, 
      title: 'Documentation', 
      description: 'Browse our comprehensive guides',
      action: () => setShowDocsModal(true)
    },
    { 
      icon: MessageSquare, 
      title: 'Live Chat', 
      description: 'Chat with our support team',
      action: () => window.location.href = 'mailto:support@estospaces.com?subject=Live Chat Request'
    },
    { 
      icon: Mail, 
      title: 'Email Support', 
      description: 'Send us an email at support@estospaces.com',
      action: () => window.location.href = 'mailto:support@estospaces.com'
    },
  ];

  const faqs = [
    { question: 'How do I add a new property?', answer: 'Go to Discover Properties and use the search filters...' },
    { question: 'How do I make a payment?', answer: 'Navigate to the Payments section and click Make Payment...' },
    { question: 'How do I view my contracts?', answer: 'All your contracts are available in the Contracts section...' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate ticket submission delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Open email client
    const mailtoLink = `mailto:contact@estospaces.com?subject=[${ticketForm.category}] ${encodeURIComponent(ticketForm.subject)}&body=${encodeURIComponent(ticketForm.message)}`;
    window.location.href = mailtoLink;
    
    // Show success modal
    setShowSuccessModal(true);
    setIsSubmitting(false);
    
    // Reset form
    setTicketForm({
      subject: '',
      category: 'General Inquiry',
      message: ''
    });
  };

  return (
    <div className="p-4 lg:p-6 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/user/dashboard')}
        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>

      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-orange-500 mb-2">Help & Support</h1>
        <p className="text-gray-600 dark:text-orange-400">Get help with your account and properties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {helpTopics.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <div 
              key={index} 
              onClick={topic.action}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
            >
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-orange-500 mb-2">{topic.title}</h3>
              <p className="text-sm text-gray-600 dark:text-orange-400">{topic.description}</p>
            </div>
          );
        })}
      </div>

      {/* Documentation Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 dark:text-orange-500">Help & Support Guides</h3>
              <button 
                onClick={() => setShowDocsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Explore our comprehensive resources to get the most out of EstoSpaces:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-blue-50 rounded text-blue-600">
                    <Book size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Getting Started</h4>
                    <p className="text-sm text-gray-500">Learn how to set up your profile and preferences.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-green-50 rounded text-green-600">
                    <Book size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Property Management</h4>
                    <p className="text-sm text-gray-500">Step-by-step guides on listing and managing properties.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-purple-50 rounded text-purple-600">
                    <Book size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Financials</h4>
                    <p className="text-sm text-gray-500">Understanding payments, invoices, and contracts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-orange-50 rounded text-orange-600">
                    <Book size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Troubleshooting</h4>
                    <p className="text-sm text-gray-500">Common issues and how to resolve them.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Submitted Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Ticket Submitted! 🎉</h3>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 text-center mb-6">
                Thank you for reaching out! Your support ticket has been submitted successfully.
              </p>
              
              {/* What to Expect */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  What happens next?
                </h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    Our team will review your ticket
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    You'll receive a response within 24-48 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    Check your email for updates
                  </li>
                </ul>
              </div>
              
              {/* Notification Badge */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <p className="text-sm text-green-700">
                  You'll be notified when we respond to your ticket
                </p>
              </div>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Ticket Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Mail className="text-orange-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-orange-500">Raise a Ticket</h2>
            <p className="text-sm text-gray-600 dark:text-orange-400">Submit a support request and we'll get back to you shortly</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Brief description of the issue"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white"
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              >
                <option>General Inquiry</option>
                <option>Technical Issue</option>
                <option>Billing & Payments</option>
                <option>Property Listing</option>
                <option>Account Support</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe your issue in detail..."
              value={ticketForm.message}
              onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-orange-500 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
              <h3 className="font-medium text-gray-900 dark:text-orange-500 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600 dark:text-orange-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

export default DashboardHelp;

