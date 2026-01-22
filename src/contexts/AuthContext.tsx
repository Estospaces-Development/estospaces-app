import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { isSupabaseAvailable } from '../lib/supabase';
import authService, {
    AuthState,
    ProfileData,
    AUTH_CONFIG
} from '../services/authService';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

interface AuthContextValue {
    // State
    session: Session | null;
    user: User | null;
    profile: ProfileData | null;
    authState: AuthState;
    loading: boolean;
    profileLoading: boolean;
    error: string | null;

    // Authentication
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;

    // Computed
    isAuthenticated: boolean;
    isSupabaseConfigured: boolean;

    // Profile methods
    fetchProfile: (userId: string) => Promise<ProfileData | null>;
    updateProfile: (updates: Partial<ProfileData>) => Promise<{ data?: ProfileData; error?: string }>;
    createProfile: (profileData?: Partial<ProfileData>) => Promise<{ data?: ProfileData; error?: string } | ProfileData | null>;

    // Helpers
    getDisplayName: () => string;
    getRole: () => string;
    getAvatarUrl: () => string | null;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

// ============================================================================
// Provider
// ============================================================================

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // Core state
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [authState, setAuthState] = useState<AuthState>('loading');
    const [error, setError] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Refs to prevent duplicate operations
    const initializingRef = useRef(false);
    const mountedRef = useRef(true);

    // ========================================================================
    // Profile Operations
    // ========================================================================

    const fetchProfile = useCallback(async (userId: string): Promise<ProfileData | null> => {
        if (!userId || !mountedRef.current) return null;

        setProfileLoading(true);
        try {
            const profileData = await authService.fetchProfile(userId);
            if (mountedRef.current) {
                setProfile(profileData);
            }
            return profileData;
        } finally {
            if (mountedRef.current) {
                setProfileLoading(false);
            }
        }
    }, []);

    const updateProfile = useCallback(async (updates: Partial<ProfileData>): Promise<{ data?: ProfileData; error?: string }> => {
        if (!isSupabaseAvailable() || !user?.id) {
            return { error: 'Not authenticated' };
        }

        setProfileLoading(true);
        try {
            const { supabase } = await import('../lib/supabase');
            if (!supabase) {
                return { error: 'Supabase not available' };
            }

            const { data, error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    ...updates,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'id' })
                .select()
                .single();

            if (updateError) {
                return { error: updateError.message };
            }

            if (mountedRef.current) {
                setProfile(data as ProfileData);
            }
            return { data: data as ProfileData };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Update failed';
            return { error: message };
        } finally {
            if (mountedRef.current) {
                setProfileLoading(false);
            }
        }
    }, [user]);

    const createProfile = useCallback(async (profileData?: Partial<ProfileData>): Promise<{ data?: ProfileData; error?: string } | ProfileData | null> => {
        if (!isSupabaseAvailable() || !user?.id) {
            return { error: 'Not authenticated' };
        }

        try {
            const { supabase } = await import('../lib/supabase');
            if (!supabase) {
                return { error: 'Supabase not available' };
            }

            const { data, error: createError } = await supabase
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

            if (mountedRef.current) {
                setProfile(data as ProfileData);
            }
            return { data: data as ProfileData };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Create failed';
            return { error: message };
        }
    }, [user, fetchProfile]);

    // ========================================================================
    // Session Management
    // ========================================================================

    const refreshSession = useCallback(async () => {
        if (!mountedRef.current) return;

        const { session: freshSession, error: sessionError } = await authService.getSessionSafe();

        if (!mountedRef.current) return;

        if (sessionError) {
            setError(sessionError);
            setAuthState('error');
            return;
        }

        if (freshSession) {
            setSession(freshSession);
            setUser(freshSession.user);
            setAuthState('authenticated');
            setError(null);

            // Fetch profile in background
            fetchProfile(freshSession.user.id);
        } else if (import.meta.env.DEV) {
            // DEVELOPMENT FALLBACK: Restore mock session if Supabase fails
            console.log('⚠️ AuthContext: Refresh failed/empty. Restoring MOCK USER for development.');

            const mockUser: User = {
                id: 'mock-user-123',
                app_metadata: { provider: 'email' },
                user_metadata: {
                    full_name: 'Dev User',
                    role: 'user',
                    email: 'dev@example.com'
                },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
                email: 'dev@example.com',
                phone: '',
                confirmation_sent_at: '',
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                role: 'authenticated',
                updated_at: new Date().toISOString(),
            };

            const mockSession: Session = {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 3600,
                token_type: 'bearer',
                user: mockUser
            };

            setSession(mockSession);
            setUser(mockUser);
            setAuthState('authenticated');
            setError(null);

            // Set mock profile
            setProfile({
                id: mockUser.id,
                email: mockUser.email,
                full_name: mockUser.user_metadata.full_name,
                role: mockUser.user_metadata.role,
                phone: null,
                avatar_url: null,
                updated_at: new Date().toISOString()
            });
        } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setAuthState('unauthenticated');
            setError(null);
        }
    }, [fetchProfile]);

    const signOut = useCallback(async () => {
        const { error: signOutError } = await authService.signOut();

        if (mountedRef.current) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setAuthState('unauthenticated');

            if (signOutError) {
                setError(signOutError);
            } else {
                setError(null);
            }
        }
    }, []);

    // ========================================================================
    // Initialization
    // ========================================================================

    useEffect(() => {
        mountedRef.current = true;

        // Prevent duplicate initialization in StrictMode
        if (initializingRef.current) return;
        initializingRef.current = true;

        const initialize = async () => {
            if (!isSupabaseAvailable()) {
                setAuthState('unauthenticated');
                return;
            }

            setAuthState('loading');

            // Get initial session
            const { session: initialSession, error: sessionError } = await authService.getSessionSafe();

            if (!mountedRef.current) return;

            if (sessionError) {
                // Don't show error for initial load - user might just not be logged in
                console.warn('Initial session check warning:', sessionError);
                setSession(null);
                setUser(null);
                setAuthState('unauthenticated');
                return;
            }

            if (initialSession) {
                setSession(initialSession);
                setUser(initialSession.user);
                setAuthState('authenticated');

                // Fetch profile in background (non-blocking)
                fetchProfile(initialSession.user.id);
            } else if (import.meta.env.DEV) {
                // DEVELOPMENT FALLBACK: Create mock session if Supabase fails
                console.log('⚠️ AuthContext: Supabase not connected/authenticated. Using MOCK USER for development.');

                const mockUser: User = {
                    id: 'mock-user-123',
                    app_metadata: { provider: 'email' },
                    user_metadata: {
                        full_name: 'Dev User',
                        role: 'user',
                        email: 'dev@example.com'
                    },
                    aud: 'authenticated',
                    created_at: new Date().toISOString(),
                    email: 'dev@example.com',
                    phone: '',
                    confirmation_sent_at: '',
                    confirmed_at: new Date().toISOString(),
                    last_sign_in_at: new Date().toISOString(),
                    role: 'authenticated',
                    updated_at: new Date().toISOString(),
                };

                const mockSession: Session = {
                    access_token: 'mock-token',
                    refresh_token: 'mock-refresh-token',
                    expires_in: 3600,
                    token_type: 'bearer',
                    user: mockUser
                };

                setSession(mockSession);
                setUser(mockUser);
                setAuthState('authenticated');

                // Set mock profile
                setProfile({
                    id: mockUser.id,
                    email: mockUser.email,
                    full_name: mockUser.user_metadata.full_name,
                    role: mockUser.user_metadata.role,
                    phone: null,
                    avatar_url: null,
                    updated_at: new Date().toISOString()
                });
            } else {
                setAuthState('unauthenticated');
            }
        };

        // Set up auth state listener FIRST
        const unsubscribe = authService.onAuthStateChange(async (event, newSession) => {
            if (!mountedRef.current) return;

            console.log('🔔 Auth state change:', event);

            // Ignore token refresh events - session is still valid
            if (event === 'TOKEN_REFRESHED') {
                if (newSession) {
                    setSession(newSession);
                    setUser(newSession.user);
                }
                return;
            }

            if (event === 'SIGNED_IN' && newSession) {
                setSession(newSession);
                setUser(newSession.user);
                setAuthState('authenticated');
                setError(null);

                // Fetch profile for new sign-in
                fetchProfile(newSession.user.id);
                return;
            }

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setAuthState('unauthenticated');
                setError(null);
                return;
            }

            // Handle other events (USER_UPDATED, etc.)
            if (newSession) {
                setSession(newSession);
                setUser(newSession.user);
                setAuthState('authenticated');
            } else {
                setSession(null);
                setUser(null);
                setProfile(null);
                setAuthState('unauthenticated');
            }
        });

        // Then initialize
        initialize();

        return () => {
            mountedRef.current = false;
            unsubscribe();
        };
    }, [fetchProfile]);

    // ========================================================================
    // Helper Functions
    // ========================================================================

    const getDisplayName = useCallback((): string => {
        if (profile?.full_name) return profile.full_name;
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    }, [profile, user]);

    const getRole = useCallback((): string => {
        if (profile?.role) return profile.role;
        if (user?.user_metadata?.role) return user.user_metadata.role;
        return 'user';
    }, [profile, user]);

    const getAvatarUrl = useCallback((): string | null => {
        if (profile?.avatar_url) return profile.avatar_url;
        if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
        return null;
    }, [profile, user]);

    // ========================================================================
    // Context Value
    // ========================================================================

    const value: AuthContextValue = {
        // State
        session,
        user,
        profile,
        authState,
        loading: authState === 'loading',
        profileLoading,
        error,

        // Authentication
        signOut,
        refreshSession,

        // Computed
        isAuthenticated: authState === 'authenticated' && !!session,
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

// ============================================================================
// Hook
// ============================================================================

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Re-export types and config for convenience
export type { AuthState, ProfileData };
export { AUTH_CONFIG };

export default AuthContext;
