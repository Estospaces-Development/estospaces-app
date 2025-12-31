import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import { LeadProvider } from './contexts/LeadContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
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

function App() {
  return (
    <ThemeProvider>
      <PropertyProvider>
        <LeadProvider>
          <Router>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/properties" element={<PropertiesList />} />
                <Route path="/properties/add" element={<AddProperty />} />
                <Route path="/properties/edit/:id" element={<AddProperty />} />
                <Route path="/properties/:id" element={<PropertyView />} />
                <Route path="/leads" element={<LeadsClients />} />
                <Route path="/application" element={<Application />} />
                <Route path="/appointment" element={<Appointment />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/help" element={<HelpSupport />} />
              </Routes>
            </MainLayout>
          </Router>
        </LeadProvider>
      </PropertyProvider>
    </ThemeProvider>
  );
}

export default App;
