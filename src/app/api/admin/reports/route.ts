import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, getResolvedReports, resolveReport, deleteReport } from '@/lib/admin-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const busLine = searchParams.get('busLine');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    if (status === 'resolved') {
      const { reports: resolved, total } = await getResolvedReports();
      
      let filtered = resolved;
      if (type) {
        filtered = filtered.filter((r: any) => r.type === type);
      }
      if (busLine) {
        filtered = filtered.filter((r: any) => r.bus_line_id?.toString() === busLine);
      }
      if (date) {
        filtered = filtered.filter((r: any) => r.date === date);
      }
      
      return NextResponse.json({
        reports: filtered,
        total: filtered.length,
        status: 'resolved',
      });
    }

    const { reports, total } = await getAllReports();

    let filtered = reports;
    if (type) {
      filtered = filtered.filter((r: any) => r.reportType === type);
    }
    if (busLine) {
      filtered = filtered.filter((r: any) => r.bus_line_id?.toString() === busLine);
    }
    if (date) {
      filtered = filtered.filter((r: any) => r.date === date);
    }

    return NextResponse.json({
      reports: filtered,
      total: filtered.length,
      status: 'active',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, adminId, adminName } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    await resolveReport({ type, id, adminId, adminName });

    return NextResponse.json({
      success: true,
      message: 'Report resolved and moved to resolved list',
    });
  } catch (error: any) {
    if (error.message === 'Report not found') {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}