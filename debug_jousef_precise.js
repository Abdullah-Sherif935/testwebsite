import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    // 1. Get Jousef Antigravity profile
    const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('full_name_ar', '%Antigravity%');

    if (!profiles || profiles.length === 0) {
        console.log('No "Antigravity" profile. Trying "Jousef"...');
        const { data: jousefs } = await supabase.from('user_profiles').select('*').ilike('full_name_ar', '%Jousef%');
        jousefs?.forEach(p => printProfile(p));
    } else {
        profiles.forEach(p => printProfile(p));
    }

    async function printProfile(p) {
        console.log(`\n👨‍💻 Profile: ${p.full_name_ar}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   User ID (column): ${p.user_id}`); // Some schemas have both?

        // 2. Query Articles for this ID
        console.log(`   🔎 Querying articles where user_id = '${p.id}'...`);
        const { data: articles, error } = await supabase
            .from('articles')
            .select('id, title, user_id, status')
            .eq('user_id', p.id);

        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            console.log(`   ✅ Articles found: ${articles.length}`);
            articles.forEach(a => console.log(`      - ${a.title} (User ID: ${a.user_id})`));
        }
    }
}

run();
