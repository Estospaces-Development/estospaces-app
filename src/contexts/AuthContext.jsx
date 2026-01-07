import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user profile from profiles table
    const fetchProfile = useCallback(async (userId) => {
        if (!isSupabaseAvailable() || !userId) {
            return null;
        }

        setProfileLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // If profile doesn't exist, it might not have been created yet
                if (error.code === 'PGRST116') {
                    console.log('Profile not found, may need to be created');
                    return null;
                }
                console.error('Error fetching profile:', error);
                return null;
            }

            setProfile(data);
            return data;
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            return null;
        } finally {
            setProfileLoading(false);
        }
    }, []);

    // Update user profile
    const updateProfile = async (updates) => {
        if (!isSupabaseAvailable() || !user?.id) {
            setError('Cannot update profile: not authenticated');
            return { error: 'Not authenticated' };
        }

        setProfileLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating profile:', error);
                setError(error.message);
                return { error: error.message };
            }

            setProfile(data);
            return { data };
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.message);
            return { error: err.message };
        } finally {
            setProfileLoading(false);
        }
    };

    // Create profile if it doesn't exist
    const createProfile = async (profileData) => {
        if (!isSupabaseAvailable() || !user?.id) {
            return { error: 'Not authenticated' };
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: profileData?.full_name || user.user_metadata?.full_name || '',
                    role: profileData?.role || user.user_metadata?.role || 'user',
                    ...profileData,
                })
                .select()
                .single();

            if (error) {
                // Profile might already exist
                if (error.code === '23505') {
                    // Fetch existing profile instead
                    return await fetchProfile(user.id);
                }
                console.error('Error creating profile:', error);
                return { error: error.message };
            }

            setProfile(data);
            return { data };
        } catch (err) {
            console.error('Failed to create profile:', err);
            return { error: err.message };
        }
    };

    useEffect(() => {
        // Check if Supabase is configured
        if (!isSupabaseAvailable()) {
            console.warn('Supabase is not configured. Auth features will not work.');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(async ({ data, error }) => {
            if (error) {
                console.error('Error getting session:', error);
                setError(error.message);
            } else {
                setSession(data.session);
                setUser(data.session?.user ?? null);
                
                // Fetch profile if user is logged in
                if (data.session?.user) {
                    await fetchProfile(data.session.user.id);
                }
            }
            setLoading(false);
        }).catch((err) => {
            console.error('Failed to get session:', err);
            setError('Failed to initialize authentication');
            setLoading(false);
        });

        // Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                setError(null);

                // Fetch profile when user signs in
                if (event === 'SIGNED_IN' && session?.user) {
                    await fetchProfile(session.user.id);
                }

                // Clear profile when user signs out
                if (event === 'SIGNED_OUT') {
                    setProfile(null);
                }
            }
        );

        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, [fetchProfile]);

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
            setProfile(null);
        } catch (err) {
            console.error('Sign out error:', err);
            setError(err.message);
        }
    };

    // Get display name from profile or user metadata
    const getDisplayName = () => {
        if (profile?.full_name) return profile.full_name;
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    // Get user role
    const getRole = () => {
        if (profile?.role) return profile.role;
        if (user?.user_metadata?.role) return user.user_metadata.role;
        return 'user';
    };

    // Get avatar URL
    const getAvatarUrl = () => {
        if (profile?.avatar_url) return profile.avatar_url;
        if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
        return null;
    };

    const value = {
        session,
        user,
        profile,
        loading,
        profileLoading,
        error,
        signOut,
        isAuthenticated: !!session,
        isSupabaseConfigured: isSupabaseAvailable(),
        // Profile methods
        fetchProfile,
        updateProfile,
        createProfile,
        // Helpers
        getDisplayName,
        getRole,
        getAvatarUrl,
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
