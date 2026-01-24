import { useState } from 'react';
import { Clock, TrendingUp, CheckCircle, FileText, Search, MessageSquare, Headphones, Mail, Plus, Bell, X } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

type ViewType = 'search' | 'contact' | 'tickets' | 'notifications';

const HelpSupport = () => {
  const [currentView, setCurrentView] = useState<ViewType>('search');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'General',
  });

  const tickets = [
    {
      id: '1',
      title: 'Issue with property application',
      status: 'Pending',
      date: '2025-01-10',
    },
    {
      id: '2',
      title: 'Payment processing question',
      status: 'Resolved',
      date: '2025-01-08',
    },
    {
      id: '3',
      title: 'Account access problem',
      status: 'Pending',
      date: '2025-01-12',
    },
  ];

  const notifications = [
    {
      id: '1',
      title: 'New Booking Request',
      description: 'You have a new booking request for Modern Downtown Apartment',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      title: 'Upcoming Appointment',
      description: 'Reminder: Appointment with Sarah Johnson tomorrow at 10:00 AM',
      timestamp: '5 hours ago',
    },
    {
      id: '3',
      title: 'Payment Received',
      description: 'Payment of $2,500.00 received for Luxury Condo with City View',
      timestamp: '1 day ago',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', subject: '', message: '' });
    alert('Message sent successfully!');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket creation
    console.log('New ticket:', newTicket);
    setShowNewTicketModal(false);
    setNewTicket({ title: '', description: '', priority: 'Medium', category: 'General' });
    alert('Ticket created successfully!');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Help & Support</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">24/7</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Support Available</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg shadow-lg shadow-green-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">+20%</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">98%</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary rounded-lg shadow-lg shadow-primary/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Report</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Support Tickets</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 transition-colors">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCurrentView('search')}
            className={`px-4 py-2 rounded-lg transition-colors ${currentView === 'search'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            Search
          </button>
          <button
            onClick={() => setCurrentView('contact')}
            className={`px-4 py-2 rounded-lg transition-colors ${currentView === 'contact'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setCurrentView('tickets')}
            className={`px-4 py-2 rounded-lg transition-colors ${currentView === 'tickets'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setCurrentView('notifications')}
            className={`px-4 py-2 rounded-lg transition-colors ${currentView === 'notifications'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* Content Based on View */}
      {currentView === 'search' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6 transition-colors">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">How can we help you?</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search our knowledge base or guides"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Do you have any specific questions?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                <FileText className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Help Center</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                <MessageSquare className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Live Chat</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                <Headphones className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Micro Support</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                <Mail className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Email Support</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'contact' && (
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      )}

      {currentView === 'tickets' && (
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Support Ticket</h2>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Ticket</span>
            </button>
          </div>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{ticket.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(ticket.date).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${ticket.status === 'Resolved'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                      }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Create New Ticket</h3>
              <button
                onClick={() => {
                  setShowNewTicketModal(false);
                  setNewTicket({ title: '', description: '', priority: 'Medium', category: 'General' });
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ticket Title *
                </label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Billing">Billing</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTicketModal(false);
                    setNewTicket({ title: '', description: '', priority: 'Medium', category: 'General' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentView === 'notifications' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6 transition-colors">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification</h2>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{notification.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notification.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{notification.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">How can we help you?</h2>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search our knowledge base or guides"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                <FileText className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Help Center</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                <MessageSquare className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Live Chat</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                <Headphones className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Micro Support</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group">
                <Mail className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Email Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;

