/**
 * Centralized Authentication Service
 * 
 * This service provides a single source of truth for all authentication operations.
 * It implements retry logic with exponential backoff, proper error handling,
 * and ensures atomic session operations.
 */

import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { User, Session, AuthError, Provider } from '@supabase/supabase-js';

// ============================================================================
// Constants
// ============================================================================

export const AUTH_CONFIG = {
    // Timeout settings (in milliseconds)
    TIMEOUTS: {
        SESSION_CHECK: 10000,      // 10 seconds for session checks
        SIGN_IN: 30000,            // 30 seconds for sign-in operations
        PROFILE_FETCH: 8000,       // 8 seconds for profile fetches
        OAUTH_CALLBACK: 45000,     // 45 seconds for OAuth callback
    },
    // Retry settings
    RETRY: {
        MAX_ATTEMPTS: 3,
        BASE_DELAY_MS: 1000,       // 1 second base delay
        MAX_DELAY_MS: 8000,        // 8 seconds max delay
    },
    // Session settings
    SESSION: {
        SYNC_DELAY_MS: 300,        // Wait for session to sync after auth
        PROFILE_RETRY_DELAY_MS: 500, // Wait before retrying profile fetch
    },
} as const;

// ============================================================================
// Types
// ============================================================================

export type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthResult {
    success: boolean;
    session: Session | null;
    user: User | null;
    error: string | null;
    needsEmailConfirmation?: boolean;
}

export interface ProfileData {
    id: string;
    email?: string;
    full_name?: string;
    role?: string;
    phone?: string;
    avatar_url?: string;
    company_name?: string;
    bio?: string;
    location?: string;
    is_verified?: boolean;
    created_at?: string;
    updated_at?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep for a specified duration
 */
const sleep = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getBackoffDelay = (attempt: number): number => {
    const delay = AUTH_CONFIG.RETRY.BASE_DELAY_MS * Math.pow(2, attempt);
    return Math.min(delay, AUTH_CONFIG.RETRY.MAX_DELAY_MS);
};

/**
 * Check if an error is a network/timeout error that should be retried
 */
const isRetryableError = (error: unknown): boolean => {
    if (!error) return false;
    const err = error as { message?: string; name?: string; code?: string };
    const message = (err.message || '').toLowerCase();
    const name = (err.name || '').toLowerCase();
    
    return (
        name === 'aborterror' ||
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('fetch') ||
        message.includes('aborted') ||
        message.includes('failed to fetch') ||
        message.includes('connection')
    );
};

/**
 * Check if error is an abort error (should be silently ignored)
 */
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

/**
 * Create a promise that rejects after a timeout
 */
const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number,
    operationName: string
): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        promise
            .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
};

/**
 * Get a user-friendly error message
 */
const getErrorMessage = (error: unknown): string => {
    if (!error) return 'An unknown error occurred';
    
    const err = error as { message?: string; code?: string };
    const message = (err.message || '').toLowerCase();
    
    if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
        return 'Invalid email or password. Please check your credentials.';
    }
    if (message.includes('email not confirmed')) {
        return 'Please verify your email before signing in.';
    }
    if (message.includes('user not found')) {
        return 'No account found with this email. Please sign up first.';
    }
    if (message.includes('too many requests') || message.includes('rate limit')) {
        return 'Too many attempts. Please wait a moment and try again.';
    }
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return 'Network error. Please check your internet connection.';
    }
    if (message.includes('timeout')) {
        return 'Request timed out. Please try again.';
    }
    
    return err.message || 'An error occurred during authentication';
};

// ============================================================================
// Core Authentication Functions
// ============================================================================

/**
 * Get current session with timeout and retry
 */
export const getSessionSafe = async (): Promise<{ session: Session | null; error: string | null }> => {
    if (!isSupabaseAvailable() || !supabase) {
        return { session: null, error: 'Authentication service not configured' };
    }

    for (let attempt = 0; attempt < AUTH_CONFIG.RETRY.MAX_ATTEMPTS; attempt++) {
        try {
            const { data, error } = await withTimeout(
                supabase.auth.getSession(),
                AUTH_CONFIG.TIMEOUTS.SESSION_CHECK,
                'Session check'
            );

            if (error) {
                if (isAbortError(error)) {
                    return { session: null, error: null };
                }
                throw error;
            }

            return { session: data.session, error: null };
        } catch (error) {
            if (isAbortError(error)) {
                return { session: null, error: null };
            }
            
            if (attempt < AUTH_CONFIG.RETRY.MAX_ATTEMPTS - 1 && isRetryableError(error)) {
                await sleep(getBackoffDelay(attempt));
                continue;
            }
            
            console.error('Session check failed:', error);
            return { session: null, error: getErrorMessage(error) };
        }
    }

    return { session: null, error: 'Failed to check session after multiple attempts' };
};

/**
 * Sign in with email and password
 * Implements retry logic with exponential backoff
 */
export const signInWithEmail = async (
    email: string,
    password: string
): Promise<AuthResult> => {
    if (!isSupabaseAvailable() || !supabase) {
        return {
            success: false,
            session: null,
            user: null,
            error: 'Authentication service not configured',
        };
    }

    console.log('🔐 AuthService: Starting email sign-in...');

    for (let attempt = 0; attempt < AUTH_CONFIG.RETRY.MAX_ATTEMPTS; attempt++) {
        try {
            const startTime = Date.now();
            
            const { data, error } = await withTimeout(
                supabase.auth.signInWithPassword({ email, password }),
                AUTH_CONFIG.TIMEOUTS.SIGN_IN,
                'Sign-in'
            );

            const duration = Date.now() - startTime;
            console.log(`⏱️ Sign-in attempt ${attempt + 1} took ${duration}ms`);

            if (error) {
                // Don't retry auth errors (wrong password, etc.)
                if (!isRetryableError(error)) {
                    console.error('❌ Auth error (not retryable):', error.message);
                    return {
                        success: false,
                        session: null,
                        user: null,
                        error: getErrorMessage(error),
                    };
                }
                throw error;
            }

            if (!data.session || !data.user) {
                throw new Error('No session returned from sign-in');
            }

            // Wait for session to sync
            await sleep(AUTH_CONFIG.SESSION.SYNC_DELAY_MS);

            // Verify session was persisted
            const { session: verifiedSession } = await getSessionSafe();
            
            if (!verifiedSession) {
                console.warn('⚠️ Session not found after sign-in, retrying...');
                if (attempt < AUTH_CONFIG.RETRY.MAX_ATTEMPTS - 1) {
                    await sleep(getBackoffDelay(attempt));
                    continue;
                }
            }

            console.log('✅ Sign-in successful:', data.user.email);

            // Ensure profile exists
            await ensureProfile(data.user);

            return {
                success: true,
                session: data.session,
                user: data.user,
                error: null,
            };
        } catch (error) {
            if (isAbortError(error)) {
                return { success: false, session: null, user: null, error: null };
            }

            console.error(`❌ Sign-in attempt ${attempt + 1} failed:`, error);

            if (attempt < AUTH_CONFIG.RETRY.MAX_ATTEMPTS - 1 && isRetryableError(error)) {
                const delay = getBackoffDelay(attempt);
                console.log(`⏳ Retrying in ${delay}ms...`);
                await sleep(delay);
                continue;
            }

            return {
                success: false,
                session: null,
                user: null,
                error: getErrorMessage(error),
            };
        }
    }

    return {
        success: false,
        session: null,
        user: null,
        error: 'Sign-in failed after multiple attempts. Please try again.',
    };
};

/**
 * Sign in with OAuth provider (Google, etc.)
 */
export const signInWithOAuth = async (
    provider: Provider = 'google'
): Promise<{ success: boolean; error: string | null }> => {
    if (!isSupabaseAvailable() || !supabase) {
        return { success: false, error: 'Authentication service not configured' };
    }

    console.log(`🔐 AuthService: Starting ${provider} OAuth sign-in...`);

    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('❌ OAuth error:', error);
            return { success: false, error: getErrorMessage(error) };
        }

        // OAuth redirects, so we won't reach here on success
        return { success: true, error: null };
    } catch (error) {
        console.error('❌ OAuth exception:', error);
        return { success: false, error: getErrorMessage(error) };
    }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
    email: string,
    password: string,
    metadata: { full_name?: string; role?: string } = {}
): Promise<AuthResult> => {
    if (!isSupabaseAvailable() || !supabase) {
        return {
            success: false,
            session: null,
            user: null,
            error: 'Authentication service not configured',
        };
    }

    console.log('📝 AuthService: Starting email sign-up...');

    try {
        const { data, error } = await withTimeout(
            supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            }),
            AUTH_CONFIG.TIMEOUTS.SIGN_IN,
            'Sign-up'
        );

        if (error) {
            console.error('❌ Sign-up error:', error);
            return {
                success: false,
                session: null,
                user: null,
                error: getErrorMessage(error),
            };
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
            return {
                success: true,
                session: null,
                user: data.user,
                error: null,
                needsEmailConfirmation: true,
            };
        }

        if (data.session && data.user) {
            await sleep(AUTH_CONFIG.SESSION.SYNC_DELAY_MS);
            console.log('✅ Sign-up successful (auto-confirmed):', data.user.email);
            
            return {
                success: true,
                session: data.session,
                user: data.user,
                error: null,
            };
        }

        return {
            success: false,
            session: null,
            user: null,
            error: 'Sign-up failed. Please try again.',
        };
    } catch (error) {
        console.error('❌ Sign-up exception:', error);
        return {
            success: false,
            session: null,
            user: null,
            error: getErrorMessage(error),
        };
    }
};

/**
 * Handle OAuth callback
 * Implements a state machine approach for reliable callback processing
 */
export const handleOAuthCallback = async (): Promise<AuthResult> => {
    if (!isSupabaseAvailable() || !supabase) {
        return {
            success: false,
            session: null,
            user: null,
            error: 'Authentication service not configured',
        };
    }

    console.log('🔄 AuthService: Processing OAuth callback...');

    // Check for error in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    
    const urlError = hashParams.get('error') || searchParams.get('error');
    const urlErrorDescription = hashParams.get('error_description') || searchParams.get('error_description');
    
    if (urlError) {
        console.error('❌ OAuth error from URL:', urlError, urlErrorDescription);
        return {
            success: false,
            session: null,
            user: null,
            error: urlErrorDescription || 'Authentication failed',
        };
    }

    // Try to get session with retries
    for (let attempt = 0; attempt < AUTH_CONFIG.RETRY.MAX_ATTEMPTS + 2; attempt++) {
        try {
            // Give Supabase time to process the callback
            if (attempt > 0) {
                await sleep(AUTH_CONFIG.SESSION.SYNC_DELAY_MS * (attempt + 1));
            }

            const { data, error } = await withTimeout(
                supabase.auth.getSession(),
                AUTH_CONFIG.TIMEOUTS.SESSION_CHECK,
                'OAuth session check'
            );

            if (error) {
                if (isAbortError(error)) {
                    continue;
                }
                throw error;
            }

            if (data.session) {
                console.log('✅ OAuth callback successful:', data.session.user.email);
                
                // Ensure profile exists
                await ensureProfile(data.session.user);
                
                return {
                    success: true,
                    session: data.session,
                    user: data.session.user,
                    error: null,
                };
            }

            console.log(`⏳ Session not ready, attempt ${attempt + 1}...`);
        } catch (error) {
            if (isAbortError(error)) continue;
            console.error(`❌ OAuth callback attempt ${attempt + 1} failed:`, error);
        }
    }

    return {
        success: false,
        session: null,
        user: null,
        error: 'Failed to complete sign-in. Please try again.',
    };
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ success: boolean; error: string | null }> => {
    if (!isSupabaseAvailable() || !supabase) {
        // Clear any local storage even if Supabase isn't configured
        try {
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
        } catch { /* ignore */ }
        return { success: true, error: null };
    }

    console.log('👋 AuthService: Signing out...');

    try {
        const { error } = await supabase.auth.signOut();
        
        // Clear additional local storage
        try {
            localStorage.removeItem('managerVerified');
            localStorage.removeItem('leads');
        } catch { /* ignore */ }

        if (error) {
            console.error('❌ Sign-out error:', error);
            return { success: false, error: getErrorMessage(error) };
        }

        console.log('✅ Sign-out successful');
        return { success: true, error: null };
    } catch (error) {
        console.error('❌ Sign-out exception:', error);
        return { success: false, error: getErrorMessage(error) };
    }
};

// ============================================================================
// Profile Functions
// ============================================================================

/**
 * Ensure user profile exists, create if missing
 */
export const ensureProfile = async (user: User): Promise<ProfileData | null> => {
    if (!isSupabaseAvailable() || !supabase || !user) {
        return null;
    }

    console.log('👤 AuthService: Ensuring profile exists...');

    for (let attempt = 0; attempt < AUTH_CONFIG.RETRY.MAX_ATTEMPTS; attempt++) {
        try {
            // Try to fetch existing profile with timeout
            const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            const { data: existingProfile, error: fetchError } = await withTimeout(
                profilePromise as unknown as Promise<{ data: ProfileData | null; error: { code?: string; message?: string } | null }>,
                AUTH_CONFIG.TIMEOUTS.PROFILE_FETCH,
                'Profile fetch'
            ) as { data: ProfileData | null; error: { code?: string; message?: string } | null };

            if (existingProfile && !fetchError) {
                console.log('✅ Profile found');
                return existingProfile;
            }

            // Profile doesn't exist, create it
            if (fetchError?.code === 'PGRST116') {
                console.log('📝 Creating new profile...');
                
                const newProfile: Partial<ProfileData> = {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || '',
                    role: user.user_metadata?.role || 'user',
                };

                const { data: createdProfile, error: createError } = await supabase
                    .from('profiles')
                    .upsert(newProfile, { onConflict: 'id' })
                    .select()
                    .single();

                if (createError) {
                    // Profile might have been created by trigger, retry fetch
                    if (createError.code === '23505') {
                        await sleep(AUTH_CONFIG.SESSION.PROFILE_RETRY_DELAY_MS);
                        continue;
                    }
                    throw createError;
                }

                console.log('✅ Profile created');
                return createdProfile as ProfileData;
            }

            throw fetchError;
        } catch (error) {
            if (isAbortError(error)) {
                return null;
            }

            console.error(`❌ Profile operation attempt ${attempt + 1} failed:`, error);
            
            if (attempt < AUTH_CONFIG.RETRY.MAX_ATTEMPTS - 1) {
                await sleep(AUTH_CONFIG.SESSION.PROFILE_RETRY_DELAY_MS);
                continue;
            }
        }
    }

    // Profile operations are non-blocking, return null on failure
    console.warn('⚠️ Could not ensure profile, continuing without it');
    return null;
};

/**
 * Fetch user profile
 */
export const fetchProfile = async (userId: string): Promise<ProfileData | null> => {
    if (!isSupabaseAvailable() || !supabase || !userId) {
        return null;
    }

    try {
        const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        const { data, error } = await withTimeout(
            profilePromise as unknown as Promise<{ data: ProfileData | null; error: { code?: string; message?: string } | null }>,
            AUTH_CONFIG.TIMEOUTS.PROFILE_FETCH,
            'Profile fetch'
        ) as { data: ProfileData | null; error: { code?: string; message?: string } | null };

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Profile not found
            }
            throw error;
        }

        return data as ProfileData;
    } catch (error) {
        if (!isAbortError(error)) {
            console.error('❌ Profile fetch failed:', error);
        }
        return null;
    }
};

/**
 * Get user role from session/profile
 */
export const getUserRole = async (user: User | null): Promise<string> => {
    if (!user) return 'user';

    // First check user_metadata (instant)
    const metadataRole = user.user_metadata?.role;
    if (metadataRole) {
        return metadataRole;
    }

    // Then check profile
    try {
        const profile = await fetchProfile(user.id);
        if (profile?.role) {
            return profile.role;
        }
    } catch {
        // Fallback to default
    }

    return 'user';
};

/**
 * Get redirect path based on user role
 */
export const getRedirectPath = (role: string, fromPath?: string | null): string => {
    if (fromPath) return fromPath;
    
    switch (role) {
        case 'admin':
            return '/admin/verifications';
        case 'manager':
            return '/manager/dashboard';
        default:
            return '/user/dashboard';
    }
};

// ============================================================================
// Auth State Subscription
// ============================================================================

export type AuthStateCallback = (
    event: string,
    session: Session | null
) => void;

/**
 * Subscribe to auth state changes
 * Returns unsubscribe function
 */
export const onAuthStateChange = (callback: AuthStateCallback): (() => void) => {
    if (!isSupabaseAvailable() || !supabase) {
        return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });

    return () => {
        subscription.unsubscribe();
    };
};

// Default export
const authService = {
    // Config
    AUTH_CONFIG,
    
    // Session
    getSessionSafe,
    
    // Authentication
    signInWithEmail,
    signInWithOAuth,
    signUpWithEmail,
    handleOAuthCallback,
    signOut,
    
    // Profile
    ensureProfile,
    fetchProfile,
    getUserRole,
    getRedirectPath,
    
    // Subscription
    onAuthStateChange,
};

export default authService;
