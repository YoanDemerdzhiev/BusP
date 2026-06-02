import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient, isConfigured } from '@/lib/supabase';

const ADMIN_EMAIL = 'admin@busp.bg';

async function getAdminFromProfiles(userId: string) {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    if (data.role !== 'admin') return null;
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
    };
  } catch {
    return null;
  }
}

async function getAdminFromAuth(userId: string) {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient.auth.admin.getUserById(userId);
    if (error || !data?.user) return null;

    const u = data.user;
    const isAdmin = u.app_metadata?.role === 'admin'
      || u.user_metadata?.role === 'admin'
      || u.email === ADMIN_EMAIL;

    if (!isAdmin) return null;

    if (u.email === ADMIN_EMAIL && u.app_metadata?.role !== 'admin') {
      await adminClient.auth.admin.updateUserById(userId, {
        app_metadata: { ...u.app_metadata, role: 'admin' },
      }).catch(() => {});
    }

    return {
      id: u.id,
      email: u.email || '',
      firstName: u.user_metadata?.first_name || '',
      lastName: u.user_metadata?.last_name || '',
      role: 'admin',
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!isConfigured || !supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured.' },
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
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  let adminData = await getAdminFromProfiles(user.id);
  if (!adminData) {
    adminData = await getAdminFromAuth(user.id);
  }

  if (!adminData) {
    return NextResponse.json(
      { error: 'Forbidden: admin role required' },
      { status: 403 }
    );
  }

  return NextResponse.json(adminData);
}
