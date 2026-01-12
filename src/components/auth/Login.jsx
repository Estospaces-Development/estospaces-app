import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';
import logo from '../../assets/auth/logo.jpg';
import building from '../../assets/auth/building.jpg';
import { AlertCircle } from 'lucide-react';

/**
 * Login Component
 * 
 * Main login page with OAuth (Google) and email sign-in options.
 * Uses the centralized authService for OAuth.
 * Relies on AuthContext for session state.
 */
const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, loading: authLoading, getRole } = useAuth();
    
    const [active, setActive] = useState('google');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Ref to prevent multiple OAuth attempts
    const isSigningIn = useRef(false);

    // Get the intended destination from location state
    const from = location.state?.from?.pathname;

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const role = getRole();
            const redirectPath = authService.getRedirectPath(role, from);
            console.log('✅ Login: Already authenticated, redirecting to:', redirectPath);
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, authLoading, getRole, navigate, from]);

    const signInWithGoogle = async () => {
        // Prevent multiple concurrent OAuth attempts
        if (isSigningIn.current || loading) {
            return;
        }

        isSigningIn.current = true;
        setActive('google');
        setLoading(true);
        setError('');
        
        try {
            console.log('🔐 Login: Starting Google OAuth...');
            
            const { success, error: oauthError } = await authService.signInWithOAuth('google');
            
            if (!success && oauthError) {
                setError(oauthError);
                isSigningIn.current = false;
                setLoading(false);
            }
            // Note: On success, we don't reset loading because the page will redirect
        } catch (err) {
            console.error('❌ Login: OAuth error:', err);
            setError('Failed to sign in with Google. Please try again.');
            isSigningIn.current = false;
            setLoading(false);
        }
    };

    const goToEmail = () => {
        setActive('email');
        navigate('/auth/sign-in-email');
    };

    // Show loading while checking for existing session
    if (authLoading) {
        return (
            <AuthLayout image={building}>
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Checking session...</p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout image={building}>
            <div className="flex flex-col items-center">
                {/* Logo */}
                <div className="mb-8">
                    <img src={logo} alt="Estospaces" className="h-10" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 text-center">
                    Sign in to Estospaces
                </h2>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center">
                    Welcome back! Please sign in to continue
                </p>

                {/* Google Button */}
                <button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-md font-medium text-sm transition-all duration-200 mb-3 border ${
                        active === 'google'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-orange-50 dark:bg-orange-900/20 text-primary border-primary hover:bg-orange-100 dark:hover:bg-orange-900/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <span className="flex items-center justify-center gap-3">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {loading ? 'Signing in...' : 'Sign in with Google'}
                    </span>
                </button>

                {/* Email Button */}
                <button
                    onClick={goToEmail}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-md font-medium text-sm transition-all duration-200 mb-4 border ${
                        active === 'email'
                            ? 'bg-primary text-white border-primary'
                            : 'bg-orange-50 dark:bg-orange-900/20 text-primary border-primary hover:bg-orange-100 dark:hover:bg-orange-900/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Sign in with Email
                </button>

                {/* Error Message */}
                {error && (
                    <div className="w-full mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2">
                        <AlertCircle className="text-red-500 dark:text-red-400 flex-shrink-0" size={18} />
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <span
                        onClick={() => navigate('/auth/signup')}
                        className="text-primary font-medium cursor-pointer hover:underline"
                    >
                        Sign Up
                    </span>
                </p>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-12 text-center leading-relaxed">
                    By continuing you agree to Estospaces<br />
                    <a href="/terms" className="text-primary hover:underline">terms & conditions</a>
                    {' · '}
                    <a href="/privacy" className="text-primary hover:underline">privacy policy</a>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Login;
