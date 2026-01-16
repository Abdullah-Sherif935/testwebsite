import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'nodejs',
};

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
        const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;

        if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
            return res.status(500).json({ error: 'Missing env vars' });
        }

        // 1️⃣ Get latest videos
        const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?` +
            `key=${YOUTUBE_API_KEY}` +
            `&channelId=${YOUTUBE_CHANNEL_ID}` +
            `&part=snippet` +
            `&order=date&type=video&maxResults=10`
        );

        const searchData = await searchRes.json();

        const videoIds = searchData.items.map(
            (v: any) => v.id.videoId
        );

        // 2️⃣ Get views
        const statsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?` +
            `key=${YOUTUBE_API_KEY}` +
            `&id=${videoIds.join(',')}` +
            `&part=statistics`
        );

        const statsData = await statsRes.json();

        const viewsMap = new Map(
            statsData.items.map((v: any) => [
                v.id,
                Number(v.statistics.viewCount || 0),
            ])
        );

        // 3️⃣ Save to Supabase
        for (const v of searchData.items) {
            await supabase.from('videos').upsert({
                youtube_video_id: v.id.videoId,
                title: v.snippet.title,
                description: v.snippet.description,
                youtube_url: `https://youtube.com/watch?v=${v.id.videoId}`,
                thumbnail_url: v.snippet.thumbnails.high?.url,
                published_at: v.snippet.publishedAt,
                view_count: viewsMap.get(v.id.videoId) || 0,
            });
        }

        return res.status(200).json({ success: true });
    } catch (err: any) {
        return res.status(500).json({
            error: err.message,
        });
    }
}
