import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ProjectCard } from '../components/common/ProjectCard';
import { getAllProjects } from '../services/projects';
import type { Project } from '../types/project';
import { staggerContainer, fadeInUp } from '../utils/animations';

export function Projects() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getAllProjects(false).then(data => {
            setProjects(data);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching projects:', err);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-white dark:bg-[#020617]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                    <div className="absolute inset-x-0 -bottom-8 text-center text-sm font-medium text-slate-500 animate-pulse">
                        {isArabic ? 'جاري تحميل المشاريع...' : 'Loading Engineering Projects...'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-white dark:bg-[#020617] relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

            <Helmet>
                <title>{isArabic ? 'المشاريع الهندسية' : 'Engineering Projects'} | {t('app.title')}</title>
                <meta name="description" content={isArabic ? 'استكشف مجموعة من المشاريع الهندسية والبرمجية المتقدمة.' : 'Explore a showcase of advanced engineering and technical software projects.'} />
            </Helmet>

            <section className="container mx-auto px-4">
                <motion.div
                    className="max-w-4xl mx-auto text-center mb-20"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                        {isArabic ? 'معرض الأعمال' : 'Project Portfolio'}
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl md:text-6xl font-bold mb-8 text-slate-900 dark:text-white leading-tight"
                    >
                        {isArabic ? 'مشاريع هندسية متميزة' : 'Featured Engineering Projects'}
                    </motion.h1>

                    <motion.p
                        variants={fadeInUp}
                        className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                    >
                        {isArabic
                            ? 'مجموعة مختارة من المشاريع العملية في مجالات الميكاترونيكس، الأتمتة، والأنظمة المدمجة.'
                            : 'A curated collection of professional projects in mechatronics, automation, and industrial control systems.'}
                    </motion.p>
                </motion.div>

                {projects.length === 0 ? (
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
                    >
                        <p className="text-slate-500 dark:text-slate-400 italic">
                            {isArabic ? 'لا توجد مشاريع منشورة حالياً.' : 'No projects published at the moment.'}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        {projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                title={project.title}
                                excerpt={project.excerpt}
                                coverImage={project.cover_image}
                                slug={project.slug}
                                technologies={project.technologies}
                            />
                        ))}
                    </motion.div>
                )}
            </section>
        </div>
    );
}
