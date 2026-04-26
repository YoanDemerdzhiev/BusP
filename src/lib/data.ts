import { User, Problem, LostItem, FoundItem, ResolvedReport, Database } from './types';

const DB_KEY = 'busp_database';

const ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@busp.bg',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
};

function getInitialData(): Database {
  return {
    users: [],
    problems: [],
    lostItems: [],
    foundItems: [],
    resolvedReports: [],
  };
}

function readDatabase(): Database {
  if (typeof window === 'undefined') {
    return getInitialData();
  }

  const stored = localStorage.getItem(DB_KEY);
  let db: Database;
  if (!stored) {
    db = getInitialData();
  } else {
    try {
      db = JSON.parse(stored);
    } catch {
      db = getInitialData();
    }
  }

  const hasAdmin = db.users?.some((u) => u.role === 'admin');
  if (!hasAdmin) {
    db.users = db.users || [];
    db.users.push(ADMIN_USER);
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  return db;
}

function saveDatabase(db: Database): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getUsers(): User[] {
  return readDatabase().users;
}

export function getUserByEmail(email: string): User | undefined {
  return readDatabase().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return readDatabase().users.find((u) => u.id === id);
}

export function createUser(user: User): User {
  const db = readDatabase();
  db.users.push(user);
  saveDatabase(db);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const db = readDatabase();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;
  db.users[index] = { ...db.users[index], ...updates };
  saveDatabase(db);
  return db.users[index];
}

export function verifyUser(email: string, password: string): User | undefined {
  const user = getUserByEmail(email);
  if (!user) return undefined;
  if (user.password !== password) return undefined;
  return user;
}

export function getProblems(): Problem[] {
  return readDatabase().problems;
}

export function getProblemsByUserId(userId: string): Problem[] {
  return readDatabase().problems.filter((p) => p.userId === userId);
}

export function getPublicProblems(): Problem[] {
  return readDatabase().problems.filter((p) => !p.isAnonymous);
}

export function createProblem(problem: Problem): Problem {
  const db = readDatabase();
  db.problems.push(problem);
  saveDatabase(db);
  return problem;
}

export function updateProblem(id: string, updates: Partial<Problem>): Problem | undefined {
  const db = readDatabase();
  const index = db.problems.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  db.problems[index] = { ...db.problems[index], ...updates };
  saveDatabase(db);
  return db.problems[index];
}

export function getLostItems(): LostItem[] {
  return readDatabase().lostItems;
}

export function getLostItemsByUserId(userId: string): LostItem[] {
  return readDatabase().lostItems.filter((l) => l.userId === userId);
}

export function createLostItem(item: LostItem): LostItem {
  const db = readDatabase();
  db.lostItems.push(item);
  saveDatabase(db);
  return item;
}

export function updateLostItem(id: string, updates: Partial<LostItem>): LostItem | undefined {
  const db = readDatabase();
  const index = db.lostItems.findIndex((l) => l.id === id);
  if (index === -1) return undefined;
  db.lostItems[index] = { ...db.lostItems[index], ...updates };
  saveDatabase(db);
  return db.lostItems[index];
}

export function getFoundItems(): FoundItem[] {
  return readDatabase().foundItems;
}

export function getFoundItemsByUserId(userId: string): FoundItem[] {
  return readDatabase().foundItems.filter((f) => f.userId === userId);
}

export function createFoundItem(item: FoundItem): FoundItem {
  const db = readDatabase();
  db.foundItems.push(item);
  saveDatabase(db);
  return item;
}

export function updateFoundItem(id: string, updates: Partial<FoundItem>): FoundItem | undefined {
  const db = readDatabase();
  const index = db.foundItems.findIndex((f) => f.id === id);
  if (index === -1) return undefined;
  db.foundItems[index] = { ...db.foundItems[index], ...updates };
  saveDatabase(db);
  return db.foundItems[index];
}

export function getUserReports(userId: string) {
  const problems = getProblemsByUserId(userId);
  const lostItems = getLostItemsByUserId(userId);
  const foundItems = getFoundItemsByUserId(userId);
  return {
    problems,
    lostItems,
    foundItems,
    total: problems.length + lostItems.length + foundItems.length,
  };
}

export function getAllProblems(): Problem[] {
  return readDatabase().problems;
}

export function getAllLostItems(): LostItem[] {
  return readDatabase().lostItems;
}

export function getAllFoundItems(): FoundItem[] {
  return readDatabase().foundItems;
}

export function getProblemById(id: string): Problem | undefined {
  return readDatabase().problems.find((p) => p.id === id);
}

export function getLostItemById(id: string): LostItem | undefined {
  return readDatabase().lostItems.find((l) => l.id === id);
}

export function getFoundItemById(id: string): FoundItem | undefined {
  return readDatabase().foundItems.find((f) => f.id === id);
}

export function getAllReports() {
  const problems = getAllProblems();
  const lostItems = getAllLostItems();
  const foundItems = getAllFoundItems();
  const resolved = getResolvedReports();
  return {
    problems,
    lostItems,
    foundItems,
    resolved,
    total: problems.length + lostItems.length + foundItems.length,
    resolvedCount: resolved.length,
  };
}

export function deleteProblem(id: string): boolean {
  const db = readDatabase();
  const index = db.problems.findIndex((p) => p.id === id);
  if (index === -1) return false;
  db.problems.splice(index, 1);
  saveDatabase(db);
  return true;
}

export function deleteLostItem(id: string): boolean {
  const db = readDatabase();
  const index = db.lostItems.findIndex((l) => l.id === id);
  if (index === -1) return false;
  db.lostItems.splice(index, 1);
  saveDatabase(db);
  return true;
}

export function deleteFoundItem(id: string): boolean {
  const db = readDatabase();
  const index = db.foundItems.findIndex((f) => f.id === id);
  if (index === -1) return false;
  db.foundItems.splice(index, 1);
  saveDatabase(db);
  return true;
}

export function getResolvedReports(): ResolvedReport[] {
  return readDatabase().resolvedReports || [];
}

export function addResolvedReport(report: ResolvedReport): ResolvedReport {
  const db = readDatabase();
  if (!db.resolvedReports) {
    db.resolvedReports = [];
  }
  db.resolvedReports.push(report);
  saveDatabase(db);
  return report;
}

export function getReportsByBusLine(busLine: string) {
  const problems = getAllProblems().filter((p) => p.busLine === busLine);
  const lostItems = getAllLostItems().filter((l) => l.busLine === busLine);
  const foundItems = getAllFoundItems().filter((f) => f.busLine === busLine);
  return {
    problems,
    lostItems,
    foundItems,
    total: problems.length + lostItems.length + foundItems.length,
  };
}

export function getReportsByType(type: 'problem' | 'lost' | 'found') {
  if (type === 'problem') {
    return { reports: getAllProblems(), total: getAllProblems().length };
  }
  if (type === 'lost') {
    return { reports: getAllLostItems(), total: getAllLostItems().length };
  }
  return { reports: getAllFoundItems(), total: getAllFoundItems().length };
}

export function getDatabase(): Database {
  return readDatabase();
}