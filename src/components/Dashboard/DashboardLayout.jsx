import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import HorizontalNavigation from './HorizontalNavigation';
import LakshmiAssistant from './LakshmiAssistant';
import { LocationProvider } from '../../contexts/LocationContext';
import { PropertiesProvider } from '../../contexts/PropertiesContext';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  // Only show Lakshmi Assistant on the main dashboard page
  const isMainDashboard = location.pathname === '/user/dashboard' || location.pathname === '/user/dashboard/';

  // Force light theme for user dashboard - remove dark class from document
  useEffect(() => {
    const root = document.documentElement;
    const hadDarkClass = root.classList.contains('dark');

    // Remove dark class to force light theme
    root.classList.remove('dark');

    // Cleanup: restore dark class if it was present before (when navigating away)
    return () => {
      const savedTheme = localStorage.getItem('estospaces-theme');
      if (hadDarkClass || savedTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  return (
    <LocationProvider>
      <PropertiesProvider>
        {/* Force light theme for user dashboard by using 'light' class wrapper */}
        <div className="light flex flex-col h-screen bg-gray-50 overflow-hidden">
          <Header />
          <HorizontalNavigation />
          <main className="flex-1 overflow-y-auto bg-gray-50">
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
          {/* Lakshmi AI Assistant - Only on main dashboard page */}
          {isMainDashboard && <LakshmiAssistant />}
        </div>
      </PropertiesProvider>
    </LocationProvider>
  );
};

export default DashboardLayout;

