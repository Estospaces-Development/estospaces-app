import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import HorizontalNavigation from './HorizontalNavigation';
import LakshmiAssistant from './LakshmiAssistant';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Header />
      <HorizontalNavigation />
      <main className="flex-1 overflow-y-auto dark:bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {/* Lakshmi AI Assistant - Available on all dashboard pages */}
      <LakshmiAssistant />
    </div>
  );
};

export default DashboardLayout;

