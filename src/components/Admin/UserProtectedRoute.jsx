import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * UserProtectedRoute
 * 
 * A simplified protected route that relies solely on AuthContext.
 * No duplicate session checks or auth listeners.
 */
const UserProtectedRoute = ({ children }) => {
    const { authState, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading || authState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location, intendedRole: 'user' }} replace />;
    }

    return children;
};

export default UserProtectedRoute;
