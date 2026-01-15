import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { aboutContent } from '../../content/aboutContent';
import { fadeInUp, staggerContainer, scaleIn } from '../../utils/animations';

export function AboutExperience() {
    const { i18n } = useTranslation();
    const lang = i18n.language as 'en' | 'ar';
    const content = aboutContent[lang];

    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />

            <div className="container relative z-10 mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 items-center text-center lg:text-start">
                        <motion.div
                            className="lg:w-1/3 flex justify-center"
                            variants={scaleIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            <div className="relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-lg" />
                                <div className="relative aspect-square rounded-2xl bg-slate-900 flex items-center justify-center p-8 border border-white/10 overflow-hidden">
                                    <span className="text-8xl">🚀</span>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            className="lg:w-2/3 flex flex-col items-center lg:items-start space-y-6"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.25 }}
                        >
                            <motion.h2
                                className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white"
                                variants={fadeInUp}
                            >
                                Professional Objective
                            </motion.h2>
                            <motion.p
                                className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed italic"
                                variants={fadeInUp}
                            >
                                "{content.experience.objective}"
                            </motion.p>
                            <motion.div className="h-px w-20 bg-blue-500 mx-auto lg:mx-0" variants={fadeInUp} />
                            <motion.p
                                className="text-lg text-slate-600 dark:text-slate-400"
                                variants={fadeInUp}
                            >
                                {content.experience.focus}
                            </motion.p>
                            <motion.div
                                className="flex flex-wrap gap-8 pt-4 justify-center lg:justify-start"
                                variants={fadeInUp}
                            >
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">Available</p>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Status</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">Freelance</p>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Open For</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">Global</p>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Work Style</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
