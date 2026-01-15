
import { createClient } from '@supabase/supabase-js';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

// 1. Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase environment variables are missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Define Static Routes
const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/articles', changefreq: 'daily', priority: 0.9 },
    { url: '/resources', changefreq: 'weekly', priority: 0.8 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
];

async function generateSitemap() {
    try {
        console.log('🔄 Generating sitemap...');

        // 3. Fetch Published Articles
        const { data: articles, error } = await supabase
            .from('articles')
            .select('slug, updated_at')
            .eq('status', 'published');

        if (error) {
            console.error('Error fetching articles:', error);
            throw error;
        }

        // 4. Add Dynamic Article Routes
        if (articles) {
            articles.forEach((article) => {
                links.push({
                    url: `/articles/${article.slug}`,
                    changefreq: 'weekly',
                    priority: 0.8,
                    lastmod: article.updated_at,
                });
            });
        }

        // 5. Create Sitemap Stream
        const stream = new SitemapStream({ hostname: 'https://eng-abdullah-sherif.com' }); // TODO: Replace with real domain when live

        const sitemapPath = resolve('public', 'sitemap.xml');

        // Pipe to file
        const writeStream = createWriteStream(sitemapPath);

        // Return a promise that resolves when the file is fully written
        return new Promise((resolve, reject) => {
            stream.pipe(writeStream)
                .on('finish', () => {
                    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
                    resolve(true);
                })
                .on('error', (err) => {
                    reject(err);
                });

            // Write all links
            links.forEach((link) => stream.write(link));
            stream.end();
        });

    } catch (error) {
        console.error('❌ Failed to generate sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
