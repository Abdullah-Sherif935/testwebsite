import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';

// Services & Types
import { getArticleBySlug, getArticleAction, toggleArticleAction, incrementArticleViews } from '../../services/articles';
import { getResourcesByArticleSlug } from '../../services/resources';
import { supabase } from '../../services/supabase';
import type { Article, ArticleAction } from '../../types/article';
import type { Resource } from '../../types/resource';
import { pageTransition } from '../../utils/animations';
import { RichTextRenderer } from '../../components/common/RichTextRenderer';
import { CommentSection } from '../../components/articles/CommentSection';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';

// CSS for Math and Code Highlighting
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

import { extractSEOData } from '../../utils/seo';

export function ArticleDetail() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const isArabic = i18n.language.startsWith('ar');
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Interactions
    const [user, setUser] = useState<any>(null);
    const [actions, setActions] = useState<ArticleAction | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
    }, []);

    const markdownComponents = useMemo(() => ({
        h1: ({ node, ...props }: any) => <h1 className="text-4xl font-bold mt-12 mb-6 text-slate-900 dark:text-white" {...props} />,
        h2: ({ node, ...props }: any) => <h2 className="text-3xl font-bold mt-10 mb-5 text-slate-900 dark:text-white" {...props} />,
        h3: ({ node, ...props }: any) => <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white" {...props} />,
        h4: ({ node, ...props }: any) => <h4 className="text-xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200" {...props} />,
        p: ({ node, ...props }: any) => <p className="text-lg leading-relaxed mb-6 text-slate-700 dark:text-slate-300" {...props} />,
        ul: ({ node, ...props }: any) => <ul className="list-disc list-inside mb-6 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
        ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside mb-6 space-y-2 text-slate-700 dark:text-slate-300" {...props} />,
        li: ({ node, ...props }: any) => <li className="text-lg leading-relaxed ml-4" {...props} />,
        a: ({ node, ...props }: any) => (
            <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        img: ({ node, ...props }: any) => (
            <img className="rounded-xl my-8 w-full shadow-lg" loading="lazy" {...props} />
        ),
        code: ({ node, inline, ...props }: any) =>
            inline ? (
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded text-sm font-mono" {...props} />
            ) : (
                <div className="my-6">
                    <pre className="!bg-slate-900 !rounded-lg overflow-x-auto">
                        <code className="block p-4 text-sm font-mono text-slate-200" {...props} />
                    </pre>
                </div>
            ),
        blockquote: ({ node, ...props }: any) => (
            <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg" {...props} />
        ),
        hr: ({ node, ...props }: any) => <hr className="my-12 border-slate-200 dark:border-slate-800" {...props} />,
        table: ({ node, ...props }: any) => (
            <div className="overflow-x-auto my-8">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} />
            </div>
        ),
        th: ({ node, ...props }: any) => <th className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-left text-sm font-semibold text-slate-900 dark:text-white" {...props} />,
        td: ({ node, ...props }: any) => <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700" {...props} />,
    }), []);

    useEffect(() => {
        if (slug) {
            window.scrollTo(0, 0);
            Promise.all([
                getArticleBySlug(slug),
                getResourcesByArticleSlug(slug)
            ]).then(([articleData, resourcesData]) => {
                setArticle(articleData);
                setResources(resourcesData);
                setLoading(false);
                if (articleData?.id) {
                    incrementArticleViews(articleData.id);
                }
            });
        }
    }, [slug]);

    useEffect(() => {
        if (article && user) {
            getArticleAction(article.id, user.id).then(setActions);
        }
    }, [article, user]);

    const handleAction = async (type: 'is_saved' | 'is_read') => {
        if (!user || !article) {
            navigate('/auth', { state: { from: location } });
            return;
        }

        setActionLoading(true);
        const newValue = !actions?.[type];
        const { error } = await toggleArticleAction(article.id, user.id, type, newValue);

        if (error) {
            alert(error.message);
        } else {
            setActions(prev => prev ? { ...prev, [type]: newValue } : { [type]: newValue } as any);
        }
        setActionLoading(false);
    };

    const articleBody = useMemo(() => article?.content_md || article?.content, [article]);
    const seoData = useMemo(() => extractSEOData(article?.content_rich, article?.excerpt), [article]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-white dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!article) {
        return (
            <motion.div
                className="min-h-screen pt-32 container mx-auto px-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">المقال غير موجود</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">عذراً، لم نتمكن من العثور على المقال المطلوب</p>
                <Link
                    to="/articles"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    العودة للمقالات
                </Link>
            </motion.div>
        );
    }

    const pageTitle = article ? `${article.title} | ${t('app.title')}` : t('app.title');
    const description = seoData.description || article?.excerpt || '';
    const ogImage = seoData.ogImage || article?.image_url;

    return (
        <motion.article
            className="pt-16 pb-20 min-h-screen bg-white dark:bg-slate-950"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={description} />

                {/* Open Graph */}
                <meta property="og:title" content={article.title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="article" />
                <meta property="og:locale" content={isArabic ? 'ar_EG' : 'en_US'} />
                {ogImage && <meta property="og:image" content={ogImage} />}

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={article.title} />
                <meta name="twitter:description" content={description} />
                {ogImage && <meta name="twitter:image" content={ogImage} />}

                <html lang={i18n.language} dir={isArabic ? 'rtl' : 'ltr'} />
            </Helmet>

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <motion.div
                    className="relative mb-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-8 text-slate-900 dark:text-white leading-tight">
                        {article.title}
                    </h1>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-slate-500 dark:text-slate-400 text-sm">
                        <time dateTime={article.created_at} className="flex items-center gap-2">
                            <span>📅</span>
                            {new Date(article.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>

                        {/* Author */}
                        <Link
                            to={`/authors/${article.user_id}`}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                        >
                            {article.author?.avatar_url ? (
                                <img src={article.author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800" />
                            ) : (
                                <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-sm">👤</span>
                            )}
                            <span className="font-bold flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                                {article.author_name}
                                {article.author?.is_verified && <VerifiedBadge size="sm" />}
                            </span>
                        </Link>

                        {/* Interaction Buttons */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction('is_saved')}
                                disabled={actionLoading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm font-bold ${actions?.is_saved
                                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                title={t('article.saveForLater')}
                            >
                                <span className="text-lg">{actions?.is_saved ? '🔖' : '📑'}</span>
                                {actions?.is_saved ? (isArabic ? 'محفوظ' : 'Saved') : (isArabic ? 'حفظ' : 'Save')}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction('is_read')}
                                disabled={actionLoading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm font-bold ${actions?.is_read
                                    ? 'bg-green-600 text-white shadow-green-500/20'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                title={t('article.markAsRead')}
                            >
                                <span className="text-lg">{actions?.is_read ? '✅' : '✔️'}</span>
                                {actions?.is_read ? (isArabic ? 'مقروء' : 'Read') : (isArabic ? 'مقروء؟' : 'Read?')}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Header */}

                {/* Content */}
                <motion.div
                    className="article-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {!article.content_rich && !articleBody ? (
                        <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <span className="text-4xl mb-4 block">📝</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('article.noContent.title')}</h3>
                            <p className="text-slate-600 dark:text-slate-400">{t('article.noContent.description')}</p>
                        </div>
                    ) : article.content_rich ? (
                        <RichTextRenderer content={article.content_rich} />
                    ) : (
                        <div className="prose prose-lg dark:prose-invert max-w-none prose-slate" dir="auto">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[
                                    rehypeRaw,
                                    rehypeSanitize,
                                    rehypeHighlight,
                                    rehypeKatex
                                ]}
                                components={markdownComponents}
                            >
                                {articleBody}
                            </ReactMarkdown>
                        </div>
                    )}
                </motion.div>

                {/* Resources Section */}
                {resources.length > 0 && (
                    <motion.section
                        className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="text-blue-600">📁</span> {t('article.attachments')}
                        </h2>
                        <div className="space-y-4">
                            {resources.map((resource) => (
                                <a
                                    key={resource.id}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`w-10 h-10 flex items-center justify-center rounded-lg ${resource.type === 'pdf' ? 'bg-red-100 text-red-600' :
                                            resource.type === 'code' ? 'bg-purple-100 text-purple-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            {resource.type === 'pdf' ? '📄' : resource.type === 'code' ? '💻' : '🔗'}
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {resource.title}
                                            </h3>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">{resource.type}</span>
                                        </div>
                                    </div>
                                    <svg className={`w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors ${isArabic ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Comments Section */}
                <CommentSection articleId={article.id} />

                {/* Back Button */}
                <motion.div
                    className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link
                        to="/articles"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group"
                    >
                        <svg className={`w-5 h-5 transition-transform ${isArabic ? 'transform -rotate-180 group-hover:translate-x-1' : 'transform rotate-180 group-hover:-translate-x-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        {t('article.backToAll')}
                    </Link>
                </motion.div>
            </div>
        </motion.article>
    );
}
