import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'nodejs',
};

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler() {
    try {
        // 1️⃣ هات آخر 10 فيديوهات
        const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search` +
            `?key=${YOUTUBE_API_KEY}` +
            `&channelId=${YOUTUBE_CHANNEL_ID}` +
            `&part=snippet` +
            `&order=date` +
            `&type=video` +
            `&maxResults=10`
        );

        if (!searchRes.ok) {
            throw new Error('YouTube search failed');
        }

        const searchData: any = await searchRes.json();

        const videoIds = searchData.items.map(
            (item: any) => item.id.videoId
        );

        // 2️⃣ هات عدد المشاهدات
        const statsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos` +
            `?key=${YOUTUBE_API_KEY}` +
            `&id=${videoIds.join(',')}` +
            `&part=statistics`
        );

        if (!statsRes.ok) {
            throw new Error('YouTube stats failed');
        }

        const statsData: any = await statsRes.json();

        const statsMap = new Map(
            statsData.items.map((v: any) => [
                v.id,
                Number(v.statistics.viewCount || 0),
            ])
        );

        // 3️⃣ خزّن في Supabase
        for (const item of searchData.items) {
            await supabase.from('videos').upsert({
                youtube_video_id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                youtube_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                thumbnail_url: item.snippet.thumbnails.high?.url,
                published_at: item.snippet.publishedAt,
                view_count: statsMap.get(item.id.videoId) || 0,
            });
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200 }
        );
    } catch (err: any) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500 }
        );
    }
}
