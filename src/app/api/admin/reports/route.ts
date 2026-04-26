import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, getAllProblems, getAllLostItems, getAllFoundItems, getResolvedReports, deleteProblem, deleteLostItem, deleteFoundItem, addResolvedReport } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const busLine = searchParams.get('busLine');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let reports: any[] = [];
    let total = 0;
    let resolved: any[] = [];

    if (status === 'resolved') {
      resolved = getResolvedReports();
      
      if (type) {
        resolved = resolved.filter(r => r.type === type);
      }
      if (busLine) {
        resolved = resolved.filter(r => r.busLine === busLine);
      }
      if (date) {
        resolved = resolved.filter(r => r.date === date);
      }
      
      return NextResponse.json({
        reports: resolved,
        total: resolved.length,
        status: 'resolved',
      });
    }

    if (type === 'problem' || !type) {
      const problems = getAllProblems();
      reports = [...reports, ...problems.map(p => ({ ...p, reportType: 'problem' }))];
    }
    if (type === 'lost' || !type) {
      const lostItems = getAllLostItems();
      reports = [...reports, ...lostItems.map(l => ({ ...l, reportType: 'lost' }))];
    }
    if (type === 'found' || !type) {
      const foundItems = getAllFoundItems();
      reports = [...reports, ...foundItems.map(f => ({ ...f, reportType: 'found' }))];
    }

    if (type === 'problem' || !type) {
      total += getAllProblems().length;
    }
    if (type === 'lost' || !type) {
      total += getAllLostItems().length;
    }
    if (type === 'found' || !type) {
      total += getAllFoundItems().length;
    }

    if (busLine) {
      reports = reports.filter(r => r.busLine === busLine);
    }

    if (date) {
      reports = reports.filter(r => r.date === date);
    }

    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      reports,
      total: reports.length,
      status: 'active',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
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

    let originalReport: any;

    if (type === 'problem') {
      originalReport = getAllProblems().find(p => p.id === id);
    } else if (type === 'lost') {
      originalReport = getAllLostItems().find(l => l.id === id);
    } else if (type === 'found') {
      originalReport = getAllFoundItems().find(f => f.id === id);
    }

    if (!originalReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const resolvedReport = {
      id: uuidv4(),
      originalId: originalReport.id,
      type,
      title: originalReport.title || originalReport.itemName || '',
      itemName: originalReport.itemName,
      description: originalReport.description,
      busLine: originalReport.busLine,
      busRegistration: originalReport.busRegistration,
      date: originalReport.date,
      time: originalReport.time,
      location: originalReport.location,
      photoUrl: originalReport.photoUrl,
      isAnonymous: originalReport.isAnonymous,
      reporterName: originalReport.reporterName,
      reporterPhone: originalReport.reporterPhone,
      finderName: originalReport.finderName,
      finderPhone: originalReport.finderPhone,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: adminName || adminId || 'Admin',
    };

    addResolvedReport(resolvedReport);

    if (type === 'problem') {
      deleteProblem(id);
    } else if (type === 'lost') {
      deleteLostItem(id);
    } else if (type === 'found') {
      deleteFoundItem(id);
    }

    return NextResponse.json({
      success: true,
      message: 'Report resolved and moved to resolved list',
      resolvedReport,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}