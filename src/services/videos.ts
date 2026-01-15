import { supabase } from './supabase';
import type { Video } from '../types/video';

// Mock data for offline/fallback
const MOCK_VIDEOS: Video[] = [
    {
        id: '1',
        title: 'شرح تفصيلي لقسم Mechatronics - كل اللي محتاج تعرفه',
        description: 'دليل شامل لفهم تخصص الميكاترونكس',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '15:30',
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'مشروع تخرج ميكاترونكس كامل بالشرح والملفات',
        description: 'شرح تفصيلي لمشروع تخرج احترافي',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '22:45',
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        title: 'أسهل طريقة لفهم ChatGPT Plus مع شرح مميزات (تجربة حقيقية)',
        description: 'تجربة عملية لمميزات ChatGPT Plus',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '18:20',
        created_at: new Date().toISOString()
    }
];

const fetchOEmbedData = async (youtubeUrl: string) => {
    try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('oEmbed fetch error:', error);
        return null;
    }
};

export async function fetchVideosWithAutoMetadata(limit: number): Promise<Video[]> {
    console.log('🎥 [fetchVideosWithAutoMetadata] Starting fetch for', limit, 'videos...');
    try {
        console.log('  → Querying Supabase for videos (NO FILTERS)...');
        const { data: videos, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        console.log('  ← Supabase Videos Response:', {
            hasError: !!error,
            errorMessage: error?.message,
            errorDetails: error,
            videosCount: videos?.length || 0,
            videos: videos
        });

        if (error) throw error;
        if (!videos || videos.length === 0) {
            console.log('⚠️ [fetchVideosWithAutoMetadata] No videos found, returning MOCK_VIDEOS');
            return MOCK_VIDEOS.slice(0, limit);
        }

        // Process videos for missing metadata
        const processedVideos = await Promise.all(videos.map(async (video) => {
            const missingTitle = !video.title || video.title.trim() === '';
            const missingThumbnail = !video.thumbnail_url || video.thumbnail_url.trim() === '';

            if ((missingTitle || missingThumbnail) && video.youtube_url) {
                const metadata = await fetchOEmbedData(video.youtube_url);

                if (metadata) {
                    const updates: any = {};
                    if (missingTitle && metadata.title) {
                        updates.title = metadata.title;
                    }
                    if (missingThumbnail && metadata.thumbnail_url) {
                        updates.thumbnail_url = metadata.thumbnail_url;
                    }

                    if (Object.keys(updates).length > 0) {
                        await supabase
                            .from('videos')
                            .update(updates)
                            .eq('id', video.id);

                        return { ...video, ...updates } as Video;
                    }
                }
            }
            return video as Video;
        }));

        console.log('✅ [fetchVideosWithAutoMetadata] Returning', processedVideos.length, 'videos from Supabase');
        return processedVideos;
    } catch (error) {
        console.error('❌ [fetchVideosWithAutoMetadata] Error:', error);
        console.log('⚠️ [fetchVideosWithAutoMetadata] Falling back to MOCK_VIDEOS');
        return MOCK_VIDEOS.slice(0, limit);
    }
}

export async function getLatestVideos(limit = 3): Promise<Video[]> {
    return fetchVideosWithAutoMetadata(limit);
}
