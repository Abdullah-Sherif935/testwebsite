import { useTranslation } from 'react-i18next';

interface VideoItemProps {
    title: string;
    videoId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    viewCount?: number;
    publishedAt?: string;
}

export function VideoItem({ title, videoId, videoUrl, thumbnailUrl, viewCount, publishedAt }: VideoItemProps) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const finalThumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // دالة لتحويل الأرقام الكبيرة لشكل احترافي (1500 -> 1.5K)
    const formatViews = (views: number = 0) => {
        if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
        return views;
    };

    return (
        <div className="modern-video-card group text-slate-800 dark:text-slate-100">
            <div className="thumbnail-wrapper">
                <img src={finalThumbnail} alt={title} loading="lazy" />
                <div className="view-count-tag">
                    <span className="live-icon"></span>
                    {formatViews(viewCount)} {isArabic ? 'مشاهدة' : 'views'}
                </div>

                {/* Play Icon Overlay (Optional but nice) */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="video-content">
                <h3 className="video-title group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {title}
                </h3>
                <div className="video-footer">
                    <span className="publish-date">
                        {publishedAt ? new Date(publishedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : ''}
                    </span>
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="watch-btn"
                    >
                        {isArabic ? 'مشاهدة الآن' : 'Watch Now'}
                    </a>
                </div>
            </div>
        </div>
    );
}
