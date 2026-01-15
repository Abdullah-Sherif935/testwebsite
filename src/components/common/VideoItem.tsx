import { useTranslation } from 'react-i18next';

interface VideoItemProps {
    title: string;
    videoId: string;
    videoUrl: string;
    thumbnailUrl?: string;
}

export function VideoItem({ title, videoId, videoUrl, thumbnailUrl }: VideoItemProps) {
    const { t } = useTranslation();
    const finalThumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
        <div className="relative group h-full">
            {/* Dark Tech Border Glow */}
            <div className="absolute inset-0 bg-slate-800/50 rounded-2xl blur-[1px] group-hover:border-cyan-500/50 border border-transparent transition-all duration-300" />

            {/* Card Content */}
            <div className="relative h-full flex flex-col p-4 rounded-2xl bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 shadow-xl overflow-hidden">

                {/* Thumbnail Container */}
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 group/image">
                    <img
                        src={finalThumbnail}
                        alt={title}
                        className="w-full h-full object-cover opacity-90 group-hover/image:opacity-100 group-hover/image:scale-105 transition-all duration-500"
                    />


                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <h4 className="font-medium text-slate-200 mb-2 leading-relaxed line-clamp-2 min-h-[3rem]">
                        {title}
                    </h4>

                    {/* Meta Data */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        <span>{t('cards.views', { views: '1.5K' })}</span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex gap-4 mt-auto">
                        <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#182030] text-slate-300 text-sm font-medium rounded-[4px] hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 shadow-sm"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                            </svg>
                            {t('cards.watch')}
                        </a>

                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#122b3b] text-[#38bdf8] text-sm font-medium rounded-[4px] hover:bg-[#16384d] transition-colors border border-[#0e5a75] shadow-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t('cards.download')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
