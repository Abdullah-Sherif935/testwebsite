import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { VideoItem } from '../components/common/VideoItem';
import { getAllVideos } from '../services/videos';
import { fadeInUp, staggerContainer, pageTransition } from '../utils/animations';
import type { Video } from '../types/video';

export function Videos() {
    const { t, i18n } = useTranslation();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'shorts' | 'long'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const isArabic = i18n.language === 'ar';

    const CATEGORIES = [
        'Inspection Robot',
        'ROS2',
        'PID Control',
        'Arduino',
        'SolidWorks'
    ];

    // Helper to infer category from title if not present in DB
    const inferCategory = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('robot') || lowerTitle.includes('روبوت')) return 'Inspection Robot';
        if (lowerTitle.includes('ros') || lowerTitle.includes('روز')) return 'ROS2';
        if (lowerTitle.includes('pid') || lowerTitle.includes('تحكم')) return 'PID Control';
        if (lowerTitle.includes('arduino') || lowerTitle.includes('أردوينو')) return 'Arduino';
        if (lowerTitle.includes('solidworks') || lowerTitle.includes('سوليد')) return 'SolidWorks';
        return 'Other';
    };

    useEffect(() => {
        setLoading(true);
        getAllVideos()
            .then(data => {
                setVideos(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching videos:', err);
                setLoading(false);
            });
    }, []);

    const getYouTubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    };

    // Filter Logic
    const filteredVideos = videos.filter(video => {
        // 1. Search
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Type Filter
        const matchesType =
            typeFilter === 'all' ? true :
                typeFilter === 'shorts' ? video.is_shorts :
                    !video.is_shorts;

        // 3. Category Filter
        const videoCategory = inferCategory(video.title);
        const matchesCategory =
            categoryFilter === 'all' ? true :
                videoCategory === categoryFilter;

        return matchesSearch && matchesType && matchesCategory;
    });

    // Stats Logic
    const stats = {
        total: videos.length,
        shorts: videos.filter(v => v.is_shorts).length,
        long: videos.filter(v => !v.is_shorts).length
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-white dark:bg-[#020617]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-red-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.main
            className="pt-16 pb-20 min-h-screen bg-slate-50 dark:bg-[#020617]"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{t('seo.videos.title') || (isArabic ? 'المحتوى المرئي | عبدالله شريف' : 'Videos | Abdullah Sherif')}</title>
                <meta name="description" content={t('seo.videos.description') || (isArabic ? 'شروحات تقنية وهندسية متقدمة' : 'Advanced technical and engineering tutorials')} />
            </Helmet>

            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header & Stats */}
                <motion.div className="mb-12" variants={fadeInUp}>
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                            {isArabic ? 'المكتبة المرئية' : 'Video Library'}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {isArabic
                                ? 'استكشف مئات الشروحات التقنية المصنفة بعناية لتناسب مسارك التعليمي.'
                                : 'Explore hundreds of carefully categorized technical tutorials to suit your learning path.'}
                        </p>
                    </div>

                    {/* Stats Cards - Modern Glass */}
                    <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-10">
                        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                            <div className="text-xs md:text-sm text-slate-500 uppercase tracking-wider">{isArabic ? 'الكل' : 'Total'}</div>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-orange-500 to-red-500 opacity-80"></div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stats.shorts}</div>
                            <div className="text-xs md:text-sm text-orange-500 font-bold uppercase tracking-wider">Shorts</div>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500 to-cyan-500 opacity-80"></div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stats.long}</div>
                            <div className="text-xs md:text-sm text-blue-500 font-bold uppercase tracking-wider">{isArabic ? 'شروحات كاملة' : 'Tutorials'}</div>
                        </div>
                    </div>

                    {/* Controls Bar (Search + Filters) */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-6 items-center justify-between sticky top-24 z-30">

                        {/* Search */}
                        <div className="relative w-full lg:w-1/3">
                            <input
                                type="text"
                                placeholder={isArabic ? 'ابحث عن فيديو...' : 'Search for a video...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                            />
                            <svg className="w-5 h-5 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Filters Group */}
                        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto overflow-x-auto pb-2 md:pb-0">

                            {/* Type Filter */}
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                {(['all', 'videos', 'shorts'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type === 'videos' ? 'long' : type as any)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${(typeFilter === 'long' && type === 'videos') || typeFilter === type
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        {type === 'all' ? (isArabic ? 'الكل' : 'All') :
                                            type === 'videos' ? (isArabic ? 'فيديوهات' : 'Videos') : 'Shorts'}
                                    </button>
                                ))}
                            </div>

                            {/* Divider (Hidden on mobile) */}
                            <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                            {/* Category Filter */}
                            <div className="flex gap-2 items-center overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => setCategoryFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${categoryFilter === 'all'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {isArabic ? 'جميع الأقسام' : 'All Categories'}
                                </button>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${categoryFilter === cat
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Videos Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    key={`${typeFilter}-${categoryFilter}-${searchQuery}`}
                >
                    {filteredVideos.map((video) => (
                        <motion.div key={video.id} variants={fadeInUp}>
                            <VideoItem
                                title={video.title}
                                videoId={video.youtube_video_id || getYouTubeId(video.youtube_url)}
                                videoUrl={video.youtube_url}
                                thumbnailUrl={video.thumbnail_url}
                                viewCount={video.view_count}
                                publishedAt={video.published_at}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {filteredVideos.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {isArabic ? 'لا توجد نتائج' : 'No videos found'}
                        </h3>
                        <p className="text-slate-500">
                            {isArabic ? 'جرب البحث بكلمات مختلفة أو تغيير الفلاتر' : 'Try adjusting your search or filters'}
                        </p>
                    </div>
                )}
            </div>
        </motion.main>
    );
}
