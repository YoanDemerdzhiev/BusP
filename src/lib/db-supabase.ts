import { supabase } from './supabase';
import { User, Problem, LostItem, FoundItem, ResolvedReport } from './types';

export interface DatabaseUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface DatabaseReport {
  id: string;
  type: 'problem' | 'lost' | 'found';
  title: string | null;
  description: string | null;
  bus_line_id: number | null;
  bus_registration: string | null;
  date: string;
  time: string | null;
  location: string;
  image_url: string | null;
  is_anonymous: boolean;
  status: string;
  user_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
}

export interface BusLine {
  id: number;
  line_number: string;
  route_name: string | null;
}

export function toUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    password: '',
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    role: dbUser.role,
    createdAt: dbUser.created_at,
  };
}

export function toProblem(dbReport: DatabaseReport): Problem {
  const busLine = dbReport.bus_line_id 
    ? String(dbReport.bus_line_id) 
    : '';
  
  return {
    id: dbReport.id,
    userId: dbReport.user_id,
    title: dbReport.title || '',
    busLine,
    busRegistration: dbReport.bus_registration || '',
    date: dbReport.date,
    time: dbReport.time || '',
    location: dbReport.location,
    description: dbReport.description || '',
    photoUrl: dbReport.image_url,
    isAnonymous: dbReport.is_anonymous,
    status: dbReport.status as 'new' | 'in_progress' | 'resolved',
    createdAt: dbReport.created_at,
  };
}

export function toLostItem(dbReport: DatabaseReport): LostItem {
  return {
    id: dbReport.id,
    userId: dbReport.user_id || '',
    itemName: dbReport.title || '',
    busLine: String(dbReport.bus_line_id || ''),
    busRegistration: dbReport.bus_registration || '',
    date: dbReport.date,
    time: dbReport.time || '',
    location: dbReport.location,
    description: dbReport.description || '',
    photoUrl: dbReport.image_url,
    reporterName: dbReport.contact_name || '',
    reporterPhone: dbReport.contact_phone || '',
    status: 'active',
    createdAt: dbReport.created_at,
  };
}

export function toFoundItem(dbReport: DatabaseReport): FoundItem {
  return {
    id: dbReport.id,
    userId: dbReport.user_id || '',
    itemName: dbReport.title || '',
    busLine: String(dbReport.bus_line_id || ''),
    busRegistration: dbReport.bus_registration || '',
    date: dbReport.date,
    time: dbReport.time || '',
    location: dbReport.location,
    description: dbReport.description || '',
    photoUrl: dbReport.image_url,
    finderName: dbReport.contact_name || '',
    finderPhone: dbReport.contact_phone || '',
    status: 'active',
    createdAt: dbReport.created_at,
  };
}

export async function getUsers(): Promise<User[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('profiles').select('*');
  return (data || []).map(toUser);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  if (!supabase) return undefined;
  const { data } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
  return data ? toUser(data as DatabaseUser) : undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  if (!supabase) return undefined;
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data ? toUser(data as DatabaseUser) : undefined;
}

export async function createUser(user: User): Promise<User> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role,
  }).select().single();
  return toUser(data as DatabaseUser);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  if (!supabase) return undefined;
  const updateData: any = {};
  if (updates.firstName) updateData.first_name = updates.firstName;
  if (updates.lastName) updateData.last_name = updates.lastName;
  if (updates.role) updateData.role = updates.role;
  
  const { data } = await supabase.from('profiles').update(updateData).eq('id', id).select().single();
  return data ? toUser(data as DatabaseUser) : undefined;
}

export async function verifyUser(email: string, password: string): Promise<User | undefined> {
  if (!supabase) return undefined;
  const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
  if (!authData?.user) return undefined;
  return getUserById(authData.user.id);
}

export async function getProblems(): Promise<Problem[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('reports').select('*').eq('type', 'problem');
  return (data || []).map(toProblem);
}

export async function getProblemsByUserId(userId: string): Promise<Problem[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('reports').select('*').eq('type', 'problem').eq('user_id', userId);
  return (data || []).map(toProblem);
}

export async function getPublicProblems(): Promise<Problem[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('reports').select('*').eq('type', 'problem').eq('is_anonymous', true);
  return (data || []).map(toProblem);
}

export async function createProblem(problem: Problem): Promise<Problem> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data } = await supabase.from('reports').insert({
    type: 'problem',
    title: problem.title,
    description: problem.description,
    bus_line_id: problem.busLine ? parseInt(problem.busLine) : null,
    bus_registration: problem.busRegistration,
    date: problem.date,
    time: problem.time,
    location: problem.location,
    image_url: problem.photoUrl,
    is_anonymous: problem.isAnonymous,
    status: problem.status,
    user_id: problem.isAnonymous ? null : problem.userId,
    created_at: problem.createdAt,
  }).select().single();
  return toProblem(data as DatabaseReport);
}

export async function updateProblem(id: string, updates: Partial<Problem>): Promise<Problem | undefined> {
  if (!supabase) return undefined;
  const updateData: any = {};
  if (updates.title) updateData.title = updates.title;
  if (updates.description) updateData.description = updates.description;
  if (updates.status) updateData.status = updates.status;
  
  const { data } = await supabase.from('reports').update(updateData).eq('id', id).select().single();
  return data ? toProblem(data as DatabaseReport) : undefined;
}

export async function getLostItems(): Promise<LostItem[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('reports').select('*').eq('type', 'lost');
  return (data || []).map(toLostItem);
}

export async function getLostItemsByUserId(userId: string): Promise<LostItem[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('reports').select('*').eq('type', 'lost').eq('user_id', userId);
  return (data || []).map(toLostItem);
}

export async function createLostItem(item: LostItem): Promise<LostItem> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data } = await supabase.from('reports').insert({
    type: 'lost',
    title: item.itemName,
    description: item.description,
    bus_line_id: item.busLine ? parseInt(item.busLine) : null,
    bus_registration: item.busRegistration,
    date: item.date,
    time: item.time,
    location: item.location,
    image_url: item.photoUrl,
    is_anonymous: false,
    status: 'active',
    user_id: item.userId,
    contact_name: item.reporterName,
    contact_phone: item.reporterPhone,
    created_at: item.createdAt,
  }).select().single();
  return toLostItem(data as DatabaseReport);
}

export async function updateLostItem(id: string, updates: Partial<LostItem>): Promise<LostItem | undefined> {
  if (!supabase) return undefined;
  const updateData: any = {};
  if (updates.itemName) updateData.title = updates.itemName;
  if (updates.description) updateData.description = updates.description;
  if (updates.status) updateData.status = updates.status;
  
  const { data } = await supabase.from('reports').update(updateData).eq('id', id).select().single();
  return data ? toLostItem(data as DatabaseReport) : undefined;
}

export async function getFoundItems(): Promise<FoundItem[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('reports').select('*').eq('type', 'found');
  return (data || []).map(toFoundItem);
}

export async function getFoundItemsByUserId(userId: string): Promise<FoundItem[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('reports').select('*').eq('type', 'found').eq('user_id', userId);
  return (data || []).map(toFoundItem);
}

export async function createFoundItem(item: FoundItem): Promise<FoundItem> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data } = await supabase.from('reports').insert({
    type: 'found',
    title: item.itemName,
    description: item.description,
    bus_line_id: item.busLine ? parseInt(item.busLine) : null,
    bus_registration: item.busRegistration,
    date: item.date,
    time: item.time,
    location: item.location,
    image_url: item.photoUrl,
    is_anonymous: false,
    status: 'active',
    user_id: item.userId,
    contact_name: item.finderName,
    contact_phone: item.finderPhone,
    created_at: item.createdAt,
  }).select().single();
  return toFoundItem(data as DatabaseReport);
}

export async function updateFoundItem(id: string, updates: Partial<FoundItem>): Promise<FoundItem | undefined> {
  if (!supabase) return undefined;
  const updateData: any = {};
  if (updates.itemName) updateData.title = updates.itemName;
  if (updates.description) updateData.description = updates.description;
  if (updates.status) updateData.status = updates.status;
  
  const { data } = await supabase.from('reports').update(updateData).eq('id', id).select().single();
  return data ? toFoundItem(data as DatabaseReport) : undefined;
}

export async function getUserReports(userId: string) {
  const problems = await getProblemsByUserId(userId);
  const lostItems = await getLostItemsByUserId(userId);
  const foundItems = await getFoundItemsByUserId(userId);
  return {
    problems,
    lostItems,
    foundItems,
    total: problems.length + lostItems.length + foundItems.length,
  };
}

export async function getAllProblems(): Promise<Problem[]> {
  return getProblems();
}

export async function getAllLostItems(): Promise<LostItem[]> {
  return getLostItems();
}

export async function getAllFoundItems(): Promise<FoundItem[]> {
  return getFoundItems();
}

export async function getProblemById(id: string): Promise<Problem | undefined> {
  if (!supabase) return undefined;
  const { data } = await supabase.from('reports').select('*').eq('id', id).eq('type', 'problem').single();
  return data ? toProblem(data as DatabaseReport) : undefined;
}

export async function getLostItemById(id: string): Promise<LostItem | undefined> {
  if (!supabase) return undefined;
  const { data } = await supabase.from('reports').select('*').eq('id', id).eq('type', 'lost').single();
  return data ? toLostItem(data as DatabaseReport) : undefined;
}

export async function getFoundItemById(id: string): Promise<FoundItem | undefined> {
  if (!supabase) return undefined;
  const { data } = await supabase.from('reports').select('*').eq('id', id).eq('type', 'found').single();
  return data ? toFoundItem(data as DatabaseReport) : undefined;
}

export async function getAllReports() {
  const problems = await getAllProblems();
  const lostItems = await getAllLostItems();
  const foundItems = await getAllFoundItems();
  return {
    problems,
    lostItems,
    foundItems,
    total: problems.length + lostItems.length + foundItems.length,
  };
}

export async function deleteProblem(id: string): Promise<boolean> {
  if (!supabase) return false;
  await supabase.from('reports').delete().eq('id', id).eq('type', 'problem');
  return true;
}

export async function deleteLostItem(id: string): Promise<boolean> {
  if (!supabase) return false;
  await supabase.from('reports').delete().eq('id', id).eq('type', 'lost');
  return true;
}

export async function deleteFoundItem(id: string): Promise<boolean> {
  if (!supabase) return false;
  await supabase.from('reports').delete().eq('id', id).eq('type', 'found');
  return true;
}

export async function getReportsByBusLine(busLine: string) {
  if (!supabase) return { problems: [], lostItems: [], foundItems: [], total: 0 };
  const lineId = parseInt(busLine);
  
  const { data: problems } = await supabase.from('reports').select('*').eq('type', 'problem').eq('bus_line_id', lineId);
  const { data: lostItems } = await supabase.from('reports').select('*').eq('type', 'lost').eq('bus_line_id', lineId);
  const { data: foundItems } = await supabase.from('reports').select('*').eq('type', 'found').eq('bus_line_id', lineId);
  
  return {
    problems: (problems || []).map(toProblem),
    lostItems: (lostItems || []).map(toLostItem),
    foundItems: (foundItems || []).map(toFoundItem),
    total: (problems?.length || 0) + (lostItems?.length || 0) + (foundItems?.length || 0),
  };
}

export async function getReportsByType(type: 'problem' | 'lost' | 'found') {
  if (!supabase) return { reports: [], total: 0 };
  const { data } = await supabase.from('reports').select('*').eq('type', type);
  
  if (!data) return { reports: [], total: 0 };
  
  let mapped: any[] = [];
  if (type === 'problem') mapped = data.map(toProblem);
  else if (type === 'lost') mapped = data.map(toLostItem);
  else mapped = data.map(toFoundItem);
  
  return { reports: mapped, total: data.length };
}

export async function getBusLines(): Promise<BusLine[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('bus_lines').select('*').order('line_number');
  return data || [];
}