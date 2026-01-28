import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
    getUserProfile,
    upsertUserProfile,
    uploadUserCV,
    deleteUserCV,
    type UserProfile,
    type UserProject,
    type UserExperience,
} from '../../services/profile';
import { fadeInUp } from '../../utils/animations';

const GOVERNORATES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'القليوبية',
    'كفر الشيخ', 'الغربية', 'المنوفية', 'البحيرة', 'الإسماعيلية', 'بورسعيد',
    'السويس', 'شمال سيناء', 'جنوب سيناء', 'مطروح', 'البحر الأحمر', 'الفيوم',
    'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'الوادي الجديد'
];

export function UserProfileForm() {
    const { user } = useAuth();
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingCV, setUploadingCV] = useState(false);

    // Form data
    const [formData, setFormData] = useState<UserProfile>({
        full_name_ar: '',
        full_name_en: '',
        birth_date: '',
        governorate: '',
        education_status: 'student',
        university: '',
        faculty: '',
        department: '',
        projects: [],
        experiences: [],
        skills: [],
        about_me: '',
        linkedin_url: '',
    });

    // Store initial data to check for sensitive changes like name
    const [initialData, setInitialData] = useState<UserProfile | null>(null);

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    async function loadProfile() {
        if (!user) return;

        setLoading(true);
        try {
            const profile = await getUserProfile(user.id);
            if (profile) {
                setFormData(profile);
                setInitialData(profile);
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!user) return;

        setSaving(true);
        try {
            // Check Name Change Restriction (20 Days)
            const isNameChanged =
                (formData.full_name_ar !== initialData?.full_name_ar) ||
                (formData.full_name_en !== initialData?.full_name_en);

            if (isNameChanged) {
                const lastUpdate = formData.last_name_update ? new Date(formData.last_name_update) : new Date(0);
                const now = new Date();
                const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

                if (daysSinceUpdate < 20) {
                    const daysLeft = Math.ceil(20 - daysSinceUpdate);
                    const msg = isArabic
                        ? `⚠️ لا يمكنك تغيير الاسم حالياً. يجب مرور 20 يوماً بين كل تغيير. المتبقي: ${daysLeft} يوم.`
                        : `⚠️ You cannot change your name yet. 20 days cooldown required. ${daysLeft} days remaining.`;
                    alert(msg);
                    setSaving(false);
                    return;
                }

                // Update timestamp if change is allowed
                formData.last_name_update = new Date().toISOString();
            }

            await upsertUserProfile(user.id, formData);

            // Update initial data after successful save
            setInitialData(formData);

            alert(isArabic ? '✅ تم حفظ البيانات بنجاح' : '✅ Profile saved successfully');
        } catch (err: any) {
            alert(isArabic ? '❌ حدث خطأ أثناء الحفظ' : '❌ Error saving profile');
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    async function handleCVUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!user || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploadingCV(true);

        try {
            const result = await uploadUserCV(user.id, file);
            setFormData(prev => ({
                ...prev,
                cv_file_url: result.url,
                cv_file_name: result.fileName,
                cv_file_size: result.size,
            }));
            alert(isArabic ? '✅ تم رفع السيرة الذاتية بنجاح' : '✅ CV uploaded successfully');
        } catch (err: any) {
            alert(err.message || (isArabic ? '❌ فشل رفع الملف' : '❌ Failed to upload file'));
        } finally {
            setUploadingCV(false);
            e.target.value = ''; // Reset file input
        }
    }

    async function handleDeleteCV() {
        if (!user || !formData.cv_file_url) return;
        if (!window.confirm(isArabic ? 'هل تريد حذف السيرة الذاتية؟' : 'Delete CV file?')) return;

        try {
            await deleteUserCV(user.id);
            setFormData(prev => ({
                ...prev,
                cv_file_url: '',
                cv_file_name: '',
                cv_file_size: 0,
            }));
            alert(isArabic ? '✅ تم حذف السيرة الذاتية' : '✅ CV deleted');
        } catch (err) {
            alert(isArabic ? '❌ فشل الحذف' : '❌ Failed to delete');
        }
    }

    function addProject() {
        setFormData(prev => ({
            ...prev,
            projects: [...(prev.projects || []), { title: '', description: '', link: '' }],
        }));
    }

    function removeProject(index: number) {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects?.filter((_, i) => i !== index) || [],
        }));
    }

    function updateProject(index: number, field: keyof UserProject, value: string) {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects?.map((proj, i) =>
                i === index ? { ...proj, [field]: value } : proj
            ) || [],
        }));
    }

    function addExperience() {
        setFormData(prev => ({
            ...prev,
            experiences: [...(prev.experiences || []), { title: '', company: '', description: '', from: '', to: '' }],
        }));
    }

    function removeExperience(index: number) {
        setFormData(prev => ({
            ...prev,
            experiences: prev.experiences?.filter((_, i) => i !== index) || [],
        }));
    }

    function updateExperience(index: number, field: keyof UserExperience, value: string) {
        setFormData(prev => ({
            ...prev,
            experiences: prev.experiences?.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            ) || [],
        }));
    }

    function addSkill() {
        if (!newSkill.trim()) return;
        setFormData(prev => ({
            ...prev,
            skills: [...(prev.skills || []), newSkill.trim()],
        }));
        setNewSkill('');
    }

    function removeSkill(index: number) {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills?.filter((_, i) => i !== index) || [],
        }));
    }

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div className="space-y-8" variants={fadeInUp}>
            {/* Personal Information */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {isArabic ? 'الاسم (عربي) - يظهر كاسم الكاتب' : 'Full Name (Arabic) - Appears as Author'}
                        </label>
                        <input
                            type="text"
                            value={formData.full_name_ar || ''}
                            onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={isArabic ? 'أحمد محمد' : 'Ahmed Mohamed'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {isArabic ? 'الاسم (إنجليزي) - يظهر كاسم الكاتب' : 'Full Name (English) - Appears as Author'}
                        </label>
                        <input
                            type="text"
                            value={formData.full_name_en || ''}
                            onChange={(e) => setFormData({ ...formData, full_name_en: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ahmed Mohamed"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
                            {isArabic
                                ? 'ℹ️ ملاحظة: هذا الاسم هو الذي سيظهر كـ "اسم الكاتب" على جميع مقالاتك. للحفاظ على الهوية، يُسمح بتغيير الاسم مرة واحدة فقط كل 20 يوماً.'
                                : 'ℹ️ Note: This name will appear as "Author Name" on all your articles. To maintain identity, you can only change it once every 20 days.'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {isArabic ? 'تاريخ الميلاد' : 'Birth Date'}
                        </label>
                        <input
                            type="date"
                            value={formData.birth_date || ''}
                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {isArabic ? 'المحافظة' : 'Governorate'}
                        </label>
                        <select
                            value={formData.governorate || ''}
                            onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">{isArabic ? 'اختر المحافظة' : 'Select Governorate'}</option>
                            {GOVERNORATES.map((gov) => (
                                <option key={gov} value={gov}>{gov}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    {isArabic ? 'التعليم' : 'Education'}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {isArabic ? 'الحالة التعليمية' : 'Education Status'}
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-all">
                                <input
                                    type="radio"
                                    name="education_status"
                                    value="student"
                                    checked={formData.education_status === 'student'}
                                    onChange={(e) => setFormData({ ...formData, education_status: e.target.value as 'student' | 'graduate' })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {isArabic ? 'طالب' : 'Student'}
                                </span>
                            </label>
                            <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-all">
                                <input
                                    type="radio"
                                    name="education_status"
                                    value="graduate"
                                    checked={formData.education_status === 'graduate'}
                                    onChange={(e) => setFormData({ ...formData, education_status: e.target.value as 'student' | 'graduate' })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {isArabic ? 'خريج' : 'Graduate'}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isArabic ? 'الجامعة' : 'University'}
                            </label>
                            <input
                                type="text"
                                value={formData.university || ''}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={isArabic ? 'جامعة القاهرة' : 'Cairo University'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isArabic ? 'الكلية' : 'Faculty'}
                            </label>
                            <input
                                type="text"
                                value={formData.faculty || ''}
                                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={isArabic ? 'الهندسة' : 'Engineering'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isArabic ? 'القسم' : 'Department'}
                            </label>
                            <input
                                type="text"
                                value={formData.department || ''}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={isArabic ? 'ميكاترونيكس' : 'Mechatronics'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isArabic ? 'المشاريع' : 'Projects'}
                    </h3>
                    <button
                        onClick={addProject}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                    >
                        {isArabic ? '➕ إضافة مشروع' : '➕ Add Project'}
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.projects && formData.projects.length > 0 ? (
                        formData.projects.map((project, index) => (
                            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-sm font-bold text-slate-500">
                                        {isArabic ? `مشروع ${index + 1}` : `Project ${index + 1}`}
                                    </span>
                                    <button
                                        onClick={() => removeProject(index)}
                                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                                    >
                                        {isArabic ? '🗑️ حذف' : '🗑️ Remove'}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={project.title}
                                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder={isArabic ? 'عنوان المشروع' : 'Project Title'}
                                    />
                                    <textarea
                                        value={project.description}
                                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder={isArabic ? 'وصف المشروع' : 'Project Description'}
                                        rows={2}
                                    />
                                    <input
                                        type="url"
                                        value={project.link || ''}
                                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder={isArabic ? 'رابط المشروع (اختياري)' : 'Project Link (optional)'}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8 italic">
                            {isArabic ? 'لم تضف أي مشاريع بعد' : 'No projects added yet'}
                        </p>
                    )}
                </div>
            </div>

            {/* Experiences */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isArabic ? 'الخبرات العملية' : 'Work Experience'}
                    </h3>
                    <button
                        onClick={addExperience}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                    >
                        {isArabic ? '➕ إضافة خبرة' : '➕ Add Experience'}
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.experiences && formData.experiences.length > 0 ? (
                        formData.experiences.map((exp, index) => (
                            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-sm font-bold text-slate-500">
                                        {isArabic ? `خبرة ${index + 1}` : `Experience ${index + 1}`}
                                    </span>
                                    <button
                                        onClick={() => removeExperience(index)}
                                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                                    >
                                        {isArabic ? '🗑️ حذف' : '🗑️ Remove'}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={exp.title}
                                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder={isArabic ? 'المسمى الوظيفي' : 'Job Title'}
                                        />
                                        <input
                                            type="text"
                                            value={exp.company}
                                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder={isArabic ? 'الشركة' : 'Company'}
                                        />
                                    </div>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder={isArabic ? 'وصف العمل' : 'Job Description'}
                                        rows={2}
                                    />
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">
                                                {isArabic ? 'من' : 'From'}
                                            </label>
                                            <input
                                                type="month"
                                                value={exp.from}
                                                onChange={(e) => updateExperience(index, 'from', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">
                                                {isArabic ? 'إلى' : 'To'}
                                            </label>
                                            <input
                                                type="month"
                                                value={exp.to || ''}
                                                onChange={(e) => updateExperience(index, 'to', e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                placeholder={isArabic ? 'حتى الآن' : 'Present'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8 italic">
                            {isArabic ? 'لم تضف أي خبرات بعد' : 'No experiences added yet'}
                        </p>
                    )}
                </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    {isArabic ? 'المهارات المكتسبة' : 'Skills'}
                </h3>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            className="w-full sm:flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={isArabic ? 'أضف مهارة...' : 'Add a skill...'}
                        />
                        <button
                            onClick={addSkill}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                        >
                            {isArabic ? 'إضافة' : 'Add'}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.skills && formData.skills.length > 0 ? (
                            formData.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold flex items-center gap-2"
                                >
                                    {skill}
                                    <button
                                        onClick={() => removeSkill(index)}
                                        className="text-red-500 hover:text-red-700 ml-1"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 italic text-sm">
                                {isArabic ? 'لم تضف أي مهارات بعد' : 'No skills added yet'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* About Me & Links */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isArabic ? 'نبذة عني' : 'About Me'}
                    </label>
                    <textarea
                        value={formData.about_me || ''}
                        onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={isArabic ? 'اكتب نبذة عن نفسك...' : 'Tell us about yourself...'}
                        rows={6}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isArabic ? 'رابط LinkedIn' : 'LinkedIn URL'}
                    </label>
                    <input
                        type="url"
                        value={formData.linkedin_url || ''}
                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://linkedin.com/in/username"
                    />
                </div>
            </div>

            {/* CV Upload */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    {isArabic ? 'السيرة الذاتية (PDF)' : 'CV Upload (PDF)'}
                </h3>

                {formData.cv_file_url ? (
                    <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="flex-1">
                            <p className="font-bold text-green-700 dark:text-green-400">
                                📄 {formData.cv_file_name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500">
                                {formData.cv_file_size ? `${(formData.cv_file_size / 1024).toFixed(1)} KB` : ''}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={formData.cv_file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
                            >
                                {isArabic ? 'تحميل' : 'Download'}
                            </a>
                            <button
                                onClick={handleDeleteCV}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all"
                            >
                                {isArabic ? 'حذف' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block w-full px-6 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer text-center">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleCVUpload}
                                className="hidden"
                                disabled={uploadingCV}
                            />
                            {uploadingCV ? (
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="text-4xl mb-2">📤</div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {isArabic ? 'اضغط لرفع السيرة الذاتية' : 'Click to upload CV'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {isArabic ? 'PDF فقط، حجم أقصى 5 ميجابايت' : 'PDF only, max 5MB'}
                                    </p>
                                </>
                            )}
                        </label>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                >
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                        </span>
                    ) : (
                        isArabic ? '💾 حفظ البيانات' : '💾 Save Profile'
                    )}
                </button>
            </div>
        </motion.div>
    );
}
