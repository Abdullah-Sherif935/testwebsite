import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { aboutContent } from '../../content/aboutContent';

export function AboutNav() {
    const { i18n } = useTranslation();
    const content = aboutContent[i18n.language === 'ar' ? 'ar' : 'en'].bio.nav;
    const [activeSection, setActiveSection] = useState('hero');

    const navLinks = useMemo(() => [
        { label: content.about, href: '#hero' },
        { label: content.skills, href: '#skills' },
        { label: content.projects, href: '#projects' },
        { label: content.experience, href: '#experience' },
        { label: content.services, href: '#services' },
        { label: content.contact, href: '#contact' },
    ], [content]);

    useEffect(() => {
        const handleScroll = () => {
            const sections = navLinks.map(link => link.href.substring(1));
            let current = 'hero';

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100) {
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [navLinks]);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.getElementById(href.substring(1));
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="sticky top-16 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
            <div className="container mx-auto px-4">
                <nav className="flex overflow-x-auto md:justify-center gap-2 py-3 no-scrollbar pb-3 md:pb-3 -mb-px">
                    {/* Added overflow-x-auto for mobile scrolling. Negative margin hack or padding adjustment might be needed if scrollbar is ugly, but let's stick to simple overflow first */}
                    {navLinks.map((link) => {
                        const href = link.href.substring(1);
                        const isActive = activeSection === href;
                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => scrollToSection(e, link.href)}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {link.label}
                            </a>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
