import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, isConfigured } from '@/lib/supabase';
import { getAllReports, getResolvedReports } from '@/lib/admin-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (isConfigured) {
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
    } else {
      const { reports } = await getAllReports();
      const report = reports.find((r: any) => r.id === id);

      if (report) {
        return NextResponse.json({ report, reportType: report.reportType });
      }

      const { reports: resolved } = await getResolvedReports();
      const resolvedReport = resolved.find((r: any) => r.original_id === id || r.id === id);
      if (resolvedReport) {
        return NextResponse.json({ report: { ...resolvedReport, reportType: resolvedReport.type }, status: 'resolved' });
      }

      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
    }

    if (isConfigured) {
      const adminClient = getAdminClient();
      const tableName = type === 'problem' ? 'problems' : type === 'lost' ? 'lost_items' : 'found_items';
      const { error } = await adminClient.from(tableName).delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { deleteReport } = await import('@/lib/admin-api');
      await deleteReport(id, type);
    }

    return NextResponse.json({ success: true, message: 'Report deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Report not found') {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
