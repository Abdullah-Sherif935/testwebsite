-- Final Sync and Fix for User Profiles & Articles
-- This ensures all users have records in BOTH 'profiles' and 'user_profiles'
-- and fixes the trigger to keep them in sync for NEW users.

-- 1. Redefine handle_new_user to insert into BOTH tables
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into old 'profiles' table for backward compatibility
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User ' || substr(new.id::text, 1, 5)), 
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into new 'user_profiles' table for the verification system
  INSERT INTO public.user_profiles (
    user_id,
    full_name_ar,
    full_name_en,
    is_verified,
    created_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    false,
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill missing records in BOTH tables
-- Ensure all auth.users have 'profiles'
INSERT INTO public.profiles (id, full_name, avatar_url, email)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'User ' || substr(id::text, 1, 5)), 
    raw_user_meta_data->>'avatar_url',
    email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Ensure all auth.users have 'user_profiles'
INSERT INTO public.user_profiles (user_id, full_name_ar, full_name_en, is_verified, created_at)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE(raw_user_meta_data->>'full_name', 'New User'),
    false,
    NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 3. Update 'articles' table to reference 'user_profiles' for more robustness
-- but keep 'profiles' FK for now to avoid breaking existing queries if any.
-- Actually, let's just make sure both exist.

-- 4. Fix potential RLS issue for user_action_logs
ALTER TABLE IF EXISTS public.user_action_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own logs" ON public.user_action_logs;
CREATE POLICY "Users can insert own logs"
ON public.user_action_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own logs" ON public.user_action_logs;
CREATE POLICY "Users can view own logs"
ON public.user_action_logs FOR SELECT
USING (auth.uid() = user_id);
