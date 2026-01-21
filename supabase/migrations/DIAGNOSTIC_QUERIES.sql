-- =====================================================
-- DIAGNOSTIC: Check Creator Requests Status
-- نفذ هذه الاستعلامات واحدة تلو الأخرى لتشخيص المشكلة
-- =====================================================

-- =====================================================
-- STEP 1: Check if ANY requests exist in the table
-- =====================================================
-- This bypasses RLS to see the raw data
-- نفذ هذا كـ "postgres" user أو في SQL Editor
SELECT 
    id,
    user_id,
    status,
    created_at,
    profile_data->>'full_name_ar' as name_ar,
    profile_data->>'full_name_en' as name_en
FROM public.creator_requests
ORDER BY created_at DESC;

-- =====================================================
-- STEP 2: Check current RLS policies
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'creator_requests';

-- =====================================================
-- STEP 3: Check if admin user email matches
-- =====================================================
-- Replace with your actual user ID from auth.users
SELECT 
    id,
    email,
    email = 'eng.abdullah.sherif@gmail.com' as is_admin
FROM auth.users
WHERE email LIKE '%abdullah%';

-- =====================================================
-- STEP 4: Test admin policy directly
-- =====================================================
-- This checks if the policy condition works
SELECT 
    (auth.jwt() ->> 'email') as current_user_email,
    (auth.jwt() ->> 'email') = 'eng.abdullah.sherif@gmail.com' as should_see_requests;

-- =====================================================
-- STEP 5: Count requests by status
-- =====================================================
SELECT 
    status,
    COUNT(*) as count
FROM public.creator_requests
GROUP BY status;

-- =====================================================
-- TEMPORARY FIX: Disable RLS to test
-- =====================================================
-- ⚠️ WARNING: This removes all security temporarily
-- Only use for testing, then re-enable immediately
-- النتيجة: إذا ظهرت الطلبات بعد هذا، المشكلة في RLS policies

-- Disable RLS (للاختبار فقط)
ALTER TABLE public.creator_requests DISABLE ROW LEVEL SECURITY;

-- After testing, RE-ENABLE immediately:
-- ALTER TABLE public.creator_requests ENABLE ROW LEVEL SECURITY;
