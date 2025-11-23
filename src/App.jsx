import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Terms from './pages/Terms';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import AdminLogin from './pages/AdminLogin';
import AdminChatDashboard from './pages/AdminChatDashboard';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import ChatWidget from './components/LiveChat/ChatWidget';
import CookieConsent from './components/CookieConsent';

// Layout component to handle conditional rendering of global components
const Layout = ({ children }) => {
  const location = useLocation();
  // Hide chat widget on admin pages
  const showChatWidget = !location.pathname.startsWith('/admin');

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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
