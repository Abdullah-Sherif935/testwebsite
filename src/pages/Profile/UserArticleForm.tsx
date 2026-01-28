import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabase';
import { Editor } from '../../components/admin/Editor';
import { submitUserArticle, updateUserArticle } from '../../services/articles';
import type { Article } from '../../types/article';
import { pageTransition } from '../../utils/animations';
import { RichTextRenderer } from '../../components/common/RichTextRenderer';
import { compressImage } from '../../utils/imageCompression';
import { getUserProfile } from '../../services/profile';
import { CreatorRequestForm } from './CreatorRequestForm';

export function UserArticleForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const isEdit = !!id;
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const [isVerified, setIsVerified] = useState<boolean | null>(null);

    const [formData, setFormData] = useState<Partial<Article>>({
        title: '',
        slug: '',
        excerpt: '',
        content_rich: null,
        category: 'General Engineering',
        language: 'ar',
        image_url: '',
        author_name: user?.user_metadata?.full_name || '',
        status: 'draft'
    });

    const categories = ['General Engineering', 'Robotics', 'Control Systems', 'Automation', 'Programming', 'Other'];

    useEffect(() => {
        if (user) {
            checkVerification();
        }
    }, [user]);

    async function checkVerification() {
        try {
            const profile = await getUserProfile(user!.id);
            setIsVerified(!!profile?.is_verified);
            if (isEdit) {
                await fetchArticle();
            } else {
                // If new article, set author name from profile immediately
                if (profile) {
                    const name = profile.full_name_ar || profile.full_name_en;
                    if (name) {
                        setFormData(prev => ({ ...prev, author_name: name }));
                    }
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Error checking verification:', error);
            setLoading(false);
        }
    }

    async function fetchArticle() {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .eq('user_id', user?.id)
                .single();

            if (error) throw error;
            if (error) throw error;

            // When editing, overwrite the stored author_name with the CURRENT profile name
            // We need to fetch profile again or pass it? 
            // Actually, checkVerification runs before or parallel? 
            // To be safe, we fetch profile name here explicitly OR rely on the disabled input 
            // but we must ENSURE the formData HAS the current name so it SAVES the current name.

            const { data: profile } = await supabase.from('user_profiles').select('full_name_ar, full_name_en').eq('id', user?.id).single();
            const currentName = profile?.full_name_ar || profile?.full_name_en || data.author_name;

            setFormData({
                ...data,
                author_name: currentName // Force update to current profile name
            });
            if (data.category && !categories.includes(data.category)) {
                setCustomCategory(data.category);
                setFormData(prev => ({ ...prev, category: 'Other' }));
            }
        } catch (error: any) {
            alert(isArabic ? 'خطأ في جلب المقال: ' : 'Error fetching article: ' + error.message);
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            // Explicitly remove problematic characters like colons
            .replace(/[:]/g, '')
            // Allow Arabic characters (Unicode range \u0600-\u06FF) and alphanumeric
            .replace(/[^\w\s\u0600-\u06FF-]/g, '')
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

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setUploadingCover(true);
        console.log('Cover upload started for slug:', formData.slug);
        try {
            // Compress image before upload
            const compressedBlob = await compressImage(file, 1600, 0.85);

            const fileName = `cover-${Date.now()}.jpeg`;
            // Use user.id as folder to avoid 'Invalid key' issues with Arabic slugs in Storage
            const filePath = `${user?.id}/${fileName}`;

            console.log('Uploading compressed cover to path:', filePath);
            const { error: uploadError } = await supabase.storage
                .from('article-images')
                .upload(filePath, compressedBlob, {
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                console.error('Cover upload error:', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('article-images')
                .getPublicUrl(filePath);

            console.log('Cover public URL:', publicUrl);
            setFormData(prev => ({ ...prev, image_url: publicUrl }));
            alert(isArabic ? '✅ تم رفع الغلاف بنجاح' : '✅ Cover uploaded successfully');
        } catch (error: any) {
            console.error('Final cover upload error:', error);
            alert((isArabic ? 'خطأ في رفع الغلاف: ' : 'Cover upload error: ') + error.message);
        } finally {
            setUploadingCover(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.content_rich) {
            alert(isArabic ? 'يرجى إضافة محتوى للمقال' : 'Please add some content to your article.');
            return;
        }

        // Ensure slug is unique by appending a short random string for NEW articles
        const submissionSlug = isEdit
            ? formData.slug
            : `${formData.slug}-${Math.random().toString(36).substring(2, 7)}`;

        const finalData = {
            ...formData,
            slug: submissionSlug,
            content: '', // Fallback for DB
            content_md: '', // Fallback for DB
            category: formData.category === 'Other' ? customCategory : formData.category
        };

        if (finalData.category === 'Other' && !customCategory) {
            alert(isArabic ? 'يرجى كتابة التصنيف' : 'Please enter custom category name');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                const { error } = await updateUserArticle(id!, finalData);
                if (error) throw error;
                const msg = finalData.status === 'draft'
                    ? (isArabic ? '✅ تم حفظ التعديلات في المسودة' : '✅ Draft updates saved')
                    : (isArabic ? '🚀 تم إرسال التعديلات للمراجعة' : '🚀 Updates sent for review');
                alert(msg);
            } else {
                const { error } = await submitUserArticle(finalData);
                if (error) throw error;
                const msg = finalData.status === 'draft'
                    ? (isArabic ? '✅ تم حفظ المسودة بنجاح' : '✅ Draft saved successfully')
                    : (isArabic ? '🚀 تم إرسال المقال للمراجعة بنجاح' : '🚀 Article submitted for review');
                alert(msg);
            }
            navigate('/profile?tab=articles');
        } catch (error: any) {
            console.error('Submission error:', error);
            alert((isArabic ? '❌ خطأ أثناء الحفظ: ' : '❌ Error saving: ') + (error.message || JSON.stringify(error)));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen pt-32 flex justify-center items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    if (isVerified === false) {
        return <CreatorRequestForm />;
    }

    return (
        <motion.div
            className="pt-32 pb-20 min-h-screen bg-slate-50 dark:bg-slate-950"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{isEdit ? (isArabic ? 'تعديل مقال' : 'Edit Article') : (isArabic ? 'كتابة مقال جديد' : 'New Article')}</title>
            </Helmet>

            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/profile?tab=articles" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                            {isArabic ? '⬅️' : '⬅️'}
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {isEdit ? (isArabic ? 'تعديل مقالك' : 'Edit Your Article') : (isArabic ? 'كتابة مقال جديد' : 'Write New Article')}
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                        👁️ {isArabic ? 'معاينة' : 'Preview'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start" dir={isArabic ? 'rtl' : 'ltr'}>
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
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, author_name: val }));
                                    }}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed font-bold"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {isArabic
                                        ? 'يتم استرداد اسم الكاتب تلقائياً من الملف الشخصي. لتغييره، اذهب إلى إعدادات الملف الشخصي (مسموح كل 20 يوم).'
                                        : 'Author name is fetched from your profile. To change it, go to Profile Settings (allowed once every 20 days).'
                                    }
                                </p>
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
                                    value={formData.category}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, category: val }));
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>

                                {formData.category === 'Other' && (
                                    <motion.input
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        type="text"
                                        required
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        placeholder={isArabic ? 'اكتب التصنيف الجديد...' : 'Enter new category...'}
                                        className="w-full px-4 py-3 rounded-xl border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'اللغة' : 'Language'}</label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => {
                                        const val = e.target.value as any;
                                        setFormData(prev => ({ ...prev, language: val }));
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ar">العربية</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {isArabic ? 'حالة المقال' : 'Article Status'}
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => {
                                        const val = e.target.value as any;
                                        setFormData(prev => ({ ...prev, status: val }));
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-500/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                >
                                    <option value="draft">{isArabic ? '📄 مسودة (حفظ فقط)' : '📄 Draft (Save only)'}</option>
                                    <option value="published">{isArabic ? '🚀 نشر (إرسال للمراجعة)' : '🚀 Publish (Send to review)'}</option>
                                </select>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    {isArabic
                                        ? '* المسودة لا تظهر للإدارة ولا للعامة حتى تختار "نشر"'
                                        : '* Drafts are not visible to admin or public until you choose "Publish"'}
                                </p>
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
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, excerpt: val }));
                                    }}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder={isArabic ? 'اكتب وصفاً مختصراً يجذب القارئ...' : 'Write a short summary to attract readers...'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{isArabic ? 'صورة الغلاف' : 'Cover Image'}</label>
                                <div
                                    onClick={() => {
                                        console.log('Cover area clicked');
                                        coverInputRef.current?.click();
                                    }}
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
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : isEdit ? (isArabic ? 'حفظ التعديلات' : 'Save Changes') : (formData.status === 'draft' ? (isArabic ? 'حفظ كمسودة' : 'Save as Draft') : (isArabic ? 'إرسال للمراجعة' : 'Submit for Review'))}
                            </button>

                            <p className="text-xs text-slate-500 text-center leading-relaxed">
                                {isArabic ? '⚠️ سيتم مراجعة المقال من قبل الإدارة قبل نشره للجميع.' : '⚠️ Article will be reviewed by admin before becoming public.'}
                            </p>
                        </div>
                    </div>
                </form>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-y-auto"
                    >
                        <div className="container mx-auto px-4 max-w-4xl py-20 relative">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="fixed top-8 right-8 w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-all z-[110]"
                            >
                                ✕
                            </button>

                            <div className="text-center mb-12">
                                <div className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold mb-6">
                                    {formData.category === 'Other' ? customCategory : formData.category}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                                    {formData.title || (isArabic ? 'العنوان يظهر هنا' : 'Title appears here')}
                                </h1>
                                <div className="flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-bold">
                                    <span>👤 {formData.author_name}</span>
                                    <span>📅 {new Date().toLocaleDateString(isArabic ? 'ar' : 'en')}</span>
                                </div>
                            </div>

                            {formData.image_url && (
                                <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl">
                                    <img src={formData.image_url} alt="" className="w-full h-auto" />
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                {formData.content_rich ? (
                                    <RichTextRenderer content={formData.content_rich} />
                                ) : (
                                    <div className="py-20 text-center italic text-slate-400">
                                        {isArabic ? 'المحتوى سيظهر هنا...' : 'Content will appear here...'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
