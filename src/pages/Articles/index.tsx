import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { getAllArticles } from '../../services/articles';
import { pageTransition } from '../../utils/animations';
import type { Article } from '../../types/article';

type SortOption = 'newest' | 'oldest';

export function Articles() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        getAllArticles().then(data => {
            setArticles(data);
            setLoading(false);
        });
    }, []);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = articles.map(a => a.category);
        return ['all', ...Array.from(new Set(cats))];
    }, [articles]);

    // Filter and sort articles
    const filteredArticles = useMemo(() => {
        let filtered = selectedCategory === 'all'
            ? articles
            : articles.filter(a => a.category === selectedCategory);

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        return filtered.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [articles, selectedCategory, sortBy, searchQuery]);

    // Helper to format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper for read time
    const estimateReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return t('cards.readTime', { count: minutes });
    };

    return (
        <motion.div
            className="pt-24 pb-20 min-h-screen bg-white dark:bg-slate-950"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{t('seo.articles.title')}</title>
                <meta name="description" content={t('seo.articles.description')} />
            </Helmet>

            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <motion.header
                    className="mb-12 pb-8 border-b border-slate-200 dark:border-slate-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900 dark:text-white">
                        {t('sections.blog.title')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                        {t('sections.blog.subtitle')}
                    </p>
                </motion.header>

                {/* Filters Bar */}
                <motion.div
                    className="mb-10 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('cards.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className={`absolute ${isArabic ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Category & Sort */}
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedCategory === cat
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {cat === 'all' ? t('cards.all') : cat}
                                </button>
                            ))}
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border-none outline-none cursor-pointer"
                        >
                            <option value="newest">{t('cards.newest')}</option>
                            <option value="oldest">{t('cards.oldest')}</option>
                        </select>
                    </div>

                    {/* Results count */}
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('cards.articleCount', { count: filteredArticles.length })}
                    </p>
                </motion.div>

                {/* Articles List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-3 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                            {t('cards.noArticles')}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {filteredArticles.map((article, index) => {
                            // Defensive guard: Skip articles without valid slugs
                            if (!article.slug) {
                                console.warn('Skipping article without slug:', article.id, article.title);
                                return null;
                            }

                            return (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group"
                                >
                                    <Link
                                        to={`/articles/${article.slug}`}
                                        className="block pb-6 border-b border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                                                {article.title}
                                            </h2>
                                            <span className="flex-shrink-0 px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                                {article.category}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                                            {article.excerpt || (article.content_md || article.content)?.substring(0, 150) + '...'}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                                            <time dateTime={article.created_at}>
                                                {formatDate(article.created_at)}
                                            </time>
                                            <span>•</span>
                                            <span>{estimateReadTime(article.content_md || article.content || '')}</span>
                                            <span className={`text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ${isArabic ? 'mr-auto' : 'ml-auto'}`}>
                                                {t('cards.readMore')}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.article>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
