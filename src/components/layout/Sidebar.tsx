import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as managerVerificationService from '../../services/managerVerificationService';
import type { VerificationStatus } from '../../services/managerVerificationService';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, getDisplayName, signOut } = useAuth();
  
  // Get user display name and email
  const displayName = getDisplayName ? getDisplayName() : (user?.email?.split('@')[0] || 'Property Manager');
  const userEmail = user?.email || profile?.email || '';
  
  // Manager verification status
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Fetch manager verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user?.id) {
        setVerificationLoading(false);
        return;
      }
      
      try {
        const result = await managerVerificationService.getManagerProfile(user.id);
        if (result.data) {
          setVerificationStatus(result.data.verification_status);
        }
      } catch (err) {
        console.error('Error fetching verification status:', err);
      } finally {
        setVerificationLoading(false);
      }
    };
    
    fetchVerificationStatus();
  }, [user?.id]);

  const isVerified = verificationStatus === 'approved';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      if (signOut) {
        await signOut();
      } else {
        // Fallback: clear localStorage and navigate
        localStorage.removeItem('managerVerified');
        localStorage.removeItem('leads');
      }
      // Navigate to home page after signout
      navigate('/');
      // Force a page reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      // On error, still navigate away and clear storage
      localStorage.removeItem('managerVerified');
      localStorage.removeItem('leads');
      navigate('/');
      window.location.href = '/';
    } finally {
      setSigningOut(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/manager/dashboard' },
    { icon: Building2, label: 'Properties', path: '/manager/dashboard/properties' },
    { icon: Users, label: 'Leads & Clients', path: '/manager/dashboard/leads' },
    { icon: FileText, label: 'Applications', path: '/manager/dashboard/application' },
    { icon: Calendar, label: 'Appointments', path: '/manager/dashboard/appointment' },
    { icon: MessageSquare, label: 'Messages', path: '/manager/dashboard/messages' },
    { icon: BarChart3, label: 'Analytics', path: '/manager/dashboard/analytics' },
    { icon: CreditCard, label: 'Billing', path: '/manager/dashboard/billing' },
  ];

  const footerMenuItems = [
    { icon: Shield, label: 'Verification', path: '/manager/dashboard/verification' },
    { icon: UserCircle, label: 'Profile', path: '/manager/dashboard/profile' },
    { icon: HelpCircle, label: 'Help & Support', path: '/manager/dashboard/help' },
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
                  <p className="text-sm font-medium text-gray-800 dark:text-white transition-colors duration-300 truncate">{displayName}</p>
                  {verificationLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-primary animate-spin" />
                  ) : isVerified ? (
                    <div className="flex items-center gap-1" title="Verified Manager">
                      <BadgeCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    </div>
                  ) : (
                    <VerificationStatusBadgeInline status={verificationStatus} />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">{userEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white hover:scale-[1.02] hover:shadow-sm hover:brightness-105 dark:hover:brightness-110'
                      }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} />
                    {isOpen && <span className={`menu-item transition-all duration-300 ${!isActive && 'group-hover:translate-x-1'}`}>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Menu Items */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <ul className="space-y-2">
            {footerMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white hover:scale-[1.02] hover:shadow-sm hover:brightness-105 dark:hover:brightness-110'
                      }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} />
                    {isOpen && <span className={`menu-item transition-all duration-300 ${!isActive && 'group-hover:translate-x-1'}`}>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 group hover:scale-[1.02] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${signingOut ? 'animate-spin' : 'group-hover:scale-110 group-hover:rotate-12'}`} />
            {isOpen && <span className="text-sm font-medium transition-all duration-300 group-hover:translate-x-1">{signingOut ? 'Signing out...' : 'Sign out'}</span>}
          </button>
        </div>
      </div>

    </div>
  );
};

// Inline verification status badge for sidebar
const VerificationStatusBadgeInline = ({ status }: { status: VerificationStatus | null }) => {
  const navigate = useNavigate();
  
  const getConfig = () => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return {
          icon: Clock,
          label: 'Pending',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-700 dark:text-yellow-400',
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-700 dark:text-red-400',
        };
      case 'verification_required':
        return {
          icon: AlertCircle,
          label: 'Update',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          textColor: 'text-orange-700 dark:text-orange-400',
        };
      default:
        return {
          icon: Shield,
          label: 'Verify',
          bgColor: 'bg-primary/10',
          textColor: 'text-primary',
        };
    }
  };
  
  const config = getConfig();
  const Icon = config.icon;
  
  return (
    <button
      onClick={() => navigate('/manager/dashboard/verification')}
      className={`flex items-center gap-1 px-2 py-0.5 text-xs ${config.bgColor} ${config.textColor} rounded-md transition-colors hover:opacity-80`}
      title="View verification status"
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </button>
  );
};

export default Sidebar;
