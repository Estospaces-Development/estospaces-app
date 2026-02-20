import React, { useEffect, useRef, Suspense } from 'react';
import LoadingState from '../ui/LoadingState';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import HorizontalNavigation from './HorizontalNavigation';
import LakshmiAssistant from './LakshmiAssistant';
import { LocationProvider } from '../../contexts/LocationContext';
import { PropertiesProvider } from '../../contexts/PropertiesContext';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const mainContentRef = useRef(null);

  // Scroll to top on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Only show Lakshmi Assistant on the main dashboard page
  const isMainDashboard = location.pathname === '/user/dashboard' || location.pathname === '/user/dashboard/';

  return (
    <LocationProvider>
      <PropertiesProvider>
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
          <Header />
          <HorizontalNavigation />
          <main ref={mainContentRef} className="flex-1 overflow-y-auto bg-gray-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="h-full"
              >
                <Suspense fallback={<div className="h-full" />}>
                  {children}
                </Suspense>
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

