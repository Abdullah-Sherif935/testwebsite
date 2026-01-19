import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonHover, buttonTap } from '../../utils/animations';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export function Header() {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { user, signOut } = useAuth();
    const location = useLocation();
    const isArabic = i18n.language.startsWith('ar');

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
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleSignOut = async () => {
        try {
            // Close menus first
            setIsProfileOpen(false);
            setIsMenuOpen(false);

            // Execute sign out
            await signOut();

            // Force a hard reload to clear all state and cookies effectively on Vercel
            // Small delay to ensure signOut completes fully on mobile
            setTimeout(() => {
                window.location.href = '/';
            }, 100);
        } catch (err) {
            console.error('Sign out error:', err);
            // Even if it fails, try to redirect
            window.location.href = '/';
        }
    };

    return (
        <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* LEFT: Logo + YouTube */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link to="/" className="text-xl font-bold text-slate-900 dark:text-white shrink-0">
                        {t('app.title')}
                    </Link>

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
                </div>

                {/* CENTER: Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                    {navItems.map((item) => {
                        const active = isActive(item.to);
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className="relative group py-2"
                            >
                                <motion.span
                                    className={`block text-xs lg:text-sm font-semibold transition-colors duration-200 ${active
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

                {/* RIGHT: User & Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <motion.button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </motion.button>

                    <Link to="/saved-articles" className="hidden sm:block">
                        <motion.button
                            className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative"
                            whileHover={buttonHover}
                            whileTap={buttonTap}
                            title={isArabic ? 'المقالات المحفوظة' : 'Saved Articles'}
                        >
                            <span>🔖</span>
                        </motion.button>
                    </Link>

                    <motion.button
                        onClick={toggleLang}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 uppercase"
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                    >
                        {i18n.language === 'en' ? 'AR' : 'EN'}
                    </motion.button>

                    {/* Profile */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-0.5 rounded-full border-2 border-transparent hover:border-blue-600/30 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm">👤</span>
                                    )}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <>
                                        {/* Backdrop to close menu */}
                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className={`absolute top-full mt-2 ${isArabic ? 'left-0' : 'right-0'} w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden`}
                                        >
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <span>👤</span>
                                                {isArabic ? 'الملف الشخصي' : 'Profile'}
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-slate-100 dark:border-slate-800"
                                            >
                                                <span>🚪</span>
                                                {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link
                            to="/auth"
                            className="hidden sm:flex px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                            {isArabic ? 'دخول' : 'Login'}
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <motion.button
                        className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        onClick={toggleMenu}
                        whileHover={buttonHover}
                        whileTap={buttonTap}
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

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-40"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
                            {navItems.map((item) => {
                                const active = isActive(item.to);
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`px-4 py-3.5 rounded-xl font-semibold flex items-center justify-between ${active
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <span>{item.label}</span>
                                        {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                                    </Link>
                                );
                            })}

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                                {user ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-3"
                                        >
                                            <span>👤</span> {isArabic ? 'الملف الشخصي' : 'Profile'}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('Mobile: Sign Out triggered');
                                                handleSignOut();
                                            }}
                                            className="w-full px-4 py-3.5 rounded-xl text-red-600 font-bold flex items-center gap-3 text-start hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        >
                                            <span>🚪</span> {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/auth"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="px-4 py-4 rounded-xl bg-blue-600 text-white font-bold text-center"
                                    >
                                        {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
