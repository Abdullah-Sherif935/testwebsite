import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { buttonHover, buttonTap } from '../../utils/animations';
import { useTheme } from '../../context/ThemeContext';

export function Header() {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const toggleLang = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const navItems = [
        { label: t('nav.home'), to: '/' },
        { label: t('nav.blog'), to: '/articles' },
        { label: t('nav.projects'), to: '/projects' },
        { label: t('nav.videos'), to: '/videos' },
        { label: t('nav.resources'), to: '/resources' },
        { label: t('nav.about'), to: '/about' },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* LEFT AREA: YouTube + Logo */}
                <div className="flex items-center gap-6">
                    {/* YouTube Tab - Top Left */}
                    <a
                        href="https://youtube.com/@engabdullah-sherif"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/10 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 font-medium text-sm"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                        <span className="hidden lg:inline">{t('nav.youtube')}</span>
                    </a>

                    {/* Logo */}
                    <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('app.title')}
                    </Link>
                </div>

                {/* CENTER: Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => {
                        const active = isActive(item.to);
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className="relative group py-2"
                            >
                                <motion.span
                                    className={`block text-sm font-semibold transition-colors duration-200 ${active
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.label}
                                </motion.span>
                                <span className={`absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 dark:bg-blue-400 transition-transform duration-300 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                    } origin-left`} />
                            </Link>
                        );
                    })}
                </nav>

                {/* RIGHT: Actions & Mobile Toggle */}
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        aria-label={t('nav.toggleTheme') || 'Toggle theme'}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </motion.button>

                    <motion.button
                        onClick={toggleLang}
                        className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 uppercase tracking-wider"
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        {i18n.language === 'en' ? 'AR' : 'EN'}
                    </motion.button>

                    {/* Mobile Menu Toggle */}
                    <motion.button
                        className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        onClick={toggleMenu}
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        aria-label={t('nav.toggleMenu') || 'Toggle menu'}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-5 fade-in duration-200">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {navItems.map((item) => {
                            const active = isActive(item.to);
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-between ${active
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                >
                                    <span>{item.label}</span>
                                    {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </header>
    );
}
