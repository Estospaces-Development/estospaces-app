import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SavedPropertiesProvider } from './contexts/SavedPropertiesContext';
import { MessagesProvider } from './contexts/MessagesContext';
import { ApplicationsProvider } from './contexts/ApplicationsContext';
import { PropertiesProvider } from './contexts/PropertiesContext';
import { LocationProvider } from './contexts/LocationContext';
import { PropertyFilterProvider } from './contexts/PropertyFilterContext';
import Home from './pages/Home';
import Terms from './pages/Terms';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import AdminLogin from './pages/AdminLogin';
import AdminChatDashboard from './pages/AdminChatDashboard';
import AdminPropertyManagement from './pages/AdminPropertyManagement';
import UserAnalytics from './pages/UserAnalytics';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import ChatWidget from './components/LiveChat/ChatWidget';
import CookieConsent from './components/CookieConsent';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Dashboard from './pages/Dashboard';
import DashboardLocationBased from './pages/DashboardLocationBased';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardDiscover from './pages/DashboardDiscover';
import DashboardMessages from './pages/DashboardMessages';
import DashboardPayments from './pages/DashboardPayments';
import DashboardContracts from './pages/DashboardContracts';
import DashboardSettings from './pages/DashboardSettings';
import DashboardHelp from './pages/DashboardHelp';
import DashboardProfile from './pages/DashboardProfile';
import DashboardSaved from './pages/DashboardSaved';
import DashboardApplications from './pages/DashboardApplications';
import DashboardViewings from './pages/DashboardViewings';
import DashboardReviews from './pages/DashboardReviews';
import PropertyDetail from './pages/PropertyDetail';

// Layout component to handle conditional rendering of global components
const Layout = ({ children }) => {
  const location = useLocation();
  // Hide chat widget on admin and dashboard pages
  const showChatWidget = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/user/dashboard');

  return (
    <>
      {children}
      {showChatWidget && <ChatWidget />}
      <CookieConsent />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <SavedPropertiesProvider>
        <MessagesProvider>
          <ApplicationsProvider>
            <PropertiesProvider>
              <LocationProvider>
                  <Router>
                    <PropertyFilterProvider>
          <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/chat"
            element={
              <ProtectedRoute>
                <AdminChatDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute>
                <AdminPropertyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-analytics"
            element={
              <ProtectedRoute>
                <UserAnalytics />
              </ProtectedRoute>
            }
          />
          {/* Dashboard Routes */}
          <Route
            path="/user/dashboard"
            element={
              <DashboardLayout>
                <ErrorBoundary>
                  <DashboardLocationBased />
                </ErrorBoundary>
              </DashboardLayout>
            }
          />
          {/* Catch-all route for invalid dashboard paths */}
          <Route
            path="/user/dashboard/*"
            element={
              <DashboardLayout>
                <ErrorBoundary>
                  <DashboardLocationBased />
                </ErrorBoundary>
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/discover"
            element={
              <DashboardLayout>
                <DashboardDiscover />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/saved"
            element={
              <DashboardLayout>
                <DashboardSaved />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/applications"
            element={
              <DashboardLayout>
                <DashboardApplications />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/viewings"
            element={
              <DashboardLayout>
                <DashboardViewings />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/messages"
            element={
              <DashboardLayout>
                <DashboardMessages />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/reviews"
            element={
              <DashboardLayout>
                <DashboardReviews />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/payments"
            element={
              <DashboardLayout>
                <DashboardPayments />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/contracts"
            element={
              <DashboardLayout>
                <DashboardContracts />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/settings"
            element={
              <DashboardLayout>
                <DashboardSettings />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/help"
            element={
              <DashboardLayout>
                <DashboardHelp />
              </DashboardLayout>
            }
          />
          <Route
            path="/user/dashboard/profile"
            element={
              <DashboardLayout>
                <DashboardProfile />
              </DashboardLayout>
            }
          />
          {/* Property Detail Route */}
          <Route
            path="/user/dashboard/property/:id"
            element={
              <DashboardLayout>
                <PropertyDetail />
              </DashboardLayout>
            }
          />
        </Routes>
        </Layout>
                    </PropertyFilterProvider>
                  </Router>
              </LocationProvider>
            </PropertiesProvider>
          </ApplicationsProvider>
        </MessagesProvider>
      </SavedPropertiesProvider>
    </ThemeProvider>
  );
}

export default App;
