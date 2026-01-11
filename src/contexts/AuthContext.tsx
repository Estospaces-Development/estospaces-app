import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

// Auth timeout constants - Generous for production stability
const AUTH_TIMEOUT_MS = 15000; // 15 seconds max for initial session check
const PROFILE_TIMEOUT_MS = 10000; // 10 seconds max for profile fetch

// Helper to check if error is an AbortError (should be silently ignored)
const isAbortError = (error: unknown): boolean => {
    if (!error) return false;
    const err = error as { name?: string; message?: string; code?: string };
    return (
        err.name === 'AbortError' ||
        err.message?.includes('aborted') ||
        err.message?.includes('AbortError') ||
        err.code === 'ABORT_ERR'
    );
};

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
                    return null;
                }
                return null;
            }

            setProfile(data);
            return data;
        } catch {
            return null;
        } finally {
            setProfileLoading(false);
        }
    }, []);

    // Update user profile (uses upsert for reliability)
    const updateProfile = async (updates: Partial<Profile>): Promise<{ data?: Profile; error?: string }> => {
        if (!isSupabaseAvailable() || !supabase || !user?.id) {
            setError('Cannot update profile: not authenticated');
            return { error: 'Not authenticated' };
        }

        setProfileLoading(true);
        try {
            // Use upsert to create profile if it doesn't exist, or update if it does
            const { data, error: updateError } = await (supabase as SupabaseClient)
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    ...updates,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'id'
                })
                .select()
                .single();

            if (updateError) {
                setError(updateError.message);
                return { error: updateError.message };
            }

            setProfile(data);
            return { data };
        } catch (err: any) {
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
                return { error: createError.message };
            }

            setProfile(data);
            return { data };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    useEffect(() => {
        let isMounted = true;
        let authListener: { subscription: { unsubscribe: () => void } } | null = null;

        // Check if Supabase is configured
        if (!isSupabaseAvailable() || !supabase) {
            setLoading(false);
            return;
        }

        // Helper function to get session with timeout
        const getSessionWithTimeout = async (): Promise<{ data: { session: Session | null }; error: Error | null }> => {
            return new Promise((resolve) => {
                const timeoutId = setTimeout(() => {
                    resolve({ data: { session: null }, error: new Error('Session check timeout') });
                }, AUTH_TIMEOUT_MS);

                (supabase as SupabaseClient).auth.getSession()
                    .then((result) => {
                        clearTimeout(timeoutId);
                        if (!isMounted) {
                            resolve({ data: { session: null }, error: null });
                            return;
                        }
                        resolve(result as { data: { session: Session | null }; error: Error | null });
                    })
                    .catch((err) => {
                        clearTimeout(timeoutId);
                        // Silently handle abort errors
                        if (isAbortError(err)) {
                            resolve({ data: { session: null }, error: null });
                            return;
                        }
                        resolve({ data: { session: null }, error: err });
                    });
            });
        };

        // Get initial session with timeout protection
        const initSession = async () => {
            try {
                const { data, error: sessionError } = await getSessionWithTimeout();
                
                if (!isMounted) return;

                if (sessionError) {
                    // Session check failed or timed out
                    // This is OK on initial load - user may not be logged in
                    setError(null); // Don't show error to user for initial check
                    setSession(null);
                    setUser(null);
                    setLoading(false);
                    return;
                }

                if (!data.session) {
                    // No session found - user is not logged in
                    setSession(null);
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // Session exists - update state
                setSession(data.session);
                setUser(data.session.user);
                
                // Fetch profile if user is logged in (with timeout, but don't block)
                if (data.session.user && isMounted) {
                    // Use a separate try-catch to not block loading state
                    try {
                        const profileTimeoutPromise = new Promise<null>((resolve) => {
                            setTimeout(() => resolve(null), PROFILE_TIMEOUT_MS);
                        });
                        const profilePromise = fetchProfile(data.session.user.id);
                        await Promise.race([profilePromise, profileTimeoutPromise]);
                    } catch {
                        // Profile fetch failed - continue without profile
                        // This is OK - we still have the session
                    }
                }
                
                if (isMounted) {
                    setLoading(false);
                }
            } catch {
                // Unexpected error during session check
                if (isMounted) {
                    setError(null);
                    setSession(null);
                    setUser(null);
                    setLoading(false);
                }
            }
        };

        initSession();

        // Listen for auth changes
        try {
            const { data: listener } = (supabase as SupabaseClient).auth.onAuthStateChange(
                async (event: string, currentSession: Session | null) => {
                    if (!isMounted) return;

                    setSession(currentSession);
                    setUser(currentSession?.user ?? null);
                    setLoading(false);
                    setError(null);

                    // Fetch profile when user signs in
                    if (event === 'SIGNED_IN' && currentSession?.user) {
                        try {
                            await fetchProfile(currentSession.user.id);
                        } catch {
                            // Profile fetch failed - continue
                        }
                    }

                    // Clear profile when user signs out
                    if (event === 'SIGNED_OUT') {
                        setProfile(null);
                    }
                }
            );
            authListener = listener;
        } catch {
            // Auth listener setup failed
        }

        return () => {
            isMounted = false;
            authListener?.subscription?.unsubscribe();
        };
    }, [fetchProfile]);

    const signOut = async () => {
        if (!isSupabaseAvailable() || !supabase) {
            // Clear local state even if Supabase is not configured
            setSession(null);
            setUser(null);
            setProfile(null);
            // Clear localStorage
            localStorage.removeItem('managerVerified');
            return;
        }
        
        try {
            const { error: signOutError } = await (supabase as SupabaseClient).auth.signOut();
            if (signOutError) throw signOutError;
            
            // Clear state
            setSession(null);
            setUser(null);
            setProfile(null);
            
            // Clear localStorage
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
        } catch (err: any) {
            // Even on error, clear local state
            setSession(null);
            setUser(null);
            setProfile(null);
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
            setError(err.message);
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
