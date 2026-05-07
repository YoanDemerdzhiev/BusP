import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();
    
    const tableName = type === 'problem' ? 'problems' : type === 'lost' ? 'lost_items' : 'found_items';

    const { data: original, error: fetchError } = await adminClient
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const { error: insertError } = await adminClient
      .from('resolved_reports')
      .insert({
        original_id: original.id,
        type: type,
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

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    const { error: deleteError } = await adminClient
      .from(tableName)
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
