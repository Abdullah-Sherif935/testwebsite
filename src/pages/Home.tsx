import { Hero } from '../components/home/Hero';
import { ResourceCard } from '../components/common/ResourceCard';
import { BlogCard } from '../components/common/BlogCard';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fadeInUp, staggerContainer, pageTransition } from '../utils/animations';
import { getLatestArticles } from '../services/articles';
import { getResources } from '../services/resources';
import type { Article } from '../types/article';
import type { Resource } from '../types/resource';

export function Home() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    // Start with empty arrays to ensure we see the REAL data from Supabase
    const [articles, setArticles] = useState<Article[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Load Articles & Resources in parallel
        Promise.all([
            getLatestArticles(3),
            getResources()
        ]).then(([articlesData, resourcesData]) => {
            setArticles(articlesData);
            setResources(resourcesData);
            setLoading(false);
        }).catch(err => {
            console.error('Error in Home data fetch:', err);
            setLoading(false);
        });
    }, []);

    const getResourceIcon = (fileType: string | null) => {
        switch (fileType?.toLowerCase()) {
            case 'pdf': return <span className="text-2xl">📄</span>;
            case 'zip': return <span className="text-2xl">📦</span>;
            case 'code': return <span className="text-2xl">💻</span>;
            case 'roadmap': return <span className="text-2xl">🗺️</span>;
            default: return <span className="text-2xl">📁</span>;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const estimateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return t('cards.readTime', { count: minutes });
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-white dark:bg-[#020617]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                    <div className="absolute inset-x-0 -bottom-8 text-center text-sm font-medium text-slate-500 animate-pulse">
                        {t('common.loading') || 'Loading...'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{t('seo.home.title')}</title>
                <meta name="description" content={t('seo.home.description')} />
            </Helmet>
            <Hero />

            {/* Featured Resources Section */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900/50 relative border-y border-slate-200 dark:border-slate-800">
                <motion.div
                    className="container mx-auto px-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div
                        className="flex justify-between items-end mb-12"
                        variants={fadeInUp}
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
                                {t('sections.resources.title')}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-xl">
                                {t('sections.resources.subtitle')}
                            </p>
                        </div>
                        <Link to="/resources" className="hidden md:block text-blue-600 dark:text-blue-400 font-medium hover:underline">
                            {t('sections.resources.viewAll')}
                        </Link>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={staggerContainer}
                    >
                        {resources.map((resource) => (
                            <motion.div key={resource.id} variants={fadeInUp}>
                                <ResourceCard
                                    title={resource.title}
                                    description={resource.description || ''}
                                    icon={getResourceIcon(resource.type)}
                                    action={{
                                        label: t('sections.resources.download'),
                                        onClick: () => window.open(resource.url, '_blank')
                                    }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* Blog Section */}
            <section className="py-20 bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800">
                <motion.div
                    className="container mx-auto px-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div
                        className="flex justify-between items-end mb-12"
                        variants={fadeInUp}
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
                                {t('sections.blog.title')}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-xl">
                                {t('sections.blog.subtitle')}
                            </p>
                        </div>
                        <Link to="/articles" className="hidden md:block text-purple-600 dark:text-purple-400 font-medium hover:underline">
                            {t('sections.blog.viewAll')}
                        </Link>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={staggerContainer}
                    >
                        {articles.map((article) => {
                            // Defensive guard: Skip articles without valid slugs
                            if (!article.slug) {
                                console.warn('Skipping article without slug in Home:', article.id, article.title);
                                return null;
                            }

                            return (
                                <motion.div key={article.id} variants={fadeInUp}>
                                    <Link to={`/articles/${article.slug}`}>
                                        <BlogCard
                                            title={article.title}
                                            excerpt={article.excerpt || article.content_md?.substring(0, 120) + '...'}
                                            date={formatDate(article.created_at)}
                                            readTime={estimateReadTime(article.content_md || '')}
                                            category={article.category}
                                            image={article.image_url}
                                            onClick={() => { }}
                                        />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </section>
        </motion.div>
    );
}
