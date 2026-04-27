import { supabase, isConfigured } from './supabase';
import { BUS_LINES_PLOVDIV } from './types';

const ADMIN_TOKEN_KEY = 'busp_admin_token';

const ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@busp.bg',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
};

function getDatabase() {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('busp_database');
  let db = stored ? JSON.parse(stored) : { users: [], problems: [], lostItems: [], foundItems: [], resolvedReports: [] };
  
  const hasAdmin = db.users?.some((u: any) => u.role === 'admin');
  if (!hasAdmin) {
    db.users = db.users || [];
    db.users.push(ADMIN_USER);
    localStorage.setItem('busp_database', JSON.stringify(db));
  }
  
  return db;
}

function saveDb(db: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('busp_database', JSON.stringify(db));
}

function verifyUser(email: string, password: string): any {
  const db = getDatabase();
  if (!db) return null;
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) return null;
  return user;
}

export async function loginAdmin(email: string, password: string) {
  if (isConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Invalid credentials');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Access denied. Admin role required.');
    }

    const token = btoa(`${profile.id}:${profile.email}:${profile.role}`);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    
    return { success: true, token, user: { ...profile, password: '' } };
  } else {
    const user = verifyUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (user.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }
    const token = btoa(`${user.id}:${user.email}:${user.role}`);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    return { success: true, token, user };
  }
}

export async function getAllReports() {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const reports = (data || []).map((r: any) => ({
      ...r,
      reportType: r.type,
      itemName: r.title,
      reporterName: r.contact_name,
      reporterPhone: r.contact_phone,
      finderName: r.contact_name,
      finderPhone: r.contact_phone,
    }));

    return {
      reports,
      total: reports.length,
    };
  } else {
    const db = getDatabase();
    if (!db) throw new Error('Database not available');

    return {
      reports: [
        ...db.problems.map((p: any) => ({ ...p, reportType: 'problem' })),
        ...db.lostItems.map((l: any) => ({ ...l, reportType: 'lost' })),
        ...db.foundItems.map((f: any) => ({ ...f, reportType: 'found' })),
      ],
      total: db.problems.length + db.lostItems.length + db.foundItems.length,
    };
  }
}

export async function getResolvedReports() {
  if (isConfigured && supabase) {
    const { data, error } = await supabase
      .from('resolved_reports')
      .select('*')
      .order('resolved_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      reports: data || [],
      total: (data || []).length,
    };
  } else {
    const db = getDatabase();
    if (!db) throw new Error('Database not available');

    return {
      reports: db.resolvedReports || [],
      total: (db.resolvedReports || []).length,
    };
  }
}

export async function getBusLinesData() {
  if (isConfigured && supabase) {
    const { data: busLines } = await supabase
      .from('bus_lines')
      .select('*')
      .order('line_number');

    const { data: reports } = await supabase
      .from('reports')
      .select('*');

    const result = (busLines || []).map((line: any) => {
      const lineReports = (reports || []).filter((r: any) => r.bus_line_id === line.id);
      const problemCount = lineReports.filter((r: any) => r.type === 'problem').length;
      const lostCount = lineReports.filter((r: any) => r.type === 'lost').length;
      const foundCount = lineReports.filter((r: any) => r.type === 'found').length;

      return {
        line: line.line_number,
        route: line.route_name,
        totalReports: problemCount + lostCount + foundCount,
        problems: problemCount,
        lost: lostCount,
        found: foundCount,
      };
    });

    return {
      busLines: result,
      total: result.length,
    };
  } else {
    const db = getDatabase();
    if (!db) throw new Error('Database not available');

    return {
      busLines: BUS_LINES_PLOVDIV.map((line: any) => {
        const problemCount = (db.problems || []).filter((p: any) => p.busLine === line.line).length;
        const lostCount = (db.lostItems || []).filter((l: any) => l.busLine === line.line).length;
        const foundCount = (db.foundItems || []).filter((f: any) => f.busLine === line.line).length;
        return {
          line: line.line,
          route: line.route,
          totalReports: problemCount + lostCount + foundCount,
          problems: problemCount,
          lost: lostCount,
          found: foundCount,
        };
      }),
      total: BUS_LINES_PLOVDIV.length,
    };
  }
}

export async function resolveReport(reportData: any) {
  if (isConfigured && supabase) {
    const { type, id } = reportData;

    const { data: original, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !original) {
      throw new Error('Report not found');
    }

    const { error: insertError } = await supabase
      .from('resolved_reports')
      .insert({
        original_id: original.id,
        type: original.type,
        title: original.title,
        description: original.description,
        bus_line_id: original.bus_line_id,
        bus_registration: original.bus_registration,
        date: original.date,
        time: original.time,
        location: original.location,
        image_url: original.image_url,
        is_anonymous: original.is_anonymous,
        contact_name: original.contact_name,
        contact_phone: original.contact_phone,
        resolved_at: new Date().toISOString(),
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { success: true };
  } else {
    const db = getDatabase();
    if (!db) throw new Error('Database not available');

    const { type, id, adminId, adminName } = reportData;
    let original: any = null;

    if (type === 'problem') {
      original = db.problems.find((p: any) => p.id === id);
      if (original) {
        db.problems = db.problems.filter((p: any) => p.id !== id);
      }
    } else if (type === 'lost') {
      original = db.lostItems.find((l: any) => l.id === id);
      if (original) {
        db.lostItems = db.lostItems.filter((l: any) => l.id !== id);
      }
    } else if (type === 'found') {
      original = db.foundItems.find((f: any) => f.id === id);
      if (original) {
        db.foundItems = db.foundItems.filter((f: any) => f.id !== id);
      }
    }

    if (!original) throw new Error('Report not found');

    const resolvedReport = {
      id: crypto.randomUUID(),
      originalId: original.id,
      type,
      title: original.title || original.itemName || '',
      itemName: original.itemName,
      description: original.description,
      busLine: original.busLine,
      busRegistration: original.busRegistration,
      date: original.date,
      time: original.time,
      location: original.location,
      photoUrl: original.photoUrl,
      isAnonymous: original.isAnonymous,
      reporterName: original.reporterName,
      reporterPhone: original.reporterPhone,
      finderName: original.finderName,
      finderPhone: original.finderPhone,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: adminName || adminId || 'Admin',
    };

    db.resolvedReports = db.resolvedReports || [];
    db.resolvedReports.push(resolvedReport);
    saveDb(db);

    return { success: true, resolvedReport };
  }
}

export async function deleteReport(reportId: string, type: string) {
  if (isConfigured && supabase) {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } else {
    const db = getDatabase();
    if (!db) throw new Error('Database not available');

    if (type === 'problem') {
      db.problems = db.problems.filter((p: any) => p.id !== reportId);
    } else if (type === 'lost') {
      db.lostItems = db.lostItems.filter((l: any) => l.id !== reportId);
    } else if (type === 'found') {
      db.foundItems = db.foundItems.filter((f: any) => f.id !== reportId);
    }

    saveDb(db);
    return { success: true };
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}