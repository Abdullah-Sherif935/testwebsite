import { supabase } from './supabase'
import type { Article } from '../types/article'
import { MOCK_ARTICLES } from './mockData';
import { filterProfanity } from '../utils/filter';

const fetchWithRetry = async <T>(fetcher: () => Promise<any>, fallback: T[], retries = 1, delay = 300): Promise<T[]> => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data, error } = await fetcher();
            if (error) throw error;
            if (data && data.length > 0) return data as T[];
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) return fallback;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    return fallback;
};

export async function getAllArticles(): Promise<Article[]> {
    return fetchWithRetry<Article>(async () => {
        const response = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published') // إظهار المنشور فقط
            .not('slug', 'is', null)
            .order('created_at', { ascending: false });

        return response;
    }, []);
}

export async function getLatestArticles(limit = 3): Promise<Article[]> {
    return fetchWithRetry<Article>(async () => {
        const response = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published') // إظهار المنشور فقط
            .not('slug', 'is', null)
            .order('created_at', { ascending: false })
            .limit(limit);

        return response;
    }, []);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
    const sanitizedSlug = slug?.trim();

    if (!sanitizedSlug || sanitizedSlug === 'null' || sanitizedSlug === 'undefined') {
        console.warn('Security Alert: Invalid slug attempt:', slug);
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', sanitizedSlug)
            .eq('status', 'published')
            .maybeSingle();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (data) {
            return data as Article;
        }

    } catch (error) {
        console.error('Error fetching article:', error);
    }

    console.log('Falling back to mock data for slug:', sanitizedSlug);
    return MOCK_ARTICLES.find(a => a.slug === sanitizedSlug) || null;
}

export async function incrementArticleViews(articleId: string) {
    const { data: article } = await supabase
        .from('articles')
        .select('views_count')
        .eq('id', articleId)
        .single();

    if (article) {
        return supabase
            .from('articles')
            .update({ views_count: (article.views_count || 0) + 1 })
            .eq('id', articleId);
    }
}

// User Interactions
export async function getArticleAction(articleId: string, userId: string): Promise<any> {
    const { data, error } = await supabase
        .from('user_article_actions')
        .select('*')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching article action:', error);
        return null;
    }
    return data;
}

export async function toggleArticleAction(articleId: string, userId: string, action: 'is_saved' | 'is_read', value: boolean) {
    const { data: existing } = await supabase
        .from('user_article_actions')
        .select('*')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .maybeSingle();

    if (existing) {
        return supabase
            .from('user_article_actions')
            .update({ [action]: value })
            .eq('article_id', articleId)
            .eq('user_id', userId);
    } else {
        return supabase
            .from('user_article_actions')
            .insert([{ article_id: articleId, user_id: userId, [action]: value }]);
    }
}

export async function getUserArticleInteractions(userId: string) {
    const { data, error } = await supabase
        .from('user_article_actions')
        .select('article_id, is_saved, is_read')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user interactions:', error);
        return [];
    }
    return data;
}

// Comments
export async function getArticleComments(articleId: string) {
    const { data, error } = await supabase
        .from('article_comments')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    // Process nested replies (one level deep as requested)
    const mainComments = data.filter(c => !c.parent_id);
    const replies = data.filter(c => c.parent_id);

    return mainComments.map(comment => ({
        ...comment,
        replies: replies.filter(r => r.parent_id === comment.id)
    }));
}

export async function postComment(articleId: string, userId: string, content: string, parentId: string | null = null) {
    const { cleanText, isFlagged } = filterProfanity(content);

    // Strict requirement: If flagged, we can choose to block or just sanitize.
    // Given the user's "strict" request, we save the sanitized version 
    // but we could also throw an error here if preferred.
    if (isFlagged) {
        throw new Error('Comment contains inappropriate content and cannot be posted.');
    }

    return supabase
        .from('article_comments')
        .insert([{
            article_id: articleId,
            user_id: userId,
            content: cleanText,
            parent_id: parentId
        }]);
}

export async function deleteComment(commentId: string, userId: string) {
    return supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);
}

// Admin Comment Management
export async function adminGetAllComments() {
    const { data, error } = await supabase
        .from('article_comments')
        .select(`
            *,
            articles:article_id (title),
            profiles:user_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin comments:', error);
        return [];
    }
    return data;
}

export async function adminDeleteComment(commentId: string) {
    return supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId);
}

export async function getSavedArticles(userId: string): Promise<Article[]> {
    const { data, error } = await supabase
        .from('user_article_actions')
        .select(`
            article_id,
            articles:article_id (*)
        `)
        .eq('user_id', userId)
        .eq('is_saved', true);

    if (error) {
        console.error('Error fetching saved articles:', error);
        return [];
    }

    return (data?.map((item: any) => item.articles).filter(Boolean) || []) as Article[];
}