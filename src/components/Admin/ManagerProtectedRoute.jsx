import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';

const ManagerProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            if (!isSupabaseAvailable()) {
                setAuthenticated(false);
                setIsManager(false);
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setAuthenticated(false);
                    setIsManager(false);
                    setLoading(false);
                    return;
                }

                setAuthenticated(true);

                // Check role from user metadata first
                const userRole = session.user?.user_metadata?.role;
                
                if (userRole === 'manager') {
                    setIsManager(true);
                    setLoading(false);
                    return;
                }

                // Check profile for role
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (!error && profile?.role === 'manager') {
                    setIsManager(true);
                } else {
                    setIsManager(false);
                }
            } catch (err) {
                console.error('Error checking manager auth:', err);
                setAuthenticated(false);
                setIsManager(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        if (!isSupabaseAvailable()) {
            return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!session) {
                setAuthenticated(false);
                setIsManager(false);
                return;
            }

            setAuthenticated(true);

            // Check role
            const userRole = session.user?.user_metadata?.role;
            if (userRole === 'manager') {
                setIsManager(true);
                return;
            }

            // Check profile for role
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                setIsManager(profile?.role === 'manager');
            } catch {
                setIsManager(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not authenticated at all - redirect to login
    if (!authenticated) {
        return <Navigate to="/auth/login" state={{ from: location, intendedRole: 'manager' }} replace />;
    }

    // Authenticated but not a manager - redirect to user dashboard
    if (!isManager) {
        return <Navigate to="/user/dashboard" replace />;
    }

    return children;
};

export default ManagerProtectedRoute;
