import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('--- DEBUG JOUSEF START ---');

    // 1. Find the user profile for 'Jousef Antigravity' (or similar)
    // We'll search by name since we see it in the screenshot
    const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('full_name_ar', '%Jousef%') // Try partial match
        .limit(5);

    if (profileError) {
        console.error('❌ Profile Search Error:', profileError);
    } else if (profiles.length === 0) {
        console.error('❌ No profile found with name like "Jousef"');
        // Try listing all profiles to see what we have
        const { data: allProfiles } = await supabase.from('user_profiles').select('id, full_name_ar').limit(5);
        console.log('Available profiles:', allProfiles);
    } else {
        console.log(`✅ Found ${profiles.length} profiles matching "Jousef":`);
        profiles.forEach(p => console.log(`   - Name: ${p.full_name_ar}, ID: ${p.id}, UserID: ${p.user_id || 'Same as ID'}`));

        const targetProfile = profiles[0];

        // 2. Search articles for this User ID
        console.log(`\n2. Searching articles for user_id: ${targetProfile.id}...`);
        const { data: articles, error: articleError } = await supabase
            .from('articles')
            .select('id, title, user_id, status, moderation_status')
            .eq('user_id', targetProfile.id);

        if (articleError) {
            console.error('❌ Article Query Error:', articleError);
        } else {
            console.log(`✅ Articles found: ${articles.length}`);
            articles.forEach(a => console.log(`   - [${a.id}] ${a.title} (Status: ${a.status}, Mod: ${a.moderation_status})`));
        }

        // 3. Double check if articles exist with a different user_id but maybe related?
        if (articles.length === 0) {
            console.log('\n3. Checking if any articles exist at all...');
            const { data: anyArticles } = await supabase.from('articles').select('id, title, user_id').limit(3);
            console.log('Sample matches:', anyArticles);
        }
    }
}

run();
