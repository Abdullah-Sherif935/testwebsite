import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

/**
 * Sync YouTube Videos to Supabase
 * Script context: Node.js (Background Process)
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // NEVER expose to frontend
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCC-SXz7nymdUw9VXogzUosQ';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !YOUTUBE_API_KEY) {
    console.error('❌ Missing environment variables. Please check your secrets.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function syncYouTube() {
    console.log('🔄 Starting Comprehensive YouTube Synchronization...');

    try {
        // 1. Fetch latest 10 videos via Search API
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.error) throw new Error(`YouTube Search error: ${searchData.error.message}`);
        if (!searchData.items?.length) {
            console.log('⚠️ No videos found for this channel.');
            return;
        }

        const videoIds = searchData.items.map(item => item.id.videoId).join(',');
        console.log(`🔍 Found ${searchData.items.length} latest videos. Fetching details...`);

        // 2. Fetch specific details (Statistics & Snippet)
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds}&part=statistics,snippet`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json();

        if (statsData.error) throw new Error(`YouTube Stats error: ${statsData.error.message}`);

        // 3. Prepare data for Upsert
        const updates = statsData.items?.map(item => ({
            video_id: item.id,
            title: item.snippet?.title || 'Untitled Video',
            view_count: parseInt(item.statistics?.viewCount || '0'),
            thumbnail_url: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
            youtube_url: `https://www.youtube.com/watch?v=${item.id}`,
            published_at: item.snippet?.publishedAt || new Date().toISOString(),
        })) || [];

        console.log(`📡 Processing upsert for ${updates.length} records...`);

        // 4. Perform Upsert in Supabase
        const { data, error } = await supabase
            .from('videos')
            .upsert(updates, {
                onConflict: 'video_id',
                ignoreDuplicates: false
            });

        if (error) throw error;

        console.log('✅ Successfully synced new videos and updated view counts!');
        process.exit(0);

    } catch (err) {
        console.error('🚨 Automation Failed:', err.message);
        process.exit(1);
    }
}

syncYouTube();
