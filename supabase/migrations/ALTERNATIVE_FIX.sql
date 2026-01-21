-- =====================================================
-- ALTERNATIVE FIX: Simple Admin Check Using Metadata
-- This uses a simpler approach without complex queries
-- =====================================================

-- First, let's check what we're working with
-- Run this to see current user info:
SELECT 
    auth.uid() as user_id,
    auth.jwt() ->> 'email' as user_email;

-- =====================================================
-- SOLUTION 1: Direct email comparison (Simplest)
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can insert own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.creator_requests;

-- User policies (unchanged)
CREATE POLICY "Users can view own request"
  ON public.creator_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own request"
  ON public.creator_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending request"
  ON public.creator_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admin policies - Method 1: Using JWT email
CREATE POLICY "Admin can view all requests"
  ON public.creator_requests FOR SELECT
  USING (
    LOWER(TRIM(auth.jwt() ->> 'email')) = 'eng.abdullah.sherif@gmail.com'
  );

CREATE POLICY "Admin can update all requests"
  ON public.creator_requests FOR UPDATE
  USING (
    LOWER(TRIM(auth.jwt() ->> 'email')) = 'eng.abdullah.sherif@gmail.com'
  );

-- =====================================================
-- SOLUTION 2: If Solution 1 doesn't work, use this
-- Create a helper function
-- =====================================================

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN LOWER(TRIM(auth.jwt() ->> 'email')) = 'eng.abdullah.sherif@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old policies
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.creator_requests;

-- Create new policies using function
CREATE POLICY "Admin can view all requests"
  ON public.creator_requests FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can update all requests"
  ON public.creator_requests FOR UPDATE
  USING (public.is_admin());

-- =====================================================
-- SOLUTION 3: Nuclear option - Allow authenticated users
-- ⚠️ Use ONLY for testing to verify data exists
-- =====================================================

-- This allows ANY logged-in user to see all requests
-- DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
-- CREATE POLICY "Admin can view all requests"
--   ON public.creator_requests FOR SELECT
--   USING (auth.role() = 'authenticated');
