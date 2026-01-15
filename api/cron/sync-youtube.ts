import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Environment Variables (Server-side only - NEVER exposed to client)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase with Service Role Key (full access)
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface YouTubeSearchItem {
    id: { videoId: string };
    snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
        };
    };
}

interface YouTubeVideoStats {
    id: string;
    statistics: {
        viewCount: string;
    };
}

async function fetchLatestVideos(): Promise<YouTubeSearchItem[]> {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&type=video&maxResults=10`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`YouTube Search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
}

async function fetchVideoStats(videoIds: string[]): Promise<Map<string, number>> {
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds.join(',')}&part=statistics`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`YouTube Videos API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const statsMap = new Map<string, number>();

    for (const item of data.items || []) {
        statsMap.set(item.id, parseInt(item.statistics.viewCount || '0', 10));
    }

    return statsMap;
}

async function syncVideosToSupabase(videos: YouTubeSearchItem[], statsMap: Map<string, number>) {
    const results = { inserted: 0, updated: 0, errors: 0 };

    for (const video of videos) {
        const videoId = video.id.videoId;
        const viewCount = statsMap.get(videoId) || 0;
        const thumbnailUrl = video.snippet.thumbnails.high?.url
            || video.snippet.thumbnails.medium?.url
            || video.snippet.thumbnails.default?.url;

        const videoData = {
            youtube_video_id: videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail_url: thumbnailUrl,
            published_at: video.snippet.publishedAt,
            view_count: viewCount,
        };

        try {
            // Check if video exists
            const { data: existing } = await supabase
                .from('videos')
                .select('id')
                .eq('youtube_video_id', videoId)
                .maybeSingle();

            if (existing) {
                // Update view count only
                await supabase
                    .from('videos')
                    .update({ view_count: viewCount })
                    .eq('youtube_video_id', videoId);
                results.updated++;
            } else {
                // Insert new video
                await supabase
                    .from('videos')
                    .insert([videoData]);
                results.inserted++;
            }
        } catch (error) {
            console.error(`Error syncing video ${videoId}:`, error);
            results.errors++;
        }
    }

    return results;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Verify cron secret (optional but recommended)
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow manual testing in development
        if (process.env.NODE_ENV === 'production') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    // Validate environment variables
    if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({
            error: 'Missing environment variables',
            details: {
                hasYouTubeKey: !!YOUTUBE_API_KEY,
                hasChannelId: !!YOUTUBE_CHANNEL_ID,
                hasSupabaseUrl: !!SUPABASE_URL,
                hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
            }
        });
    }

    try {
        console.log('🎥 Starting YouTube sync...');

        // 1. Fetch latest videos from YouTube
        const videos = await fetchLatestVideos();
        console.log(`📹 Found ${videos.length} videos from YouTube`);

        if (videos.length === 0) {
            return res.status(200).json({ message: 'No videos found', synced: 0 });
        }

        // 2. Get video IDs and fetch statistics
        const videoIds = videos.map(v => v.id.videoId);
        const statsMap = await fetchVideoStats(videoIds);
        console.log(`📊 Fetched stats for ${statsMap.size} videos`);

        // 3. Sync to Supabase
        const results = await syncVideosToSupabase(videos, statsMap);
        console.log(`✅ Sync complete:`, results);

        return res.status(200).json({
            success: true,
            message: 'YouTube sync completed',
            results,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('❌ YouTube sync error:', error);
        return res.status(500).json({
            error: 'Sync failed',
            message: error.message
        });
    }
}
