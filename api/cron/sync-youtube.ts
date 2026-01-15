import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/* =======================
   Environment Variables
======================= */
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;
const SUPABASE_URL =
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET;

/* =======================
   Supabase Client
======================= */
const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
);

/* =======================
   Types
======================= */
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

interface YouTubeSearchResponse {
    items: YouTubeSearchItem[];
}

interface YouTubeVideoStats {
    id: string;
    statistics: {
        viewCount: string;
    };
}

interface YouTubeStatsResponse {
    items: YouTubeVideoStats[];
}

/* =======================
   YouTube Fetch
======================= */
async function fetchLatestVideos(): Promise<YouTubeSearchItem[]> {
    const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?key=${YOUTUBE_API_KEY}` +
        `&channelId=${YOUTUBE_CHANNEL_ID}` +
        `&part=snippet` +
        `&order=date` +
        `&type=video` +
        `&maxResults=10`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`YouTube search error: ${res.status}`);
    }

    const json = (await res.json()) as YouTubeSearchResponse;
    return json.items ?? [];
}

async function fetchVideoStats(
    videoIds: string[]
): Promise<Map<string, number>> {
    if (videoIds.length === 0) return new Map();

    const url =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?key=${YOUTUBE_API_KEY}` +
        `&id=${videoIds.join(',')}` +
        `&part=statistics`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`YouTube stats error: ${res.status}`);
    }

    const json = (await res.json()) as YouTubeStatsResponse;
    const map = new Map<string, number>();

    for (const item of json.items ?? []) {
        map.set(item.id, Number(item.statistics?.viewCount ?? 0));
    }

    return map;
}

/* =======================
   Sync to Supabase
======================= */
async function syncVideos(
    videos: YouTubeSearchItem[],
    stats: Map<string, number>
) {
    let inserted = 0;
    let updated = 0;

    for (const video of videos) {
        const videoId = video.id.videoId;
        const viewCount = stats.get(videoId) ?? 0;

        const thumbnail =
            video.snippet.thumbnails.high?.url ||
            video.snippet.thumbnails.medium?.url ||
            video.snippet.thumbnails.default?.url ||
            null;

        const payload = {
            youtube_video_id: videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnail_url: thumbnail,
            published_at: video.snippet.publishedAt,
            view_count: viewCount,
        };

        const { data: existing } = await supabase
            .from('videos')
            .select('id')
            .eq('youtube_video_id', videoId)
            .maybeSingle();

        if (existing) {
            await supabase
                .from('videos')
                .update({ view_count: viewCount })
                .eq('youtube_video_id', videoId);
            updated++;
        } else {
            await supabase.from('videos').insert(payload);
            inserted++;
        }
    }

    return { inserted, updated };
}

/* =======================
   Vercel Handler
======================= */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // 🔐 Cron protection
    if (
        CRON_SECRET &&
        req.headers.authorization !== `Bearer ${CRON_SECRET}`
    ) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('▶ YouTube sync started');

        const videos = await fetchLatestVideos();
        const ids = videos.map(v => v.id.videoId);
        const stats = await fetchVideoStats(ids);

        const result = await syncVideos(videos, stats);

        console.log('✔ Sync completed', result);

        return res.status(200).json({
            success: true,
            result,
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error('❌ Sync error', err);
        return res.status(500).json({
            error: 'Sync failed',
            message: err.message,
        });
    }
}
