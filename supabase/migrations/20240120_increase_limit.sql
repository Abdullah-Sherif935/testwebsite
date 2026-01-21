-- Increase rate limit from 5 to 50 actions per day
CREATE OR REPLACE FUNCTION public.check_user_article_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    action_count INT;
BEGIN
    SELECT count(*) INTO action_count
    FROM public.user_action_logs
    WHERE user_id = NEW.user_id 
    AND action_type = 'article_submission'
    AND created_at > now() - interval '1 day';

    IF action_count >= 50 THEN
        RAISE EXCEPTION 'Daily limit of 50 article submissions/edits reached. Please try again tomorrow.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
