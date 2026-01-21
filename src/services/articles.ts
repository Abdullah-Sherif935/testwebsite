import { supabase } from './supabase'
import { adminSupabase } from './adminSupabase'
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
            .select('*, author:user_profiles (is_verified, avatar_url, cv_file_url)')
            .eq('status', 'published')
            .eq('moderation_status', 'approved')
            .not('slug', 'is', null)
            .order('created_at', { ascending: false });

        return response;
    }, []);
}

export async function getLatestArticles(limit = 3): Promise<Article[]> {
    return fetchWithRetry<Article>(async () => {
        const response = await supabase
            .from('articles')
            .select('*, author:user_profiles (is_verified, avatar_url, cv_file_url)')
            .eq('status', 'published')
            .eq('moderation_status', 'approved')
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
            .select('*, author:user_profiles (is_verified, avatar_url, cv_file_url)')
            .eq('slug', sanitizedSlug)
            .eq('status', 'published')
            .eq('moderation_status', 'approved')
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
            author:user_profiles (full_name_ar, avatar_url)
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

export async function updateComment(commentId: string, userId: string, content: string) {
    const { cleanText, isFlagged } = filterProfanity(content);

    if (isFlagged) {
        throw new Error('Comment contains inappropriate content and cannot be updated.');
    }

    return supabase
        .from('article_comments')
        .update({ content: cleanText })
        .eq('id', commentId)
        .eq('user_id', userId);
}

// Admin Comment Management
export async function adminGetAllComments() {
    const { data, error } = await adminSupabase
        .from('article_comments')
        .select(`
            *,
            articles:article_id (id, title, slug),
            author:user_profiles (full_name_ar, avatar_url, email)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin comments:', error);
        return [];
    }
    return data;
}

export async function markCommentAsRead(commentId: string) {
    return await adminSupabase
        .from('article_comments')
        .update({ is_read: true })
        .eq('id', commentId);
}

export async function adminDeleteComment(commentId: string) {
    return await adminSupabase
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

// --- USER ARTICLE CONTRIBUTIONS ---

export async function submitUserArticle(articleData: Partial<Article>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    return await supabase
        .from('articles')
        .insert([{
            ...articleData,
            user_id: user.id,
            moderation_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }]);
}

export async function updateUserArticle(articleId: string, updates: Partial<Article>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // If updating content, it goes to pending_content_rich for review
    const finalUpdates: any = {
        ...updates,
        moderation_status: 'pending',
        updated_at: new Date().toISOString()
    };

    if (updates.content_rich) {
        finalUpdates.pending_content_rich = updates.content_rich;
        delete finalUpdates.content_rich;
    }

    return await supabase
        .from('articles')
        .update(finalUpdates)
        .eq('id', articleId)
        .eq('user_id', user.id);
}

export async function deleteUserArticle(articleId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    return await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)
        .eq('user_id', user.id);
}

export async function getUserArticles(userId: string) {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Article[];
}

// --- ADMIN MODERATION ---

export async function adminGetPendingArticles() {
    const { data, error } = await adminSupabase
        .from('articles')
        .select(`
            *,
            author:user_profiles (full_name_ar, avatar_url)
        `)
        .eq('moderation_status', 'pending')
        .eq('status', 'published')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function adminApproveArticle(articleId: string, note?: string) {
    // 1. Fetch current article to get pending_content_rich if exists
    const { data: article } = await adminSupabase
        .from('articles')
        .select('pending_content_rich, moderation_status')
        .eq('id', articleId)
        .single();

    const updates: any = {
        moderation_status: 'approved',
        status: 'published',
        moderation_note: note || 'Approved by admin',
        updated_at: new Date().toISOString()
    };

    // If there were pending edits, apply them
    if (article?.pending_content_rich) {
        updates.content_rich = article.pending_content_rich;
        updates.pending_content_rich = null;
    }

    return await adminSupabase
        .from('articles')
        .update(updates)
        .eq('id', articleId);
}

export async function adminRejectArticle(articleId: string, note: string) {
    return await adminSupabase
        .from('articles')
        .update({
            moderation_status: 'rejected',
            moderation_note: note,
            updated_at: new Date().toISOString()
        })
        .eq('id', articleId);
}

// --- ADMIN STATISTICS & MANAGEMENT ---

export async function adminGetStats() {
    const { data, error } = await adminSupabase
        .from('articles')
        .select(`
            moderation_status,
            status,
            user_id
        `)
        .neq('status', 'draft');

    if (error) {
        console.error('Error fetching stats:', error);
        return { published: 0, total: 0, pending: 0, rejected: 0 };
    }

    const stats = {
        published: data.filter(a => a.moderation_status === 'approved').length,
        total: data.length,
        pending: data.filter(a => a.moderation_status === 'pending').length,
        rejected: data.filter(a => a.moderation_status === 'rejected').length,
    };

    return stats;
}

export async function adminGetApprovedArticles() {
    const { data, error } = await adminSupabase
        .from('articles')
        .select(`
            *,
            author:user_profiles (full_name_ar, avatar_url)
        `)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching approved articles:', error);
        return [];
    }

    return data;
}


export async function adminDeleteArticle(articleId: string) {
    return await adminSupabase
        .from('articles')
        .delete()
        .eq('id', articleId);
}

export async function adminGetArticleById(articleId: string) {
    const { data, error } = await adminSupabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

    if (error) throw error;
    return data;
}

export async function adminUpdateArticle(articleId: string, updates: Partial<Article>) {
    return await adminSupabase
        .from('articles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', articleId);
}

export async function adminGetAuthorsStats() {
    const { data, error } = await adminSupabase
        .from('articles')
        .select(`
            id,
            user_id,
            status,
            author:user_profiles (id, full_name_ar, avatar_url)
        `)
        .neq('status', 'draft');

    if (error) {
        console.error('Error fetching authors stats:', error);
        return [];
    }

    const authorMap = new Map();

    data.forEach((article: any) => {
        let p = article.author;
        if (Array.isArray(p)) p = p[0];
        if (!p) return;

        if (!authorMap.has(p.id)) {
            authorMap.set(p.id, {
                id: p.id,
                name: p.full_name_ar || 'Unknown',
                avatar_url: p.avatar_url,
                articleCount: 0
            });
        }
        authorMap.get(p.id).articleCount++;
    });

    return Array.from(authorMap.values());
}

export async function adminGetArticlesByAuthor(userId: string) {
    const { data, error } = await adminSupabase
        .from('articles')
        .select(`
            *,
            author:user_profiles (full_name_ar, email, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getAuthorArticles(userId: string): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select(`
            *,
            author:user_profiles (is_verified, avatar_url, cv_file_url)
        `)
        .eq('user_id', userId)
        .eq('status', 'published')
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching author articles:', error);
        return [];
    }
    return data as Article[];
}
