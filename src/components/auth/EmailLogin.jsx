import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
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

    // Get the intended destination from location state
    const from = location.state?.from?.pathname;

    // Check if user is already logged in
    useEffect(() => {
        const checkExistingSession = async () => {
            if (!isSupabaseAvailable()) {
                setCheckingSession(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session) {
                    // User is already logged in, redirect based on role
                    await redirectBasedOnRole(session.user);
                }
            } catch (err) {
                console.error('Error checking session:', err);
            } finally {
                setCheckingSession(false);
            }
        };

        checkExistingSession();
    }, []);

    // Helper function to redirect based on user role
    const redirectBasedOnRole = async (user) => {
        const userRole = user?.user_metadata?.role;
        
        // Check profile for role if not in metadata
        let role = userRole;
        if (!role) {
            try {
                // Add timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
                );
                
                const profilePromise = supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                
                const { data: profile } = await Promise.race([profilePromise, timeoutPromise]);
                role = profile?.role || 'user';
            } catch (err) {
                console.log('Could not fetch profile role, defaulting to user:', err);
                role = 'user';
            }
        }

        // Redirect to the intended destination or dashboard based on role
        if (from) {
            navigate(from, { replace: true });
        } else if (role === 'manager') {
            navigate('/manager/dashboard', { replace: true });
        } else {
            navigate('/user/dashboard', { replace: true });
        }
    };

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

        setLoading(true);

        try {
            // Add timeout to prevent hanging
            const loginPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Login request timed out. Please try again.')), 10000)
            );
            
            const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

            if (error) {
                const msg = error.message.toLowerCase();
                if (msg.includes('email') && !msg.includes('credentials')) {
                    setEmailError(error.message);
                } else if (msg.includes('password') || msg.includes('credentials') || msg.includes('invalid')) {
                    setPasswordError('Invalid email or password');
                } else {
                    setGeneralError(error.message);
                }
                setLoading(false);
            } else if (data?.session) {
                // Successful login - redirect immediately using window.location for reliability
                const userRole = data.session.user?.user_metadata?.role;
                
                let redirectPath = '/user/dashboard';
                if (from) {
                    redirectPath = from;
                } else if (userRole === 'manager') {
                    redirectPath = '/manager/dashboard';
                }
                
                // Use window.location for reliable navigation after login
                window.location.href = redirectPath;
            } else {
                setGeneralError('Login failed. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            setGeneralError(error.message || 'An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

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
                            className={`w-full px-4 py-3 border rounded-md outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                                emailError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
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
                                className={`w-full px-4 py-3 pr-12 border rounded-md outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                                    passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
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
                </form>

                {generalError && (
                    <p className="text-red-500 text-sm mt-4 text-center">{generalError}</p>
                )}

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

