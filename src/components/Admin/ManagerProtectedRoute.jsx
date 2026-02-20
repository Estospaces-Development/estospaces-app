import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ManagerProtectedRoute
 * 
 * A simplified protected route that relies solely on AuthContext.
 * No duplicate session checks or auth listeners.
 * Checks if user has 'manager' role.
 * 
 * DEVELOPMENT MODE: Auth check can be bypassed using mock user in localStorage.
 */
const ManagerProtectedRoute = ({ children }) => {
    const { authState, isAuthenticated, loading, getRole } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading || authState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location, intendedRole: 'manager' }} replace />;
    }

    // Check if user is a manager or admin (admins can also access manager routes)
    const role = getRole();
    if (role !== 'manager' && role !== 'admin') {
        // Authenticated but not a manager or admin - redirect to user dashboard
        return <Navigate to="/user/dashboard" replace />;
    }

    return children;
};

export default ManagerProtectedRoute;
