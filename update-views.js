import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ytKey = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'ضع_هنا_ID_قناتك'; // مهم جداً

const supabase = createClient(url, serviceKey);

async function syncYouTube() {
  console.log('🔄 بدأت عملية المزامنة الشاملة...');

  try {
    // 1. جلب آخر 10 فيديوهات من القناة (لضمان تغطية أي فيديو جديد)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${ytKey}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items) throw new Error("لم يتم العثور على فيديوهات في القناة.");

    const videoIds = searchData.items.map(item => item.id.videoId).join(',');

    // 2. جلب التفاصيل الدقيقة (المشاهدات والعناوين) لهذه الفيديوهات
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${ytKey}&id=${videoIds}&part=statistics,snippet`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    // 3. تجهيز البيانات للـ Upsert (إضافة الجديد وتحديث القديم)
    const updates = statsData.items.map(item => ({
      video_id: item.id,
      view_count: parseInt(item.statistics.viewCount),
      title: item.snippet.title,
      thumbnail_url: item.snippet.thumbnails.high.url,
      youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
      published_at: item.snippet.publishedAt
    }));

    console.log(`📡 وجدنا ${updates.length} فيديوهات، جاري تحديث قاعدة البيانات...`);

    // 4. تنفيذ العملية في Supabase
    const { error } = await supabase.from('videos').upsert(updates, { onConflict: 'video_id' });

    if (error) throw error;
    console.log('✅ تم جلب الفيديوهات الجديدة وتحديث المشاهدات بنجاح!');

  } catch (err) {
    console.error('🚨 فشلت الأتمتة:', err.message);
    process.exit(1);
  }
}

syncYouTube();