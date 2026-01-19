import { useState, useEffect } from 'react';
import { adminGetAllComments, adminDeleteComment } from '../../services/articles';

export function AdminComments() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchComments();
    }, []);

    async function fetchComments() {
        setLoading(true);
        const data = await adminGetAllComments();
        setComments(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;

        const { error } = await adminDeleteComment(id);
        if (error) {
            alert('Error deleting comment: ' + error.message);
        } else {
            setComments(comments.filter(c => c.id !== id));
        }
    }

    const filteredComments = comments.filter(c =>
        c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.articles?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Comments Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Monitor and moderate user discussions</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 text-sm"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Article</th>
                                <th className="px-6 py-4">Comment</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredComments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No comments found.
                                    </td>
                                </tr>
                            ) : (
                                filteredComments.map((comment) => (
                                    <tr key={comment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                    {comment.profiles?.avatar_url ? (
                                                        <img src={comment.profiles.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        (comment.profiles?.full_name?.[0] || 'U').toUpperCase()
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {comment.profiles?.full_name || 'Anonymous User'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold max-w-[150px] truncate">
                                                {comment.articles?.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-400 max-w-md line-clamp-2">
                                                {comment.content}
                                            </div>
                                            {comment.parent_id && (
                                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                    Reply
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                title="Delete Comment"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
