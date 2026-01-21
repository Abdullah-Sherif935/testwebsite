-- =================================================================
-- CREATE USER PROFILES FOR ALL EXISTING USERS
-- This ensures every user has a profile record
-- =================================================================

-- Step 1: Check if user_profiles exist
SELECT 
    u.id as user_id,
    u.email,
    up.user_id as has_profile
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- Step 2: Insert missing profiles for ALL existing users
-- This will NOT overwrite existing profiles (ON CONFLICT DO NOTHING)
INSERT INTO public.user_profiles (
    user_id,
    full_name_ar,
    full_name_en,
    is_verified,
    created_at
)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE(u.raw_user_meta_data->>'full_name', 'New User'),
    false,
    NOW()
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE up.user_id IS NULL;  -- Only insert if profile doesn't exist

-- Step 3: Verify - Check how many profiles were created
SELECT COUNT(*) as total_profiles FROM public.user_profiles;

-- Step 4: List all profiles
SELECT 
    user_id,
    full_name_ar,
    full_name_en,
    is_verified,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC;
