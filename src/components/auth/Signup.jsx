import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AuthLayout from './AuthLayout';
import logo from '../../assets/auth/logo.jpg';
import building from '../../assets/auth/building.jpg';
import { Check, X, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { 
                    data: { full_name: name },
                    emailRedirectTo: `${window.location.origin}/manager/dashboard`
                },
            });

            if (signUpError) {
                setError(signUpError.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout image={building}>
                <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    <div className="mb-8">
                        <img src={logo} alt="Estospaces" className="h-10" />
                    </div>
                    
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <Check className="text-green-600" size={32} />
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Check your email
                    </h2>
                    
                    <p className="text-gray-500 text-sm mb-8">
                        We've sent a confirmation link to<br />
                        <strong className="text-gray-800">{email}</strong>
                    </p>

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
                
                <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                    Sign up for Estospaces
                </h2>
                
                <p className="text-gray-500 text-sm mb-8 text-center">
                    Create your account to get started
                </p>

                <form onSubmit={handleSignup} className="w-full">
                    {/* Name Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors bg-white text-gray-900 placeholder-gray-400"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors bg-white text-gray-900 placeholder-gray-400"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md outline-none focus:border-primary transition-colors bg-white text-gray-900 placeholder-gray-400"
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

                <p className="text-sm text-gray-600 mt-6">
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

