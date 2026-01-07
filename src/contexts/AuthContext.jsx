import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if Supabase is configured
        if (!isSupabaseAvailable()) {
            console.warn('Supabase is not configured. Auth features will not work.');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error('Error getting session:', error);
                setError(error.message);
            } else {
                setSession(data.session);
                setUser(data.session?.user ?? null);
            }
            setLoading(false);
        }).catch((err) => {
            console.error('Failed to get session:', err);
            setError('Failed to initialize authentication');
            setLoading(false);
        });

        // Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('Auth state changed:', event);
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                setError(null);
            }
        );

        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        if (!isSupabaseAvailable()) {
            console.warn('Supabase is not configured');
            return;
        }
        
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setSession(null);
            setUser(null);
        } catch (err) {
            console.error('Sign out error:', err);
            setError(err.message);
        }
    };

    const value = {
        session,
        user,
        loading,
        error,
        signOut,
        isAuthenticated: !!session,
        isSupabaseConfigured: isSupabaseAvailable(),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

