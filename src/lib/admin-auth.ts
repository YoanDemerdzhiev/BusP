import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient, isConfigured } from './supabase';

export async function verifyAdminRequest(request: NextRequest): Promise<{ userId: string } | Response> {
  if (!isConfigured || !supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured. Admin API is unavailable.' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (!token) {
    return NextResponse.json(
      { error: 'Missing authorization token' },
      { status: 401 }
    );
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  const adminClient = getAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('[AdminAuth] Profile query error:', profileError);
  }

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: admin role required' },
      { status: 403 }
    );
  }

  return { userId: user.id };
}
