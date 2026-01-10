import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Bot } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                aria-label="Ask Lakshmi"
            >
                <Bot size={20} className="flex-shrink-0" />
                <span className="font-medium text-sm whitespace-nowrap">Ask Lakshmi</span>
            </button>

            {/* Chat window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 right-6 z-50 w-80 max-w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <ChatWindow onClose={() => setIsOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
