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
                
                // If user_metadata has manager role, set it immediately but still check profile
                if (userRole === 'manager') {
                    setIsManager(true);
                    // Continue to check profile to ensure consistency
                }

                // Check profile for role (always check, even if user_metadata says manager)
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    // Profile doesn't exist or error fetching - log but don't fail
                    console.log('Profile fetch result:', error.code, error.message);
                    
                    // If profile doesn't exist (PGRST116), role should be in user_metadata
                    // Only set isManager to false if we explicitly got a profile with a different role
                    if (error.code !== 'PGRST116' && profile) {
                        // Profile exists but doesn't have manager role
                        setIsManager(false);
                    } else if (error.code === 'PGRST116') {
                        // Profile doesn't exist yet - rely on user_metadata which was already checked
                        console.log('Profile not found, using user_metadata role:', userRole);
                        setIsManager(userRole === 'manager');
                    } else {
                        // Other error - default to false but log it
                        console.warn('Error checking profile, defaulting to false:', error);
                        setIsManager(false);
                    }
                } else if (profile?.role === 'manager') {
                    // Profile confirms manager role
                    setIsManager(true);
                } else if (profile?.role) {
                    // Profile exists with a different role - override user_metadata
                    setIsManager(false);
                } else {
                    // Profile exists but no role - use user_metadata (already checked above)
                    // Keep existing isManager state (set from user_metadata check)
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

            // Check role from user_metadata
            const userRole = session.user?.user_metadata?.role;
            if (userRole === 'manager') {
                setIsManager(true);
                // Continue to check profile for consistency
            }

            // Check profile for role (always check, even if user_metadata says manager)
            try {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    // Profile doesn't exist - rely on user_metadata which was already checked
                    if (profileError.code === 'PGRST116') {
                        console.log('Profile not found in auth listener, using user_metadata role:', userRole);
                        setIsManager(userRole === 'manager');
                    } else {
                        console.warn('Error fetching profile in auth listener:', profileError);
                        setIsManager(userRole === 'manager'); // Fallback to user_metadata
                    }
                } else if (profile?.role === 'manager') {
                    setIsManager(true);
                } else if (profile?.role) {
                    setIsManager(false);
                } else {
                    // Profile exists but no role - use user_metadata
                    setIsManager(userRole === 'manager');
                }
            } catch (err) {
                console.error('Error checking profile in auth listener:', err);
                setIsManager(userRole === 'manager'); // Fallback to user_metadata
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
