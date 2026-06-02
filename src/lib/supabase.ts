import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

let _supabase: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!_supabase && isConfigured) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

export const supabase = getClient();

export function getAdminClient(): SupabaseClient {
  if (!isConfigured) {
    throw new Error('Supabase not configured');
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Service role key not configured');
  }
  return createClient(supabaseUrl, serviceKey);
}
