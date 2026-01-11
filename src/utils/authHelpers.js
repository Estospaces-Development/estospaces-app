import { supabase, isSupabaseAvailable } from '../lib/supabase';

// Constants for timeouts - Very generous for slow connections
export const AUTH_TIMEOUTS = {
  SESSION_CHECK: 10000,     // 10 seconds for session checks
  SIGN_IN: 60000,           // 60 seconds for sign-in operations (very generous for slow networks)
  PROFILE_FETCH: 10000,     // 10 seconds for profile fetches
  OAUTH_INIT: 30000,        // 30 seconds for OAuth initialization
};

/**
 * Check if an error is an abort error (should be silently ignored)
 */
const isAbortError = (error) => {
  if (!error) return false;
  return (
    error.name === 'AbortError' ||
    error.message?.includes('aborted') ||
    error.message?.includes('AbortError') ||
    error.code === 'ABORT_ERR'
  );
};

/**
 * Wrap a promise with timeout, returning a safe result
 * Handles AbortErrors gracefully without throwing
 */
const withTimeout = async (promise, timeoutMs, operationName = 'Operation') => {
  let timeoutId;
  let completed = false;

  // Wrap the original promise to catch any errors (including abort errors)
  // even if they occur after the race completes
  const wrappedPromise = promise.catch((error) => {
    // If the operation already completed (timeout won), silently ignore this error
    if (completed) {
      return null;
    }
    // Otherwise, handle the error
    if (isAbortError(error)) {
      return {
        data: { session: null, user: null },
        error: null,
        aborted: true
      };
    }
    throw error;
  });

  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      completed = true;
      resolve({
        data: { session: null, user: null },
        error: { message: `${operationName} is taking too long. Please try again.` },
        timedOut: true
      });
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([wrappedPromise, timeoutPromise]);
    completed = true;
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    completed = true;
    clearTimeout(timeoutId);
    // Silently handle abort errors - these happen on component unmount
    if (isAbortError(error)) {
      return {
        data: { session: null, user: null },
        error: null,
        aborted: true
      };
    }
    return {
      data: { session: null, user: null },
      error: { message: error.message || `${operationName} failed` }
    };
  }
};

/**
 * Get session with timeout protection
 * Prevents hanging authentication calls that can cause infinite loading
 */
export const getSessionWithTimeout = async (timeoutMs = AUTH_TIMEOUTS.SESSION_CHECK) => {
  if (!isSupabaseAvailable()) {
    return {
      data: { session: null },
      error: { message: 'Authentication service not configured' },
    };
  }

  try {
    const result = await withTimeout(
      supabase.auth.getSession(),
      timeoutMs,
      'Session check'
    );

    // Handle aborted requests silently
    if (result.aborted) {
      return { data: { session: null }, error: null };
    }

    return result;
  } catch (error) {
    // Handle any uncaught abort errors
    if (isAbortError(error)) {
      return { data: { session: null }, error: null };
    }
    return {
      data: { session: null },
      error: { message: error.message || 'Authentication failed' },
    };
  }
};

/**
 * Sign in with email/password with timeout protection
 * Prevents hanging on slow networks or backend delays
 */
export const signInWithTimeout = async (email, password, timeoutMs = AUTH_TIMEOUTS.SIGN_IN) => {
  if (!isSupabaseAvailable()) {
    console.error('❌ Supabase not available for sign in');
    return {
      data: { session: null, user: null },
      error: { message: 'Authentication service not configured' },
    };
  }

  console.log('🔑 Calling Supabase signInWithPassword...');

  try {
    const result = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      timeoutMs,
      'Sign-in'
    );

    console.log('📬 Sign in result:', {
      hasData: !!result.data,
      hasSession: !!result.data?.session,
      hasUser: !!result.data?.user,
      hasError: !!result.error,
      timedOut: result.timedOut,
      aborted: result.aborted
    });

    // Handle aborted requests silently
    if (result.aborted) {
      return { data: { session: null, user: null }, error: null };
    }

    return result;
  } catch (error) {
    console.error('❌ Sign in exception:', error);
    if (isAbortError(error)) {
      return { data: { session: null, user: null }, error: null };
    }
    return {
      data: { session: null, user: null },
      error: { message: error.message || 'Sign-in failed' },
    };
  }
};

/**
 * Fetch user profile with timeout protection
 */
export const fetchProfileWithTimeout = async (userId, timeoutMs = AUTH_TIMEOUTS.PROFILE_FETCH) => {
  if (!isSupabaseAvailable() || !userId) {
    return { data: null, error: { message: 'Cannot fetch profile' } };
  }

  try {
    const result = await withTimeout(
      supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single(),
      timeoutMs,
      'Profile fetch'
    );

    // Handle aborted requests silently
    if (result.aborted) {
      return { data: null, error: null };
    }

    return result;
  } catch (error) {
    if (isAbortError(error)) {
      return { data: null, error: null };
    }
    return { data: null, error: { message: error.message || 'Failed to fetch profile' } };
  }
};

/**
 * Get user role from session and profile with fallbacks
 */
export const getUserRole = async (user, timeoutMs = AUTH_TIMEOUTS.PROFILE_FETCH) => {
  if (!user) return 'user';

  // First check user_metadata
  const metadataRole = user.user_metadata?.role;
  if (metadataRole) {
    // Debug logging (only in development)
    if (typeof window !== 'undefined' && window.import?.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.log('Role from user_metadata:', metadataRole);
    }
    return metadataRole;
  }

  // Then check profile
  try {
    const { data: profile, error } = await fetchProfileWithTimeout(user.id, timeoutMs);
    if (!error && profile?.role) {
      // Debug logging (only in development)
      if (typeof window !== 'undefined' && window.import?.meta?.env?.DEV) {
        // eslint-disable-next-line no-console
        console.log('Role from profile table:', profile.role);
      }
      return profile.role;
    }
  } catch {
    // Fallback to default role
  }

  // Debug logging (only in development)
  if (typeof window !== 'undefined' && window.import?.meta?.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn('No role found, defaulting to user');
  }
  return 'user';
};

/**
 * Helper to determine redirect path based on role
 */
export const getRedirectPath = (role, fromPath = null) => {
  if (fromPath) return fromPath;
  return role === 'manager' ? '/manager/dashboard' : '/user/dashboard';
};
