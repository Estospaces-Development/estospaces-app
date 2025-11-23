import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, MessageSquare, RefreshCw } from 'lucide-react';
import useAdminChat from '../hooks/useAdminChat';
import ConversationList from '../components/Admin/ConversationList';
import AdminChatWindow from '../components/Admin/AdminChatWindow';

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
    } = useAdminChat();

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
            navigate('/admin/login');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquare size={28} />
                        <div>
                            <h1 className="text-xl font-bold">Admin Chat Dashboard</h1>
                            <p className="text-sm text-orange-100">Manage visitor conversations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={refreshConversations}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Refresh conversations"
                        >
                            <RefreshCw size={20} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Conversation List */}
                <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">
                            Conversations ({conversations.length})
                        </h2>
                    </div>
                    <ConversationList
                        conversations={conversations}
                        selectedConversation={selectedConversation}
                        onSelect={selectConversation}
                    />
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 bg-white">
                    {error && (
                        <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}
                    <AdminChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        onSendMessage={sendAdminMessage}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminChatDashboard;
