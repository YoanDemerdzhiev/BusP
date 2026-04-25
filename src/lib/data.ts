import { User, Problem, LostItem, FoundItem, Database } from './types';

const DB_KEY = 'busp_database';

const initialData: Database = {
  users: [],
  problems: [],
  lostItems: [],
  foundItems: [],
};

function getDatabase(): Database {
  if (typeof window === 'undefined') return initialData;
  
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialData;
  }
}

function saveDatabase(db: Database): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getUsers(): User[] {
  return getDatabase().users;
}

export function getUserByEmail(email: string): User | undefined {
  return getDatabase().users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return getDatabase().users.find(u => u.id === id);
}

export function createUser(user: User): User {
  const db = getDatabase();
  db.users.push(user);
  saveDatabase(db);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const db = getDatabase();
  const index = db.users.findIndex(u => u.id === id);
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
  return getDatabase().problems;
}

export function getProblemsByUserId(userId: string): Problem[] {
  return getDatabase().problems.filter(p => p.userId === userId);
}

export function getPublicProblems(): Problem[] {
  return getDatabase().problems.filter(p => !p.isAnonymous);
}

export function createProblem(problem: Problem): Problem {
  const db = getDatabase();
  db.problems.push(problem);
  saveDatabase(db);
  return problem;
}

export function updateProblem(id: string, updates: Partial<Problem>): Problem | undefined {
  const db = getDatabase();
  const index = db.problems.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  
  db.problems[index] = { ...db.problems[index], ...updates };
  saveDatabase(db);
  return db.problems[index];
}

export function getLostItems(): LostItem[] {
  return getDatabase().lostItems;
}

export function getLostItemsByUserId(userId: string): LostItem[] {
  return getDatabase().lostItems.filter(l => l.userId === userId);
}

export function createLostItem(item: LostItem): LostItem {
  const db = getDatabase();
  db.lostItems.push(item);
  saveDatabase(db);
  return item;
}

export function updateLostItem(id: string, updates: Partial<LostItem>): LostItem | undefined {
  const db = getDatabase();
  const index = db.lostItems.findIndex(l => l.id === id);
  if (index === -1) return undefined;
  
  db.lostItems[index] = { ...db.lostItems[index], ...updates };
  saveDatabase(db);
  return db.lostItems[index];
}

export function getFoundItems(): FoundItem[] {
  return getDatabase().foundItems;
}

export function getFoundItemsByUserId(userId: string): FoundItem[] {
  return getDatabase().foundItems.filter(f => f.userId === userId);
}

export function createFoundItem(item: FoundItem): FoundItem {
  const db = getDatabase();
  db.foundItems.push(item);
  saveDatabase(db);
  return item;
}

export function updateFoundItem(id: string, updates: Partial<FoundItem>): FoundItem | undefined {
  const db = getDatabase();
  const index = db.foundItems.findIndex(f => f.id === id);
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