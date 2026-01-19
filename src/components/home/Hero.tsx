import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TechBackground } from '../common/TechBackground';
import { fadeInUp, staggerContainer, scaleIn, buttonHover, buttonTap } from '../../utils/animations';

export function Hero() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');

    // Helper to split subtitle safely
    const subtitleParts = t('hero.subtitle').split(' · ');
    const role1 = subtitleParts[0] || 'Mechatronics Engineer';
    const role2 = subtitleParts[1] || 'Technical Content Creator';

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-slate-100 dark:bg-[#0a0f16]">
            {/* Tech Background */}
            <TechBackground />

            <div className="container relative z-10 mx-auto px-6 lg:px-24 max-w-7xl">
                {/* Reversed Grid: Image Left, Text Right (in LTR) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Column: Profile Image */}
                    <motion.div
                        className="lg:col-span-5 flex justify-center lg:justify-center order-1"
                        variants={scaleIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                            {/* Metallic Rings Effect (Bright White/Grey) */}
                            <div className="absolute inset-0 border-[3px] border-slate-300 dark:border-slate-400/30 rounded-full scale-105" />
                            <div className="absolute inset-0 border-[1px] border-slate-400/40 dark:border-white/40 rounded-full scale-110 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                            <div className="absolute inset-0 border-[4px] border-slate-300/50 dark:border-slate-600/50 rounded-full scale-[1.18]" />

                            {/* Outer Glow Ring */}
                            <div className="absolute inset-0 border-[1px] border-cyan-500/30 rounded-full scale-[1.3] opacity-50" />

                            {/* Inner Image Container */}
                            <div className="absolute inset-0 border-4 border-white dark:border-slate-200/10 rounded-full overflow-hidden shadow-2xl bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-900">
                                <img
                                    src="/assets/images/personal-final.png"
                                    alt="Abdullah Sherif"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Text Content */}
                    <motion.div
                        className="lg:col-span-7 text-center lg:text-start order-2"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.25 }}
                    >
                        <motion.h1
                            className="text-5xl lg:text-7xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white"
                            variants={fadeInUp}
                        >
                            {t('hero.title')}
                        </motion.h1>

                        <motion.div
                            className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
                            variants={fadeInUp}
                        >
                            <h2 className="text-xl lg:text-2xl font-medium text-slate-700 dark:text-slate-300">
                                {role1}
                            </h2>
                            <span className="hidden lg:block text-slate-400 dark:text-slate-500 font-light">-</span>
                            <h2 className="text-xl lg:text-2xl font-medium text-slate-700 dark:text-slate-300">
                                {role2}
                            </h2>
                        </motion.div>

                        <motion.p
                            className={`text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}
                            variants={fadeInUp}
                            dir="auto"
                        >
                            {t('hero.description')}
                        </motion.p>

                        <motion.div
                            className="flex flex-row gap-5 justify-center lg:justify-start"
                            variants={fadeInUp}
                        >
                            <Link to="/projects">
                                <motion.div
                                    className="px-8 py-3 bg-[#0e4c5e] text-cyan-50 rounded-[4px] font-medium hover:bg-[#126b85] transition-all shadow-lg shadow-cyan-900/20 text-lg"
                                    whileHover={buttonHover}
                                    whileTap={buttonTap}
                                >
                                    {t('hero.cta.projects')}
                                </motion.div>
                            </Link>

                            <motion.a
                                href="#contact"
                                className="px-8 py-3 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-[4px] font-medium hover:bg-slate-300 dark:hover:bg-white/20 transition-all text-lg"
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const contactSection = document.getElementById('contact');
                                    if (contactSection) {
                                        contactSection.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                {t('hero.cta.contact')}
                            </motion.a>
                        </motion.div>
                    </motion.div>
                </div>

            </div>
        </section >
    );
}
