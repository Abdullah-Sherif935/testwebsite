-- Migration: Activate User Profile Trigger
-- This ensures every new user automatically gets a profile created
-- Fixes: Comments foreign key error & users not appearing in admin panel

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure all existing users have profiles (backfill)
INSERT INTO public.profiles (id, full_name, avatar_url, email)
SELECT 
  u.id, 
  COALESCE(u.raw_user_meta_data->>'full_name', 'User ' || substr(u.id::text, 1, 5)), 
  u.raw_user_meta_data->>'avatar_url',
  u.email
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
