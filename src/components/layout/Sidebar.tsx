import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  User,
  BadgeCheck,
  UserCircle,
  Shield
} from 'lucide-react';
import VerificationModal from '../ui/VerificationModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(() => {
    // Load verification status from localStorage
    const stored = localStorage.getItem('managerVerified');
    return stored === 'true';
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleVerified = () => {
    setIsVerified(true);
    localStorage.setItem('managerVerified', 'true');
  };
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Building2, label: 'Properties', path: '/properties' },
    { icon: Users, label: 'Leads & Clients', path: '/leads' },
    { icon: FileText, label: 'Application', path: '/application' },
    { icon: Calendar, label: 'Appointment', path: '/appointment' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: BarChart3, label: 'Analytic', path: '/analytics' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-black shadow-lg transition-all duration-300 z-50 font-sans ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            {isOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Estospaces</h1>
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300">
              <User className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-colors duration-300" />
            </div>
            {isOpen && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-800 dark:text-white transition-colors duration-300">Property Manager</p>
                  {isVerified ? (
                    <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <button
                      onClick={() => setShowVerificationModal(true)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                      title="Verify your account"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Verify</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">manager@estospaces.com</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {isOpen && <span className="menu-item">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Sign out</span>}
          </a>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={handleVerified}
        email="manager@estospaces.com"
        phone="+1 (555) 123-4567"
      />
    </div>
  );
};

export default Sidebar;
