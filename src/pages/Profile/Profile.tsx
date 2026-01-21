import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Article } from '../../types/article';
import { fadeInUp, pageTransition } from '../../utils/animations';
import { UserProfileForm } from './UserProfileForm';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { getUserProfile, type UserProfile } from '../../services/profile';
import { uploadProfilePicture, deleteProfilePicture } from '../../services/verification';

export function Profile() {
    const { user, signOut } = useAuth();
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const navigate = useNavigate();

    const [userArticles, setUserArticles] = useState<Article[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [stats, setStats] = useState({ saved: 0, read: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'articles' | 'cv'>('info');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
        // Load from cache instantly to prevent flicker
        if (user) {
            const cached = localStorage.getItem(`profile_${user.id}`);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch {
                    return null;
                }
            }
        }
        return null;
    });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            fetchStats();
            fetchUserArticles();
            fetchProfile();
        }
    }, [user]);

    async function fetchProfile() {
        if (!user) return;
        try {
            const profile = await getUserProfile(user.id);
            setUserProfile(profile);
            // Cache the profile
            if (profile) {
                localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!user || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploadingAvatar(true);

        try {
            await uploadProfilePicture(user.id, file);
            await fetchProfile();
            alert(isArabic ? '✅ تم تحديث الصورة الشخصية' : '✅ Profile picture updated');
        } catch (err: any) {
            alert(err.message || (isArabic ? '❌ فشل رفع الصورة' : '❌ Failed to upload'));
        } finally {
            setUploadingAvatar(false);
            e.target.value = '';
        }
    }

    async function handleDeleteAvatar() {
        if (!user || !window.confirm(isArabic ? 'هل تريد حذف الصورة الشخصية؟' : 'Delete profile picture?')) return;

        try {
            await deleteProfilePicture(user.id);
            await fetchProfile();
            alert(isArabic ? '✅ تم حذف الصورة' : '✅ Picture deleted');
        } catch (err: any) {
            alert(err.message);
        }
    }

    async function fetchUserArticles() {
        setLoadingArticles(true);
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserArticles(data || []);
        } catch (err) {
            console.error('Error fetching user articles:', err);
        } finally {
            setLoadingArticles(false);
        }
    }

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
        try {
            await signOut();
        } catch (err) {
            console.error(err);
        } finally {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
        }
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

    const getStatusInfo = (status: Article['moderation_status']) => {
        switch (status) {
            case 'pending':
                return { label: isArabic ? 'قيد المراجعة' : 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '⏳' };
            case 'approved':
                return { label: isArabic ? 'تم النشر' : 'Published', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '✅' };
            case 'rejected':
                return { label: isArabic ? 'مرفوض' : 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '❌' };
            default:
                return { label: status, color: 'bg-slate-100 text-slate-700', icon: '📄' };
        }
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
                        <div className="relative w-32 h-32 group">
                            {userProfile?.avatar_url ? (
                                <img src={userProfile.avatar_url} alt="" className="w-full h-full rounded-full border-4 border-blue-600/20 object-cover" />
                            ) : userData.avatar ? (
                                <img src={userData.avatar} alt="" className="w-full h-full rounded-full border-4 border-blue-600/20 object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-blue-600/10 flex items-center justify-center text-4xl border-4 border-blue-600/20">
                                    👤
                                </div>
                            )}

                            {/* Verified Badge */}
                            {userProfile?.is_verified ? (
                                <div className="absolute bottom-0 right-0">
                                    <VerifiedBadge size="lg" className="bg-white dark:bg-slate-900 rounded-full p-1" />
                                </div>
                            ) : (
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full" title="Online"></div>
                            )}

                            {/* Upload Button Overlay */}
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                                >
                                    {uploadingAvatar ? '...' : (isArabic ? '📷 تغيير' : '📷 Change')}
                                </button>
                            </div>

                            {/* Hidden File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="text-center md:text-start flex-1">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{userData.name}</h1>
                                {userProfile?.is_verified && <VerifiedBadge size="lg" />}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">{userData.email}</p>
                            <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-full">
                                    {isArabic ? 'عضو منذ' : 'Member since'} {userData.joined}
                                </span>
                                {userProfile?.is_verified && (
                                    <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-bold rounded-full flex items-center gap-1">
                                        <VerifiedBadge size="sm" />
                                        {isArabic ? 'كاتب موثق' : 'Verified Creator'}
                                    </span>
                                )}
                            </div>
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

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`px-8 py-4 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {isArabic ? 'المعلومات الشخصية' : 'Personal Info'}
                        </button>
                        <button
                            onClick={() => setActiveTab('cv')}
                            className={`px-8 py-4 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'cv' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {isArabic ? 'السيرة الذاتية' : 'CV / Resume'}
                        </button>
                        <button
                            onClick={() => setActiveTab('articles')}
                            className={`px-8 py-4 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'articles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {isArabic ? 'مقالاتي' : 'My Articles'}
                        </button>
                    </div>

                    {activeTab === 'info' ? (
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
                    ) : activeTab === 'cv' ? (
                        <UserProfileForm />
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isArabic ? 'مقالاتك المنشورة والمقترحة' : 'Your Articles'}
                                </h3>
                                <Link
                                    to="/profile/articles/new"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                                >
                                    {isArabic ? '➕ مقال جديد' : '➕ New Article'}
                                </Link>
                            </div>

                            {loadingArticles ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : userArticles.length === 0 ? (
                                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 italic">
                                        {isArabic ? 'لم تقم بكتابة أي مقالات بعد.' : 'You haven\'t written any articles yet.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {userArticles.map(article => {
                                        const status = getStatusInfo(article.moderation_status);
                                        return (
                                            <div
                                                key={article.id}
                                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                                                            {status.icon} {status.label}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{article.category}</span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{article.title}</h3>
                                                    {article.moderation_note && (
                                                        <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/30 mt-2">
                                                            <strong>{isArabic ? 'ملاحظة الإدارة: ' : 'Admin Note: '}</strong>
                                                            {article.moderation_note}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {article.moderation_status === 'approved' && (
                                                        <Link
                                                            to={`/articles/${article.slug}`}
                                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                            title={isArabic ? 'عرض' : 'View'}
                                                        >
                                                            👁️
                                                        </Link>
                                                    )}
                                                    <Link
                                                        to={`/profile/articles/edit/${article.id}`}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                        title={isArabic ? 'تعديل' : 'Edit'}
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Are you sure you want to delete this article?')) {
                                                                try {
                                                                    const { error } = await supabase.from('articles').delete().eq('id', article.id);
                                                                    if (error) throw error;
                                                                    fetchUserArticles();
                                                                } catch (err: any) {
                                                                    alert(err.message);
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                                        title={isArabic ? 'حذف' : 'Delete'}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
