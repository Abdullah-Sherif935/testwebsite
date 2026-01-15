import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { getAllProjects } from '../../services/projects';
import type { Project } from '../../types/project';

// Placeholder image for projects without cover
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%231e293b" width="400" height="225"/%3E%3Ctext fill="%2364748b" font-family="system-ui" font-size="18" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3E📷 No Image%3C/text%3E%3C/svg%3E';

export function AboutProjects() {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllProjects(false).then(data => {
            // Get last 3 published projects
            setProjects(data.slice(0, 3));
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching featured projects:', err);
            setLoading(false);
        });
    }, []);

    const content = {
        title: isArabic ? 'المشاريع الهندسية' : 'Featured Projects',
        subtitle: isArabic
            ? 'مجموعة من المشاريع العملية التي عملت عليها في مجالات الميكاترونيكس والأتمتة.'
            : 'A selection of practical engineering projects I have worked on in mechatronics and automation.',
        viewAll: isArabic ? 'عرض كل المشاريع' : 'View All Projects',
        noProjects: isArabic ? 'لا توجد مشاريع منشورة حالياً' : 'No projects published yet',
    };

    return (
        <section id="projects" className="py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {content.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {content.subtitle}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 italic">
                        {content.noProjects}
                    </div>
                ) : (
                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
                                variants={fadeInUp}
                                whileHover={{ y: -10 }}
                            >
                                {/* Project Image */}
                                <Link to={`/projects/${project.slug}`} className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden block">
                                    <img
                                        src={project.cover_image || PLACEHOLDER_IMAGE}
                                        alt={project.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>

                                {/* Project Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.technologies.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <Link to={`/projects/${project.slug}`}>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-500 transition-colors">
                                            {project.title}
                                        </h3>
                                    </Link>

                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow line-clamp-2">
                                        {project.excerpt}
                                    </p>

                                    <Link
                                        to={`/projects/${project.slug}`}
                                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm"
                                    >
                                        {isArabic ? 'عرض التفاصيل' : 'View Details'}
                                        <span className={isArabic ? 'rotate-180' : ''}>→</span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* View All CTA */}
                <div className="text-center mt-12">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        {content.viewAll}
                        <span className={isArabic ? 'rotate-180' : ''}>→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
