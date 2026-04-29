import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, getResolvedReports, deleteReport } from '@/lib/admin-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const { reports } = await getAllReports();
    
    let report = reports.find((r: any) => r.id === id);
    let reportType = report?.reportType;

    if (!report) {
      const { reports: resolved } = await getResolvedReports();
      const resolvedReport = resolved.find((r: any) => r.original_id === id || r.id === id);
      
      if (resolvedReport) {
        return NextResponse.json({
          report: { ...resolvedReport, reportType: resolvedReport.type },
          status: 'resolved',
        });
      }
      
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      report,
      reportType,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Type parameter is required' },
        { status: 400 }
      );
    }

    await deleteReport(id, type);

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
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