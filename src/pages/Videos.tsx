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
    const isArabic = i18n.language === 'ar';

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

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-white dark:bg-[#020617]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-red-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.main
            className="pt-32 pb-20 min-h-screen"
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
                <motion.div
                    className="mb-16 text-center"
                    variants={fadeInUp}
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
                        {isArabic ? 'المحتوى المرئي' : 'Video Tutorials'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                        {isArabic
                            ? 'نغوص في التفاصيل التقنية من خلال شروحات مرئية مكثفة تغطي الميكاترونيكس، البرمجة، والأنظمة المدمجة.'
                            : 'Deep-diving into technical details through intensive video tutorials covering mechatronics, programming, and embedded systems.'}
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    viewport={{ once: true }}
                >
                    {videos.map((video) => (
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

                {videos.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 italic">
                            {isArabic ? 'لا توجد فيديوهات متاحة حالياً' : 'No videos available at the moment'}
                        </p>
                    </div>
                )}
            </div>
        </motion.main>
    );
}
