import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { getUserProfile } from '../../services/profile';
import type { UserProfile } from '../../services/profile';
import { getAuthorArticles, getAuthorStats } from '../../services/articles';
import type { Article } from '../../types/article';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { pageTransition } from '../../utils/animations';

export function AuthorProfile() {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [stats, setStats] = useState({ total_ratings: 0, average_rating: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'articles' | 'about'>('articles');

    useEffect(() => {
        if (id) {
            loadAuthorData();
        }
    }, [id]);

    async function loadAuthorData() {
        setLoading(true);
        try {
            const [profileData, articlesData, statsData] = await Promise.all([
                getUserProfile(id!),
                getAuthorArticles(id!),
                getAuthorStats(id!)
            ]);
            setProfile(profileData);
            setArticles(articlesData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading author data:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-slate-50 dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen pt-32 text-center bg-slate-50 dark:bg-slate-950">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isArabic ? 'المؤلف غير موجود' : 'Author not found'}
                </h2>
                <Link to="/articles" className="text-blue-600 hover:underline mt-4 inline-block">
                    {isArabic ? 'العودة للمقالات' : 'Back to Articles'}
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
                <title>{`${profile.full_name_ar || profile.full_name_en} | ${t('app.title')}`}</title>
            </Helmet>

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/20 shadow-2xl">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl">
                                        👤
                                    </div>
                                )}
                            </div>
                            {profile.is_verified && (
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 rounded-full p-1 shadow-lg border border-slate-100 dark:border-slate-800">
                                    <VerifiedBadge size="lg" />
                                </div>
                            )}
                        </div>

                        <div className="text-center md:text-start flex-grow">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                                {isArabic ? profile.full_name_ar : profile.full_name_en}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-2xl leading-relaxed">
                                {profile.about_me || (isArabic ? 'كاتب ومساهم في المنصة.' : 'Writer and contributor on the platform.')}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                {profile.governorate && (
                                    <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                                        📍 {profile.governorate}
                                    </span>
                                )}
                                {profile.linkedin_url && (
                                    <a
                                        href={profile.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm font-bold px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                                    >
                                        🔗 LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[150px]">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{articles.length}</span>
                                <span className="text-[10px] uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 font-bold">
                                    {isArabic ? 'مقالة منشورة' : 'Published Articles'}
                                </span>
                            </div>

                            {stats.total_ratings > 0 && (
                                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800/50">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <span className="text-xl font-black text-yellow-600 dark:text-yellow-400">{stats.average_rating}</span>
                                        <span className="text-sm">⭐</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-yellow-600/70 dark:text-yellow-400/70 font-bold">
                                        ({stats.total_ratings} {isArabic ? 'تقييم' : 'Ratings'})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-8">
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`pb-4 text-sm font-black transition-all relative ${activeTab === 'articles'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {isArabic ? '📚 المقالات' : '📚 Articles'}
                        {activeTab === 'articles' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('about')}
                        className={`pb-4 text-sm font-black transition-all relative ${activeTab === 'about'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {isArabic ? '👤 السيرة الذاتية' : '👤 About/CV'}
                        {activeTab === 'about' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                            />
                        )}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'articles' ? (
                        <motion.div
                            key="articles"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {articles.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-500">{isArabic ? 'لا توجد مقالات منشورة بعد.' : 'No published articles yet.'}</p>
                                </div>
                            ) : (
                                articles.map((article) => (
                                    <Link
                                        key={article.id}
                                        to={`/articles/${article.slug}`}
                                        className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            {article.image_url ? (
                                                <img src={article.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📝</div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold">
                                                {article.category}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{article.title}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{article.excerpt}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] text-slate-400">📅 {new Date(article.created_at).toLocaleDateString(isArabic ? 'ar' : 'en')}</span>
                                                <span className="text-[10px] text-blue-600 font-bold">{isArabic ? 'اقرأ المزيد ←' : 'Read More →'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="about"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Detailed About Me Section */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm leading-relaxed">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    📝 {isArabic ? 'نبذة تعريفية' : 'Biography'}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap text-lg">
                                    {profile.about_me || (isArabic ? 'لم يقم الكاتب بإضافة نبذة شخصية بعد.' : 'The author hasn\'t added a biography yet.')}
                                </p>
                            </div>

                            {/* Profile Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        🎓 {isArabic ? 'التحصيل العلمي' : 'Education'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500">{isArabic ? 'الجامعة' : 'University'}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{profile.university || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500">{isArabic ? 'الكلية' : 'Faculty'}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{profile.faculty || '—'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">{isArabic ? 'التخصص' : 'Department'}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{profile.department || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                        🛠️ {isArabic ? 'المهارات' : 'Skills'}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills && profile.skills.length > 0 ? (
                                            profile.skills.map((skill, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold border border-blue-100 dark:border-blue-800/50">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 italic">{isArabic ? 'لم تضاف مهارات بعد.' : 'No skills added yet.'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CV Button - Improved and fixed */}
                            {profile.cv_file_url && (
                                <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl shadow-blue-500/20">
                                    <div className="relative z-10 text-center md:text-start">
                                        <h3 className="text-2xl font-black mb-2">{isArabic ? 'السيرة الذاتية المفصلة' : 'Detailed CV / Resume'}</h3>
                                        <p className="text-blue-100 text-sm max-w-md">
                                            {isArabic
                                                ? 'يمكنك تحميل ملف السيرة الذاتية الخاص بالكاتب للإطلاع على كافة الخبرات والمهارات بشكل مفصل.'
                                                : 'You can download the author\'s CV to view all experiences and skills in detail.'}
                                        </p>
                                    </div>
                                    <a
                                        href={profile.cv_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative z-10 inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                                    >
                                        📄 {isArabic ? 'تحميل السيرة الذاتية' : 'Download CV'}
                                    </a>
                                    {/* Decorative background element */}
                                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                                </div>
                            )}

                            {/* Experiences & Projects */}
                            {profile.experiences && profile.experiences.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                                        💼 {isArabic ? 'الخبرات العملية' : 'Experiences'}
                                    </h3>
                                    <div className="space-y-8">
                                        {profile.experiences.map((exp, idx) => (
                                            <div key={idx} className="relative pl-8 md:pl-0">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{exp.title}</h4>
                                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                                        {exp.from} - {exp.to || (isArabic ? 'الآن' : 'Present')}
                                                    </span>
                                                </div>
                                                <p className="text-blue-600 dark:text-blue-400 font-bold mb-2">{exp.company}</p>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.projects && profile.projects.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                                        🚀 {isArabic ? 'أبرز المشاريع' : 'Featured Projects'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {profile.projects.map((proj, idx) => (
                                            <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{proj.title}</h4>
                                                <p className="text-sm text-slate-500 mb-4 line-clamp-3">{proj.description}</p>
                                                {proj.link && (
                                                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 font-bold flex items-center gap-1 hover:underline">
                                                        🔗 {isArabic ? 'عرض المشروع' : 'View Project'}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
