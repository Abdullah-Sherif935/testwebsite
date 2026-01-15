import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { aboutContent } from '../../content/aboutContent';
import { fadeInUp, staggerContainer, buttonHover, buttonTap } from '../../utils/animations';

export function AboutBio() {
    const { i18n } = useTranslation();
    const content = aboutContent[i18n.language === 'ar' ? 'ar' : 'en'].bio;

    return (
        <section id="about" className="py-20 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-6 lg:px-24 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        className="flex flex-col items-center lg:items-start text-center lg:text-start max-w-3xl mx-auto lg:mx-0 space-y-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                    >
                        <motion.div
                            className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold text-xs uppercase tracking-wider mb-2"
                            variants={fadeInUp}
                        >
                            {content.sectionTitle}
                        </motion.div>
                        <motion.h2
                            className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white"
                            variants={fadeInUp}
                        >
                            {content.headline.prefix} <span className="text-blue-500">{content.headline.highlight}</span> {content.headline.suffix}
                        </motion.h2>
                        {content.description.map((paragraph, index) => (
                            <motion.p key={index} className="text-base text-slate-600 dark:text-slate-400 leading-relaxed" variants={fadeInUp}>
                                {paragraph}
                            </motion.p>
                        ))}

                        {/* Internal Navigation Buttons */}
                        <motion.div
                            className="flex flex-wrap gap-2 pt-6 justify-center lg:justify-start"
                            variants={fadeInUp}
                        >
                            <motion.a
                                href="#about"
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                            >
                                {content.nav.about}
                            </motion.a>
                            <motion.a
                                href="#skills"
                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                            >
                                {content.nav.skills}
                            </motion.a>
                            <motion.a
                                href="#projects"
                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                            >
                                {content.nav.projects}
                            </motion.a>
                            <motion.a
                                href="#experience"
                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                            >
                                {content.nav.experience}
                            </motion.a>
                            <motion.a
                                href="#services"
                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                            >
                                {content.nav.services}
                            </motion.a>
                            <motion.a
                                href="#contact"
                                className="px-4 py-2 rounded-lg bg-transparent text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                            >
                                {content.nav.contact}
                            </motion.a>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="relative"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                        variants={fadeInUp}
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                        <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="text-2xl">🎓</span> {content.education.title}
                            </h3>
                            <div className="space-y-2">
                                <p className="text-blue-500 font-bold">{content.education.university}</p>
                                <p className="text-lg font-medium text-slate-900 dark:text-white">{content.education.degree}</p>
                                <p className="text-slate-500">{content.education.location}</p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                        <p className="text-2xl font-bold text-blue-500">{content.education.periodRaw}</p>
                                        <p className="text-sm font-medium text-slate-500 uppercase">{content.education.labels.period}</p>
                                    </div>
                                    <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                        <p className="text-2xl font-bold text-purple-500">{content.education.grade}</p>
                                        <p className="text-sm font-medium text-slate-500 uppercase">{content.education.labels.major}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
