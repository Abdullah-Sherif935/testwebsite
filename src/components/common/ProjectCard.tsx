import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../utils/animations';

// Clear placeholder SVG - No random images
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%231e293b" width="400" height="225"/%3E%3Ctext fill="%2364748b" font-family="system-ui" font-size="18" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3E📷 No Image%3C/text%3E%3C/svg%3E';

interface ProjectCardProps {
    title: string;
    excerpt: string;
    coverImage?: string;
    slug: string;
    technologies: string[];
}

export function ProjectCard({ title, excerpt, coverImage, slug, technologies }: ProjectCardProps) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    // Use placeholder if no cover image provided
    const displayImage = coverImage && coverImage.trim() !== '' ? coverImage : PLACEHOLDER_IMAGE;

    return (
        <motion.div
            variants={fadeInUp}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
        >
            {/* Image Section */}
            <Link to={`/projects/${slug}`} className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                    src={displayImage}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white text-sm font-bold flex items-center gap-2">
                        {isArabic ? 'عرض التفاصيل' : 'View Details'}
                        <span className={isArabic ? 'rotate-180' : ''}>→</span>
                    </span>
                </div>
            </Link>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                    {technologies.slice(0, 3).map(tech => (
                        <span key={tech} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-full uppercase tracking-wider">
                            {tech}
                        </span>
                    ))}
                    {technologies.length > 3 && (
                        <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[11px] font-bold rounded-full">
                            +{technologies.length - 3}
                        </span>
                    )}
                </div>

                <Link to={`/projects/${slug}`}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {title}
                    </h3>
                </Link>

                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                    {excerpt}
                </p>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto flex justify-between items-center">
                    <Link
                        to={`/projects/${slug}`}
                        className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:gap-3 transition-all"
                    >
                        <span>{isArabic ? 'اقرأ المزيد' : 'Read Case Study'}</span>
                        <span className={isArabic ? 'rotate-180' : ''}>→</span>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
