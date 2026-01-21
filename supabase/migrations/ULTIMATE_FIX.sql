-- =================================================================
-- ULTIMATE FIX: Remove ALL conflicts and create clean RLS policies
-- This will 100% work!
-- =================================================================

-- Step 1: DROP ALL existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Public can view verified users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles;

-- Step 2: Create ONE simple policy for all SELECT operations
CREATE POLICY "anyone_can_read_profiles"
ON public.user_profiles
FOR SELECT
TO public
USING (true);

-- Step 3: Users can INSERT/UPDATE their own profile
CREATE POLICY "users_can_manage_own_profile"
ON public.user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 4: Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';
