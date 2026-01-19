import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { fadeInUp, pageTransition } from '../../utils/animations';

export function Profile() {
    const { user, signOut } = useAuth();
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const navigate = useNavigate();

    const [stats, setStats] = useState({ saved: 0, read: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    async function fetchStats() {
        try {
            const { data, error } = await supabase
                .from('user_article_actions')
                .select('is_saved, is_read')
                .eq('user_id', user?.id);

            if (error) throw error;

            const saved = (data as any[]).filter(a => a.is_saved).length;
            const read = (data as any[]).filter(a => a.is_read).length;
            setStats({ saved, read });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoadingStats(false);
        }
    }

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) {
        navigate('/auth');
        return null;
    }

    const userData = {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || (isArabic ? 'مستخدم' : 'User'),
        email: user.email,
        avatar: user.user_metadata?.avatar_url || null,
        joined: new Date(user.created_at).toLocaleDateString(isArabic ? 'ar' : 'en', { year: 'numeric', month: 'long' })
    };

    return (
        <motion.div
            className="pt-32 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{isArabic ? 'الملف الشخصي' : 'Profile'}</title>
            </Helmet>

            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl"
                    variants={fadeInUp}
                >
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                        <div className="relative w-32 h-32">
                            {userData.avatar ? (
                                <img src={userData.avatar} alt="" className="w-full h-full rounded-full border-4 border-blue-600/20 object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-blue-600/10 flex items-center justify-center text-4xl border-4 border-blue-600/20">
                                    👤
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full" title="Online"></div>
                        </div>

                        <div className="text-center md:text-start flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{userData.name}</h1>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">{userData.email}</p>
                            <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-full">
                                {isArabic ? 'عضو منذ' : 'Member since'} {userData.joined}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSignOut}
                                className="px-6 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-600 hover:text-white transition-all"
                            >
                                {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                {isArabic ? 'معلومات الحساب' : 'Account Info'}
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500">{isArabic ? 'الاسم' : 'Name'}</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{userData.name}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500">{isArabic ? 'البريد' : 'Email'}</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{userData.email}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">{isArabic ? 'طريقة التسجيل' : 'Login Provider'}</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">{user.app_metadata.provider}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                {isArabic ? 'تفاعلاتك' : 'Your Activity'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-center">
                                    <div className="text-2xl mb-1">🔖</div>
                                    <div className="text-xs text-slate-500 uppercase">{isArabic ? 'المحفوظة' : 'Saved'}</div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xl">
                                        {loadingStats ? (
                                            <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mt-2" />
                                        ) : (
                                            stats.saved
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-center">
                                    <div className="text-2xl mb-1">✅</div>
                                    <div className="text-xs text-slate-500 uppercase">{isArabic ? 'مقروءة' : 'Read'}</div>
                                    <div className="font-bold text-slate-900 dark:text-white text-xl">
                                        {loadingStats ? (
                                            <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mt-2" />
                                        ) : (
                                            stats.read
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
