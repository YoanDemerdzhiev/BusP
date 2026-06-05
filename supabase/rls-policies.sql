-- ==========================================
-- RLS POLICIES FOR PRODUCTION
-- Run this in Supabase Dashboard > SQL Editor
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_lines ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PROFILES TABLE POLICIES
-- ==========================================

-- Allow users to view their OWN profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow the auth trigger to INSERT on signup
CREATE POLICY "Auth trigger can insert profiles" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id); 

-- Allow users to UPDATE their OWN profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==========================================
-- BUS_LINES TABLE POLICIES (reference data - public read)
-- ==========================================

CREATE POLICY "Bus lines are publicly readable" 
ON bus_lines FOR SELECT 
USING (true);

-- ==========================================
-- PROBLEMS TABLE POLICIES
-- ==========================================

-- Anonymous problems: everyone can see (is_anonymous = true)
-- Non-anonymous: only owner can see
-- Admins can see ALL problems
CREATE POLICY "Problems visibility" 
ON problems FOR SELECT 
USING (
  is_anonymous = true 
  OR 
  (NOT is_anonymous AND auth.uid() = user_id)
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Users can CREATE problems (link to their user_id) or anonymous
CREATE POLICY "Users can create problems" 
ON problems FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) 
  OR 
  (is_anonymous = true AND user_id IS NULL)
);

-- Users can UPDATE their OWN non-anonymous problems
CREATE POLICY "Users can update own problems" 
ON problems FOR UPDATE 
USING (auth.uid() = user_id AND is_anonymous = false)
WITH CHECK (auth.uid() = user_id);

-- Admins can UPDATE any problem (to resolve them)
CREATE POLICY "Admins can update any problem" 
ON problems FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can DELETE their OWN non-anonymous problems
CREATE POLICY "Users can delete own problems" 
ON problems FOR DELETE 
USING (auth.uid() = user_id AND is_anonymous = false);

-- Admins can DELETE any problem
CREATE POLICY "Admins can delete any problem" 
ON problems FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================
-- LOST_ITEMS TABLE POLICIES (NO anonymous option)
-- ==========================================

CREATE POLICY "Lost items visibility" 
ON lost_items FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create lost items" 
ON lost_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lost items" 
ON lost_items FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lost items" 
ON lost_items FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all lost items" 
ON lost_items FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================
-- FOUND_ITEMS TABLE POLICIES (same as lost_items)
-- ==========================================

CREATE POLICY "Found items visibility" 
ON found_items FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can create found items" 
ON found_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own found items" 
ON found_items FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own found items" 
ON found_items FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all found items" 
ON found_items FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================
-- RESOLVED_REPORTS TABLE POLICIES
-- ==========================================

-- Users can see their OWN resolved reports
-- Admins can see ALL resolved reports
CREATE POLICY "Resolved reports visibility" 
ON resolved_reports FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only SERVICE ROLE (admin API) should INSERT/UPDATE/DELETE resolved reports
CREATE POLICY "Only service role can modify resolved reports" 
ON resolved_reports FOR ALL 
USING (auth.role() = 'service_role');

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

GRANT SELECT ON bus_lines TO anon, authenticated;
GRANT ALL ON problems TO authenticated;
GRANT ALL ON lost_items TO authenticated;
GRANT ALL ON found_items TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON resolved_reports TO authenticated;
