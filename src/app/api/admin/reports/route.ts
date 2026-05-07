import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, isConfigured } from '@/lib/supabase';
import { getAllReports, getResolvedReports, resolveReport } from '@/lib/admin-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const busLine = searchParams.get('busLine');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    if (status === 'resolved') {
      if (isConfigured) {
        const client = getAdminClient();
        const query = client.from('resolved_reports').select('*').order('resolved_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        let filtered: any[] = data || [];
        if (type) filtered = filtered.filter((r: any) => r.type === type);
        if (busLine) filtered = filtered.filter((r: any) => r.bus_line_id?.toString() === busLine);
        if (date) filtered = filtered.filter((r: any) => r.date === date);

        return NextResponse.json({ reports: filtered, total: filtered.length, status: 'resolved' });
      } else {
        const { reports: resolved, total } = await getResolvedReports();
        let filtered = resolved;
        if (type) filtered = filtered.filter((r: any) => r.type === type);
        if (busLine) filtered = filtered.filter((r: any) => r.bus_line_id?.toString() === busLine);
        if (date) filtered = filtered.filter((r: any) => r.date === date);
        return NextResponse.json({ reports: filtered, total: filtered.length, status: 'resolved' });
      }
    }

    if (isConfigured) {
      const client = getAdminClient();
      const { data: problems, error: probError } = await client.from('problems').select('*').order('created_at', { ascending: false });
      const { data: lostItems, error: lostError } = await client.from('lost_items').select('*').order('created_at', { ascending: false });
      const { data: foundItems, error: foundError } = await client.from('found_items').select('*').order('created_at', { ascending: false });

      if (probError || lostError || foundError) {
        throw new Error(probError?.message || lostError?.message || foundError?.message);
      }

      let reports = [
        ...(problems || []).map((r: any) => ({ ...r, reportType: 'problem', isAnonymous: r.is_anonymous })),
        ...(lostItems || []).map((r: any) => ({ ...r, reportType: 'lost', isAnonymous: false })),
        ...(foundItems || []).map((r: any) => ({ ...r, reportType: 'found', isAnonymous: false })),
      ];

      if (type) reports = reports.filter((r: any) => r.reportType === type);
      if (busLine) reports = reports.filter((r: any) => r.bus_line_id?.toString() === busLine);
      if (date) reports = reports.filter((r: any) => r.date === date);

      return NextResponse.json({ reports, total: reports.length, status: 'active' });
    } else {
      const { reports, total } = await getAllReports();
      let filtered = reports;
      if (type) filtered = filtered.filter((r: any) => r.reportType === type);
      if (busLine) filtered = filtered.filter((r: any) => r.bus_line_id?.toString() === busLine);
      if (date) filtered = filtered.filter((r: any) => r.date === date);
      return NextResponse.json({ reports: filtered, total: filtered.length, status: 'active' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, adminId, adminName } = body;

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    if (isConfigured) {
      const adminClient = getAdminClient();
      const tableName = type === 'problem' ? 'problems' : type === 'lost' ? 'lost_items' : 'found_items';

      const { data: original, error: fetchError } = await adminClient.from(tableName).select('*').eq('id', id).single();
      if (fetchError || !original) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      const { error: insertError } = await adminClient.from('resolved_reports').insert({
        original_id: original.id,
        type,
        title: original.title,
        description: original.description,
        bus_line_id: original.bus_line_id,
        bus_registration: original.bus_registration,
        date: original.date,
        time: original.time,
        location: original.location,
        image_url: original.image_url,
        is_anonymous: original.is_anonymous,
        user_id: original.user_id,
        contact_name: original.reporter_name || original.finder_name,
        contact_phone: original.reporter_phone || original.finder_phone,
        resolved_at: new Date().toISOString(),
      });

      if (insertError) throw new Error(insertError.message);

      const { error: deleteError } = await adminClient.from(tableName).delete().eq('id', id);
      if (deleteError) throw new Error(deleteError.message);

      return NextResponse.json({ success: true });
    } else {
      await resolveReport({ type, id, adminId, adminName });
      return NextResponse.json({ success: true, message: 'Report resolved and moved to resolved list' });
    }
  } catch (error: any) {
    if (error.message === 'Report not found') {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
