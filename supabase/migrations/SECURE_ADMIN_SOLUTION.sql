-- =====================================================
-- SECURE & FINAL SOLUTION: Admin Flag Approach
-- This is the industry-standard, secure way to handle admin access
-- =====================================================

-- =====================================================
-- PART 1: Add is_admin field to user_profiles
-- =====================================================

-- Add is_admin column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin 
ON public.user_profiles(is_admin) 
WHERE is_admin = true;

-- =====================================================
-- PART 2: Set YOUR user as admin
-- Replace the user_id with your actual user ID
-- =====================================================

-- First, let's find your user ID by email
-- Run this separately to get your user_id:
-- SELECT id FROM auth.users WHERE email = 'eng.abdullah.sherif@gmail.com';

-- Then, insert/update your profile as admin:
INSERT INTO public.user_profiles (user_id, is_admin)
SELECT id, true
FROM auth.users
WHERE email = 'eng.abdullah.sherif@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET is_admin = true;

-- =====================================================
-- PART 3: Create helper function to check if user is admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 4: Drop all old policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can insert own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admins see all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admins manage all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admins delete requests" ON public.creator_requests;
DROP POLICY IF EXISTS "admin_full_access" ON public.creator_requests;
DROP POLICY IF EXISTS "users_manage_own" ON public.creator_requests;
DROP POLICY IF EXISTS "Allow all for admin" ON public.creator_requests;
DROP POLICY IF EXISTS "Users own requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Users manage own requests" ON public.creator_requests;

-- =====================================================
-- PART 5: Create NEW secure policies
-- =====================================================

-- Policy 1: Users can manage their own requests
CREATE POLICY "users_own_requests"
ON public.creator_requests
FOR ALL
USING (auth.uid() = user_id);

-- Policy 2: Admins can view ALL requests
CREATE POLICY "admins_view_all"
ON public.creator_requests
FOR SELECT
USING (public.is_current_user_admin());

-- Policy 3: Admins can update ALL requests
CREATE POLICY "admins_update_all"
ON public.creator_requests
FOR UPDATE
USING (public.is_current_user_admin());

-- Policy 4: Admins can delete ANY request
CREATE POLICY "admins_delete_all"
ON public.creator_requests
FOR DELETE
USING (public.is_current_user_admin());

-- =====================================================
-- PART 6: Verification queries
-- =====================================================

-- Run these to verify everything worked:

-- 1. Check if is_admin column was added:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' AND column_name = 'is_admin';

-- 2. Check if you are marked as admin:
-- SELECT email, is_admin 
-- FROM auth.users 
-- JOIN user_profiles ON auth.users.id = user_profiles.user_id 
-- WHERE email = 'eng.abdullah.sherif@gmail.com';

-- 3. Check if policies were created:
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'creator_requests';

-- =====================================================
-- DONE! 
-- After running this SQL, restart your app and test
-- =====================================================
