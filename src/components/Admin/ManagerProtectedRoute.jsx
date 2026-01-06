import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ManagerProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (!supabase) {
                setAuthenticated(false);
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            // For now, any authenticated user is considered a manager
            // TODO: Add role check when user roles are implemented
            // e.g., check session?.user?.user_metadata?.role === 'manager'
            setAuthenticated(!!session);
            setLoading(false);
        };

        checkAuth();

        // Listen for auth changes only if supabase is configured
        if (!supabase) {
            return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/manager/login" replace />;
    }

    return children;
};

export default ManagerProtectedRoute;
