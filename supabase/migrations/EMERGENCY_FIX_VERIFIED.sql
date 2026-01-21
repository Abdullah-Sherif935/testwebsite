-- =====================================================
-- EMERGENCY FIX: Update verified status for approved users
-- =====================================================

-- Step 1: Check current state
-- See which users have approved requests but are NOT verified
SELECT 
    cr.user_id,
    cr.status as request_status,
    up.is_verified,
    up.full_name_ar,
    up.full_name_en
FROM creator_requests cr
JOIN user_profiles up ON cr.user_id = up.user_id
WHERE cr.status = 'approved' AND up.is_verified = false;

-- Step 2: FIX - Update ALL approved users to verified
UPDATE public.user_profiles
SET 
    is_verified = true,
    verification_date = NOW()
WHERE user_id IN (
    SELECT user_id 
    FROM public.creator_requests 
    WHERE status = 'approved'
);

-- Step 3: Verify the fix worked
SELECT 
    cr.user_id,
    cr.status as request_status,
    up.is_verified,
    up.full_name_ar,
    up.full_name_en,
    up.verification_date
FROM creator_requests cr
JOIN user_profiles up ON cr.user_id = up.user_id
WHERE cr.status = 'approved';

-- Step 4: List all verified users
SELECT 
    user_id,
    full_name_ar,
    full_name_en,
    is_verified,
    verification_date
FROM public.user_profiles
WHERE is_verified = true;
