-- =================================================================
-- FIX: Allow users to UPDATE their own creator_requests (for UPSERT)
-- =================================================================

-- 1. Create a policy for users to update their own request
-- This is necessary for the 'Submit Again' feature (upsert).
DROP POLICY IF EXISTS "requests_update_self" ON public.creator_requests;

CREATE POLICY "requests_update_self" 
ON public.creator_requests 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Verify
SELECT policyname, tablename, cmd FROM pg_policies WHERE tablename = 'creator_requests';
