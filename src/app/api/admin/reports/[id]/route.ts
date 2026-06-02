import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request);
  if (auth instanceof Response) return auth;

  try {
    const { id } = await params;
    const client = getAdminClient();
    const tables = ['problems', 'lost_items', 'found_items'];

    for (const table of tables) {
      const { data } = await client.from(table).select('*').eq('id', id).maybeSingle();
      if (data) {
        return NextResponse.json({ report: { ...data, reportType: table === 'problems' ? 'problem' : table === 'lost_items' ? 'lost' : 'found' } });
      }
    }

    const { data: resolved } = await client.from('resolved_reports').select('*').eq('original_id', id).maybeSingle();
    if (resolved) {
      return NextResponse.json({ report: { ...resolved, reportType: resolved.type }, status: 'resolved' });
    }

    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request);
  if (auth instanceof Response) return auth;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
    }

    const adminClient = getAdminClient();
    const tableName = type === 'problem' ? 'problems' : type === 'lost' ? 'lost_items' : 'found_items';
    const { error } = await adminClient.from(tableName).delete().eq('id', id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: 'Report deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Report not found') {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
