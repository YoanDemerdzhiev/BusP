import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Always export a client (may throw if not configured)
export const supabase: SupabaseClient = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any as SupabaseClient);