-- =================================================================
-- FIX: Allow Admins to Update user_profiles (for Revoke)
-- =================================================================

-- 1. Ensure the is_admin column exists and is set correctly
-- (Assuming it was already added in SECURE_ADMIN_SOLUTION.sql)

-- 2. Drop the restrictive policy
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON public.user_profiles;

-- 3. Create a policy for users to manage their own profile
CREATE POLICY "users_manage_own_profile"
ON public.user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Create a policy for Admins to Update/Select all profiles
-- We check if the current user has is_admin = true in their own profile
CREATE POLICY "admins_manage_all_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- 5. Do the same for creator_requests if not already done
DROP POLICY IF EXISTS "admins_update_requests" ON public.creator_requests;
CREATE POLICY "admins_update_requests"
ON public.creator_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- 6. Verify
SELECT policyname, tablename, cmd FROM pg_policies WHERE tablename IN ('user_profiles', 'creator_requests');
