import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Terms from './pages/Terms';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import AdminLogin from './pages/AdminLogin';
import AdminChatDashboard from './pages/AdminChatDashboard';
import UserAnalytics from './pages/UserAnalytics';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import ChatWidget from './components/LiveChat/ChatWidget';
import CookieConsent from './components/CookieConsent';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Dashboard from './pages/Dashboard';
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

// Layout component to handle conditional rendering of global components
const Layout = ({ children }) => {
  const location = useLocation();
  // Hide chat widget on admin and dashboard pages
  const showChatWidget = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/dashboard');

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
      <Router>
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
            path="/admin/user-analytics"
            element={
              <ProtectedRoute>
                <UserAnalytics />
              </ProtectedRoute>
            }
          />
          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/discover"
            element={
              <DashboardLayout>
                <DashboardDiscover />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/saved"
            element={
              <DashboardLayout>
                <DashboardSaved />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/applications"
            element={
              <DashboardLayout>
                <DashboardApplications />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/viewings"
            element={
              <DashboardLayout>
                <DashboardViewings />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/messages"
            element={
              <DashboardLayout>
                <DashboardMessages />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/reviews"
            element={
              <DashboardLayout>
                <DashboardReviews />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/payments"
            element={
              <DashboardLayout>
                <DashboardPayments />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/contracts"
            element={
              <DashboardLayout>
                <DashboardContracts />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <DashboardLayout>
                <DashboardSettings />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/help"
            element={
              <DashboardLayout>
                <DashboardHelp />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <DashboardLayout>
                <DashboardProfile />
              </DashboardLayout>
            }
          />
        </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
