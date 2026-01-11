import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { 
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
        let authSubscription = null;

        // Set a maximum timeout for the entire callback process
        const maxTimeout = setTimeout(() => {
            if (isMounted && !error) {
                console.log('⏰ OAuth callback timeout');
                setError('Authentication is taking too long. Please try signing in again.');
                setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
            }
        }, AUTH_TIMEOUTS.SIGN_IN);

        const handleRedirect = async (session) => {
            if (!isMounted || !session) return;

            try {
                setStatus('Loading your profile...');

                // Get user role with timeout protection
                const role = await getUserRole(session.user, AUTH_TIMEOUTS.PROFILE_FETCH);
                
                if (!isMounted) return;

                // Redirect based on role
                const redirectPath = getRedirectPath(role);
                
                // Debug logging (only in development)
                if (import.meta.env.DEV) {
                    console.log('✅ OAuth callback complete:', {
                        userId: session.user.id,
                        email: session.user.email,
                        role,
                        redirectPath
                    });
                    console.log('🔄 Navigating to:', redirectPath);
                }
                
                clearTimeout(maxTimeout);
                navigate(redirectPath, { replace: true });
            } catch (err) {
                console.error('❌ Error during redirect:', err);
                if (isMounted) {
                    setError('An error occurred. Redirecting to login...');
                    setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                }
            }
        };

        const handleAuthCallback = async () => {
            if (!isSupabaseAvailable() || !supabase) {
                if (isMounted) {
                    setError('Authentication service is not configured.');
                    setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                }
                return;
            }

            try {
                setStatus('Verifying session...');
                
                // Check for OAuth tokens in URL - supports both PKCE (query params) and implicit (hash) flows
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const searchParams = new URLSearchParams(window.location.search);
                
                // PKCE flow uses 'code' in query params, implicit uses 'access_token' in hash
                const hasOAuthCode = searchParams.has('code');
                const hasOAuthTokens = hashParams.has('access_token');
                const hasOAuthData = hasOAuthCode || hasOAuthTokens;
                
                // Check for error in URL (can be in either hash or query params)
                const urlError = hashParams.get('error') || searchParams.get('error');
                const urlErrorDescription = hashParams.get('error_description') || searchParams.get('error_description');
                
                if (urlError) {
                    console.error('❌ OAuth error from URL:', urlError, urlErrorDescription);
                    setError(urlErrorDescription || 'Authentication failed. Please try again.');
                    setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                    return;
                }
                
                if (import.meta.env.DEV) {
                    console.log('🔍 OAuth callback check:', {
                        hasOAuthCode,
                        hasOAuthTokens,
                        hasOAuthData,
                        hash: window.location.hash ? 'present' : 'empty',
                        search: window.location.search ? 'present' : 'empty'
                    });
                }

                // Set up auth state listener FIRST to catch the session when Supabase processes the URL
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (!isMounted) return;
                    
                    if (import.meta.env.DEV) {
                        console.log('🔔 Auth state change in callback:', event, session ? 'has session' : 'no session');
                    }
                    
                    if (event === 'SIGNED_IN' && session) {
                        await handleRedirect(session);
                    } else if (event === 'TOKEN_REFRESHED' && session) {
                        // Token was refreshed, we have a valid session
                        await handleRedirect(session);
                    }
                });
                authSubscription = subscription;

                // Now check if we already have a session (might happen if tokens were already processed)
                // Small delay to let Supabase process URL tokens first
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (sessionError) {
                    console.error('❌ Session error:', sessionError);
                    setError('Authentication failed. Please try again.');
                    setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                    return;
                }

                if (session) {
                    // Session already exists, redirect
                    if (import.meta.env.DEV) {
                        console.log('✅ Session found immediately:', session.user.email);
                    }
                    await handleRedirect(session);
                } else if (!hasOAuthData) {
                    // No tokens/code in URL and no session - redirect to login
                    console.log('⚠️ No session and no OAuth data, redirecting to login');
                    navigate('/auth/login', { replace: true });
                } else {
                    // We have OAuth data (code or tokens) but no session yet
                    // For PKCE flow, Supabase should exchange the code automatically
                    // Wait a bit longer and check again
                    if (import.meta.env.DEV) {
                        console.log('⏳ Waiting for Supabase to process OAuth data...');
                    }
                    
                    // Try a few more times with increasing delays
                    for (let i = 0; i < 5; i++) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        if (!isMounted) return;
                        
                        const { data: { session: retrySession } } = await supabase.auth.getSession();
                        
                        if (retrySession) {
                            if (import.meta.env.DEV) {
                                console.log(`✅ Session found after retry ${i + 1}:`, retrySession.user.email);
                            }
                            await handleRedirect(retrySession);
                            return;
                        }
                    }
                    
                    // If still no session after retries, show error
                    if (isMounted) {
                        console.error('❌ Failed to obtain session after retries');
                        setError('Failed to complete sign in. Please try again.');
                        setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                    }
                }
                
            } catch (err) {
                console.error('❌ OAuth callback error:', err);
                if (isMounted) {
                    setError('An error occurred. Redirecting to login...');
                    setTimeout(() => navigate('/auth/login', { replace: true }), 2000);
                }
            }
        };

        handleAuthCallback();

        return () => {
            isMounted = false;
            clearTimeout(maxTimeout);
            if (authSubscription) {
                authSubscription.unsubscribe();
            }
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
