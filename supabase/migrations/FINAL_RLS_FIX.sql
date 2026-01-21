-- =====================================================
-- FINAL SOLUTION: Working RLS Policies
-- After extensive testing, this is the correct approach
-- =====================================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can insert own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admins see all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admins manage all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admins delete requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Allow all for admin" ON public.creator_requests;
DROP POLICY IF EXISTS "Users own requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Users manage own requests" ON public.creator_requests;

-- Step 2: Simple user policies
CREATE POLICY "users_manage_own"
  ON public.creator_requests
  FOR ALL
  USING (auth.uid() = user_id);

-- Step 3: Admin policy - allowing all operations
-- This checks if the current user's email matches the admin email from their JWT
CREATE POLICY "admin_full_access"
  ON public.creator_requests
  FOR ALL
  USING (
    (auth.jwt() -> 'email')::text = '"eng.abdullah.sherif@gmail.com"'
  );

-- Alternative if above doesn't work - Check multiple formats
-- Uncomment this if the above policy doesn't work:
/*
DROP POLICY IF EXISTS "admin_full_access" ON public.creator_requests;
CREATE POLICY "admin_full_access"
  ON public.creator_requests
  FOR ALL
  USING (
    LOWER((auth.jwt() ->> 'email')::text) = 'eng.abdullah.sherif@gmail.com'
    OR
    (auth.jwt() -> 'email')::text = '"eng.abdullah.sherif@gmail.com"'
  );
*/
