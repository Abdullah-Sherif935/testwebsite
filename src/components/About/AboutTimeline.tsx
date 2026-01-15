import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { aboutContent } from '../../content/aboutContent';
import { fadeInUp, staggerContainer } from '../../utils/animations';

export function AboutTimeline() {
    const { i18n } = useTranslation();
    const content = aboutContent[i18n.language === 'ar' ? 'ar' : 'en'].timeline;

    return (
        <section id="experience" className="py-20 bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            {content.title}
                        </h2>
                        <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2" />

                        <motion.div
                            className="space-y-12"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                        >
                            {content.items.map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="relative flex flex-col md:flex-row items-center md:justify-between group"
                                    variants={fadeInUp}
                                >
                                    {/* Content Area */}
                                    <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${index % 2 === 0 ? 'md:order-1 ltr:md:text-right rtl:md:text-left' : 'md:order-2 ltr:md:text-left rtl:md:text-right'}`}>
                                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-md">
                                            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-3">
                                                {item.year}
                                            </span>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Icon Circle */}
                                    <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 w-10 h-10 -translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 z-10 border-4 border-white dark:border-slate-950">
                                        <span className="text-lg">{item.icon}</span>
                                    </div>

                                    {/* Spacer for the other side */}
                                    <div className="hidden md:block md:w-[45%]" />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
