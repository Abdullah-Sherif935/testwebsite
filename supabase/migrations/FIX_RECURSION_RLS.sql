-- =================================================================
-- FIX: Solve Infinite Recursion in user_profiles RLS
-- =================================================================

-- 1. Create a Security Definer function to check admin status
-- This function runs with the privileges of the creator (postgres),
-- bypassing RLS and avoiding recursion.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "anyone_can_read_profiles" ON public.user_profiles;

-- 3. Re-create policies using the helper function

-- Policy A: Everyone can read profiles
CREATE POLICY "anyone_read_profiles"
ON public.user_profiles
FOR SELECT
TO public
USING (true);

-- Policy B: Users can update their own profile
CREATE POLICY "users_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy C: Admins can do anything
-- Using the function avoids recursion
CREATE POLICY "admins_full_access"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.check_is_admin());

-- 4. Apply similar logic to creator_requests if needed
DROP POLICY IF EXISTS "admins_update_requests" ON public.creator_requests;
CREATE POLICY "admins_manage_requests"
ON public.creator_requests
FOR ALL
TO authenticated
USING (public.check_is_admin() OR auth.uid() = user_id);

-- 5. Final check
SELECT policyname, tablename, cmd FROM pg_policies WHERE tablename IN ('user_profiles', 'creator_requests');
