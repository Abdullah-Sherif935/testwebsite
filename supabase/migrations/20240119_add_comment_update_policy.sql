-- Migration: Add policy to allow users to update their own comments
-- Securely enables the "Edit" feature in the UI

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'article_comments' AND policyname = 'Users can update their own comments'
    ) THEN
        CREATE POLICY "Users can update their own comments"
        ON public.article_comments
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
