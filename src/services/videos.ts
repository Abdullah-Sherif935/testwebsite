import { supabase } from './supabase';
import type { Video } from '../types/video';

// Mock data for offline/fallback when Supabase is empty
const MOCK_VIDEOS: Video[] = [
    {
        id: '1',
        title: 'شرح تفصيلي لقسم Mechatronics - كل اللي محتاج تعرفه',
        description: 'دليل شامل لفهم تخصص الميكاترونكس',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '15:30',
        view_count: 12500,
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'مشروع تخرج ميكاترونكس كامل بالشرح والملفات',
        description: 'شرح تفصيلي لمشروع تخرج احترافي',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '22:45',
        view_count: 8700,
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        title: 'أسهل طريقة لفهم ChatGPT Plus مع شرح مميزات',
        description: 'تجربة عملية لمميزات ChatGPT Plus',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '18:20',
        view_count: 5300,
        created_at: new Date().toISOString()
    }
];

/**
 * Fetch videos from Supabase ordered by published_at (newest first)
 * Falls back to mock data if Supabase is empty or errors
 */
export async function getLatestVideos(limit = 3): Promise<Video[]> {
    try {
        // Try to order by published_at first (from YouTube sync), fallback to created_at
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .eq('is_shorts', false) // تجنب فيديوهات الـ Shorts
            .order('published_at', { ascending: false, nullsFirst: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching videos:', error);
            throw error;
        }

        if (!videos || videos.length === 0) {
            console.log('No videos in Supabase, returning mock data');
            return MOCK_VIDEOS.slice(0, limit);
        }

        return videos as Video[];
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        return MOCK_VIDEOS.slice(0, limit);
    }
}

/**
 * Fetch all videos for the Videos page
 */
export async function getAllVideos(): Promise<Video[]> {
    try {
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .order('published_at', { ascending: false, nullsFirst: false });

        if (error) {
            console.error('Error fetching all videos:', error);
            throw error;
        }

        if (!videos || videos.length === 0) {
            return MOCK_VIDEOS;
        }

        return videos as Video[];
    } catch (error) {
        console.error('Failed to fetch all videos:', error);
        return MOCK_VIDEOS;
    }
}

/**
 * Format view count for display (e.g., 1.2K, 15K, 1.5M)
 */
export function formatViewCount(count?: number): string {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}
