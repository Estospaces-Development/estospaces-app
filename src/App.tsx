import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import { LeadProvider } from './contexts/LeadContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import ManagerProtectedRoute from './components/Admin/ManagerProtectedRoute';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import PropertiesList from './pages/PropertiesList';
import PropertyView from './pages/PropertyView';
import LeadsClients from './pages/LeadsClients';
import Application from './pages/Application';
import Appointment from './pages/Appointment';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import HelpSupport from './pages/HelpSupport';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <PropertyProvider>
        <LeadProvider>
          <Router>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<Home />} />

              {/* Manager Dashboard Routes - No Auth Required */}
              <Route
                path="/manager/dashboard"
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/properties"
                element={
                  <MainLayout>
                    <PropertiesList />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/properties/add"
                element={
                  <MainLayout>
                    <AddProperty />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/properties/edit/:id"
                element={
                  <MainLayout>
                    <AddProperty />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/properties/:id"
                element={
                  <MainLayout>
                    <PropertyView />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/leads"
                element={
                  <MainLayout>
                    <LeadsClients />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/application"
                element={
                  <MainLayout>
                    <Application />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/appointment"
                element={
                  <MainLayout>
                    <Appointment />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/messages"
                element={
                  <MainLayout>
                    <Messages />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/analytics"
                element={
                  <MainLayout>
                    <Analytics />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/billing"
                element={
                  <MainLayout>
                    <Billing />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/profile"
                element={
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                }
              />
              <Route
                path="/manager/dashboard/help"
                element={
                  <MainLayout>
                    <HelpSupport />
                  </MainLayout>
                }
              />

              {/* Catch-all for /manager/dashboard/* wildcard routes */}
              <Route
                path="/manager/dashboard/*"
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                }
              />
            </Routes>
          </Router >
        </LeadProvider >
      </PropertyProvider >
    </ThemeProvider >
  );
}

export default App;

