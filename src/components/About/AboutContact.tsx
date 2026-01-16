import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { aboutContent } from '../../content/aboutContent';
import { fadeInUp, staggerContainer, buttonHover, buttonTap } from '../../utils/animations';

export function AboutContact() {
    const { i18n } = useTranslation();
    const content = aboutContent[i18n.language === 'ar' ? 'ar' : 'en'].contactSection;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // Use hero content for socials from the same language
    const socials = aboutContent[i18n.language === 'ar' ? 'ar' : 'en'].hero.socials;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            alert(i18n.language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
            return;
        }

        // إنشاء رابط mailto مع البيانات
        const subject = `رسالة من ${formData.name} عبر الموقع`;
        const body = `الاسم: ${formData.name}%0D%0A` +
            `البريد الإلكتروني: ${formData.email}%0D%0A%0D%0A` +
            `الرسالة:%0D%0A${formData.message}`;

        const mailtoLink = `mailto:eng.abdullah.sherif@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

        // فتح تطبيق البريد الإلكتروني
        window.location.href = mailtoLink;

        // إظهار رسالة نجاح
        setTimeout(() => {
            alert(i18n.language === 'ar'
                ? '✅ سيتم فتح تطبيق البريد الإلكتروني. يرجى إرسال الرسالة من هناك.'
                : '✅ Your email app will open. Please send the message from there.'
            );

            // تفريغ النموذج
            setFormData({ name: '', email: '', message: '' });
        }, 500);
    };

    return (
        <section id="contact" className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Left: Contact Info & Socials */}
                        <motion.div
                            className="flex flex-col items-center lg:items-start text-center lg:text-start space-y-12"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.25 }}
                        >
                            <motion.div variants={fadeInUp}>
                                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                                    {content.title}
                                </h2>
                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {content.subtitle}
                                </p>
                            </motion.div>

                            <motion.div
                                className="space-y-6 w-full flex flex-col items-center lg:items-start"
                                variants={fadeInUp}
                            >
                                <div className="flex flex-col sm:flex-row items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        📧
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">{content.labels.emailMe}</p>
                                        <a href={`mailto:${content.email}`} className="text-lg font-medium text-slate-900 dark:text-white hover:text-blue-500 transition-colors">
                                            {content.email}
                                        </a>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="pt-8 border-t border-slate-200 dark:border-slate-800 w-full"
                                variants={fadeInUp}
                            >
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">{content.labels.followMe}</p>
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    {[
                                        { name: 'GitHub', url: socials.github, color: 'hover:bg-slate-900' },
                                        { name: 'LinkedIn', url: socials.linkedin, color: 'hover:bg-blue-700' },
                                        { name: 'YouTube', url: socials.youtube, color: 'hover:bg-red-600' },
                                        { name: 'Facebook', url: socials.facebook, color: 'hover:bg-blue-600' },
                                    ].map((social) => (
                                        <motion.a
                                            key={social.name}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold ${social.color} hover:text-white hover:border-transparent shadow-sm`}
                                            whileHover={buttonHover}
                                            whileTap={buttonTap}
                                        >
                                            {social.name}
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: Contact Form */}
                        <motion.div
                            className="p-8 lg:p-12 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden group"
                            variants={fadeInUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.25 }}
                        >
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-all duration-700" />

                            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{content.form.name}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder={content.form.namePlaceholder}
                                        className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{content.form.email}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder={content.form.emailPlaceholder}
                                        className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{content.form.message}</label>
                                    <textarea
                                        name="message"
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder={content.form.messagePlaceholder}
                                        className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 dark:text-white resize-none"
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 transition-all"
                                    whileHover={buttonHover}
                                    whileTap={buttonTap}
                                >
                                    {content.form.button}
                                </motion.button>

                                {/* ملاحظة توضيحية */}
                                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                                    {i18n.language === 'ar'
                                        ? '💡 سيتم فتح تطبيق البريد الإلكتروني الخاص بك لإرسال الرسالة'
                                        : '💡 Your email app will open to send the message'}
                                </p>
                            </form>
                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    );
}
