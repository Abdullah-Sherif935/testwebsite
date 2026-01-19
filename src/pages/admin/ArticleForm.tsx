import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Article } from '../../types/article';
import { Editor } from '../../components/admin/Editor';

export function AdminArticleForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Article>>({
        title: '',
        slug: '',
        excerpt: '',
        content_md: '',
        content_rich: null,
        content: '', // legacy
        category: 'General Engineering',
        status: 'draft',
        language: 'ar',
        image_url: ''
    });

    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const defaultCategories = ['General Engineering', 'Robotics', 'Control Systems', 'Automation', 'Programming'];

    useEffect(() => {
        if (isEdit) {
            fetchArticle();
        }
    }, [id]);

    async function fetchArticle() {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            alert('Error fetching article: ' + error.message);
            navigate('/admin/articles');
        } else {
            setFormData(data);
            // Check if current category is custom
            if (data.category && !defaultCategories.includes(data.category)) {
                setIsCustomCategory(true);
            }
        }
        setLoading(false);
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: newTitle,
            slug: isEdit ? prev.slug : generateSlug(newTitle)
        }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'NEW_CATEGORY') {
            setIsCustomCategory(true);
            setFormData({ ...formData, category: '' });
        } else {
            setIsCustomCategory(false);
            setFormData({ ...formData, category: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submit triggered. Current formData:', formData);

        if (!formData.content_rich && !formData.content_md && !formData.content) {
            alert('Please add some content to your article before saving. (Write something in the editor)');
            return;
        }

        if (!formData.title || !formData.slug) {
            alert('Title and Slug are required.');
            return;
        }

        if (!formData.category) {
            alert('Please select or enter a category.');
            return;
        }

        setSaving(true);
        console.log('Saving process started...');

        const finalData = {
            ...formData,
            updated_at: new Date().toISOString()
        };

        try {
            if (isEdit) {
                console.log('Updating existing article:', id);
                const { error } = await supabase
                    .from('articles')
                    .update(finalData)
                    .eq('id', id);
                if (error) throw error;
                alert(`✅ Article ${formData.status === 'published' ? 'published' : 'saved as draft'} successfully!`);
            } else {
                console.log('Creating new article...');
                const { error } = await supabase
                    .from('articles')
                    .insert([{ ...finalData, created_at: new Date().toISOString() }]);
                if (error) throw error;
                alert(`🚀 Article ${formData.status === 'published' ? 'published' : 'saved as draft'} successfully!`);
            }
            console.log('Save successful, navigating back...');
            navigate('/admin/articles');
        } catch (error: any) {
            console.error('Submit error details:', error);
            alert('❌ Error saving article: ' + (error.message || 'Check database connection or missing columns'));
        } finally {
            setSaving(false);
            console.log('Saving process finished.');
        }
    };

    if (loading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link
                    to="/admin/articles"
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    ⬅️
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isEdit ? 'Edit Article' : 'New Article'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start" dir="ltr">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Article Title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slug</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                                placeholder="article-slug"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content (Rich Text)</label>
                            <Editor
                                value={formData.content_rich}
                                onChange={(json) => setFormData({ ...formData, content_rich: json })}
                                placeholder="Write your professional article here..."
                                articleSlug={formData.slug}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                            <select
                                value={isCustomCategory ? 'NEW_CATEGORY' : formData.category}
                                onChange={handleCategoryChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {defaultCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="NEW_CATEGORY">➕ Add Custom Category...</option>
                            </select>

                            {isCustomCategory && (
                                <input
                                    type="text"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none animate-in fade-in slide-in-from-top-2"
                                    placeholder="Enter category name..."
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Language</label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ar">Arabic (العربية)</option>
                                    <option value="en">English (English)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                >
                                    <option value="draft">📁 Draft</option>
                                    <option value="published">🚀 Published</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Short summary of the article..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Featured Image</label>
                            <div className="space-y-4">
                                {formData.image_url && (
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image_url: '' })}
                                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-slate-200 dark:border-slate-700">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <span className="text-2xl mb-2">🖼️</span>
                                            <p className="mb-1 text-sm text-slate-500 dark:text-slate-400 font-bold">Click to upload cover</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">PNG, JPG, WEBP (Max 2MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        alert('Image too large. Max 2MB.');
                                                        return;
                                                    }
                                                    setSaving(true);
                                                    try {
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `${Date.now()}.${fileExt}`;
                                                        const { error: uploadError } = await supabase.storage
                                                            .from('article-covers')
                                                            .upload(fileName, file);

                                                        if (uploadError) throw uploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('article-covers')
                                                            .getPublicUrl(fileName);

                                                        setFormData({ ...formData, image_url: publicUrl });
                                                    } catch (err: any) {
                                                        alert('Upload failed: ' + err.message);
                                                    } finally {
                                                        setSaving(false);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${formData.status === 'published'
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                : 'bg-slate-600 hover:bg-slate-700 shadow-slate-500/20'
                                }`}
                        >
                            {saving ? 'Saving...' : formData.status === 'published' ? '🚀 Publish Article' : '📁 Save as Draft'}
                        </button>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <span>💡</span> Writing with Ease
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                            Use the toolbar to format your text, add links, images, or even YouTube videos directly into your article.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
