import { useTranslation } from 'react-i18next';
import { formatViewCount } from '../../services/videos';

interface VideoItemProps {
    title: string;
    videoId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    viewCount?: number;
    publishedAt?: string;
}

export function VideoItem({ title, videoId, videoUrl, thumbnailUrl, viewCount, publishedAt }: VideoItemProps) {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const finalThumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="relative group h-full">
            {/* Soft Glow Effect */}
            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-hover:bg-blue-500/10 transition-all duration-500" />

            {/* Card Content */}
            <div className="relative h-full flex flex-col p-4 rounded-2xl bg-white dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-2xl overflow-hidden">

                {/* Thumbnail Container */}
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-video rounded-xl overflow-hidden mb-4 group/image block"
                >
                    <img
                        src={finalThumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover/image:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/image:bg-transparent transition-colors duration-300" />

                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </a>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 leading-relaxed line-clamp-2 min-h-[3rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {title}
                    </h4>

                    {/* Meta Data */}
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                            <span>{t('cards.views', { views: formatViewCount(viewCount) })}</span>
                        </div>
                        {publishedAt && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{formatDate(publishedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
