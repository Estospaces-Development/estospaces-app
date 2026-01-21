import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * UserProtectedRoute
 * 
 * A simplified protected route that relies solely on AuthContext.
 * No duplicate session checks or auth listeners.
 * 
 * DEVELOPMENT MODE: Auth check is bypassed to allow testing without Supabase.
 */
const UserProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, loading, isSupabaseConfigured, authState } = useAuth();

    // DEVELOPMENT BYPASS: Check for mock user in localStorage
    if (import.meta.env.DEV) {
        try {
            const mockUser = JSON.parse(localStorage.getItem('mockUser') || 'null');
            if (mockUser && mockUser.isAuthenticated && mockUser.role === 'user') {
                console.log('🔓 UserProtectedRoute: Development bypass mode - allowing user access');
                return children;
            }
        } catch (e) {
            // Ignore JSON parse errors
        }
        // Still allow general dev bypass for backwards compatibility
        console.log('🔓 UserProtectedRoute: Development bypass mode - allowing access');
        return children;
    }

    // If Supabase is not configured, redirect to login
    if (!isSupabaseConfigured) {
        return <Navigate to="/auth/login" state={{ from: location, intendedRole: 'user' }} replace />;
    }

    // Show loading state while checking auth
    if (loading || authState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location, intendedRole: 'user' }} replace />;
    }

    return children;
};

export default UserProtectedRoute;
