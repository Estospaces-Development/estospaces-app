import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// Toast types and their styling configurations
const TOAST_TYPES = {
    success: {
        icon: CheckCircle,
        bg: 'bg-emerald-500',
        progressBg: 'bg-emerald-400',
        borderColor: 'border-emerald-400',
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-500',
        progressBg: 'bg-red-400',
        borderColor: 'border-red-400',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-500',
        progressBg: 'bg-blue-400',
        borderColor: 'border-blue-400',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-500',
        progressBg: 'bg-amber-400',
        borderColor: 'border-amber-400',
    },
};

// Individual Toast Component
const ToastItem = ({ toast, onRemove }) => {
    const { id, message, type, duration } = toast;
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative ${config.bg} text-white rounded-xl shadow-2xl overflow-hidden min-w-[320px] max-w-[420px] pointer-events-auto`}
        >
            <div className="flex items-center gap-3 px-4 py-4">
                <div className="flex-shrink-0">
                    <Icon size={22} className="text-white" strokeWidth={2} />
                </div>
                <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
                <button
                    onClick={() => onRemove(id)}
                    className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Dismiss notification"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Auto-dismiss progress bar */}
            {duration > 0 && (
                <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 right-0 h-1 ${config.progressBg} origin-left`}
                />
            )}
        </motion.div>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Toast Context
const ToastContext = createContext(null);

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toastIdRef = useRef(0);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = ++toastIdRef.current;

        const newToast = {
            id,
            message,
            type,
            duration,
        };

        setToasts((prev) => {
            // Limit to 5 toasts max
            const updated = [...prev, newToast];
            return updated.slice(-5);
        });

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const showSuccess = useCallback((message, duration = 4000) => {
        return addToast(message, 'success', duration);
    }, [addToast]);

    const showError = useCallback((message, duration = 6000) => {
        return addToast(message, 'error', duration);
    }, [addToast]);

    const showInfo = useCallback((message, duration = 5000) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    const showWarning = useCallback((message, duration = 5000) => {
        return addToast(message, 'warning', duration);
    }, [addToast]);

    const value = {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastProvider;
