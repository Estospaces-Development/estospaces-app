import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Terms from './pages/Terms';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin';
import AdminChatDashboard from './pages/AdminChatDashboard';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import ChatWidget from './components/LiveChat/ChatWidget';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
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
      </Router>
      <ChatWidget />
    </>
  );
}

export default App;
