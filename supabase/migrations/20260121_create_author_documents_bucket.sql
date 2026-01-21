-- 1. Create Storage Bucket for Author Documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'author-documents', 
  'author-documents', 
  true, 
  5242880, -- 5 MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Create Unique Policies for author-documents bucket
DROP POLICY IF EXISTS "View Author Documents" ON storage.objects;
CREATE POLICY "View Author Documents" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'author-documents');

DROP POLICY IF EXISTS "Upload Author Documents" ON storage.objects;
CREATE POLICY "Upload Author Documents" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'author-documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Update Author Documents" ON storage.objects;
CREATE POLICY "Update Author Documents" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'author-documents');

DROP POLICY IF EXISTS "Delete Author Documents" ON storage.objects;
CREATE POLICY "Delete Author Documents" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'author-documents');
