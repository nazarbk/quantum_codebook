import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client, or null when the project is not configured. Without it the app runs in
 * "local mode": no sign-in, progress kept in this browser only.
 */
export const supabase: SupabaseClient | null = url && anonKey
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    })
  : null;

export const PROGRESS_TABLE = 'user_progress';
