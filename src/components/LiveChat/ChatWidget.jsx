import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useChat } from '../../contexts/ChatContext';

const ChatWidget = () => {
    const { isChatOpen, openChat, closeChat } = useChat();

    return (
        <>
            {/* Floating button */}
            <button
                onClick={openChat}
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-orange-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
                aria-label="Open chat"
            >
                <MessageCircle size={28} />
            </button>

            {/* Chat window */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-2xl overflow-hidden"
                    >
                        <ChatWindow onClose={closeChat} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
