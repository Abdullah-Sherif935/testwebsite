import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Article } from '../../types/article';

export function AdminArticles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    async function fetchArticles() {
        setLoading(true);
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching articles:', error);
        } else {
            setArticles(data || []);
        }
        setLoading(false);
    }

    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    async function deleteArticle(id: string) {
        setLoading(true);
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) {
            alert('Error deleting article: ' + error.message);
        } else {
            setArticles(articles.filter(a => a.id !== id));
            setDeleteConfirm(null);
        }
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Articles</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your knowledge base articles</p>
                </div>
                <Link
                    to="/admin/articles/new"
                    className="px-4 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                    <span>➕</span> <span className="hidden sm:inline">New Article</span><span className="sm:hidden">New</span>
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Category</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Created At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-4">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No articles found. Create your first one!
                                    </td>
                                </tr>
                            ) : (
                                articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white truncate max-w-xs">
                                                {article.title}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                                <span className="text-slate-500 dark:text-slate-400 font-mono">{article.slug}</span>
                                                <span className="lg:hidden px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                                                    {article.category}
                                                </span>
                                                <span className="sm:hidden text-slate-500 dark:text-slate-400">
                                                    {new Date(article.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-xs font-semibold uppercase tracking-wider">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link
                                                to={`/admin/articles/edit/${article.id}`}
                                                className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </Link>
                                            {deleteConfirm === article.id ? (
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        onClick={() => deleteArticle(article.id)}
                                                        className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700 transition-colors"
                                                    >
                                                        CONFIRM
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded hover:bg-slate-300 transition-colors"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(article.id)}
                                                    className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                            <Link
                                                to={`/articles/${article.slug}`}
                                                target="_blank"
                                                className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg transition-colors"
                                                title="View Publicly"
                                            >
                                                👁️
                                            </Link>
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
