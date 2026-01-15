import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { aboutContent } from '../../content/aboutContent';
import { fadeInUp, staggerContainer } from '../../utils/animations';

export function AboutServices() {
    const { i18n } = useTranslation();
    const content = aboutContent[i18n.language === 'ar' ? 'ar' : 'en'].services;

    return (
        <section id="services" className="py-20 bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {content.title} <span className="text-blue-600"> {content.titleHighlight}</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {content.subtitle}
                    </p>
                </div>

                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {content.items.map((service, index) => (
                        <motion.div
                            key={index}
                            className="group p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                            variants={fadeInUp}
                            whileHover={{ y: -5 }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                {service.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
