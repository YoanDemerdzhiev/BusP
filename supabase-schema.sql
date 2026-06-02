-- ============================================================
-- BusP Complete Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  bus_line_id INTEGER,
  bus_registration TEXT DEFAULT '',
  date TEXT NOT NULL,
  time TEXT DEFAULT '',
  location TEXT NOT NULL,
  image_url TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  bus_line_id INTEGER,
  bus_registration TEXT DEFAULT '',
  date TEXT NOT NULL,
  time TEXT DEFAULT '',
  location TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id),
  reporter_name TEXT DEFAULT '',
  reporter_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  bus_line_id INTEGER,
  bus_registration TEXT DEFAULT '',
  date TEXT NOT NULL,
  time TEXT DEFAULT '',
  location TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id),
  finder_name TEXT DEFAULT '',
  finder_phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resolved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  bus_line_id INTEGER,
  bus_registration TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  image_url TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  user_id UUID,
  contact_name TEXT,
  contact_phone TEXT,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bus_lines (
  id SERIAL PRIMARY KEY,
  line_number TEXT NOT NULL,
  route_name TEXT
);


-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_lines ENABLE ROW LEVEL SECURITY;


-- 3. TABLE-LEVEL GRANTS
-- ============================================================
-- These grant the right to access the tables at all.
-- Without these, even the service_role key cannot read/write.

-- service_role: full access to everything (used by admin API routes, bypasses RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- authenticated: logged-in users (used by client-side pages, subject to RLS)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.problems TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lost_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.found_items TO authenticated;
GRANT SELECT ON public.resolved_reports TO authenticated;
GRANT SELECT ON public.bus_lines TO authenticated;

-- anon: not logged in (minimal access needed)
GRANT SELECT ON public.bus_lines TO anon;


-- 4. RLS POLICIES
-- ============================================================

-- PROFILES: users can read/update only their own row
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- PROBLEMS: everyone can read all, insert own or anonymous, update own
DROP POLICY IF EXISTS "problems_select_all" ON public.problems;
CREATE POLICY "problems_select_all" ON public.problems
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "problems_insert_own" ON public.problems;
CREATE POLICY "problems_insert_own" ON public.problems
  FOR INSERT WITH CHECK (auth.uid() = user_id OR (is_anonymous = true AND user_id IS NULL));

DROP POLICY IF EXISTS "problems_update_own" ON public.problems;
CREATE POLICY "problems_update_own" ON public.problems
  FOR UPDATE USING (auth.uid() = user_id);

-- LOST ITEMS: everyone can read all, insert own, update own
DROP POLICY IF EXISTS "lost_select_all" ON public.lost_items;
CREATE POLICY "lost_select_all" ON public.lost_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "lost_insert_own" ON public.lost_items;
CREATE POLICY "lost_insert_own" ON public.lost_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lost_update_own" ON public.lost_items;
CREATE POLICY "lost_update_own" ON public.lost_items
  FOR UPDATE USING (auth.uid() = user_id);

-- FOUND ITEMS: everyone can read all, insert own, update own
DROP POLICY IF EXISTS "found_select_all" ON public.found_items;
CREATE POLICY "found_select_all" ON public.found_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "found_insert_own" ON public.found_items;
CREATE POLICY "found_insert_own" ON public.found_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "found_update_own" ON public.found_items;
CREATE POLICY "found_update_own" ON public.found_items
  FOR UPDATE USING (auth.uid() = user_id);

-- RESOLVED REPORTS: everyone can read all
DROP POLICY IF EXISTS "resolved_select_all" ON public.resolved_reports;
CREATE POLICY "resolved_select_all" ON public.resolved_reports
  FOR SELECT USING (true);

-- BUS LINES: everyone can read all
DROP POLICY IF EXISTS "bus_lines_select_all" ON public.bus_lines;
CREATE POLICY "bus_lines_select_all" ON public.bus_lines
  FOR SELECT USING (true);


-- 5. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    'user',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 6. SEED BUS LINES DATA
-- ============================================================

INSERT INTO public.bus_lines (line_number, route_name) VALUES
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
  ('50', 'Момина крепост - Куклен театър'),
  ('60', 'Белащица - Централна гара'),
  ('61', 'Белащица - Кючук Париж'),
  ('66', 'Тутрановци - Съра'),
  ('71', 'Павлово - Скобелец'),
  ('93', 'Пловдив - Авиосещд'),
  ('99', 'Централна гара - Летище')
ON CONFLICT DO NOTHING;


-- 7. FIX EXISTING ADMIN USER (if profile was created without admin role)
-- ============================================================
-- After running this script, go to Authentication > Users in the Supabase dashboard,
-- find your admin user (admin@busp.bg), and set role = 'admin' in their profile row.
-- Or run: UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@busp.bg';
