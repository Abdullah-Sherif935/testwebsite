-- =================================================================
-- FIX: Allow users to UPSERT their own profile
-- =================================================================

-- 1. Drop the restrictive update-only policy
DROP POLICY IF EXISTS "self_update_profile" ON public.user_profiles;

-- 2. Create a policy for ALL actions (Insert, Update, Select) for the user on their own profile
-- This is necessary for UPSERT to work correctly.
CREATE POLICY "self_manage_profile" 
ON public.user_profiles 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Verify
SELECT policyname, tablename, cmd FROM pg_policies WHERE tablename = 'user_profiles';
