import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AuthLayout from './AuthLayout';
import logo from '../../assets/auth/logo.jpg';
import building from '../../assets/auth/building.jpg';
import { ArrowLeft, Check } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });

            if (resetError) {
                setError(resetError.message);
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
                        Password reset link sent to<br />
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
                    Reset Your Password
                </h2>
                
                <p className="text-gray-500 text-sm mb-8 text-center">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleReset} className="w-full">
                    {/* Email Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            className={`w-full px-4 py-3 border rounded-md outline-none transition-colors bg-white text-gray-900 placeholder-gray-400 ${
                                error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-primary'
                            }`}
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/auth/sign-in-email')}
                    className="flex items-center gap-2 text-sm text-gray-400 mt-8 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Sign In
                </button>
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;

