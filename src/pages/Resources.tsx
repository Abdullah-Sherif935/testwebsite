import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { pageTransition, staggerContainer, fadeInUp } from '../utils/animations';
import { getResources } from '../services/resources';
import type { Resource } from '../types/resource';
import { ResourceCard } from '../components/common/ResourceCard';

import { BackgroundPattern } from '../components/common/BackgroundPattern';

export function Resources() {
    const { t } = useTranslation();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getResources().then(data => {
            setResources(data);
            setLoading(false);
        });
    }, []);

    const getResourceIcon = (fileType: string | null) => {
        switch (fileType?.toLowerCase()) {
            case 'pdf': return <span className="text-2xl">📄</span>;
            case 'zip': return <span className="text-2xl">📦</span>;
            case 'code': return <span className="text-2xl">💻</span>;
            case 'roadmap': return <span className="text-2xl">🗺️</span>;
            default: return <span className="text-2xl">📁</span>;
        }
    };

    return (
        <motion.div
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{t('seo.resources.title')}</title>
                <meta name="description" content={t('seo.resources.description')} />
            </Helmet>

            <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
                <BackgroundPattern />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        className="text-center mb-16 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 mb-6">
                            {t('sections.resources.title')}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('sections.resources.subtitle')}
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-3 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
                        </div>
                    ) : resources.length === 0 ? (
                        <motion.div
                            className="text-center py-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                {t('cards.noResources')}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {resources.map((resource) => (
                                <motion.div key={resource.id} variants={fadeInUp}>
                                    <ResourceCard
                                        title={resource.title}
                                        description={resource.description || ''}
                                        icon={getResourceIcon(resource.type)}
                                        action={{
                                            label: t('sections.resources.download'),
                                            onClick: () => window.open(resource.url, '_blank')
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>
        </motion.div>
    );
}
