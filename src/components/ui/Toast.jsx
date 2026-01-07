import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (isVisible && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const styles = {
        success: {
            bg: 'bg-green-500',
            icon: CheckCircle,
            iconColor: 'text-white',
        },
        error: {
            bg: 'bg-red-500',
            icon: XCircle,
            iconColor: 'text-white',
        },
    };

    const currentStyle = styles[type] || styles.success;
    const Icon = currentStyle.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className={`fixed top-6 left-1/2 z-[100] ${currentStyle.bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-[500px]`}
                >
                    <Icon className={currentStyle.iconColor} size={24} />
                    <p className="flex-1 font-medium">{message}</p>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;

