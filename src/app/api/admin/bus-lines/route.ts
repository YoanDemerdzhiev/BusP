import { NextResponse } from 'next/server';
import { getAdminClient, isConfigured } from '@/lib/supabase';
import { getBusLinesData } from '@/lib/admin-api';

export async function GET() {
  try {
    if (isConfigured) {
      const adminClient = getAdminClient();
      const { data: busLines } = await adminClient.from('bus_lines').select('*').order('line_number');
      const { data: problems } = await adminClient.from('problems').select('*');
      const { data: lostItems } = await adminClient.from('lost_items').select('*');
      const { data: foundItems } = await adminClient.from('found_items').select('*');

      const result = (busLines || []).map((line: any) => {
        const lineProblems = (problems || []).filter((r: any) => r.bus_line_id === line.id);
        const lineLost = (lostItems || []).filter((r: any) => r.bus_line_id === line.id);
        const lineFound = (foundItems || []).filter((r: any) => r.bus_line_id === line.id);
        return {
          line: line.line_number,
          route: line.route_name,
          totalReports: lineProblems.length + lineLost.length + lineFound.length,
          problems: lineProblems.length,
          lost: lineLost.length,
          found: lineFound.length,
        };
      });

      return NextResponse.json({ busLines: result, total: result.length });
    } else {
      const { busLines, total } = await getBusLinesData();
      return NextResponse.json({ busLines, total });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
