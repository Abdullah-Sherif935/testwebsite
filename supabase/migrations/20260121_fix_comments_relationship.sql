-- =================================================================
-- FIX: Relink article_comments to user_profiles
-- This resolves the "PGRST200: Could not find a relationship between 'article_comments' and 'user_profiles'" error.
-- =================================================================

-- 1. Remove the old foreign key constraint pointing to the basic 'profiles' table
-- The old relationship was likely to 'profiles(id)'.
ALTER TABLE public.article_comments DROP CONSTRAINT IF EXISTS article_comments_user_id_fkey;

-- 2. Add a direct relationship to 'user_profiles' via 'user_id'
-- This allows the Supabase join: select('*, author:user_profiles(...)')
ALTER TABLE public.article_comments
ADD CONSTRAINT article_comments_user_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES public.user_profiles(user_id)
ON DELETE CASCADE;

-- 3. Ensure every user has a record in user_profiles
-- If a user exists in auth.users but not in user_profiles, inserting a comment will fail due to the FK above.
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
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. Verify RLS Policies for Comments
-- Ensure public read and authenticated insert
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.article_comments;
CREATE POLICY "Anyone can view comments"
ON public.article_comments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.article_comments;
CREATE POLICY "Authenticated users can post comments"
ON public.article_comments FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.article_comments;
CREATE POLICY "Users can update their own comments"
ON public.article_comments FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.article_comments;
CREATE POLICY "Users can delete their own comments"
ON public.article_comments FOR DELETE
USING (auth.uid() = user_id);
