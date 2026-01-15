import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { getProjectBySlug } from '../services/projects';
import type { Project } from '../types/project';
import { pageTransition, fadeInUp } from '../utils/animations';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';

export function ProjectDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            LinkExtension.configure({
                HTMLAttributes: {
                    class: 'text-blue-600 hover:underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-3xl max-w-full h-auto my-8 shadow-2xl',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: 'rounded-3xl aspect-video w-full my-10 shadow-2xl',
                },
            }),
        ],
        content: null,
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none prose-blue focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (slug) {
            setLoading(true);
            getProjectBySlug(slug).then(data => {
                setProject(data);
                if (data?.content_rich && editor) {
                    editor.commands.setContent(data.content_rich);
                }
                setLoading(false);
            }).catch(err => {
                console.error('Error loading project details:', err);
                setLoading(false);
            });
        }
    }, [slug, editor]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center items-center bg-white dark:bg-[#020617]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-white dark:bg-[#020617] px-4">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    {isArabic ? 'المشروع غير موجود' : 'Project Not Found'}
                </h1>
                <Link to="/projects" className="text-blue-600 font-bold hover:underline">
                    {isArabic ? 'العودة للمشاريع' : 'Back to Projects'}
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pt-32 pb-20 min-h-screen bg-white dark:bg-[#020617]"
        >
            <Helmet>
                <title>{project.title} | {t('app.title')}</title>
                <meta name="description" content={project.excerpt} />
            </Helmet>

            <article className="container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <motion.div variants={fadeInUp} className="mb-12">
                    <Link to="/projects" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold mb-8 hover:gap-2 transition-all group">
                        <span className={isArabic ? 'rotate-180' : ''}>←</span>
                        <span className="ml-2">{isArabic ? 'العودة للمعرض' : 'Back to Portfolio'}</span>
                    </Link>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                        {project.title}
                    </h1>

                    <div className="flex flex-wrap gap-3 mb-8">
                        {project.technologies.map(tech => (
                            <span key={tech} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                                {tech}
                            </span>
                        ))}
                    </div>

                    {project.cover_image && (
                        <div className="relative group">
                            <img
                                src={project.cover_image}
                                alt={project.title}
                                className="w-full aspect-[21/9] object-cover rounded-[2.5rem] shadow-2xl"
                            />
                            <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-slate-900/10" />
                        </div>
                    )}
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <motion.div variants={fadeInUp} className="lg:col-span-8">
                        <EditorContent editor={editor} />
                    </motion.div>

                    {/* Sidebar Info */}
                    <motion.aside variants={fadeInUp} className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 sticky top-32">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <span>🛠️</span> {isArabic ? 'نظرة عامة' : 'Quick Specs'}
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                        {isArabic ? 'التاريخ' : 'DATE'}
                                    </div>
                                    <div className="text-slate-700 dark:text-slate-300 font-medium">
                                        {new Date(project.created_at).toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'long', year: 'numeric' })}
                                    </div>
                                </div>

                                {project.video_url && (
                                    <a
                                        href={project.video_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95"
                                    >
                                        <span>▶️</span> {isArabic ? 'مشاهدة الفيديو' : 'Watch Demo Video'}
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.aside>
                </div>
            </article>
        </motion.div>
    );
}
