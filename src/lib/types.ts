export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Problem {
  id: string;
  userId: string | null;
  title: string;
  busLine: string;
  busRegistration: string;
  date: string;
  time: string;
  location: string;
  description: string;
  photoUrl: string | null;
  isAnonymous: boolean;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface LostItem {
  id: string;
  userId: string;
  itemName: string;
  busLine: string;
  busRegistration: string;
  date: string;
  time: string;
  location: string;
  description: string;
  photoUrl: string | null;
  reporterName: string;
  reporterPhone: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface FoundItem {
  id: string;
  userId: string;
  itemName: string;
  busLine: string;
  busRegistration: string;
  date: string;
  time: string;
  location: string;
  description: string;
  photoUrl: string | null;
  finderName: string;
  finderPhone: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface Database {
  users: User[];
  problems: Problem[];
  lostItems: LostItem[];
  foundItems: FoundItem[];
}

export const BUS_LINES_PLOVDIV = [
  { line: '1', route: 'Каменица - Синчец' },
  { line: '2', route: 'Хаджи Димитър - жк. Тракия' },
  { line: '4', route: 'Гробищен парк - Промишлена зона' },
  { line: '6', route: 'Кючук Париж - Гумено' },
  { line: '7', route: 'Пловдив Университет - Висла' },
  { line: '9', route: 'Клепинуар - Кап. Желязо' },
  { line: '10', route: 'Павлово - Селцо' },
  { line: '12', route: 'Рогош - Воден' },
  { line: '15', route: 'Янина - Братя Даскалови' },
  { line: '16', route: 'Учебен център - Родина' },
  { line: '17', route: 'Куклен театър - Съра' },
  { line: '18', route: 'Момина крепост - Център' },
  { line: '20', route: 'жк. Тракия - Инстационна' },
  { line: '21', route: 'Скобелец - Пеещи фонтани' },
  { line: '26', route: 'Вълка - Марица' },
  { line: '27', route: 'Мини Ограда - Централна автогара' },
  { line: '29', route: 'Твяра - Лозарска' },
  { line: '30', route: 'Ново село - Пловдив Таун' },
  { line: '36', route: 'жк. Тракия - Център' },
  { line: '37', route: 'Акарите - Парк Отдих' },
  { line: '38', route: 'Остров Владово - Толева' },
  { line: '44', route: 'Пиер - жк. Тракия' },
  { line: '49', route: 'Гребна база - Пеещи фонтани' },
  { line: '50', route: 'Момина крепост - Куклен театър' },
  { line: '60', route: 'Белащица - Централна гара' },
  { line: '61', route: 'Белащица - Кючук Париж' },
  { line: '66', route: 'Тутрановци - Съра' },
  { line: '71', route: 'Павлово - Скобелец' },
  { line: '93', route: 'Пловдив - Авиосещд' },
  { line: '99', route: 'Централна гара - Летище' },
] as const;

export type BusLine = typeof BUS_LINES_PLOVDIV[number];