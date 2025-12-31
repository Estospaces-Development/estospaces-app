import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('🔐 Login attempt started');
        console.log('📧 Email:', email);
        console.log('🔌 Supabase client:', supabase ? 'initialized' : 'NOT initialized');

        if (!supabase) {
            console.error('❌ Supabase is not configured');
            setError('Supabase is not configured');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('🚀 Calling signInWithPassword...');
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('📊 Sign in response:', { data, error: signInError });

            if (signInError) {
                console.error('❌ Sign in error:', signInError);
                throw signInError;
            }

            if (data.session) {
                console.log('✅ Login successful! Session:', data.session);
                navigate('/admin/chat');
            } else {
                console.warn('⚠️ No session returned');
                setError('No session returned from Supabase');
            }
        } catch (e) {
            console.error('❌ Caught error:', e);
            setError(e.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-r from-primary to-orange-600 p-3 rounded-full">
                        <LogIn className="text-white" size={32} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
                <p className="text-gray-600 text-center mb-6">Sign in to access the chat dashboard</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@estospaces.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
