import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import AuthLayout from './AuthLayout';
import logo from '../../assets/auth/logo.jpg';
import building from '../../assets/auth/building.jpg';
import { Check, X, Eye, EyeOff, User, Briefcase } from 'lucide-react';

/**
 * Signup Component
 * 
 * Uses the centralized authService for sign-up.
 * Relies on AuthContext for session state.
 */
const Signup = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, getRole } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // 'user' or 'manager'
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const rules = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };

    const allRulesPassed = Object.values(rules).every(Boolean);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const userRole = getRole();
            const redirectPath = authService.getRedirectPath(userRole);
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, authLoading, getRole, navigate]);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email');
            return;
        }
        
        if (!allRulesPassed) {
            setError('Please meet all password requirements');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('📝 Signup: Starting sign-up...');
            
            const result = await authService.signUpWithEmail(email, password, {
                full_name: name,
                role: role,
            });

            if (!result.success) {
                const errorMsg = result.error || 'Sign-up failed. Please try again.';
                
                // Handle specific error cases
                if (errorMsg.includes('already registered')) {
                    setError('This email is already registered. Please sign in instead.');
                } else if (errorMsg.includes('not authorized')) {
                    setError('Email service is not configured. Please contact support or try Google sign-in.');
                } else if (errorMsg.includes('rate limit')) {
                    setError('Too many attempts. Please try again later.');
                } else {
                    setError(errorMsg);
                }
                return;
            }

            // Check if email confirmation is required
            if (result.needsEmailConfirmation) {
                setSuccess(true);
                return;
            }

            // Signed in directly (email confirmation disabled)
            if (result.session) {
                console.log('✅ Signup: Auto-confirmed, redirecting...');
                const redirectPath = authService.getRedirectPath(role);
                navigate(redirectPath, { replace: true });
            }

        } catch (err) {
            console.error('❌ Signup: Exception:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <AuthLayout image={building}>
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
                </div>
            </AuthLayout>
        );
    }

    // Success state - email confirmation required
    if (success) {
        return (
            <AuthLayout image={building}>
                <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    <div className="mb-8">
                        <img src={logo} alt="Estospaces" className="h-10" />
                    </div>
                    
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                        <Check className="text-green-600 dark:text-green-400" size={32} />
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Check your email
                    </h2>
                    
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        We've sent a confirmation link to<br />
                        <strong className="text-gray-800 dark:text-gray-200">{email}</strong>
                    </p>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg px-4 py-2 mb-4">
                        <p className="text-primary text-sm font-medium">
                            Signed up as: {role === 'manager' ? 'Property Manager' : 'User'}
                        </p>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 mb-8 text-left">
                        <p className="text-gray-600 dark:text-gray-300 text-xs font-medium mb-2">Didn't receive the email?</p>
                        <ul className="text-gray-500 dark:text-gray-400 text-xs space-y-1">
                            <li>• Check your spam or junk folder</li>
                            <li>• Wait a few minutes and refresh</li>
                            <li>• Try signing up with Google instead</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => navigate('/auth/sign-in-email')}
                        className="text-primary font-medium hover:underline text-sm"
                    >
                        Back to Sign In
                    </button>
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
                    Sign up for Estospaces
                </h2>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center">
                    Create your account to get started
                </p>

                <form onSubmit={handleSignup} className="w-full">
                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">I am a</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('user')}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                                    role === 'user'
                                        ? 'border-primary bg-orange-50 dark:bg-orange-900/20 text-primary'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <User size={24} className={role === 'user' ? 'text-primary' : 'text-gray-400'} />
                                <span className="mt-2 font-medium text-sm">User</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Looking for property</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('manager')}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                                    role === 'manager'
                                        ? 'border-primary bg-orange-50 dark:bg-orange-900/20 text-primary'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <Briefcase size={24} className={role === 'manager' ? 'text-primary' : 'text-gray-400'} />
                                <span className="mt-2 font-medium text-sm">Manager</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Managing properties</span>
                            </button>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md outline-none focus:border-primary transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md outline-none focus:border-primary transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-md outline-none focus:border-primary transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Password Rules */}
                    <ul className="mb-6 space-y-1">
                        {[
                            { key: 'length', text: 'At least 8 characters' },
                            { key: 'upper', text: 'One uppercase letter' },
                            { key: 'lower', text: 'One lowercase letter' },
                            { key: 'number', text: 'One number' },
                            { key: 'symbol', text: 'One special symbol' },
                        ].map(({ key, text }) => (
                            <li
                                key={key}
                                className={`flex items-center gap-2 text-xs ${
                                    rules[key] ? 'text-green-600' : 'text-gray-400'
                                }`}
                            >
                                {rules[key] ? <Check size={14} /> : <X size={14} />}
                                {text}
                            </li>
                        ))}
                    </ul>

                    {error && (
                        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Already have an account?{' '}
                    <span
                        onClick={() => navigate('/auth/sign-in-email')}
                        className="text-primary font-medium cursor-pointer hover:underline"
                    >
                        Sign in
                    </span>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Signup;
