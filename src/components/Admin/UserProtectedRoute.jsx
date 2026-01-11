import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';

// Helper to check if error is an AbortError
const isAbortError = (error) => {
    if (!error) return false;
    return (
        error.name === 'AbortError' ||
        error.message?.includes('aborted') ||
        error.message?.includes('AbortError') ||
        error.code === 'ABORT_ERR'
    );
};

const UserProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        let subscription;

        const checkAuth = async () => {
            if (!isSupabaseAvailable()) {
                if (isMounted) {
                    setAuthenticated(false);
                    setLoading(false);
                }
                return;
            }

            try {
                // Direct session check - simpler and more reliable
                console.log('🔍 UserProtectedRoute: Checking session...');
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (!isMounted) return;

                if (error) {
                    console.log('❌ Session check error:', error);
                    setAuthenticated(false);
                    setLoading(false);
                    return;
                }

                if (import.meta.env.DEV && session) {
                    // eslint-disable-next-line no-console
                    console.log('✅ User session valid:', {
                        userId: session.user.id,
                        email: session.user.email
                    });
                }

                setAuthenticated(!!session);
            } catch (err) {
                // Silently ignore abort errors
                if (isAbortError(err)) return;
                if (isMounted) {
                    setAuthenticated(false);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        // Listen for auth changes - but don't aggressively re-check
        if (!isSupabaseAvailable()) {
            return () => {
                isMounted = false;
            };
        }

        try {
            const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
                if (!isMounted) return;

                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log('🔄 Auth state changed:', event, session ? 'Session active' : 'No session');
                }

                // Only react to actual auth state changes, not token refresh
                if (event === 'TOKEN_REFRESHED') {
                    // Token was refreshed - session is still valid, do nothing
                    return;
                }

                setAuthenticated(!!session);
            });
            subscription = authSubscription;
        } catch (err) {
            // Silently ignore abort errors during subscription setup
            if (isAbortError(err)) return;
        }

        return () => {
            isMounted = false;
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []); // Only run once on mount

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
