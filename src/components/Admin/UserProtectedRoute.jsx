import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';

const UserProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            if (!isSupabaseAvailable()) {
                setAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                setAuthenticated(!!session);
            } catch (err) {
                console.error('Error checking user auth:', err);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        if (!isSupabaseAvailable()) {
            return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/auth/login" state={{ from: location, intendedRole: 'user' }} replace />;
    }

    return children;
};

export default UserProtectedRoute;
