import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Video } from '../../types/video';

export function AdminVideos() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [articles, setArticles] = useState<{ slug: string, title: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'shorts' | 'long'>('all'); // Filter state

    // Calculate stats
    const stats = {
        total: videos.length,
        shorts: videos.filter(v => v.is_shorts).length,
        long: videos.filter(v => !v.is_shorts).length
    };

    // Filter videos for display
    const filteredVideos = videos.filter(v => {
        if (filter === 'shorts') return v.is_shorts;
        if (filter === 'long') return !v.is_shorts;
        return true;
    });

    const [formData, setFormData] = useState({
        title: '',
        youtube_url: '',
        related_article_slug: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        const [videosRes, articlesRes] = await Promise.all([
            supabase.from('videos').select('*').order('published_at', { ascending: false, nullsFirst: false }),
            supabase.from('articles').select('slug, title')
        ]);

        if (videosRes.error) console.error('Error fetching videos:', videosRes.error);
        if (articlesRes.error) console.error('Error fetching articles:', articlesRes.error);

        setVideos(videosRes.data || []);
        setArticles((articlesRes.data as any) || []);
        setLoading(false);
    }

    const extractVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const videoId = extractVideoId(formData.youtube_url);
        if (!videoId) {
            alert('Invalid YouTube URL');
            return;
        }

        const videoData = {
            title: formData.title,
            video_id: videoId,
            related_article_slug: formData.related_article_slug || null,
            created_at: new Date().toISOString()
        };

        if (editingId) {
            const { error } = await supabase.from('videos').update(videoData).eq('id', editingId);
            if (error) alert(error.message);
        } else {
            const { error } = await supabase.from('videos').insert([videoData]);
            if (error) alert(error.message);
        }

        resetForm();
        fetchInitialData();
    };

    const deleteVideo = async (id: string) => {
        if (!confirm('Delete this video?')) return;
        const { error } = await supabase.from('videos').delete().eq('id', id);
        if (error) alert(error.message);
        else setVideos(videos.filter(v => v.id !== id));
    };

    const resetForm = () => {
        setFormData({ title: '', youtube_url: '', related_article_slug: '' });
        setIsAdding(false);
        setEditingId(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Videos Manager</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and organize your YouTube content</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <span>➕</span> Add New Video
                    </button>
                )}
            </div>

            {/* Stats Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">📹</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Videos</div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">⚡</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Shorts</div>
                    <div className="text-4xl font-bold text-orange-500">{stats.shorts}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">📺</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Long Videos</div>
                    <div className="text-4xl font-bold text-blue-500">{stats.long}</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800">
                {(['all', 'videos', 'shorts'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f === 'videos' ? 'long' : f as any)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${(filter === 'long' && f === 'videos') || filter === f
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {(isAdding || editingId) && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-lg shadow-blue-500/5">
                    <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
                        {editingId ? 'Edit Video' : 'Add New Video'}
                    </h2>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Video Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">YouTube URL</label>
                            <input
                                type="url"
                                required
                                value={formData.youtube_url}
                                onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Related Article (Optional)</label>
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
                        <div className="md:col-span-2 flex justify-end gap-3">
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
                                {editingId ? 'Update Video' : 'Save Video'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
                            <th className="px-6 py-4 text-center w-12">#</th>
                            <th className="px-6 py-4">Title / ID</th>
                            <th className="px-6 py-4">Views</th>
                            <th className="px-6 py-4">Published</th>
                            <th className="px-6 py-4">Article</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
                        ) : filteredVideos.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No videos found</td></tr>
                        ) : (
                            filteredVideos.map((video, index) => (
                                <tr key={video.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1 flex items-center gap-2">
                                            {video.is_shorts && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">Shorts</span>}
                                            {video.title}
                                        </div>
                                        <div className="text-[10px] text-blue-500 font-mono tracking-wider">{video.youtube_video_id || video.video_id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                                        {video.view_count?.toLocaleString() || '0'}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {video.published_at ? new Date(video.published_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {video.related_article_slug || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingId(video.id);
                                                setFormData({
                                                    title: video.title,
                                                    youtube_url: `https://www.youtube.com/watch?v=${video.video_id}`,
                                                    related_article_slug: video.related_article_slug || ''
                                                });
                                                setIsAdding(false);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => deleteVideo(video.id)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
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
    );
}
