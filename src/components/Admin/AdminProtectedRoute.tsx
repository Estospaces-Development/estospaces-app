/**
 * Admin Protected Route
 * Protects routes that require admin role
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { authState, isAuthenticated, loading, getRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading || authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location, intendedRole: 'admin' }} replace />;
  }

  // Check if user is an admin
  const role = getRole();
  if (role !== 'admin') {
    // Authenticated but not an admin - show access denied
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Go to Home
            </a>
            <a
              href={role === 'manager' ? '/manager/dashboard' : '/user/dashboard'}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
