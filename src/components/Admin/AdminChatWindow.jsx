import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminChatWindow = ({ conversation, messages, onSendMessage, loading }) => {
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
            <div className="bg-gradient-to-r from-primary to-orange-600 text-white p-4 shadow-md">
                <h2 className="font-semibold text-lg">{conversation.visitor_name || 'Anonymous Visitor'}</h2>
                {conversation.visitor_email && (
                    <p className="text-sm text-orange-100">{conversation.visitor_email}</p>
                )}
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
