import { supabase } from './supabase'
import type { Resource } from '../types/resource'
import { MOCK_RESOURCES } from './mockData';

const fetchWithRetry = async <T>(fetcher: () => Promise<any>, fallback: T[], retries = 1, delay = 300): Promise<T[]> => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data, error } = await fetcher();
            if (error) throw error;
            if (data && data.length > 0) return data as T[]; // If we get data, return it
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) return fallback; // Return fallback on final failure
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    return fallback; // Should not reach here typically if retries exhaust
};

export async function getResources(): Promise<Resource[]> {
    console.log('📁 [getResources] Starting fetch...');
    const result = await fetchWithRetry<Resource>(async () => {
        console.log('  → Querying Supabase for resources...');
        const response = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('  ← Supabase Resources Response:', {
            hasError: !!response.error,
            errorMessage: response.error?.message,
            dataCount: response.data?.length || 0,
            data: response.data
        });

        return response;
    }, MOCK_RESOURCES);

    console.log('✅ [getResources] Final result count:', result.length, '(From:', result === MOCK_RESOURCES ? 'MOCK_RESOURCES' : 'Supabase', ')');
    return result;
}

export async function getResourcesByArticleSlug(slug: string): Promise<Resource[]> {
    return fetchWithRetry<Resource>(async () => {
        return await supabase
            .from('resources')
            .select('*')
            .eq('related_article_slug', slug)
            .order('created_at', { ascending: false });
    }, MOCK_RESOURCES.filter(r => r.related_article_slug === slug));
}
