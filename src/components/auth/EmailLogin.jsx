import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AuthLayout from './AuthLayout';
import logo from '../../assets/auth/logo.jpg';
import building from '../../assets/auth/building.jpg';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const EmailLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');

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

        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);

        setEmailError(emailErr);
        setPasswordError(passErr);
        setGeneralError('');

        if (emailErr || passErr) return;

        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                const msg = error.message.toLowerCase();
                if (msg.includes('email')) setEmailError(error.message);
                else if (msg.includes('password') || msg.includes('credentials')) 
                    setPasswordError('Invalid email or password');
                else setGeneralError(error.message);
            } else {
                navigate('/manager/dashboard');
            }
        } catch (error) {
            setGeneralError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout image={building}>
            <div className="flex flex-col items-center">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <img src={logo} alt="Estospaces" className="h-8" />
                    <span className="text-primary font-semibold text-lg">Estospaces</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                    Sign in to continue
                </h2>
                
                <p className="text-gray-500 text-sm mb-8 text-center">
                    Enter your email and password
                </p>

                <form onSubmit={handleLogin} className="w-full">
                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError('');
                            }}
                            className={`w-full px-4 py-3 border rounded-md outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 ${
                                emailError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary'
                            }`}
                        />
                        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError('');
                                }}
                                className={`w-full px-4 py-3 pr-12 border rounded-md outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 ${
                                    passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary'
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

                <p className="text-sm text-gray-600 mt-6">
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
                    className="flex items-center gap-2 text-sm text-gray-400 mt-8 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Login options
                </button>
            </div>
        </AuthLayout>
    );
};

export default EmailLogin;

