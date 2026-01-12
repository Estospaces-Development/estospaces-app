import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

// Profile type
export interface Profile {
    id: string;
    email?: string;
    full_name?: string;
    phone?: string;
    location?: string;
    bio?: string;
    company_name?: string;
    role?: string;
    avatar_url?: string;
    is_verified?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Auth context value type
interface AuthContextValue {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    profileLoading: boolean;
    error: string | null;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    isSupabaseConfigured: boolean;
    fetchProfile: (userId: string) => Promise<Profile | null>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ data?: Profile; error?: string }>;
    createProfile: (profileData?: Partial<Profile>) => Promise<{ data?: Profile; error?: string } | Profile | null>;
    getDisplayName: () => string;
    getRole: () => string;
    getAvatarUrl: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile from profiles table
    const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
        if (!isSupabaseAvailable() || !supabase || !userId) {
            return null;
        }

        setProfileLoading(true);
        try {
            const { data, error: fetchError } = await (supabase as SupabaseClient)
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (fetchError) {
                // If profile doesn't exist, it might not have been created yet
                if (fetchError.code === 'PGRST116') {
                    console.log('Profile not found, may need to be created');
                    return null;
                }
                console.error('Error fetching profile:', fetchError);
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
    const updateProfile = async (updates: Partial<Profile>): Promise<{ data?: Profile; error?: string }> => {
        if (!isSupabaseAvailable() || !supabase || !user?.id) {
            setError('Cannot update profile: not authenticated');
            return { error: 'Not authenticated' };
        }

        setProfileLoading(true);
        try {
            const { data, error: updateError } = await (supabase as SupabaseClient)
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating profile:', updateError);
                setError(updateError.message);
                return { error: updateError.message };
            }

            setProfile(data);
            return { data };
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            setError(err.message);
            return { error: err.message };
        } finally {
            setProfileLoading(false);
        }
    };

    // Create profile if it doesn't exist
    const createProfile = async (profileData?: Partial<Profile>): Promise<{ data?: Profile; error?: string } | Profile | null> => {
        if (!isSupabaseAvailable() || !supabase || !user?.id) {
            return { error: 'Not authenticated' };
        }

        try {
            const { data, error: createError } = await (supabase as SupabaseClient)
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

            if (createError) {
                // Profile might already exist
                if (createError.code === '23505') {
                    // Fetch existing profile instead
                    return await fetchProfile(user.id);
                }
                console.error('Error creating profile:', createError);
                return { error: createError.message };
            }

            setProfile(data);
            return { data };
        } catch (err: any) {
            console.error('Failed to create profile:', err);
            return { error: err.message };
        }
    };

    useEffect(() => {
        // Check if Supabase is configured
        if (!isSupabaseAvailable() || !supabase) {
            console.warn('Supabase is not configured. Auth features will not work.');
            setLoading(false);
            return;
        }

        // Get initial session - no timeout, just let it complete
        const getInitialSession = async () => {
            try {
                const { data, error: sessionError } = await (supabase as SupabaseClient).auth.getSession();
                
                if (sessionError) {
                    console.error('Error getting session:', sessionError);
                    // Don't set error - just continue, auth listener will handle it
                } else {
                    console.log('Session loaded:', data.session ? 'Authenticated' : 'No session');
                    setSession(data.session);
                    setUser(data.session?.user ?? null);
                    
                    // Fetch profile if user is logged in
                    if (data.session?.user) {
                        // Don't await - let it happen in background
                        fetchProfile(data.session.user.id).catch(err => {
                            console.log('Profile fetch failed, continuing...', err);
                        });
                    }
                }
            } catch (err: any) {
                console.error('Failed to get session:', err);
                // Don't block - just continue
            } finally {
                setLoading(false);
            }
        };
        
        getInitialSession();

        // Listen for auth changes
        const { data: listener } = (supabase as SupabaseClient).auth.onAuthStateChange(
            async (event: any, currentSession: Session | null) => {
                console.log('Auth state changed:', event);
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setLoading(false);
                setError(null);

                // Fetch profile when user signs in
                if (event === 'SIGNED_IN' && currentSession?.user) {
                    await fetchProfile(currentSession.user.id);
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
        // Clear state first
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Clear ALL auth-related storage
        try {
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('sb-yydtsteyknbpfpxjtlxe-auth-token');
            localStorage.removeItem('estospaces-auth-token');
            
            // Clear any keys that contain 'supabase' or 'auth'
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            sessionStorage.clear();
        } catch (e) {
            // Ignore storage errors
        }
        
        // Sign out from Supabase if available
        if (isSupabaseAvailable() && supabase) {
            try {
                await (supabase as SupabaseClient).auth.signOut();
            } catch (err: any) {
                console.error('Sign out error:', err);
                // Don't throw - we've already cleared local state
            }
        }
    };

    // Get display name from profile or user metadata
    const getDisplayName = (): string => {
        if (profile?.full_name) return profile.full_name;
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    // Get user role
    const getRole = (): string => {
        if (profile?.role) return profile.role;
        if (user?.user_metadata?.role) return user.user_metadata.role;
        return 'user';
    };

    // Get avatar URL
    const getAvatarUrl = (): string | null => {
        if (profile?.avatar_url) return profile.avatar_url;
        if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
        return null;
    };

    const value: AuthContextValue = {
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

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
