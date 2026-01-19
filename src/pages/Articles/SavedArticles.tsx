import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { getSavedArticles } from '../../services/articles';
import type { Article } from '../../types/article';
import { pageTransition } from '../../utils/animations';
import { Helmet } from 'react-helmet-async';

export function SavedArticles() {
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchSaved(session.user.id);
            } else {
                setLoading(false);
            }
        });
    }, []);

    async function fetchSaved(userId: string) {
        setLoading(true);
        const data = await getSavedArticles(userId);
        setArticles(data);
        setLoading(false);
    }

    const pageTitle = isArabic ? 'المقالات المحفوظة' : 'Saved Articles';

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-white dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-32 container mx-auto px-4 text-center">
                <Helmet>
                    <title>{pageTitle}</title>
                    <html lang={i18n.language} dir={isArabic ? 'rtl' : 'ltr'} />
                </Helmet>
                <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                    {isArabic ? 'سجل الدخول لرؤية مقالاتك المحفوظة' : 'Login to see your saved articles'}
                </h1>
                <Link to="/admin/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold">
                    {isArabic ? 'تسجيل الدخول' : 'Login'}
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            className="pt-32 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        {isArabic ? 'المقالات المحفوظة' : 'Saved Articles'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isArabic ? 'قائمتك الشخصية للمقالات التي تود قراءتها لاحقاً' : 'Your personal list of articles you want to read later'}
                    </p>
                </div>

                {articles.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <span className="text-5xl mb-4 block">🔖</span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {isArabic ? 'لا توجد مقالات محفوظة' : 'No saved articles'}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            {isArabic ? 'ابدأ في تصفح المقالات وحفظ ما يعجبك' : 'Start browsing articles and save what you like'}
                        </p>
                        <Link to="/articles" className="text-blue-600 font-bold hover:underline">
                            {isArabic ? 'تصفح المقالات' : 'Browse Articles'}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                to={`/articles/${article.slug}`}
                                className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300"
                            >
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
                                        <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg" title={isArabic ? 'محفوظ' : 'Saved'}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-2 uppercase tracking-widest">
                                        {article.category}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                                        {article.excerpt}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
