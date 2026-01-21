-- Add rating column to the correct table 'article_comments'
ALTER TABLE public.article_comments 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Create or update the View to calculate author rating statistics
-- This view aggregates ratings from all articles belonging to an author
CREATE OR REPLACE VIEW public.author_rating_stats AS
SELECT 
    a.user_id as author_id, -- Using user_id from articles table
    COUNT(c.id) as total_ratings,
    ROUND(AVG(c.rating)::numeric, 1) as average_rating
FROM 
    public.articles a
JOIN 
    public.article_comments c ON a.id = c.article_id
WHERE 
    c.rating IS NOT NULL
GROUP BY 
    a.user_id;

-- Grant access to the view
GRANT SELECT ON public.author_rating_stats TO anon, authenticated;
