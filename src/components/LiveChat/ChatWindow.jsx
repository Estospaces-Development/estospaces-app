import React, { useEffect, useState, useRef } from 'react';
import { X, Send, Bot } from 'lucide-react';
import useLiveChat from '../../hooks/useLiveChat';
import MessageBubble from './MessageBubble';
import WelcomeForm from './WelcomeForm';

const ChatWindow = ({ onClose }) => {
    const {
        conversation,
        messages,
        loading,
        error,
        startConversation,
        sendMessage,
        isConversationReady,
    } = useLiveChat();

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
        await sendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[500px] bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Ask Lakshmi</h3>
                        <p className="text-xs text-orange-100">Intelligent Assistant</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 custom-scrollbar">
                {!isConversationReady ? (
                    <WelcomeForm onSubmit={startConversation} loading={loading} error={error} />
                ) : (
                    <>
                        {loading && messages.length === 0 ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        isVisitor={msg.sender_type === 'visitor'}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </>
                )}
                {error && <div className="text-red-500 text-xs text-center mt-2">{error}</div>}
            </div>

            {/* Input Area (only if conversation started) */}
            {isConversationReady && (
                <form onSubmit={handleSend} className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || loading}
                            className="p-2 bg-primary text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ChatWindow;
