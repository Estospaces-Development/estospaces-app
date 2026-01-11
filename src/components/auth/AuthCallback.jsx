import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseAvailable } from '../../lib/supabase';
import { 
    getSessionWithTimeout, 
    getUserRole, 
    getRedirectPath,
    AUTH_TIMEOUTS 
} from '../../utils/authHelpers';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [status, setStatus] = useState('Completing sign in...');
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent double processing
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        let isMounted = true;
        let timeoutId;

        // Set a maximum timeout for the entire callback process (15 seconds)
        const maxTimeout = setTimeout(() => {
            if (isMounted && !error) {
                setError('Authentication is taking too long. Please try signing in again.');
                setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
            }
        }, AUTH_TIMEOUTS.SIGN_IN);

        const handleAuthCallback = async () => {
            if (!isSupabaseAvailable()) {
                if (isMounted) {
                    setError('Authentication service is not configured.');
                    timeoutId = setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                }
                return;
            }

            try {
                setStatus('Verifying session...');
                
                // Get the session after OAuth callback with timeout protection
                const { data: { session }, error: sessionError } = await getSessionWithTimeout(AUTH_TIMEOUTS.SESSION_CHECK);

                if (!isMounted) return;

                if (sessionError) {
                    setError('Authentication failed. Please try again.');
                    timeoutId = setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                    return;
                }

                if (!session) {
                    // No session, redirect to login
                    navigate('/auth/login', { replace: true });
                    return;
                }

                setStatus('Loading your profile...');

                // Get user role with timeout protection
                const role = await getUserRole(session.user, AUTH_TIMEOUTS.PROFILE_FETCH);
                
                if (!isMounted) return;

                // Redirect based on role
                const redirectPath = getRedirectPath(role);
                
                // Debug logging (only in development)
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log('✅ OAuth callback complete:', {
                        userId: session.user.id,
                        email: session.user.email,
                        role,
                        redirectPath
                    });
                    // eslint-disable-next-line no-console
                    console.log('🔄 Navigating to:', redirectPath);
                }
                
                // Force a small delay to ensure state is set
                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, 100);
            } catch {
                if (isMounted) {
                    setError('An error occurred. Redirecting to login...');
                    timeoutId = setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                }
            }
        };

        handleAuthCallback();

        return () => {
            isMounted = false;
            clearTimeout(maxTimeout);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [navigate, error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                {error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Redirecting to login...</p>
                    </div>
                ) : (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">{status}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
