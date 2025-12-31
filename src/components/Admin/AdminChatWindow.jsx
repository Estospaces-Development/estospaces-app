import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminChatWindow = ({ conversation, messages, onSendMessage, loading, onArchive, onCreateTicket, onCloseTicket }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        await onSendMessage(newMessage);
        setNewMessage('');
    };

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <User size={64} className="mb-4" />
                <p className="text-lg">Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div>
                    <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        {conversation.visitor_name || 'Anonymous Visitor'}
                        {conversation.status === 'archived' && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Archived</span>
                        )}
                    </h2>
                    {conversation.visitor_email && (
                        <p className="text-sm text-gray-500">{conversation.visitor_email}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Ticket Status Badge */}
                    {conversation.ticket && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mr-2
                            ${conversation.ticket.status === 'open' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'}
                        `}>
                            <span>Ticket #{conversation.ticket.id.substring(0, 4)}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            <span className="capitalize">{conversation.ticket.status}</span>
                        </div>
                    )}

                    {/* Actions */}
                    {conversation.status !== 'archived' && (
                        <>
                            {(!conversation.ticket || conversation.ticket.status === 'closed') && (
                                <button
                                    onClick={onCreateTicket}
                                    className="px-3 py-1.5 text-sm font-medium text-primary bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                >
                                    Create Ticket
                                </button>
                            )}

                            {conversation.ticket?.status === 'open' && (
                                <button
                                    onClick={() => onCloseTicket(conversation.ticket.id)}
                                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    Close Ticket
                                </button>
                            )}

                            <button
                                onClick={() => onArchive(conversation.id)}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Archive
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_type === 'admin'
                                        ? 'bg-gradient-to-r from-primary to-orange-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm mb-1">{msg.message}</p>
                                    <p
                                        className={`text-xs ${msg.sender_type === 'admin' ? 'text-orange-100' : 'text-gray-500'
                                            }`}
                                    >
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || loading}
                        className="p-3 bg-gradient-to-r from-primary to-orange-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminChatWindow;
