import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { BackgroundPattern } from '../components/common/BackgroundPattern';

export function NotFound() {
    const { t } = useTranslation();

    return (
        <motion.div
            className="min-h-screen relative flex items-center justify-center bg-white dark:bg-slate-950 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Helmet>
                <title>404 - {t('notFound.message')}</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <BackgroundPattern />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.h1
                    className="text-9xl font-bold text-slate-200 dark:text-slate-800 mb-4 select-none"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                >
                    {t('notFound.title')}
                </motion.h1>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {t('notFound.message')}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8 text-lg">
                        {t('notFound.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                        >
                            {t('notFound.home')}
                        </Link>
                        <Link
                            to="/articles"
                            className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                        >
                            {t('notFound.articles')}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
