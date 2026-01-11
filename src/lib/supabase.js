import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback to hardcoded values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => supabase !== null;

export { supabase };
