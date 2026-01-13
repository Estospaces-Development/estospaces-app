import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';
import logo from '../../assets/auth/logo.jpg';
import building from '../../assets/auth/building.jpg';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * EmailLogin Component
 * 
 * Uses the centralized authService for sign-in with retry logic.
 * Relies on AuthContext for session state.
 */
const EmailLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, loading: authLoading, getRole } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

    // Ref to prevent multiple concurrent sign-in attempts
    const isSigningIn = useRef(false);
    
    // Refs for input elements (for browser automation testing)
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    // Get the intended destination from location state
    const from = location.state?.from?.pathname;

    // Pre-fill form from URL parameters (for testing - only in development)
    React.useEffect(() => {
        // Only allow URL parameter testing in development mode
        if (import.meta.env.MODE === 'development') {
            const params = new URLSearchParams(window.location.search);
            const testEmail = params.get('testEmail');
            const testPassword = params.get('testPassword');
            if (testEmail && testPassword) {
                setEmail(testEmail);
                setPassword(testPassword);
                // Auto-submit after a short delay
                setTimeout(() => {
                    const form = document.querySelector('form');
                    if (form) {
                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                        form.dispatchEvent(submitEvent);
                    }
                }, 500);
            }
        }
    }, []);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const role = getRole();
            const redirectPath = authService.getRedirectPath(role, from);
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, authLoading, getRole, navigate, from]);

    // Test mode: Allow setting values via window object for browser automation testing
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.__testEmailLogin = {
                setEmail: (value) => {
                    setEmail(value);
                    setEmailError('');
                    if (emailInputRef.current) {
                        emailInputRef.current.value = value;
                        emailInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
                        emailInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                },
                setPassword: (value) => {
                    setPassword(value);
                    setPasswordError('');
                    if (passwordInputRef.current) {
                        passwordInputRef.current.value = value;
                        passwordInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
                        passwordInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                },
                submit: () => {
                    const form = document.querySelector('form');
                    if (form) {
                        const event = new Event('submit', { bubbles: true, cancelable: true });
                        form.dispatchEvent(event);
                    }
                },
                fillAndSubmit: (emailValue, passwordValue) => {
                    setEmail(emailValue);
                    setPassword(passwordValue);
                    setEmailError('');
                    setPasswordError('');
                    if (emailInputRef.current) {
                        emailInputRef.current.value = emailValue;
                        emailInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
                        emailInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (passwordInputRef.current) {
                        passwordInputRef.current.value = passwordValue;
                        passwordInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
                        passwordInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) {
                            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                            form.dispatchEvent(submitEvent);
                        }
                    }, 100);
                }
            };
        }
    }, []);

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

        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);

        setEmailError(emailErr);
        setPasswordError(passErr);
        setGeneralError('');

        if (emailErr || passErr) return;

        // Check network connectivity
        if (!navigator.onLine) {
            setGeneralError('No internet connection. Please check your network and try again.');
            return;
        }

        // Set loading state and prevent concurrent attempts
        isSigningIn.current = true;
        setLoading(true);
        setGeneralError('');

        try {
            console.log('🔐 EmailLogin: Attempting sign in...');
            
            const result = await authService.signInWithEmail(email, password);

            if (!result.success) {
                const errorMsg = result.error || 'Sign-in failed. Please try again.';
                
                // Categorize errors for better UX
                const msg = errorMsg.toLowerCase();
                if (msg.includes('email') && !msg.includes('password') && !msg.includes('credentials')) {
                    setEmailError(errorMsg);
                } else if (msg.includes('password') || msg.includes('credentials') || msg.includes('invalid')) {
                    setPasswordError('Invalid email or password');
                } else {
                    setGeneralError(errorMsg);
                }
                return;
            }

            // Success! Get role and redirect
            console.log('✅ EmailLogin: Sign-in successful');
            const role = await authService.getUserRole(result.user);
            const redirectPath = authService.getRedirectPath(role, from);

            console.log('🔄 EmailLogin: Navigating to:', redirectPath);
            navigate(redirectPath, { replace: true });

        } catch (error) {
            console.error('❌ EmailLogin: Unexpected error:', error);
            setGeneralError('An unexpected error occurred. Please try again.');
        } finally {
            isSigningIn.current = false;
            setLoading(false);
        }
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
                            ref={emailInputRef}
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
                                ref={passwordInputRef}
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
