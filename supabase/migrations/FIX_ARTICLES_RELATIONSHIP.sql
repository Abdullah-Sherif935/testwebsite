-- =================================================================
-- FIX: Relink articles to user_profiles and Fix Join Error
-- =================================================================

-- 1. Identify and remove the old foreign key constraint
-- It's likely named 'articles_user_id_fkey'
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_user_id_fkey;

-- 2. Add the correct foreign key pointing to user_profiles
ALTER TABLE public.articles
ADD CONSTRAINT articles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.user_profiles(user_id)
ON DELETE CASCADE;

-- 3. Ensure moderation_status column exists and is correct
-- (Sometimes it might be named 'status' in code but 'moderation_status' in DB)
-- If the frontend uses .eq('status', 'published'), we might need an alias or a rename.
-- Let's check if 'status' column exists. If not, we might need to add it or rename moderation_status.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'moderation_status') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'status') THEN
        ALTER TABLE public.articles RENAME COLUMN moderation_status TO status;
    END IF;
END $$;

-- 4. Verify RLS for articles
DROP POLICY IF EXISTS "Anyone can view approved articles" ON public.articles;
CREATE POLICY "Anyone can view approved articles"
ON public.articles FOR SELECT
USING (status = 'published' OR status = 'approved');

-- 5. Final check
SELECT policyname, tablename, cmd FROM pg_policies WHERE tablename = 'articles';
