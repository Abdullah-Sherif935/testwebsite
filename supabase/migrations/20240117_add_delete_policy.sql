-- Allow authenticated users to DELETE files from the documents bucket
create policy "Authenticated users can delete CVs"
on storage.objects for delete
using ( bucket_id = 'documents' and auth.role() = 'authenticated' );
