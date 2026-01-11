import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client
let supabase = null;

if (isSupabaseConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    });
} else {
    console.warn('⚠️ Supabase credentials not found. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file');
}

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => isSupabaseConfigured && supabase !== null;

export { supabase };
