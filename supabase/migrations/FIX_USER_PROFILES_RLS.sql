-- =====================================================
-- CHECK AND FIX: user_profiles RLS policies
-- =====================================================

-- View current policies on user_profiles
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- =====================================================
-- If no policies exist or they're wrong, create them:
-- =====================================================

-- Enable RLS if not enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Public can view verified users" ON public.user_profiles;

-- Create new policies

-- 1. Users can view own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can insert/update own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Allow public to view verified status (for displaying badges)
CREATE POLICY "Public can view verified users"
ON public.user_profiles
FOR SELECT
USING (true);  -- Everyone can see profiles (for article authors, etc.)

-- =====================================================
-- Verify the policies were created
-- =====================================================
SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles';
