-- 1. Add missing content_rich column if it doesn't exist
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content_rich JSONB;

-- 2. Ensure existing columns have correct types
ALTER TABLE public.articles ALTER COLUMN content SET DEFAULT '';
ALTER TABLE public.articles ALTER COLUMN content_md SET DEFAULT '';

-- 3. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'article-images'
);

DROP POLICY IF EXISTS "Users can manage their own folder" ON storage.objects;
CREATE POLICY "Users can manage their own folder"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'article-images' AND
    (SELECT auth.uid()) = owner
);
