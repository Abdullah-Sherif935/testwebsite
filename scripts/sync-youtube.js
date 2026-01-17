import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCC-SXz7nymdUw9VXogzUosQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// دالة تحويل مدة يوتيوب إلى ثواني
function parseDuration(duration) {
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    const seconds = duration.match(/(\d+)S/);

    const h = hours ? parseInt(hours[1]) : 0;
    const m = minutes ? parseInt(minutes[1]) : 0;
    const s = seconds ? parseInt(seconds[1]) : 0;

    return (h * 3600) + (m * 60) + s;
}

async function syncYouTube() {
    console.log('🔄 جاري بدء المزامنة الذكية...');

    try {
        // 1. جلب IDs الفيديوهات الأخيرة
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=15&type=video`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.error) throw new Error(`Youtube Error: ${searchData.error.message}`);
        if (!searchData.items) throw new Error("لم يتم العثور على فيديوهات.");

        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        // 2. جلب التفاصيل الكاملة (بما فيها المدة contentDetails)
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=statistics,snippet,contentDetails`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json(); // تم التأكد من تعريفها هنا

        if (statsData.error) throw new Error(`YouTube Stats Error: ${statsData.error.message}`);

        // 3. تجهيز البيانات للرفع
        // 3. تجهيز البيانات للرفع (تعديل للتحقيق فقط)
        const updates = statsData.items.map(item => {
            // جلب المدة الخام من يوتيوب
            const rawDuration = item.contentDetails?.duration;
            const durationInSeconds = parseDuration(rawDuration || "PT0S");
            const isShorts = durationInSeconds < 120;

            // أهم سطر في المرحلة دي: هيطبع لنا يوتيوب باعت إيه بالظبط
            console.log(`-----------------------------------------`);
            console.log(`🎥 الفيديو: ${item.snippet.title}`);
            console.log(`⏳ المدة الخام (Raw): ${rawDuration}`);
            console.log(`⏱️ المدة بالثواني: ${durationInSeconds} ثانية`);
            console.log(`❓ هل تم تصنيفه Shorts؟ ${isShorts}`);

            return {
                video_id: item.id,
                title: item.snippet.title,
                view_count: parseInt(item.statistics?.viewCount || '0'),
                thumbnail_url: item.snippet.thumbnails.high?.url,
                youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
                published_at: item.snippet.publishedAt,
                is_shorts: isShorts
            };
        });

        // 4. تنفيذ التحديث في Supabase
        const { error } = await supabase.from('videos').upsert(updates, { onConflict: 'video_id' });

        if (error) throw error;
        console.log('✅ تم تحديث البيانات بنجاح وفلترة الفيديوهات القصيرة!');

    } catch (err) {
        console.error('🚨 فشلت الأتمتة:', err.message);
        process.exit(1);
    }
}

syncYouTube();