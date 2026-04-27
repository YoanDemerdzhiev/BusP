-- Complete Working Schema for BusP App
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- This replaces the old unified "reports" table with 3 separate tables

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create bus_lines table
CREATE TABLE IF NOT EXISTS bus_lines (
  id SERIAL PRIMARY KEY,
  line_number TEXT UNIQUE NOT NULL,
  route_name TEXT
);

-- 3. Create problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  bus_line_id INTEGER REFERENCES bus_lines(id),
  bus_registration TEXT,
  date DATE NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  image_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'new',
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create lost_items table
CREATE TABLE IF NOT EXISTS lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  bus_line_id INTEGER REFERENCES bus_lines(id),
  bus_registration TEXT,
  date DATE NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  user_id UUID,
  reporter_name TEXT,
  reporter_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create found_items table
CREATE TABLE IF NOT EXISTS found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  bus_line_id INTEGER REFERENCES bus_lines(id),
  bus_registration TEXT,
  date DATE NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'active',
  user_id UUID,
  finder_name TEXT,
  finder_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create resolved_reports table (for resolved/archived reports)
CREATE TABLE IF NOT EXISTS resolved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  bus_line_id INTEGER,
  bus_registration TEXT,
  date DATE,
  time TEXT,
  location TEXT,
  image_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  contact_name TEXT,
  contact_phone TEXT,
  resolved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Insert bus lines (Plovdiv routes)
INSERT INTO bus_lines (line_number, route_name) VALUES
  ('1', 'Каменица - Синчец'),
  ('2', 'Хаджи Димитър - жк. Тракия'),
  ('4', 'Гробищен парк - Промишлена зона'),
  ('6', 'Кючук Париж - Гумено'),
  ('7', 'Пловдив Университет - Висла'),
  ('9', 'Клепинуар - Кап. Желязо'),
  ('10', 'Павлово - Селцо'),
  ('12', 'Рогош - Воден'),
  ('15', 'Янина - Братя Даскалови'),
  ('16', 'Учебен център - Родина'),
  ('17', 'Куклен театър - Съра'),
  ('18', 'Момина крепост - Център'),
  ('20', 'жк. Тракия - Инстационна'),
  ('21', 'Скобелец - Пеещи фонтани'),
  ('26', 'Вълка - Марица'),
  ('27', 'Мини Ограда - Централна автогара'),
  ('29', 'Твяра - Лозарска'),
  ('30', 'Ново село - Пловдив Таун'),
  ('36', 'жк. Тракия - Център'),
  ('37', 'Акарите - Парк Отдих'),
  ('38', 'Остров Владово - Толева'),
  ('44', 'Пиер - жк. Тракия'),
  ('49', 'Гребна база - Пеещи фонтани'),
  ('50', 'Моми��а крепост - Куклен театър'),
  ('60', 'Белащица - Централна гара'),
  ('61', 'Белащица - Кючук Париж'),
  ('66', 'Тутрановци - Съра'),
  ('71', 'Павлово - Скобелец'),
  ('93', 'Пловдив - Авиосещд'),
  ('99', 'Централна гара - Летище')
ON CONFLICT (line_number) DO NOTHING;

-- 8. Disable RLS (temporarily for development)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bus_lines DISABLE ROW LEVEL SECURITY;
ALTER TABLE problems DISABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE found_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE resolved_reports DISABLE ROW LEVEL SECURITY;

-- 9. Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- OPTIONAL: Drop old reports table after verifying new tables work
-- DROP TABLE IF EXISTS reports;

-- Done! Run in Supabase SQL Editor.