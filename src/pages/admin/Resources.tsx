import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Resource } from '../../types/resource';

export function AdminResources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [articles, setArticles] = useState<{ slug: string, title: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        url: '',
        type: 'pdf' as 'pdf' | 'code' | 'link',
        related_article_slug: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        const [resourcesRes, articlesRes] = await Promise.all([
            supabase.from('resources').select('*').order('created_at', { ascending: false }),
            supabase.from('articles').select('slug, title')
        ]);

        setResources(resourcesRes.data || []);
        setArticles((articlesRes.data as any) || []);
        setLoading(false);
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const resourceData = {
            ...formData,
            related_article_slug: formData.related_article_slug || null,
            created_at: new Date().toISOString()
        };

        if (editingId) {
            const { error } = await supabase.from('resources').update(resourceData).eq('id', editingId);
            if (error) alert(error.message);
        } else {
            const { error } = await supabase.from('resources').insert([resourceData]);
            if (error) alert(error.message);
        }

        resetForm();
        fetchInitialData();
    };

    const deleteResource = async (id: string) => {
        if (!confirm('Delete this resource?')) return;
        const { error } = await supabase.from('resources').delete().eq('id', id);
        if (error) alert(error.message);
        else setResources(resources.filter(r => r.id !== id));
    };

    const resetForm = () => {
        setFormData({ title: '', url: '', type: 'pdf', related_article_slug: '' });
        setIsAdding(false);
        setEditingId(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Resources</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage technical attachments and files</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg"
                    >
                        ➕ Add Resource
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-lg">
                    <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
                        {editingId ? 'Edit Resource' : 'Add New Resource'}
                    </h2>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Resource Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                placeholder="e.g. Robot Kinematics PDF"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">URL / Direct Link</label>
                            <input
                                type="url"
                                required
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                            >
                                <option value="pdf">📄 PDF Document</option>
                                <option value="code">💻 Source Code</option>
                                <option value="link">🔗 External Link</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Link to Article (Slug)</label>
                            <select
                                value={formData.related_article_slug}
                                onChange={e => setFormData({ ...formData, related_article_slug: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                            >
                                <option value="">None</option>
                                {articles.map(article => (
                                    <option key={article.slug} value={article.slug}>
                                        {article.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2.5 text-slate-500 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                            >
                                {editingId ? 'Update Resource' : 'Create Resource'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
                            <th className="px-6 py-4">Title / Type</th>
                            <th className="px-6 py-4 hidden sm:table-cell">Article Reference</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={3} className="px-6 py-10 text-center">Loading resources...</td></tr>
                        ) : resources.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-500">No resources available</td></tr>
                        ) : (
                            resources.map((resource) => (
                                <tr key={resource.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                            <span>
                                                {resource.type === 'pdf' ? '📄' : resource.type === 'code' ? '💻' : '🔗'}
                                            </span>
                                            <span className="line-clamp-1">{resource.title}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="text-[10px] text-slate-500 truncate max-w-[150px] sm:max-w-xs">{resource.url}</div>
                                            <div className="sm:hidden text-[10px] text-blue-500 font-mono">
                                                Ref: {resource.related_article_slug || 'None'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono hidden sm:table-cell">
                                        {resource.related_article_slug || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingId(resource.id);
                                                    setFormData({
                                                        title: resource.title,
                                                        url: resource.url,
                                                        type: resource.type as any,
                                                        related_article_slug: resource.related_article_slug || ''
                                                    });
                                                    setIsAdding(false);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => deleteResource(resource.id)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
