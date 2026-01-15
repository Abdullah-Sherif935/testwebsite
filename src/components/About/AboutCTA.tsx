import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { aboutContent } from '../../content/aboutContent';

export function AboutCTA() {
    const { i18n } = useTranslation();
    const lang = i18n.language as 'en' | 'ar';
    const content = aboutContent[lang];

    return (
        <section id="contact" className="py-20 bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4">
                <div className="relative rounded-3xl bg-slate-900 text-white p-12 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
                    </div>

                    <div className="relative z-10 text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                            Ready to Build the <span className="text-blue-400">Future?</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                            If you're looking for a mechatronics engineer to collaborate on robotics projects or automation systems, I'm just a message away.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                            <a
                                href={content.hero.cta.contact}
                                className="px-10 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                Let's Talk
                            </a>
                            <Link
                                to={content.hero.cta.projects}
                                className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                Browse Projects
                            </Link>
                        </div>

                        {/* Official Social Links in CTA */}
                        <div className="flex items-center justify-center gap-8 border-t border-white/10 pt-8 mt-12">
                            <a
                                href={content.hero.socials.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                            >
                                <span className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">GitHub</span>
                            </a>
                            <a
                                href={content.hero.socials.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                            >
                                <span className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">LinkedIn</span>
                            </a>
                            <a
                                href={content.hero.socials.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                            >
                                <span className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">YouTube</span>
                            </a>
                            <a
                                href={content.hero.socials.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                            >
                                <span className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">Facebook</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
