import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import HorizontalNavigation from './HorizontalNavigation';
import LakshmiAssistant from './LakshmiAssistant';
import { LocationProvider } from '../../contexts/LocationContext';
import { PropertiesProvider } from '../../contexts/PropertiesContext';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const mainRef = useRef(null);
  
  // Only show Lakshmi Assistant on the main dashboard page
  const isMainDashboard = location.pathname === '/user/dashboard' || location.pathname === '/user/dashboard/';

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <LocationProvider>
      <PropertiesProvider>
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden">
          <Header />
          <HorizontalNavigation />
          <main ref={mainRef} className="flex-1 overflow-y-auto dark:bg-[#0a0a0a]">
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
