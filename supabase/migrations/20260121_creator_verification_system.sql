-- Creator Verification System
-- This migration creates tables and storage for content creator verification

-- 1. Create creator_requests table for user applications
CREATE TABLE IF NOT EXISTS public.creator_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  profile_data jsonb DEFAULT '{}'::jsonb,
  admin_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add verification fields to user_profiles
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS verification_date timestamp with time zone;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_creator_requests_user_id ON public.creator_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_requests_status ON public.creator_requests(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verified ON public.user_profiles(is_verified);

-- 4. Enable RLS on creator_requests
ALTER TABLE public.creator_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for creator_requests
DROP POLICY IF EXISTS "Users can view own request" ON public.creator_requests;
CREATE POLICY "Users can view own request"
  ON public.creator_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own request" ON public.creator_requests;
CREATE POLICY "Users can insert own request"
  ON public.creator_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pending request" ON public.creator_requests;
CREATE POLICY "Users can update own pending request"
  ON public.creator_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admin policies will use app-level checks with adminSupabase client

-- 6. Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage Policies for profile-pictures bucket
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
CREATE POLICY "Public can view profile pictures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-pictures');

DROP POLICY IF EXISTS "Users can upload own profile picture" ON storage.objects;
CREATE POLICY "Users can upload own profile picture"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update own profile picture" ON storage.objects;
CREATE POLICY "Users can update own profile picture"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own profile picture" ON storage.objects;
CREATE POLICY "Users can delete own profile picture"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 8. Function to auto-update updated_at for creator_requests
DROP TRIGGER IF EXISTS set_creator_request_updated_at ON public.creator_requests;
CREATE TRIGGER set_creator_request_updated_at
  BEFORE UPDATE ON public.creator_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. Function to sync verification status to user_profiles
CREATE OR REPLACE FUNCTION public.sync_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.user_profiles
    SET 
      is_verified = true,
      verification_date = timezone('utc'::text, now())
    WHERE user_id = NEW.user_id;
  ELSIF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
    UPDATE public.user_profiles
    SET 
      is_verified = false,
      verification_date = NULL
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger to sync verification on request status change
DROP TRIGGER IF EXISTS sync_verification_on_approval ON public.creator_requests;
CREATE TRIGGER sync_verification_on_approval
  AFTER UPDATE ON public.creator_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.sync_verification_status();
