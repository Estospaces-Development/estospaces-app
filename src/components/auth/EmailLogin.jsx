import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSupabaseAvailable } from '../../lib/supabase';
import { getUserRole, getRedirectPath } from '../../utils/authHelpers';
import AuthLayout from './AuthLayout';
import logo from '../../assets/auth/logo.jpg';
import building from '../../assets/auth/building.jpg';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

const EmailLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

    // Ref to prevent multiple concurrent sign-in attempts
    const isSigningIn = useRef(false);

    // Get the intended destination from location state
    const from = location.state?.from?.pathname;

    // Check if user is already logged in - simplified to avoid abort issues
    useEffect(() => {
        let isMounted = true;

        const checkExistingSession = async () => {
            // Skip if supabase not configured
            if (!isSupabaseAvailable()) {
                setCheckingSession(false);
                return;
            }

            try {
                // Import supabase directly to avoid wrapper issues
                const { supabase } = await import('../../lib/supabase');
                if (!supabase || !isMounted) {
                    setCheckingSession(false);
                    return;
                }

                // Quick session check from localStorage (should be instant)
                const { data: { session } } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (session) {
                    // User is already logged in, redirect based on role
                    console.log('✅ Existing session found, redirecting...');
                    const role = await getUserRole(session.user);
                    if (isMounted) {
                        const redirectPath = getRedirectPath(role, from);
                        console.log('🔄 Redirecting to:', redirectPath);
                        navigate(redirectPath, { replace: true });
                    }
                } else {
                    setCheckingSession(false);
                }
            } catch (err) {
                // Silently handle errors - just let user sign in
                console.log('Session check skipped:', err.message);
                if (isMounted) setCheckingSession(false);
            }
        };

        checkExistingSession();

        return () => {
            isMounted = false;
        };
    }, [navigate, from]);

    const validateEmail = (value) => {
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Enter a valid email';
        return '';
    };

    const validatePassword = (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Prevent multiple concurrent sign-in attempts
        if (isSigningIn.current || loading) {
            return;
        }

        // Check if Supabase is configured
        if (!isSupabaseAvailable()) {
            setGeneralError('Authentication service is not configured. Please contact support.');
            return;
        }

        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);

        setEmailError(emailErr);
        setPasswordError(passErr);
        setGeneralError('');

        if (emailErr || passErr) return;

        // Set loading state and prevent concurrent attempts
        isSigningIn.current = true;
        setLoading(true);

        try {
            // Check network connectivity first
            if (!navigator.onLine) {
                setGeneralError('No internet connection. Please check your network and try again.');
                isSigningIn.current = false;
                setLoading(false);
                return;
            }

            // Import supabase directly
            const { supabase } = await import('../../lib/supabase');
            
            if (!supabase) {
                console.error('❌ Supabase client not available');
                setGeneralError('Authentication service not available. Please refresh and try again.');
                isSigningIn.current = false;
                setLoading(false);
                return;
            }

            console.log('🔐 Attempting sign in...', { email });
            
            // Direct sign-in call
            const startTime = Date.now();
            const { data, error } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
            });
            const duration = Date.now() - startTime;
            console.log(`⏱️ Sign in took ${duration}ms`);

            console.log('📨 Sign in response:', {
                hasData: !!data,
                hasSession: !!data?.session,
                hasError: !!error,
                errorMessage: error?.message
            });

            if (error) {
                console.error('❌ Sign in error:', error);
                const msg = error.message?.toLowerCase() || '';
                if (msg.includes('timeout') || msg.includes('taking too long')) {
                    setGeneralError('The server is taking too long to respond. This might be due to a slow connection or server issues. Please try again in a moment.');
                } else if (msg.includes('email') && !msg.includes('credentials')) {
                    setEmailError(error.message);
                } else if (msg.includes('password') || msg.includes('credentials') || msg.includes('invalid')) {
                    setPasswordError('Invalid email or password');
                } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
                    setGeneralError('Network error. Please check your internet connection and try again.');
                } else {
                    setGeneralError(error.message || 'Sign-in failed. Please try again.');
                }
            } else if (data?.session) {
                // Successful login - get role and redirect
                console.log('✅ Session obtained, getting user role...');
                const role = await getUserRole(data.session.user);
                const redirectPath = getRedirectPath(role, from);

                // Debug logging (only in development)
                if (import.meta.env.DEV) {
                    // eslint-disable-next-line no-console
                    console.log('✅ Login successful:', {
                        userId: data.session.user.id,
                        email: data.session.user.email,
                        role,
                        redirectPath,
                        from
                    });
                    // eslint-disable-next-line no-console
                    console.log('🔄 Navigating to:', redirectPath);
                }

                // Force a small delay to ensure state is set
                setTimeout(() => {
                    console.log('⏭️  Executing navigation...');
                    navigate(redirectPath, { replace: true });
                }, 100);
            } else {
                // No session returned - unexpected state
                console.error('❌ No session in response');
                setGeneralError('Sign-in failed. Please try again.');
            }
        } catch (error) {
            console.error('❌ Unexpected error during sign in:', error);
            setGeneralError('An unexpected error occurred. Please try again.');
        } finally {
            isSigningIn.current = false;
            setLoading(false);
        }
    };

    // Show loading while checking for existing session
    if (checkingSession) {
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
                    Sign in to continue
                </h2>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center">
                    Enter your email and password
                </p>

                <form onSubmit={handleLogin} className="w-full">
                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError('');
                            }}
                            className={`w-full px-4 py-3 border rounded-md outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${emailError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                                }`}
                        />
                        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError('');
                                }}
                                className={`w-full px-4 py-3 pr-12 border rounded-md outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right mb-6">
                        <span
                            onClick={() => navigate('/auth/reset-password')}
                            className="text-primary text-sm font-medium cursor-pointer hover:underline"
                        >
                            Forgot Password?
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {/* General Error Message */}
                    {generalError && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2">
                            <AlertCircle className="text-red-500 dark:text-red-400 flex-shrink-0" size={18} />
                            <p className="text-red-600 dark:text-red-400 text-sm">{generalError}</p>
                        </div>
                    )}
                </form>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Don't have an account?{' '}
                    <span
                        onClick={() => navigate('/auth/signup')}
                        className="text-primary font-medium cursor-pointer hover:underline"
                    >
                        Sign Up
                    </span>
                </p>

                <button
                    onClick={() => navigate('/auth/login')}
                    className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mt-8 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Login options
                </button>
            </div>
        </AuthLayout>
    );
};

export default EmailLogin;

