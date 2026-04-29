import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

let _supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_supabase && isConfigured) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  if (!_supabase) {
    throw new Error('Supabase not configured');
  }
  return _supabase;
}

// Simple export - initialize on first use
export const supabase = getClient();

// Admin client - ONLY use in server-side API routes!
// Never expose service key to client-side code
export function getAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Service role key not configured');
  }
  return createClient(supabaseUrl, serviceKey);
}
