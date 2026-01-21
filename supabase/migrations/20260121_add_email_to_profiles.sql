-- Add email column to user_profiles table
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email text;

-- Update existing profiles with emails from auth.users (Admin operation)
UPDATE public.user_profiles
SET email = auth.users.email
FROM auth.users
WHERE public.user_profiles.user_id = auth.users.id;

-- Create a trigger function to automatically update email when a user is created or updated
-- Although email is in auth.users, having it in user_profiles makes it easy to fetch for lists.

-- Re-sync email on every update just in case
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Fetch email from auth.users if not provided
  IF NEW.email IS NULL THEN
    SELECT email INTO NEW.email FROM auth.users WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_user_email ON public.user_profiles;
CREATE TRIGGER tr_sync_user_email
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_email();
