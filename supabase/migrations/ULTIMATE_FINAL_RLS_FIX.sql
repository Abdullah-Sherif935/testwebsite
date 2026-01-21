-- =================================================================
-- FINAL FIX: Eliminate RLS Recursion & Enable Admin Revoke
-- =================================================================

-- 1. Get the admin email from our known config
-- We will use this directly in the policy to avoid any table lookups (No Recursion!)

-- 2. Clean up ALL previous policies to avoid conflicts
DROP POLICY IF EXISTS "admins_full_access" ON public.user_profiles;
DROP POLICY IF EXISTS "anyone_read_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "anyone_can_read_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.user_profiles;

-- 3. Create SIMPLE, NON-RECURSIVE policies

-- A. PUBLIC READ: Everyone can see profiles
CREATE POLICY "public_read_profiles" 
ON public.user_profiles 
FOR SELECT 
TO public 
USING (true);

-- B. USER OWN: Users can update their own profile
CREATE POLICY "self_update_profile" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- C. ADMIN MASTER: Specific email has full access (NO RECURSION)
-- Replace with the user's admin email
CREATE POLICY "admin_master_access" 
ON public.user_profiles 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'eng.abdullah.sherif@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'eng.abdullah.sherif@gmail.com');

-- 4. Apply same logic to creator_requests
DROP POLICY IF EXISTS "admins_manage_requests" ON public.creator_requests;
DROP POLICY IF EXISTS "admins_update_requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can view own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can insert own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.creator_requests;

CREATE POLICY "requests_read_all" 
ON public.creator_requests 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'eng.abdullah.sherif@gmail.com');

CREATE POLICY "requests_insert_self" 
ON public.creator_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "requests_admin_manage" 
ON public.creator_requests 
FOR UPDATE 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'eng.abdullah.sherif@gmail.com');

-- 5. Verification
SELECT policyname, tablename, cmd FROM pg_policies WHERE tablename IN ('user_profiles', 'creator_requests');
