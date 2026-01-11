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

const ManagerProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        let timeoutId;
        let subscription;

        const checkAuth = async () => {
            if (!isSupabaseAvailable()) {
                if (isMounted) {
                    setAuthenticated(false);
                    setIsManager(false);
                    setLoading(false);
                }
                return;
            }

            try {
                // Direct session check - simpler and more reliable
                console.log('🔍 ManagerProtectedRoute: Checking session...');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (sessionError) {
                    console.log('❌ Session check error:', sessionError);
                    setAuthenticated(false);
                    setIsManager(false);
                    setLoading(false);
                    return;
                }

                if (!session) {
                    console.log('❌ No session found');
                    setAuthenticated(false);
                    setIsManager(false);
                    setLoading(false);
                    return;
                }

                console.log('✅ Session found:', session.user.email);
                setAuthenticated(true);

                // Check role from user metadata first
                const userRole = session.user?.user_metadata?.role;
                
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log('✅ Manager route check:', {
                        userId: session.user.id,
                        email: session.user.email,
                        userRole
                    });
                }
                
                // If user_metadata has manager role, set it immediately but still check profile
                if (userRole === 'manager') {
                    setIsManager(true);
                }

                // Check profile for role with timeout (5 seconds)
                try {
                    const profilePromise = supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();
                    const profileTimeoutPromise = new Promise((_, reject) => {
                        timeoutId = setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
                    });

                    const { data: profile, error } = await Promise.race([profilePromise, profileTimeoutPromise]);
                    clearTimeout(timeoutId);

                    if (!isMounted) return;

                    if (error) {
                        // If profile doesn't exist (PGRST116), use user_metadata role
                        if (error.code === 'PGRST116') {
                            setIsManager(userRole === 'manager');
                        } else {
                            // Other error - use user_metadata as fallback
                            setIsManager(userRole === 'manager');
                        }
                    } else if (profile?.role === 'manager') {
                        setIsManager(true);
                    } else if (profile?.role) {
                        setIsManager(false);
                    } else {
                        setIsManager(userRole === 'manager');
                    }
                } catch (profileErr) {
                    // Timeout or other error - use user_metadata as fallback
                    clearTimeout(timeoutId);
                    // Silently ignore abort errors
                    if (isAbortError(profileErr)) return;
                    if (isMounted && userRole !== undefined) {
                        setIsManager(userRole === 'manager');
                    }
                }
            } catch (err) {
                // Session fetch failed or timed out
                clearTimeout(timeoutId);
                // Silently ignore abort errors
                if (isAbortError(err)) return;
                if (isMounted) {
                    setAuthenticated(false);
                    setIsManager(false);
                    setLoading(false);
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
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }

        try {
            const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (!isMounted) return;

                // Only react to actual auth state changes, not token refresh
                if (event === 'TOKEN_REFRESHED') {
                    // Token was refreshed - session is still valid, do nothing
                    return;
                }

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
                }

                // Check profile for role (with timeout)
                try {
                    const profilePromise = supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();
                    const profileTimeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
                    });

                    const { data: profile, error } = await Promise.race([profilePromise, profileTimeoutPromise]);

                    if (!isMounted) return;

                    if (error) {
                        // Silently ignore abort errors
                        if (isAbortError(error)) return;
                        setIsManager(userRole === 'manager');
                    } else if (profile?.role === 'manager') {
                        setIsManager(true);
                    } else if (profile?.role) {
                        setIsManager(false);
                    } else {
                        setIsManager(userRole === 'manager');
                    }
                } catch (err) {
                    // Silently ignore abort errors
                    if (isAbortError(err)) return;
                    if (isMounted && userRole !== undefined) {
                        setIsManager(userRole === 'manager');
                    }
                }
            });
            subscription = authSubscription;
        } catch (err) {
            // Auth listener setup failed - not critical
            if (!isAbortError(err)) {
                // Only log non-abort errors in dev
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.warn('Failed to set up auth listener:', err);
                }
            }
        }

        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []); // Only run once on mount

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
