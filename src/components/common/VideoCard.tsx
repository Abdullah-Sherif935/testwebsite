interface VideoCardProps {
    title: string;
    description?: string;
    thumbnail: string;
    videoUrl: string;
    duration?: string;
}

export function VideoCard({ title, description, thumbnail, videoUrl, duration }: VideoCardProps) {
    return (
        <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block flex-shrink-0 w-64"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 mb-2">
                <img
                    src={thumbnail}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {duration && (
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-semibold bg-black/90 text-white rounded">
                        {duration}
                    </div>
                )}
            </div>

            {/* Content */}
            <div>
                <h4 className="font-semibold text-sm leading-tight text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    {title}
                </h4>
                {description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                        {description}
                    </p>
                )}
                <div className="text-xs text-red-600 dark:text-red-500 font-medium">
                    Watch on YouTube →
                </div>
            </div>
        </a>
    );
}
