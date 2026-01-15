import { supabase } from './supabase';
import type { Project } from '../types/project';

const fetchWithRetry = async <T>(fetcher: () => Promise<any>, fallback: T[], retries = 1, delay = 300): Promise<T[]> => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data, error } = await fetcher();
            if (error) throw error;
            if (data) return data as T[];
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) return fallback;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    return fallback;
};

export async function getAllProjects(includeDrafts = false): Promise<Project[]> {
    return fetchWithRetry<Project>(async () => {
        let query = supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (!includeDrafts) {
            query = query.eq('status', 'published');
        }

        return await query;
    }, []);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error) throw error;
        return data as Project;
    } catch (error) {
        console.error('Error fetching project:', error);
        return null;
    }
}
