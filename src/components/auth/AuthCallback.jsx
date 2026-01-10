import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleAuthCallback = async () => {
            if (!isSupabaseAvailable()) {
                setError('Authentication service is not configured.');
                setTimeout(() => navigate('/auth/login'), 2000);
                return;
            }

            try {
                // Get the session after OAuth callback
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setError('Authentication failed. Please try again.');
                    setTimeout(() => navigate('/auth/login'), 2000);
                    return;
                }

                if (!session) {
                    // No session, redirect to login
                    navigate('/auth/login', { replace: true });
                    return;
                }

                // Get user role from metadata
                const userRole = session.user?.user_metadata?.role;
                let role = userRole;

                // If no role in metadata, check profile
                if (!role) {
                    try {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', session.user.id)
                            .single();
                        role = profile?.role || 'user';
                    } catch {
                        role = 'user';
                    }
                }

                // Redirect based on role
                if (role === 'manager') {
                    navigate('/manager/dashboard', { replace: true });
                } else {
                    navigate('/user/dashboard', { replace: true });
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setError('An error occurred. Redirecting to login...');
                setTimeout(() => navigate('/auth/login'), 2000);
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                {error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Completing sign in...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
