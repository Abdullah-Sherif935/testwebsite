import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';

// Services & Types
import { getArticleBySlug } from '../../services/articles';
import { getResourcesByArticleSlug } from '../../services/resources';
import type { Article } from '../../types/article';
import type { Resource } from '../../types/resource';
import { pageTransition } from '../../utils/animations';
import { RichTextRenderer } from '../../components/common/RichTextRenderer';

// CSS for Math and Code Highlighting
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

import { extractSEOData } from '../../utils/seo';

export function ArticleDetail() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

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
            });
        }
    }, [slug]);

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

    if (!article) {
        return (
            <motion.div
                className="min-h-screen pt-32 container mx-auto px-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">{t('article.notFound.title')}</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">{t('article.notFound.description')}</p>
                <Link
                    to="/articles"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {t('article.backToArticles')}
                </Link>
            </motion.div>
        );
    }

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

                {/* Direction: We use the site's language direction, but if article has specific lang we could respect it. 
                    For now, assuming unified UI direction. */}
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
                    {/* Category Label */}
                    <div className={`lg:absolute ${isArabic ? 'lg:-right-32' : 'lg:-left-32'} lg:top-0 mb-6 lg:mb-0`}>
                        <div className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold whitespace-nowrap">
                            {article.category}
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                            {article.title}
                        </h1>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                        <time dateTime={article.created_at}>
                            {new Date(article.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>
                </motion.div>

                {/* Featured Image */}
                {article.image_url && (
                    <motion.div
                        className="relative aspect-video w-full rounded-2xl overflow-hidden mb-16 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                )}

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
