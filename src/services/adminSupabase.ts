import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Separate Supabase client for Admin Panel with different storage key
// This ensures admin sessions are completely isolated from public site sessions
export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'admin-auth-token', // Different from default 'sb-auth-token'
        storage: window.localStorage, // Use localStorage only (not cookies)
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Disable URL-based session detection
        flowType: 'pkce', // Use PKCE flow (no cookies)
    }
});
