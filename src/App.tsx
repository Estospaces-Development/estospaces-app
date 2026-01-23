import { Routes, Route, Navigate } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import { LeadProvider } from './contexts/LeadContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { MessagesProvider } from './contexts/MessagesContext';
import { PropertyFilterProvider } from './contexts/PropertyFilterContext';
import { SavedPropertiesProvider } from './contexts/SavedPropertiesContext';
import { ApplicationsProvider } from './contexts/ApplicationsContext';
import { LocationProvider } from './contexts/LocationContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ManagerVerificationProvider } from './contexts/ManagerVerificationContext';
import { ToastProvider } from './contexts/ToastContext';
import MainLayout from './layouts/MainLayout';
import ManagerProtectedRoute from './components/Admin/ManagerProtectedRoute';
import UserProtectedRoute from './components/Admin/UserProtectedRoute';
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute';

// Manager Dashboard Pages
import Dashboard from './pages/Dashboard';
import ManagerVerificationSection from './components/Dashboard/ManagerVerificationSection';
import BrokerPropertyDetail from './pages/BrokerPropertyDetail';
import AllBrokerRequests from './pages/AllBrokerRequests';
import ClientHistory from './pages/ClientHistory';
import FastTrackDashboard from './pages/manager/FastTrackDashboard';
import MonitoringDashboard from './pages/manager/MonitoringDashboard';
import BrokersCommunity from './pages/manager/BrokersCommunity';

// Admin Pages
import AdminVerificationDashboard from './pages/AdminVerificationDashboard';
import AdminChatDashboard from './pages/AdminChatDashboard';
import AdminLogin from './pages/AdminLogin';
import UserAnalytics from './pages/UserAnalytics';
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

// User Dashboard Pages
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardLocationBased from './pages/DashboardLocationBased';
import DashboardDiscover from './pages/DashboardDiscover';
import DashboardMessages from './pages/DashboardMessages';
import DashboardPayments from './pages/DashboardPayments';
import DashboardProfile from './pages/DashboardProfile';
import DashboardContracts from './pages/DashboardContracts';
import DashboardApplications from './pages/DashboardApplications';
import DashboardViewings from './pages/DashboardViewings';
import DashboardReviews from './pages/DashboardReviews';
import DashboardSaved from './pages/DashboardSaved';
import DashboardSettings from './pages/DashboardSettings';
import DashboardHelp from './pages/DashboardHelp';
import DashboardNotifications from './pages/DashboardNotifications';
import DashboardOverseas from './pages/DashboardOverseas';
import PropertyDetail from './pages/PropertyDetail';

// Auth Components
import { Login, EmailLogin, Signup, ResetPassword, AuthCallback } from './components/auth';

// Public Pages
import PropertySearch from './pages/PropertySearch';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import TermsConditions from './pages/TermsConditions';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PropertyProvider>
            <LeadProvider>
              <MessagesProvider>
                <SavedPropertiesProvider>
                  <ApplicationsProvider>
                    <NotificationsProvider>
                      <LocationProvider>
                        <PropertyFilterProvider>
                          <Routes>
                            {/* Redirect root to sign-in page */}
                            <Route path="/" element={<Navigate to="/auth/login" replace />} />

                            {/* Auth Routes */}
                            <Route path="/auth/login" element={<Login />} />
                            <Route path="/auth/sign-in-email" element={<EmailLogin />} />
                            <Route path="/auth/signup" element={<Signup />} />
                            <Route path="/auth/reset-password" element={<ResetPassword />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />

                            {/* Public Property Search */}
                            <Route path="/properties/search" element={<PropertySearch />} />
                            <Route path="/property/:id" element={<PropertyDetail />} />

                            {/* Dashboard redirect - redirects /dashboard to /user/dashboard */}
                            <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
                            <Route path="/dashboard/*" element={<Navigate to="/user/dashboard" replace />} />

                            {/* Public Pages */}
                            <Route path="/privacy" element={<PrivacyPolicy />} />
                            <Route path="/cookies" element={<CookiePolicy />} />
                            <Route path="/terms" element={<TermsConditions />} />
                            <Route path="/contact" element={<ContactUs />} />
                            <Route path="/faq" element={<FAQ />} />

                            {/* Manager Dashboard Routes - Protected */}
                            <Route
                              path="/manager/dashboard"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <Dashboard />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/fast-track"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <FastTrackDashboard />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/monitoring"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <MonitoringDashboard />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/brokers-community"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <BrokersCommunity />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/properties"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <PropertiesList />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/properties/add"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <AddProperty />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/properties/edit/:id"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <AddProperty />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/properties/:id"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <PropertyView />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/leads"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <LeadsClients />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/application"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <Application />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/appointment"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <Appointment />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/messages"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <Messages />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/analytics"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <Analytics />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/billing"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <Billing />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/profile"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <Profile />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/help"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <HelpSupport />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/verification"
                              element={
                                <ManagerProtectedRoute>
                                  <ManagerVerificationProvider>
                                    <MainLayout>
                                      <ManagerVerificationSection />
                                    </MainLayout>
                                  </ManagerVerificationProvider>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/broker-property/:id"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <BrokerPropertyDetail />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/broker-requests"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <AllBrokerRequests />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />
                            <Route
                              path="/manager/dashboard/client-history/:id"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <ClientHistory />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />

                            {/* Admin Routes */}
                            <Route path="/admin/login" element={<AdminLogin />} />

                            <Route
                              path="/admin/verifications"
                              element={
                                <AdminProtectedRoute>
                                  <AdminVerificationDashboard />
                                </AdminProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/chat"
                              element={
                                <AdminProtectedRoute>
                                  <AdminChatDashboard />
                                </AdminProtectedRoute>
                              }
                            />

                            <Route
                              path="/admin/analytics"
                              element={
                                <AdminProtectedRoute>
                                  <UserAnalytics />
                                </AdminProtectedRoute>
                              }
                            />

                            {/* Catch-all for /manager/dashboard/* wildcard routes */}
                            <Route
                              path="/manager/dashboard/*"
                              element={
                                <ManagerProtectedRoute>
                                  <MainLayout>
                                    <Dashboard />
                                  </MainLayout>
                                </ManagerProtectedRoute>
                              }
                            />

                            {/* User Dashboard Routes - Protected */}
                            <Route
                              path="/user/dashboard"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardLocationBased />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/discover"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardDiscover />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/saved"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardSaved />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/property/:id"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <PropertyDetail />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/applications"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardApplications />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/viewings"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardViewings />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/messages"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardMessages />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/payments"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardPayments />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/contracts"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardContracts />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/reviews"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardReviews />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/settings"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardSettings />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/help"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardHelp />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/notifications"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardNotifications />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/profile"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardProfile />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                            <Route
                              path="/user/dashboard/overseas"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardOverseas />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />


                            {/* Catch-all for /user/dashboard/* wildcard routes */}
                            <Route
                              path="/user/dashboard/*"
                              element={
                                <UserProtectedRoute>
                                  <DashboardLayout>
                                    <DashboardLocationBased />
                                  </DashboardLayout>
                                </UserProtectedRoute>
                              }
                            />
                          </Routes>
                        </PropertyFilterProvider>
                      </LocationProvider>
                    </NotificationsProvider>
                  </ApplicationsProvider>
                </SavedPropertiesProvider>
              </MessagesProvider>
            </LeadProvider>
          </PropertyProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
