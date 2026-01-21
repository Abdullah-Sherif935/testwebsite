import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { getAllArticles, getUserArticleInteractions } from '../../services/articles';
import { supabase } from '../../services/supabase';
import { pageTransition } from '../../utils/animations';
import type { Article } from '../../types/article';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';

type SortOption = 'newest' | 'oldest';

export function Articles() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [interactions, setInteractions] = useState<Record<string, { is_saved: boolean, is_read: boolean }>>({});

    useEffect(() => {
        const loadInitialData = async () => {
            const articlesData = await getAllArticles();
            setArticles(articlesData);

            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const userActions = await getUserArticleInteractions(session.user.id);
                const interactionMap: Record<string, { is_saved: boolean, is_read: boolean }> = {};
                userActions.forEach((action: any) => {
                    interactionMap[action.article_id] = {
                        is_saved: action.is_saved,
                        is_read: action.is_read
                    };
                });
                setInteractions(interactionMap);
            }

            setLoading(false);
        };

        loadInitialData();
    }, []);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = articles.map(a => a.category);
        return ['all', ...Array.from(new Set(cats))];
    }, [articles]);

    // Extract unique authors
    const authors = useMemo(() => {
        const auths = articles.map(a => ({
            id: a.user_id,
            name: a.author_name
        }));
        // Remove duplicates based on ID
        const uniqueAuthors = Array.from(new Map(auths.map(a => [a.id, a])).values());
        return [{ id: 'all', name: isArabic ? 'كل الكتّاب' : 'All Authors' }, ...uniqueAuthors];
    }, [articles, isArabic]);

    // Filter and sort articles
    const filteredArticles = useMemo(() => {
        let filtered = selectedCategory === 'all'
            ? articles
            : articles.filter(a => a.category === selectedCategory);

        // Author filter
        if (selectedAuthor !== 'all') {
            filtered = filtered.filter(a => a.user_id === selectedAuthor);
        }

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
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Category Dropdown Filter */}
                        <div className="w-full md:w-auto">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full md:min-w-[200px] px-4 py-2 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            >
                                <option value="all">{t('cards.all')}</option>
                                {categories.filter(c => c !== 'all').map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Author Dropdown Filter */}
                        <div className="w-full md:w-auto">
                            <select
                                value={selectedAuthor}
                                onChange={(e) => setSelectedAuthor(e.target.value)}
                                className="w-full md:min-w-[200px] px-4 py-2 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            >
                                {authors.map((author) => (
                                    <option key={author.id} value={author.id}>
                                        {author.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div className="w-full md:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="w-full md:min-w-[150px] px-4 py-2 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            >
                                <option value="newest">{t('cards.newest')}</option>
                                <option value="oldest">{t('cards.oldest')}</option>
                            </select>
                        </div>
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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {filteredArticles.map((article, index) => {
                            if (!article.slug) return null;

                            return (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group h-full"
                                >
                                    <Link
                                        to={`/articles/${article.slug}`}
                                        className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300"
                                    >
                                        {/* Image Container with 1:1 Aspect Ratio */}
                                        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            {article.image_url ? (
                                                <img
                                                    src={article.image_url}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                                                    📝
                                                </div>
                                            )}

                                            {/* Status Indicators Overlays */}
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                                {interactions[article.id]?.is_saved && (
                                                    <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg" title={isArabic ? 'محفوظ' : 'Saved'}>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {interactions[article.id]?.is_read && (
                                                    <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg" title={isArabic ? 'تمت القراءة' : 'Read'}>
                                                        <span className="text-[10px] font-bold">✅✅</span>
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        <div className="p-6 flex flex-col flex-grow">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                                                {article.title}
                                            </h2>

                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
                                                {article.excerpt || (article.content_md || article.content)?.substring(0, 100) + '...'}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs text-slate-500 font-medium">
                                                <div className="flex items-center gap-2">
                                                    {article.author?.avatar_url ? (
                                                        <img src={article.author.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                                                    ) : (
                                                        <span>👤</span>
                                                    )}
                                                    <span className="flex items-center gap-1 font-bold">
                                                        {article.author_name}
                                                        {article.author?.is_verified && <VerifiedBadge size="xs" />}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>{formatDate(article.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-medium">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                    <span>📂</span>
                                                    <span className="font-bold">{article.category}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>👁️</span>
                                                    <span>{article.views_count || 0}</span>
                                                </div>
                                            </div>
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
