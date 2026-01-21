-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public read access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- 3. Allow authenticated users to upload their own images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'article-images' AND
    (storage.foldername(name))[1] IS NOT NULL -- Ensure it's inside a folder (usually the article slug)
);

-- 4. Allow users to update/delete their own uploads (if needed)
CREATE POLICY "Users can manage their own folder"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'article-images' AND
    (SELECT auth.uid()) = owner
);
