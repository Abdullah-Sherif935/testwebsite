import { motion } from 'framer-motion';

interface BlogCardProps {
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    category: string;
    image?: string;
    onClick: () => void;
}

export function BlogCard({ title, excerpt, date, readTime, category, image, onClick }: BlogCardProps) {
    return (
        <motion.div
            onClick={onClick}
            className="group cursor-pointer rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-purple-500/50 transition-colors duration-300 hover:shadow-xl hover:shadow-purple-500/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-4xl">📝</span>
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/90 text-white backdrop-blur-sm">
                        {category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>{date}</span>
                    <span>•</span>
                    <span>{readTime}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                    {excerpt}
                </p>
            </div>
        </motion.div>
    );
}
