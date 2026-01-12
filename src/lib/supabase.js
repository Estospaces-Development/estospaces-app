import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Clean up old storage keys that might conflict
// Supabase v2 uses format: sb-{projectRef}-auth-token
if (typeof window !== 'undefined') {
    const oldKeys = [
        'supabase.auth.token',
        'sb-auth-token',
    ];
    
    for (const oldKey of oldKeys) {
        try {
            if (localStorage.getItem(oldKey)) {
                localStorage.removeItem(oldKey);
                if (import.meta.env.DEV) {
                    console.log(`🔄 Cleaned up old auth storage key: ${oldKey}`);
                }
            }
        } catch (e) {
            // Ignore errors during cleanup
        }
    }
}

// Create Supabase client
/** @type {SupabaseClient | null} */
let supabase = null;

if (isSupabaseConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            // Use PKCE flow for better security and reliability with OAuth
            flowType: 'pkce',
            // Use default storage (localStorage) and default key format
            // This ensures consistency with Supabase v2.x default behavior
        },
    });
    
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('✅ Supabase client initialized');
    }
} else if (import.meta.env.DEV) {
    // Only show warnings in development mode
    // eslint-disable-next-line no-console
    console.warn('⚠️ Supabase credentials not found. See SUPABASE_SETUP.md for setup instructions');
}

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => isSupabaseConfigured && supabase !== null;

// Test Supabase connection
export const testSupabaseConnection = async () => {
    if (!supabase) {
        console.error('❌ Supabase client not initialized');
        return { connected: false, error: 'Client not initialized' };
    }
    
    try {
        console.log('🔌 Testing Supabase connection...');
        const startTime = Date.now();
        
        // Simple auth session check (should be fast)
        const { data, error } = await supabase.auth.getSession();
        
        const duration = Date.now() - startTime;
        console.log(`⏱️ Connection test took ${duration}ms`);
        
        if (error) {
            console.error('❌ Connection test failed:', error);
            return { connected: false, error: error.message, duration };
        }
        
        console.log('✅ Supabase connection successful');
        return { connected: true, hasSession: !!data.session, duration };
    } catch (err) {
        console.error('❌ Connection test exception:', err);
        return { connected: false, error: err.message };
    }
};

// Log configuration on load (development only)
if (import.meta.env.DEV && isSupabaseConfigured) {
    console.log('🔧 Supabase configured:', {
        url: supabaseUrl?.substring(0, 30) + '...',
        hasAnonKey: !!supabaseAnonKey
    });
}

export { supabase };
