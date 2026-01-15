interface VideoListItemProps {
    title: string;
    description?: string;
    thumbnail: string;
    videoUrl: string;
    duration?: string;
}

export function VideoListItem({ title, description, thumbnail, videoUrl, duration }: VideoListItemProps) {
    return (
        <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 items-start py-2 group"
        >
            {/* Thumbnail - LEFT */}
            <div className="relative w-40 flex-shrink-0">
                <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded overflow-hidden">
                    <img
                        src={thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
                {duration && (
                    <div className="absolute bottom-1 right-1 px-1 py-0.5 text-xs font-semibold bg-black/90 text-white rounded text-[10px]">
                        {duration}
                    </div>
                )}
            </div>

            {/* Content - RIGHT */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-tight text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                    {title}
                </h4>
                {description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-1">
                        {description}
                    </p>
                )}
                <div className="text-xs text-red-600 dark:text-red-500 font-medium">
                    Watch on YouTube
                </div>
            </div>
        </a>
    );
}
