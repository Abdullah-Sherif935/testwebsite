import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCC-SXz7nymdUw9VXogzUosQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// دالة لتحويل مدة يوتيوب (ISO 8601) إلى ثواني
function parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    return (hours * 3600) + (minutes * 60) + seconds;
}

async function syncYouTube() {
    console.log('🔄 جاري بدء المزامنة الذكية وتصنيف الفيديوهات...');

    try {
        // 1. جلب آخر 15 فيديو لضمان تغطية الجديد
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=15&type=video`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.error) throw new Error(searchData.error.message);

        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        // 2. جلب التفاصيل مع مدة الفيديو (contentDetails)
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=statistics,snippet,contentDetails`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json();

        // 3. معالجة البيانات وتحديد الـ Shorts
        const updates = statsData.items.map(item => {
            const durationInSeconds = parseDuration(item.contentDetails.duration);
            const isShorts = durationInSeconds < 120; // أقل من دقيقتين (120 ثانية)

            return {
                video_id: item.id,
                title: item.snippet.title,
                view_count: parseInt(item.statistics.viewCount || '0'),
                thumbnail_url: item.snippet.thumbnails.high.url,
                youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
                published_at: item.snippet.publishedAt,
                is_shorts: isShorts
                // لاحظ: لم نضع category هنا لكي لا نمسح القيم اليدوية
            };
        });

        console.log(`📡 جاري تحديث ${updates.length} فيديو في الداتابيز...`);

        // 4. تنفيذ الـ Upsert
        const { error } = await supabase.from('videos').upsert(updates, { onConflict: 'video_id' });

        if (error) throw error;
        console.log('✅ تمت المزامنة بنجاح وفصل الـ Shorts تلقائياً!');

    } catch (err) {
        console.error('🚨 فشلت الأتمتة:', err.message);
    }
}

syncYouTube();