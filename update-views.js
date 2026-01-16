// update-views.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// 1. إعداد المتغيرات من ملف .env
const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ytKey = process.env.YOUTUBE_API_KEY;

// فحص أولي للمفاتيح
if (!url || !serviceKey || !ytKey) {
    console.error("❌ خطأ: تأكد من وجود VITE_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY و YOUTUBE_API_KEY في ملف .env");
    process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function updateViewsOnly() {
    console.log('⏳ جاري الاتصال بقاعدة بيانات Supabase...');

    try {
        // 2. جلب الفيديوهات التي تمتلك video_id صالح (طوله 11 حرف)
        const { data: dbVideos, error: dbError } = await supabase
            .from('videos')
            .select('video_id')
            .not('video_id', 'is', null);

        if (dbError) throw dbError;

        if (!dbVideos || dbVideos.length === 0) {
            console.log('⚠️ لم يتم العثور على فيديوهات بـ video_id صالح في الجدول.');
            return;
        }

        const videoIds = dbVideos.map(v => v.video_id).filter(id => id.length === 11).join(',');
        console.log(`🔍 جاري طلب تحديثات لـ ${dbVideos.length} فيديو من يوتيوب...`);

        // 3. طلب البيانات من YouTube API (Statistics للعداد و Snippet للعنوان والصور)
        const ytUrl = `https://www.googleapis.com/youtube/v3/videos?key=${ytKey}&id=${videoIds}&part=statistics,snippet`;

        // ملاحظة: نستخدم fetch المدمج في Node.js 18+ مباشرة
        const response = await fetch(ytUrl);
        const ytData = await response.json();

        if (ytData.error) {
            if (ytData.error.message.includes('referer')) {
                throw new Error("خطأ في صلاحيات Google API Key: تأكد من جعل القيود (None) في Google Console.");
            }
            throw new Error(ytData.error.message);
        }

        if (!ytData.items || ytData.items.length === 0) {
            console.log('⚠️ يوتيوب لم يرجع أي بيانات، تأكد من صحة الـ Video IDs.');
            return;
        }

        // 4. تجهيز البيانات للإرسال (تحديث المشاهدات + البيانات الأساسية)
        const updates = ytData.items.map(item => ({
            video_id: item.id,
            view_count: parseInt(item.statistics.viewCount),
            title: item.snippet?.title || 'Untitled',
            thumbnail_url: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
            youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
            published_at: item.snippet?.publishedAt
        }));

        console.log('🔄 جاري إرسال التحديثات إلى Supabase...');

        // 5. تنفيذ الـ Upsert (تحديث بناءً على الـ video_id)
        const { error: updateError } = await supabase
            .from('videos')
            .upsert(updates, { onConflict: 'video_id' });

        if (updateError) throw updateError;

        console.log('✅ تم التحديث بنجاح! المشاهدات والعناوين الآن مطابقة لليوتيوب.');

    } catch (err) {
        console.error('🚨 حدث خطأ أثناء التشغيل:');
        console.error(err.message);
    }
}

// البدء في التنفيذ
updateViewsOnly();