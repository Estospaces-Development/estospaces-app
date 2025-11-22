import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if credentials are provided
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('⚠️ Supabase credentials not found. Waitlist feature will not work until you add credentials to .env.local');
    console.warn('📖 See SUPABASE_SETUP.md for setup instructions');
}

export { supabase };
