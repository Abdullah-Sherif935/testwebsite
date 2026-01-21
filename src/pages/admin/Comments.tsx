import { useState, useEffect } from 'react';
import { adminGetAllComments, adminDeleteComment, markCommentAsRead } from '../../services/articles';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminComments() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({ total: 0, unread: 0 });

    useEffect(() => {
        fetchComments();
    }, []);

    async function fetchComments() {
        setLoading(true);
        const data = await adminGetAllComments();
        setComments(data);
        updateStats(data);
        setLoading(false);
    }

    function updateStats(data: any[]) {
        setStats({
            total: data.length,
            unread: data.filter(c => !c.is_read).length
        });
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;

        const { error } = await adminDeleteComment(id);
        if (error) {
            alert('Error deleting comment: ' + error.message);
        } else {
            const updated = comments.filter(c => c.id !== id);
            setComments(updated);
            updateStats(updated);
        }
    }

    async function handleMarkAsRead(id: string) {
        const { error } = await markCommentAsRead(id);
        if (error) {
            alert('Error marking comment as read: ' + error.message);
        } else {
            const updated = comments.map(c =>
                c.id === id ? { ...c, is_read: true } : c
            );
            setComments(updated);
            updateStats(updated);
        }
    }

    const filteredComments = comments.filter(c =>
        c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.author?.full_name_ar || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.articles?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20 md:pb-8">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Comments Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Monitor and moderate user discussions across your articles</p>
                </div>
                <div className="relative group min-w-[280px]">
                    <input
                        type="text"
                        placeholder="Search by user, article or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none w-full text-sm shadow-sm transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-800/30 rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">💬</div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Comments</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-900/20 dark:to-orange-800/10 border border-orange-200/50 dark:border-orange-800/30 rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl text-orange-600 dark:text-orange-400">🔔</div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.unread}</div>
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Unread Comments</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Comments Display */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <th className="px-6 py-5">User</th>
                                <th className="px-6 py-5">Article</th>
                                <th className="px-6 py-5">Comment</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={`skeleton-${i}`} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8">
                                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredComments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="max-w-xs mx-auto text-slate-500 dark:text-slate-400">
                                                <div className="text-4xl mb-4">📭</div>
                                                <div className="font-semibold">No comments found</div>
                                                <div className="text-xs mt-1">Try searching for something else or wait for user interactions.</div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredComments.map((comment) => (
                                        <motion.tr
                                            key={comment.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative group ${!comment.is_read ? 'bg-orange-500/[0.03] dark:bg-orange-500/[0.05]' : ''}`}
                                        >
                                            {/* Unread indicator bar */}
                                            {!comment.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />}

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden shrink-0">
                                                        {comment.author?.avatar_url ? (
                                                            <img src={comment.author.avatar_url} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            (comment.author?.full_name_ar?.[0] || 'U').toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                            {comment.author?.full_name_ar || 'Anonymous User'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 truncate">{comment.author?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Link
                                                    to={`/articles/${comment.articles?.slug}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg max-w-[180px]"
                                                >
                                                    <span className="truncate">{comment.articles?.title}</span>
                                                    <span className="shrink-0 text-[10px]">↗</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm text-slate-600 dark:text-slate-300 max-w-md line-clamp-2 leading-relaxed italic">
                                                    "{comment.content}"
                                                </div>
                                                {comment.parent_id && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full mt-2 inline-block">
                                                        ↩ Reply
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-[11px] font-medium text-slate-400">
                                                {new Date(comment.created_at).toLocaleDateString()}<br />
                                                {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!comment.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(comment.id)}
                                                            className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
                                                            title="Mark as Read"
                                                        >
                                                            ✅
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                        title="Delete Comment"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={`mob-skeleton-${i}`} className="h-32 bg-slate-50 dark:bg-slate-800/30 animate-pulse rounded-2xl w-full"></div>
                        ))
                    ) : filteredComments.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">No comments found</div>
                    ) : (
                        filteredComments.map(comment => (
                            <motion.div
                                key={`mob-${comment.id}`}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-4 rounded-2xl border ${!comment.is_read ? 'border-orange-500/30 bg-orange-500/[0.02] shadow-sm' : 'border-slate-100 dark:border-slate-800'} transition-all`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                            {comment.author?.avatar_url ? (
                                                <img src={comment.author.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" />
                                            ) : (
                                                (comment.author?.full_name_ar?.[0] || 'U').toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{comment.author?.full_name_ar}</div>
                                            <div className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {!comment.is_read && (
                                            <button onClick={() => handleMarkAsRead(comment.id)} className="p-2 text-green-500 bg-green-50 dark:bg-green-900/20 rounded-xl">✅</button>
                                        )}
                                        <button onClick={() => handleDelete(comment.id)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">🗑️</button>
                                    </div>
                                </div>
                                <Link
                                    to={`/articles/${comment.articles?.slug}`}
                                    className="block mb-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[11px] font-bold text-blue-600 dark:text-blue-400 truncate"
                                >
                                    📄 {comment.articles?.title}
                                </Link>
                                <div className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                    "{comment.content}"
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

