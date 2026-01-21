import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
    adminGetPendingArticles,
    adminApproveArticle,
    adminRejectArticle,
    adminGetStats,
    adminGetApprovedArticles,
    adminDeleteArticle,
    adminGetAuthorsStats,
    adminGetArticlesByAuthor
} from '../../services/articles';
import { RichTextRenderer } from '../../components/common/RichTextRenderer';
import { fadeInUp, pageTransition } from '../../utils/animations';
import { useAdminAuth } from '../../context/AdminAuthContext';

export function AdminReview() {
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const navigate = useNavigate();
    const { user } = useAdminAuth();

    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<any>(null);
    const [note, setNote] = useState('');
    const [processing, setProcessing] = useState(false);

    // New state for tabs and stats
    const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'authors'>('pending');
    const [stats, setStats] = useState({ published: 0, total: 0, pending: 0, rejected: 0 });
    const [publishedArticles, setPublishedArticles] = useState<any[]>([]);

    // Authors Tab State
    const [authors, setAuthors] = useState<any[]>([]);
    const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
    const [authorArticles, setAuthorArticles] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchPending();
            fetchStats();
            if (activeTab === 'published') {
                fetchPublished();
            } else if (activeTab === 'authors') {
                fetchAuthors();
            }
        }
    }, [activeTab, user]);

    async function fetchStats() {
        if (!user) return;
        try {
            const data = await adminGetStats(user.email || '');
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }

    async function fetchPending() {
        if (!user) return;
        setLoading(true);
        try {
            const data = await adminGetPendingArticles(user.email || '');
            setArticles(data || []);
        } catch (err) {
            console.error('Error fetching pending articles:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchPublished() {
        if (!user) return;
        setLoading(true);
        try {
            const data = await adminGetApprovedArticles(user.email || '');
            setPublishedArticles(data || []);
        } catch (err) {
            console.error('Error fetching published articles:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchAuthors() {
        if (!user) return;
        setLoading(true);
        try {
            const data = await adminGetAuthorsStats(user.email || '');
            setAuthors(data || []);
        } catch (err) {
            console.error('Error fetching authors:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAuthorClick(author: any) {
        if (!user) return;
        setSelectedAuthor(author);
        setLoading(true);
        try {
            const data = await adminGetArticlesByAuthor(author.id);
            setAuthorArticles(data || []);
        } catch (err) {
            console.error('Error fetching author articles:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id: string) => {
        if (!window.confirm(isArabic ? 'هل أنت متأكد من الموافقة؟' : 'Are you sure you want to approve?')) return;
        setProcessing(true);
        try {
            await adminApproveArticle(id, note || 'Approved');
            alert(isArabic ? '✅ تم الموافقة والنشر' : '✅ Approved and published');
            setNote('');
            setSelectedArticle(null);
            fetchPending();
            fetchStats();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!note) {
            alert(isArabic ? 'يرجى كتابة سبب الرفض' : 'Please provide a reason for rejection');
            return;
        }
        setProcessing(true);
        try {
            await adminRejectArticle(id, note);
            alert(isArabic ? '❌ تم الرفض' : '❌ Rejected');
            setNote('');
            setSelectedArticle(null);
            fetchPending();
            fetchStats();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(isArabic ? `هل أنت متأكد من حذف المقال "${title}" نهائياً؟` : `Are you sure you want to permanently delete "${title}"?`)) return;
        try {
            await adminDeleteArticle(id);
            alert(isArabic ? '🗑️ تم الحذف' : '🗑️ Deleted');
            // Refresh based on active tab
            if (activeTab === 'authors' && selectedAuthor) {
                // Refresh author articles
                const data = await adminGetArticlesByAuthor(selectedAuthor.id);
                setAuthorArticles(data || []);
            } else {
                fetchPublished();
            }
            fetchStats();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Statistics Cards
    const StatCard = ({ title, value, icon, color }: any) => (
        <div className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{icon}</span>
                <span className={`text-3xl font-bold ${color}`}>{value}</span>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        </div>
    );

    return (
        <motion.div
            className="p-6"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{isArabic ? 'مراجعة المقالات' : 'Review Articles'}</title>
            </Helmet>

            {/* Header with Stats */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {isArabic ? 'إدارة المقالات' : 'Articles Management'}
                </h1>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title={isArabic ? 'المقالات المنشورة' : 'Published'}
                        value={stats.published}
                        icon="✅"
                        color="text-green-600"
                    />
                    <StatCard
                        title={isArabic ? 'إجمالي المساهمات' : 'Total Submissions'}
                        value={stats.total}
                        icon="📝"
                        color="text-blue-600"
                    />
                    <StatCard
                        title={isArabic ? 'قيد المراجعة' : 'Pending Review'}
                        value={stats.pending}
                        icon="⏳"
                        color="text-orange-600"
                    />
                    <StatCard
                        title={isArabic ? 'المرفوضة' : 'Rejected'}
                        value={stats.rejected}
                        icon="❌"
                        color="text-red-600"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 font-bold transition-all whitespace-nowrap ${activeTab === 'pending'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {isArabic ? `قيد المراجعة (${stats.pending})` : `Pending (${stats.pending})`}
                    </button>
                    <button
                        onClick={() => setActiveTab('published')}
                        className={`px-6 py-3 font-bold transition-all whitespace-nowrap ${activeTab === 'published'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {isArabic ? `المقالات المنشورة (${stats.published})` : `Published (${stats.published})`}
                    </button>
                    <button
                        onClick={() => { setActiveTab('authors'); setSelectedAuthor(null); }}
                        className={`px-6 py-3 font-bold transition-all whitespace-nowrap ${activeTab === 'authors'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {isArabic ? 'الكتّاب' : 'Authors'}
                    </button>
                </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'pending' ? (
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Pending Articles List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                        ) : articles.length === 0 ? (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                <span className="text-4xl mb-4 block">☕</span>
                                <p className="text-slate-500 font-bold">{isArabic ? 'لا توجد مقالات معلقة حالياً' : 'No pending articles at the moment'}</p>
                            </div>
                        ) : (
                            articles.map(article => (
                                <motion.button
                                    key={article.id}
                                    onClick={() => {
                                        setSelectedArticle(article);
                                        setNote('');
                                    }}
                                    className={`w-full text-start p-6 rounded-2xl border transition-all ${selectedArticle?.id === article.id
                                        ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
                                    variants={fadeInUp}
                                >
                                    <div className="flex gap-4 mb-3">
                                        {article.image_url && (
                                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex-shrink-0">
                                                <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                    {article.profiles?.avatar_url ? (
                                                        <img src={article.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="w-full h-full flex items-center justify-center text-[10px]">👤</span>
                                                    )}
                                                </div>
                                                <p className={`text-[10px] font-bold truncate ${selectedArticle?.id === article.id ? 'text-blue-100' : 'text-slate-500'}`}>
                                                    {article.profiles?.full_name || article.profiles?.email}
                                                </p>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${selectedArticle?.id === article.id ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                                    {article.category}
                                                </span>
                                            </div>
                                            <h3 className={`font-bold text-lg mb-1 line-clamp-1 ${selectedArticle?.id === article.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                {article.title}
                                            </h3>
                                            <p className={`text-xs line-clamp-2 ${selectedArticle?.id === article.id ? 'text-blue-50' : 'text-slate-500'}`}>
                                                {article.excerpt}
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>

                    {/* Review Panel */}
                    <div className="lg:sticky lg:top-6 h-fit">
                        {selectedArticle ? (
                            <motion.div
                                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                    <h2 className="text-xl font-bold mb-4">{isArabic ? 'مراجعة المحتوى' : 'Review Content'}</h2>

                                    {selectedArticle.image_url && (
                                        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                            <img src={selectedArticle.image_url} alt="Cover" className="w-full h-auto" />
                                        </div>
                                    )}

                                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl max-h-[400px] overflow-y-auto custom-scrollbar">
                                        <RichTextRenderer content={selectedArticle.pending_content_rich || selectedArticle.content_rich} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">{isArabic ? 'ملاحظات للأدمن (أو سبب الرفض)' : 'Admin Notes (or Rejection Reason)'}</label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm"
                                            placeholder={isArabic ? 'اكتب ملاحظتك هنا...' : 'Write your notes here...'}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => navigate(`/admin/users/articles/edit/${selectedArticle.id}`)}
                                            className="py-3 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
                                        >
                                            {isArabic ? '✏️ تعديل' : '✏️ Edit'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedArticle.id)}
                                            disabled={processing}
                                            className="py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 text-sm"
                                        >
                                            {isArabic ? 'رفض' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedArticle.id)}
                                            disabled={processing}
                                            className="py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 text-sm"
                                        >
                                            {isArabic ? 'موافقة' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="hidden lg:flex flex-col items-center justify-center h-[500px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                                <span className="text-6xl mb-4">👈</span>
                                <p className="text-slate-500 font-bold">{isArabic ? 'اختر مقالاً للمراجعة' : 'Select an article to review'}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'published' ? (
                /* Published Articles Table */
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : publishedArticles.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="text-4xl mb-4 block">📭</span>
                            <p className="text-slate-500 font-bold">{isArabic ? 'لا توجد مقالات منشورة حالياً' : 'No published articles yet'}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-start text-sm font-bold text-slate-700 dark:text-slate-300">{isArabic ? 'العنوان' : 'Title'}</th>
                                        <th className="px-6 py-4 text-start text-sm font-bold text-slate-700 dark:text-slate-300">{isArabic ? 'الكاتب' : 'Author'}</th>
                                        <th className="px-6 py-4 text-start text-sm font-bold text-slate-700 dark:text-slate-300">{isArabic ? 'التصنيف' : 'Category'}</th>
                                        <th className="px-6 py-4 text-start text-sm font-bold text-slate-700 dark:text-slate-300">{isArabic ? 'تاريخ النشر' : 'Published'}</th>
                                        <th className="px-6 py-4 text-start text-sm font-bold text-slate-700 dark:text-slate-300">{isArabic ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {publishedArticles.map(article => (
                                        <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {article.image_url && (
                                                        <img src={article.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{article.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{article.excerpt}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-700 dark:text-slate-300">{article.profiles?.full_name || article.profiles?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold">
                                                    {article.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {new Date(article.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                                                        className="px-3 py-1.5 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                                                        title={isArabic ? 'عرض' : 'View'}
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/users/articles/edit/${article.id}`)}
                                                        className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                                                        title={isArabic ? 'تعديل' : 'Edit'}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(article.id, article.title)}
                                                        className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                                                        title={isArabic ? 'حذف' : 'Delete'}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* Authors Tab */
                <div className="space-y-6">
                    {!selectedAuthor ? (
                        /* Authors Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                <div className="col-span-full py-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                            ) : authors.length === 0 ? (
                                <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                                    <span className="text-4xl mb-4 block">👥</span>
                                    <p className="text-slate-500 font-bold">{isArabic ? 'لا يوجد كتّاب حالياً' : 'No authors found'}</p>
                                </div>
                            ) : (
                                authors.map(author => (
                                    <motion.button
                                        key={author.id}
                                        onClick={() => handleAuthorClick(author)}
                                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-start group shadow-sm hover:shadow-md"
                                        variants={fadeInUp}
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                                {author.avatar_url ? (
                                                    <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="w-full h-full flex items-center justify-center text-2xl">👤</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    {author.name}
                                                </h3>
                                                <p className="text-xs text-slate-500">{author.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {isArabic ? 'عدد المقالات' : 'Articles Count'}
                                            </span>
                                            <span className="text-xl font-bold text-blue-600 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg shadow-sm">
                                                {author.articleCount}
                                            </span>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Selected Author Articles List */
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <button
                                    onClick={() => setSelectedAuthor(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    ⬅️
                                </button>
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                                    {selectedAuthor.avatar_url ? (
                                        <img src={selectedAuthor.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="w-full h-full flex items-center justify-center">👤</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {isArabic ? `مقالات: ${selectedAuthor.name}` : `Articles by: ${selectedAuthor.name}`}
                                    </h2>
                                    <p className="text-xs text-slate-500">{selectedAuthor.email}</p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {loading ? (
                                    <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                                ) : authorArticles.length === 0 ? (
                                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                                        <p className="text-slate-500">{isArabic ? 'لا توجد مقالات' : 'No articles found'}</p>
                                    </div>
                                ) : (
                                    authorArticles.map(article => (
                                        <div key={article.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all group">
                                            {article.image_url && (
                                                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img src={article.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                            )}
                                            <div className="flex-1 py-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${article.status === 'published' ? 'bg-green-100 text-green-700' :
                                                        article.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                                                            'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {article.status.toUpperCase()}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/users/articles/edit/${article.id}`)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1 rounded-lg"
                                                        >
                                                            {isArabic ? 'تعديل' : 'Edit'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(article.id, article.title)}
                                                            className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg"
                                                        >
                                                            {isArabic ? 'حذف' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{article.title}</h3>
                                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{article.excerpt}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span>📅 {new Date(article.created_at).toLocaleDateString()}</span>
                                                    <span>📁 {article.category}</span>
                                                    {article.moderation_status && (
                                                        <span className={
                                                            article.moderation_status === 'approved' ? 'text-green-500' :
                                                                article.moderation_status === 'rejected' ? 'text-red-500' :
                                                                    'text-orange-500'
                                                        }>
                                                            {article.moderation_status === 'approved' ? '✅ Approved' :
                                                                article.moderation_status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
