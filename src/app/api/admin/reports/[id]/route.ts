import { NextRequest, NextResponse } from 'next/server';
import { getProblemById, getLostItemById, getFoundItemById, getResolvedReports, deleteProblem, deleteLostItem, deleteFoundItem } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let report = null;
    let reportType = type;

    if (!type) {
      const problem = getProblemById(id);
      const lostItem = getLostItemById(id);
      const foundItem = getFoundItemById(id);
      
      if (problem) {
        report = { ...problem, reportType: 'problem' };
        reportType = 'problem';
      } else if (lostItem) {
        report = { ...lostItem, reportType: 'lost' };
        reportType = 'lost';
      } else if (foundItem) {
        report = { ...foundItem, reportType: 'found' };
        reportType = 'found';
      }
    } else {
      if (type === 'problem') {
        report = { ...(getProblemById(id) || {}), reportType: 'problem' };
      } else if (type === 'lost') {
        report = { ...(getLostItemById(id) || {}), reportType: 'lost' };
      } else if (type === 'found') {
        report = { ...(getFoundItemById(id) || {}), reportType: 'found' };
      }
    }

    if (!report || (report as any).id === undefined) {
      const resolved = getResolvedReports().find(r => r.originalId === id);
      if (resolved) {
        return NextResponse.json({
          report: { ...resolved, reportType: resolved.type },
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
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

    let deleted = false;

    if (!type) {
      deleted = deleteProblem(id) || deleteLostItem(id) || deleteFoundItem(id);
    } else {
      if (type === 'problem') {
        deleted = deleteProblem(id);
      } else if (type === 'lost') {
        deleted = deleteLostItem(id);
      } else if (type === 'found') {
        deleted = deleteFoundItem(id);
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}