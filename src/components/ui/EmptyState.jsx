import React from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    FileText,
    MessageSquare,
    Calendar,
    Search,
    Home,
    CreditCard,
    Star,
    Bell,
    FolderOpen
} from 'lucide-react';

/**
 * EmptyState - Reusable empty state component with illustrations and CTAs
 * 
 * @param {string} variant - Pre-configured variant name or "custom"
 * @param {React.ComponentType} icon - Custom icon component (when variant="custom")
 * @param {string} title - Custom title (when variant="custom")
 * @param {string} description - Custom description (when variant="custom")
 * @param {React.ReactNode} action - CTA button or action element
 */

const VARIANTS = {
    'no-saved': {
        icon: Heart,
        iconColor: 'text-rose-500',
        iconBg: 'bg-rose-100 dark:bg-rose-900/30',
        title: 'No Saved Properties',
        description: 'Properties you save will appear here. Start exploring and save your favorites!',
    },
    'no-applications': {
        icon: FileText,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        title: 'No Applications Yet',
        description: 'Your property applications will be tracked here. Apply for a property to get started.',
    },
    'no-messages': {
        icon: MessageSquare,
        iconColor: 'text-violet-500',
        iconBg: 'bg-violet-100 dark:bg-violet-900/30',
        title: 'No Messages',
        description: 'Your conversations with agents and landlords will appear here.',
    },
    'no-viewings': {
        icon: Calendar,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        title: 'No Scheduled Viewings',
        description: 'Book a property viewing to see it added here.',
    },
    'no-results': {
        icon: Search,
        iconColor: 'text-gray-500',
        iconBg: 'bg-gray-100 dark:bg-gray-700',
        title: 'No Results Found',
        description: 'Try adjusting your search criteria or browse all available properties.',
    },
    'no-properties': {
        icon: Home,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        title: 'No Properties Available',
        description: 'Check back soon for new listings in this area.',
    },
    'no-payments': {
        icon: CreditCard,
        iconColor: 'text-indigo-500',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
        title: 'No Payment History',
        description: 'Your payment transactions will be displayed here.',
    },
    'no-reviews': {
        icon: Star,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        title: 'No Reviews Yet',
        description: 'Your reviews and ratings will appear here.',
    },
    'no-notifications': {
        icon: Bell,
        iconColor: 'text-cyan-500',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
        title: 'No Notifications',
        description: 'You\'re all caught up! New notifications will appear here.',
    },
    'empty-folder': {
        icon: FolderOpen,
        iconColor: 'text-gray-500',
        iconBg: 'bg-gray-100 dark:bg-gray-700',
        title: 'Nothing Here Yet',
        description: 'This section is empty. Content will appear here when available.',
    },
};

const EmptyState = ({
    variant = 'empty-folder',
    icon: CustomIcon,
    iconColor,
    iconBg,
    title,
    description,
    action,
    className = '',
}) => {
    const config = VARIANTS[variant] || VARIANTS['empty-folder'];

    const Icon = CustomIcon || config.icon;
    const displayTitle = title || config.title;
    const displayDescription = description || config.description;
    const displayIconColor = iconColor || config.iconColor;
    const displayIconBg = iconBg || config.iconBg;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
        >
            {/* Icon with animated circle */}
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className={`relative flex items-center justify-center w-20 h-20 rounded-full ${displayIconBg} mb-5`}
            >
                <Icon size={36} className={displayIconColor} strokeWidth={1.5} />

                {/* Decorative ring */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700"
                    style={{ transform: 'scale(1.2)' }}
                />
            </motion.div>

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
                {displayTitle}
            </motion.h3>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6"
            >
                {displayDescription}
            </motion.p>

            {/* Action button */}
            {action && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    );
};

export default EmptyState;
