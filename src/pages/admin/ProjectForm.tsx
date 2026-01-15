import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Project } from '../../types/project';
import { Editor } from '../../components/admin/Editor';

// Placeholder image for preview
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%231e293b" width="400" height="225"/%3E%3Ctext fill="%2364748b" font-family="system-ui" font-size="18" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3E📷 No Image%3C/text%3E%3C/svg%3E';

export function AdminProjectForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<Partial<Project>>({
        title: '',
        slug: '',
        excerpt: '',
        content_rich: null,
        technologies: [],
        video_url: '',
        cover_image: '',
        status: 'draft'
    });

    const [techInput, setTechInput] = useState('');

    useEffect(() => {
        if (isEdit) {
            fetchProject();
        }
    }, [id]);

    async function fetchProject() {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            alert('Error fetching project: ' + error.message);
            navigate('/admin/projects');
        } else {
            setFormData(data);
            if (data.technologies) {
                setTechInput(data.technologies.join(', '));
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

    const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTechInput(value);
        setFormData(prev => ({
            ...prev,
            technologies: value.split(',').map(t => t.trim()).filter(t => t !== '')
        }));
    };

    // Image Upload Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!formData.slug) {
            alert('Please enter a project title first to generate a slug.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        console.log('Starting cover image upload for project:', formData.slug);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cover-${Date.now()}.${fileExt}`;
            const filePath = `${formData.slug}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                if (uploadError.message.includes('bucket not found') || uploadError.message.includes('Bucket not found')) {
                    throw new Error('Storage bucket "project-images" not found. Please create it in Supabase Storage.');
                }
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('project-images')
                .getPublicUrl(filePath);

            console.log('Upload successful, public URL:', publicUrl);
            setFormData(prev => ({ ...prev, cover_image: publicUrl }));

        } catch (error: any) {
            console.error('Image upload failed:', error);
            alert('❌ Upload Failed: ' + error.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.slug) {
            alert('Title and Slug are required.');
            return;
        }

        setSaving(true);
        const finalData = {
            ...formData,
            updated_at: new Date().toISOString()
        };

        try {
            if (isEdit) {
                const { error } = await supabase
                    .from('projects')
                    .update(finalData)
                    .eq('id', id);
                if (error) throw error;
                alert('🚀 Project updated successfully!');
            } else {
                const { error } = await supabase
                    .from('projects')
                    .insert([{ ...finalData, created_at: new Date().toISOString() }]);
                if (error) throw error;
                alert('🚀 Project created successfully!');
            }
            navigate('/admin/projects');
        } catch (error: any) {
            console.error('Error saving project:', error);
            alert('❌ Error saving project: ' + error.message);
        } finally {
            setSaving(false);
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
                    to="/admin/projects"
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    ⬅️
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isEdit ? 'Edit Project' : 'New Project'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start" dir="ltr">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g., 6-DOF Robotic Arm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slug</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-xs outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Details (Rich Text)</label>
                            <Editor
                                value={formData.content_rich}
                                onChange={(json) => setFormData({ ...formData, content_rich: json })}
                                placeholder="Describe the challenges, solutions, and results..."
                                articleSlug={formData.slug}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
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

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Technologies (Comma separated)</label>
                            <input
                                type="text"
                                value={techInput}
                                onChange={handleTechChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Python, Arduino, React..."
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.technologies?.map(tech => (
                                    <span key={tech} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt</label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="A brief summary for the project card..."
                            />
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cover Image</label>

                            {/* Preview */}
                            <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
                                <img
                                    src={formData.cover_image || PLACEHOLDER_IMAGE}
                                    alt="Cover Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                                />
                            </div>

                            {/* Upload Button */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                            >
                                {uploading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        📤 Upload Thumbnail
                                    </>
                                )}
                            </button>

                            {/* Or paste URL */}
                            <div className="mt-3">
                                <input
                                    type="url"
                                    value={formData.cover_image}
                                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                                    placeholder="Or paste image URL..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">YouTube Video Link (Optional)</label>
                            <input
                                type="url"
                                value={formData.video_url}
                                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="https://youtube.com/..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full py-4 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${formData.status === 'published'
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                : 'bg-slate-600 hover:bg-slate-700 shadow-slate-500/20'
                                }`}
                        >
                            {saving ? 'Saving...' : formData.status === 'published' ? '🚀 Publish Project' : '📁 Save as Draft'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
