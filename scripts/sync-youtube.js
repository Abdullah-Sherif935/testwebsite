import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// 1. التعريفات الأساسية
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCC-SXz7nymdUw9VXogzUosQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------
// 2. المكان الصحيح للدالة الجديدة (Robust Parser)
// ---------------------------------------------------------
function parseDuration(duration) {
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    const seconds = duration.match(/(\d+)S/);

    const h = hours ? parseInt(hours[1]) : 0;
    const m = minutes ? parseInt(minutes[1]) : 0;
    const s = seconds ? parseInt(seconds[1]) : 0;

    return (h * 3600) + (m * 60) + s;
}
// ---------------------------------------------------------

// 3. الدالة الرئيسية للمزامنة
async function syncYouTube() {
    console.log('🔄 جاري بدء المزامنة الذكية...');

    try {
        // ... باقي كود الجلب (Search API) ...

        // عند معالجة البيانات داخل الدالة:
        const updates = statsData.items.map(item => {
            const durationStr = item.contentDetails?.duration || "PT0S";
            const durationInSeconds = parseDuration(durationStr); // استدعاء الدالة هنا
            const isShorts = durationInSeconds < 120; // أقل من دقيقتين

            // سطر التصحيح (Debug) لكي تراه في GitHub Actions
            console.log(`🎥 Video: ${item.snippet.title} | Duration: ${durationStr} (${durationInSeconds}s) | IsShorts: ${isShorts}`);

            return {
                video_id: item.id,
                title: item.snippet.title,
                view_count: parseInt(item.statistics.viewCount || '0'),
                thumbnail_url: item.snippet.thumbnails.high.url,
                youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
                published_at: item.snippet.publishedAt,
                is_shorts: isShorts
            };
        });

        // ... كود الـ Upsert في Supabase ...

    } catch (err) {
        console.error('🚨 فشلت الأتمتة:', err.message);
    }
}

syncYouTube();