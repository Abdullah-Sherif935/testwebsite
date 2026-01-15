import { supabase } from './supabase'
import type { Article } from '../types/article'
import { MOCK_ARTICLES } from './mockData';

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