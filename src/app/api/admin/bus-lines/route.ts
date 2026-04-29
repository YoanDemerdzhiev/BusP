import { NextRequest, NextResponse } from 'next/server';
import { getBusLinesData } from '@/lib/admin-api';

export async function GET() {
  try {
    const { busLines, total } = await getBusLinesData();

    return NextResponse.json({
      busLines,
      total,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}