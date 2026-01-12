import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, MessageSquare, RefreshCw, Archive, Inbox, Ticket, TrendingUp, Shield } from 'lucide-react';
import useAdminChat from '../hooks/useAdminChat';
import ConversationList from '../components/Admin/ConversationList';
import AdminChatWindow from '../components/Admin/AdminChatWindow';
import CreateTicketModal from '../components/Admin/CreateTicketModal';
import TicketsList from '../components/Admin/TicketsList';
import TicketDetailsModal from '../components/Admin/TicketDetailsModal';

const AdminChatDashboard = () => {
    const navigate = useNavigate();
    const {
        conversations,
        selectedConversation,
        messages,
        loading,
        error,
        selectConversation,
        sendAdminMessage,
        refreshConversations,
        archiveConversation,
        createTicket,
        closeTicket,
        updateTicket
    } = useAdminChat();

    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived' | 'tickets'
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [ticketLoading, setTicketLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isTicketDetailsOpen, setIsTicketDetailsOpen] = useState(false);

    // Ticket filters
    const [ticketStatusFilter, setTicketStatusFilter] = useState('all'); // 'all' | 'open' | 'closed'
    const [ticketPriorityFilter, setTicketPriorityFilter] = useState('all'); // 'all' | 'low' | 'medium' | 'high'

    const handleLogout = async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }
            // Clear localStorage
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
            // Navigate and force reload
            navigate('/admin/login');
            window.location.href = '/admin/login';
        } catch (error) {
            // On error, still clear storage and navigate
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
            navigate('/admin/login');
            window.location.href = '/admin/login';
        }
    };

    const filteredConversations = conversations.filter(c => {
        if (activeTab === 'active') {
            return c.status !== 'archived';
        }
        return c.status === 'archived';
    });

    const handleCreateTicket = async (ticketData) => {
        if (!selectedConversation) return;
        setTicketLoading(true);
        try {
            await createTicket(selectedConversation.id, ticketData);
            setIsTicketModalOpen(false);
            refreshConversations(); // Refresh to show new ticket status
        } catch (error) {
            console.error('Failed to create ticket:', error);
            alert('Failed to create ticket');
        } finally {
            setTicketLoading(false);
        }
    };

    const handleCloseTicket = async (ticketId) => {
        if (window.confirm('Are you sure you want to close this ticket?')) {
            try {
                await closeTicket(ticketId);
                refreshConversations();
            } catch (error) {
                console.error('Failed to close ticket:', error);
                alert('Failed to close ticket');
            }
        }
    };

    const handleArchive = async (conversationId) => {
        if (window.confirm('Are you sure you want to archive this conversation?')) {
            await archiveConversation(conversationId);
        }
    };

    const handleSelectTicket = (ticket) => {
        setSelectedTicket(ticket);
        setIsTicketDetailsOpen(true);
    };

    const handleSaveTicket = async (ticketId, updates) => {
        await updateTicket(ticketId, updates);
        setIsTicketDetailsOpen(false);
        setSelectedTicket(null);
    };

    // Get all tickets from conversations
    const allTickets = conversations
        .map(c => c.ticket)
        .filter(Boolean)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Apply filters to tickets
    const filteredTickets = allTickets.filter(ticket => {
        // Filter by status
        if (ticketStatusFilter !== 'all' && ticket.status !== ticketStatusFilter) {
            return false;
        }
        // Filter by priority
        if (ticketPriorityFilter !== 'all' && ticket.priority !== ticketPriorityFilter) {
            return false;
        }
        return true;
    });

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <MessageSquare size={24} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Customer Support Center</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/verifications')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                        <Shield size={18} />
                        <span>Broker Review</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                        <TrendingUp size={18} />
                        <span>Analytics</span>
                    </button>
                    <button
                        onClick={refreshConversations}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        title="Refresh conversations"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Conversation List */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                                ${activeTab === 'active' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}
                            `}
                        >
                            <Inbox size={18} />
                            Active
                            {activeTab === 'active' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('archived')}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                                ${activeTab === 'archived' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}
                            `}
                        >
                            <Archive size={18} />
                            Archived
                            {activeTab === 'archived' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
                                ${activeTab === 'tickets' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}
                            `}
                        >
                            <Ticket size={18} />
                            Tickets
                            {activeTab === 'tickets' && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'tickets' ? (
                            <>
                                {/* Ticket Filters */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                        <select
                                            value={ticketStatusFilter}
                                            onChange={(e) => setTicketStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="open">Open</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                                        <select
                                            value={ticketPriorityFilter}
                                            onChange={(e) => setTicketPriorityFilter(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        >
                                            <option value="all">All Priorities</option>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="text-xs text-gray-500 pt-1">
                                        Showing {filteredTickets.length} of {allTickets.length} tickets
                                    </div>
                                </div>
                                <TicketsList
                                    tickets={filteredTickets}
                                    onSelectTicket={handleSelectTicket}
                                />
                            </>
                        ) : (
                            <ConversationList
                                conversations={filteredConversations}
                                selectedConversation={selectedConversation}
                                onSelect={selectConversation}
                            />
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 bg-gray-50 flex flex-col">
                    {error && (
                        <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3 text-sm flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => window.location.reload()} className="underline">Retry</button>
                        </div>
                    )}
                    <AdminChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        onSendMessage={sendAdminMessage}
                        loading={loading}
                        onArchive={handleArchive}
                        onCreateTicket={() => setIsTicketModalOpen(true)}
                        onCloseTicket={handleCloseTicket}
                    />
                </div>
            </div>

            <CreateTicketModal
                isOpen={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                onSubmit={handleCreateTicket}
                loading={ticketLoading}
            />

            <TicketDetailsModal
                ticket={selectedTicket}
                isOpen={isTicketDetailsOpen}
                onClose={() => {
                    setIsTicketDetailsOpen(false);
                    setSelectedTicket(null);
                }}
                onSave={handleSaveTicket}
            />
        </div>
    );
};

export default AdminChatDashboard;
