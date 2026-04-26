import { NextRequest, NextResponse } from 'next/server';
import { BUS_LINES_PLOVDIV } from '@/lib/types';
import { getAllProblems, getAllLostItems, getAllFoundItems } from '@/lib/data';

export async function GET() {
  try {
    const problems = getAllProblems();
    const lostItems = getAllLostItems();
    const foundItems = getAllFoundItems();

    const busLinesWithCounts = BUS_LINES_PLOVDIV.map(line => {
      const problemCount = problems.filter(p => p.busLine === line.line).length;
      const lostCount = lostItems.filter(l => l.busLine === line.line).length;
      const foundCount = foundItems.filter(f => f.busLine === line.line).length;
      
      return {
        line: line.line,
        route: line.route,
        totalReports: problemCount + lostCount + foundCount,
        problems: problemCount,
        lost: lostCount,
        found: foundCount,
      };
    });

    return NextResponse.json({
      busLines: busLinesWithCounts,
      total: busLinesWithCounts.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}