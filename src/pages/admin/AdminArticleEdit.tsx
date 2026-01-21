import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { adminGetArticleById, adminUpdateArticle } from '../../services/articles';
import { Editor } from '../../components/admin/Editor';
import { supabase } from '../../services/supabase';
import { generateSlug } from '../../utils/slug';
import type { Article } from '../../types/article';

export function AdminArticleEdit() {
    const { id } = useParams<{ id: string }>();
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Article>>({
        title: '',
        excerpt: '',
        content_rich: null,
        image_url: '',
        category: 'general-engineering',
        language: 'ar',
        author_name: '',
        slug: '',
    });

    useEffect(() => {
        if (id) {
            fetchArticle();
        }
    }, [id]);

    async function fetchArticle() {
        setLoading(true);
        try {
            const article = await adminGetArticleById(id!);
            setFormData({
                title: article.title || '',
                excerpt: article.excerpt || '',
                content_rich: article.content_rich,
                image_url: article.image_url || '',
                category: article.category || 'general-engineering',
                language: article.language || 'ar',
                author_name: article.author_name || '',
                slug: article.slug || '',
            });
        } catch (err: any) {
            console.error('Error fetching article:', err);
            alert(isArabic ? 'خطأ في جلب المقال' : 'Error fetching article');
        } finally {
            setLoading(false);
        }
    }

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCover(true);
        try {
            // Compress and upload
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (event) => {
                const img = new Image();
                img.src = event.target?.result as string;

                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const scaleFactor = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleFactor;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(async (blob) => {
                        if (!blob) return;
                        const fileName = `admin-cover-${Date.now()}.jpeg`;
                        const filePath = `admin/${fileName}`;

                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('article-images')
                            .upload(filePath, blob, { contentType: 'image/jpeg' });

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                            .from('article-images')
                            .getPublicUrl(uploadData.path);

                        setFormData(prev => ({ ...prev, image_url: publicUrl }));
                        setUploadingCover(false);
                    }, 'image/jpeg', 0.85);
                };
            };
        } catch (err: any) {
            console.error('Upload error:', err);
            alert(err.message);
            setUploadingCover(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await adminUpdateArticle(id!, formData);
            alert(isArabic ? '✅ تم حفظ التعديلات' : '✅ Changes saved');
            navigate('/admin/users/articles');
        } catch (err: any) {
            console.error('Save error:', err);
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        const newSlug = generateSlug(newTitle);
        setFormData(prev => ({ ...prev, title: newTitle, slug: newSlug }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6" dir={isArabic ? 'rtl' : 'ltr'}>
            <Helmet>
                <title>{isArabic ? 'تعديل المقال (أدمن)' : 'Edit Article (Admin)'}</title>
            </Helmet>

            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/users/articles')}
                        className="text-blue-600 hover:text-blue-700 font-bold mb-4"
                    >
                        ← {isArabic ? 'العودة للمراجعة' : 'Back to Review'}
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {isArabic ? 'تعديل المقال (أدمن)' : 'Edit Article (Admin)'}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isArabic ? 'يمكنك تعديل أي جزء من المقال كمشرف' : 'You can edit any part of this article as admin'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'عنوان المقال' : 'Article Title'}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'اسم الكاتب' : 'Author Name'}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.author_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={isArabic ? 'اسم كاتب المقال' : 'Article author name'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'المحتوى' : 'Content'}</label>
                                <Editor
                                    value={formData.content_rich}
                                    onChange={(json) => setFormData(prev => ({ ...prev, content_rich: json }))}
                                    placeholder={isArabic ? 'اكتب مقالك هنا...' : 'Write your article here...'}
                                    articleSlug={formData.slug}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'التصنيف' : 'Category'}</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="general-engineering">General Engineering</option>
                                    <option value="mechanical">Mechanical</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="civil">Civil</option>
                                    <option value="software">Software</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'اللغة' : 'Language'}</label>
                                <select
                                    required
                                    value={formData.language}
                                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value as any }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ar">العربية</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {isArabic ? 'ملخص قصير' : 'Excerpt'}
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal mr-2">
                                        {isArabic ? '(يظهر في قوائم المقالات)' : '(Shows in article previews)'}
                                    </span>
                                </label>
                                <textarea
                                    required
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder={isArabic ? 'اكتب وصفاً مختصراً يجذب القارئ...' : 'Write a short summary to attract readers...'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'صورة الغلاف' : 'Cover Image'}</label>
                                <div
                                    onClick={() => coverInputRef.current?.click()}
                                    className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden group"
                                >
                                    {formData.image_url ? (
                                        <>
                                            <img src={formData.image_url} alt="Cover" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all">
                                                {isArabic ? 'تغيير الصورة' : 'Change Image'}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <span className="text-4xl mb-2 block">{uploadingCover ? '⏳' : '🖼️'}</span>
                                            <p className="text-sm text-slate-500">
                                                {uploadingCover ? (isArabic ? 'جاري الرفع...' : 'Uploading...') : (isArabic ? 'انقر لرفع صورة الغلاف' : 'Click to upload cover image')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={coverInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleCoverUpload}
                                    disabled={uploadingCover}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving || uploadingCover}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ التعديلات' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
