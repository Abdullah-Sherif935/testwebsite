-- Migration: User Articles and Moderation Workflow
-- This setup allows users to contribute articles with an admin review process.

-- 1. Update articles table with moderation fields
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS moderation_note TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS pending_content_rich JSONB; -- For storing edits before approval

-- Default existing articles to admin-owned if user_id is null
-- (Assuming existing articles were created by the admin)
-- You might want to manually set these to your specific profile ID later.

-- 2. Create Audit Log for Rate Limiting (Spam protection)
CREATE TABLE IF NOT EXISTS public.user_action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('article_create', 'article_edit')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_user_article_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    daily_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO daily_count
    FROM public.user_action_logs
    WHERE user_id = auth.uid()
      AND action_type = (CASE 
            WHEN TG_OP = 'INSERT' THEN 'article_create' 
            WHEN TG_OP = 'UPDATE' THEN 'article_edit' 
        END)
      AND created_at > NOW() - INTERVAL '1 day';

    IF daily_count >= 5 THEN
        RAISE EXCEPTION 'Daily limit of 5 % reached. Please try again tomorrow.', 
            (CASE WHEN TG_OP = 'INSERT' THEN 'article submissions' ELSE 'article edits' END);
    END IF;

    -- Log the action
    INSERT INTO public.user_action_logs (user_id, action_type)
    VALUES (auth.uid(), (CASE WHEN TG_OP = 'INSERT' THEN 'article_create' ELSE 'article_edit' END));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Triggers for rate limiting
DROP TRIGGER IF EXISTS trigger_check_create_limit ON public.articles;
CREATE TRIGGER trigger_check_create_limit
BEFORE INSERT ON public.articles
FOR EACH ROW
WHEN (auth.uid() IS NOT NULL AND (NEW.user_id IS NOT NULL)) -- Only apply to user-contributed articles
EXECUTE FUNCTION public.check_user_article_rate_limit();

DROP TRIGGER IF EXISTS trigger_check_edit_limit ON public.articles;
CREATE TRIGGER trigger_check_edit_limit
BEFORE UPDATE OF title, excerpt, content_rich, content_md, author_name ON public.articles
FOR EACH ROW
WHEN (auth.uid() IS NOT NULL AND (OLD.user_id = auth.uid()))
EXECUTE FUNCTION public.check_user_article_rate_limit();

-- 5. RLS Policies for articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view approved articles
DROP POLICY IF EXISTS "Anyone can view approved articles" ON public.articles;
CREATE POLICY "Anyone can view approved articles"
ON public.articles FOR SELECT
USING (moderation_status = 'approved');

-- Policy: Users can view their own pending/rejected articles
DROP POLICY IF EXISTS "Users can view their own articles" ON public.articles;
CREATE POLICY "Users can view their own articles"
ON public.articles FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admin can see everything (Already handled if there's an admin bypass, or we add one)
-- In Supabase, the service_role bypasses RLS. For our custom admin, we need a policy.
DROP POLICY IF EXISTS "Admin can manage all articles" ON public.articles;
CREATE POLICY "Admin can manage all articles"
ON public.articles FOR ALL
USING (auth.jwt()->>'email' = 'eng.abdullah.sherif@gmail.com');

-- Policy: Users can insert their own articles (Status must be pending)
DROP POLICY IF EXISTS "Users can submit their own articles" ON public.articles;
CREATE POLICY "Users can submit their own articles"
ON public.articles FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND 
    moderation_status = 'pending'
);

-- Policy: Users can update their own articles
DROP POLICY IF EXISTS "Users can update their own articles" ON public.articles;
CREATE POLICY "Users can update their own articles"
ON public.articles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own articles
DROP POLICY IF EXISTS "Users can delete their own articles" ON public.articles;
CREATE POLICY "Users can delete their own articles"
ON public.articles FOR DELETE
USING (auth.uid() = user_id);
