import { useState } from 'react';
import { Clock, TrendingUp, CheckCircle, FileText, Search, MessageSquare, Headphones, Mail, Plus, Bell } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

type ViewType = 'search' | 'contact' | 'tickets' | 'notifications';

const HelpSupport = () => {
  const [currentView, setCurrentView] = useState<ViewType>('search');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
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
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Help & Support</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">24/7</h3>
          <p className="text-sm text-gray-600">Support Available</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">+20%</h3>
          <p className="text-sm text-gray-600">Response Rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">98%</h3>
          <p className="text-sm text-gray-600">Satisfaction Rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">Report</h3>
          <p className="text-sm text-gray-600">Support Tickets</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCurrentView('search')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'search'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setCurrentView('contact')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'contact'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setCurrentView('tickets')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'tickets'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setCurrentView('notifications')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'notifications'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* Content Based on View */}
      {currentView === 'search' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
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
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Do you have any specific questions?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-6 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <FileText className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-gray-800">Help Center</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <MessageSquare className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-gray-800">Live Chat</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <Headphones className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-gray-800">Micro Support</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <Mail className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-gray-800">Email Support</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'contact' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Support Ticket</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Ticket</span>
            </button>
          </div>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">{ticket.title}</h3>
                    <p className="text-xs text-gray-500">{new Date(ticket.date).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      ticket.status === 'Resolved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
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

      {currentView === 'notifications' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification</h2>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                      <p className="text-xs text-gray-400">{notification.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">How can we help you?</h2>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search our knowledge base or guides"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-6 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <FileText className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-gray-800">Help Center</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <MessageSquare className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-gray-800">Live Chat</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <Headphones className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-gray-800">Micro Support</span>
              </button>
              <button className="flex flex-col items-center p-6 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                <Mail className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-gray-800">Email Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;

