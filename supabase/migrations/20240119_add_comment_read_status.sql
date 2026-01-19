-- Migration: Add comment read status tracking
-- This allows admins to mark comments as read and see unread counters

-- Add is_read column to track admin read status
ALTER TABLE public.article_comments 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add index for faster queries on unread status
CREATE INDEX IF NOT EXISTS idx_article_comments_is_read 
ON public.article_comments(is_read);

-- Ensure RLS allows admins (authenticated users) to update the status
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'article_comments' AND policyname = 'Admins can update comment read status'
    ) THEN
        CREATE POLICY "Admins can update comment read status"
        ON public.article_comments
        FOR UPDATE
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;
