import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile } from '../../services/profile';
import { submitCreatorRequest, getUserRequest, type CreatorRequest } from '../../services/verification';
import { fadeInUp } from '../../utils/animations';
import { Link } from 'react-router-dom';

export function CreatorRequestForm() {
    const { user } = useAuth();
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [request, setRequest] = useState<CreatorRequest | null>(null);
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    async function loadData() {
        if (!user) return;

        setLoading(true);
        try {
            // Check if user has filled CV profile
            const profile = await getUserProfile(user.id);
            setHasProfile(!!profile && (!!profile.full_name_ar || !!profile.full_name_en));

            // Check existing request
            const existingRequest = await getUserRequest(user.id);
            setRequest(existingRequest);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!user) return;

        setSubmitting(true);
        try {
            const profile = await getUserProfile(user.id);
            if (!profile) {
                alert(isArabic ? 'يرجى ملء بيانات السيرة الذاتية أولاً' : 'Please fill your CV profile first');
                return;
            }

            await submitCreatorRequest(user.id, profile);
            alert(isArabic ? '✅ تم إرسال طلبك بنجاح! سيتم مراجعته قريباً' : '✅ Request submitted successfully! Will be reviewed soon');
            loadData();
        } catch (err: any) {
            alert(err.message || (isArabic ? '❌ حدث خطأ' : '❌ An error occurred'));
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Show status if request exists
    if (request) {
        return (
            <motion.div
                className="max-w-2xl mx-auto p-8"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
            >
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="text-center mb-8">
                        {request.status === 'pending' && (
                            <>
                                <div className="text-6xl mb-4">⏳</div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {isArabic ? 'طلبك قيد المراجعة' : 'Request Pending Review'}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {isArabic
                                        ? 'سيتم مراجعة طلبك من قبل الإدارة قريباً'
                                        : 'Your request will be reviewed by admin soon'}
                                </p>
                            </>
                        )}

                        {request.status === 'approved' && (
                            <>
                                <div className="text-6xl mb-4">✅</div>
                                <h2 className="text-2xl font-bold text-green-600 mb-2">
                                    {isArabic ? 'تم قبول طلبك!' : 'Request Approved!'}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {isArabic
                                        ? 'يمكنك الآن البدء في نشر المقالات والمشاريع'
                                        : 'You can now start publishing articles and projects'}
                                </p>
                            </>
                        )}

                        {request.status === 'rejected' && (
                            <>
                                <div className="text-6xl mb-4">❌</div>
                                <h2 className="text-2xl font-bold text-red-600 mb-2">
                                    {isArabic ? 'تم رفض الطلب' : 'Request Rejected'}
                                </h2>
                                {request.admin_note && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                        <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                                            {isArabic ? 'ملاحظة الإدارة:' : 'Admin Note:'}
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-500">
                                            {request.admin_note}
                                        </p>
                                    </div>
                                )}
                                <p className="text-slate-600 dark:text-slate-400 mt-4">
                                    {isArabic
                                        ? 'يمكنك تحديث بياناتك وإعادة تقديم الطلب'
                                        : 'You can update your information and resubmit'}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="text-center space-y-3">
                        <div className="text-sm text-slate-500">
                            {isArabic ? 'تاريخ التقديم:' : 'Submitted:'} {new Date(request.created_at!).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                        </div>
                        {request.reviewed_at && (
                            <div className="text-sm text-slate-500">
                                {isArabic ? 'تاريخ المراجعة:' : 'Reviewed:'} {new Date(request.reviewed_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                            </div>
                        )}
                    </div>

                    {request.status === 'rejected' && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {isArabic ? 'جاري الإرسال...' : 'Submitting...'}
                                    </span>
                                ) : (
                                    isArabic ? '📮 إعادة تقديم الطلب' : '📮 Submit Again'
                                )}
                            </button>
                            <Link
                                to="/profile"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-bold"
                            >
                                {isArabic ? 'تعديل السيرة الذاتية' : 'Edit CV Profile'}
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    // Show submission form if no request
    return (
        <motion.div
            className="max-w-2xl mx-auto p-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
        >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">✍️</div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {isArabic ? 'طلب صلاحية النشر' : 'Request Publishing Permission'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        {isArabic
                            ? 'للبدء في نشر المقالات والمشاريع، يرجى تقديم طلب للحصول على الصلاحية'
                            : 'To start publishing articles and projects, please submit a request for permission'}
                    </p>
                </div>

                {!hasProfile ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-bold text-amber-700 dark:text-amber-400 mb-2">
                                    {isArabic ? 'يرجى ملء السيرة الذاتية أولاً' : 'Please Complete Your CV First'}
                                </p>
                                <p className="text-sm text-amber-600 dark:text-amber-500 mb-4">
                                    {isArabic
                                        ? 'يجب ملء بيانات السيرة الذاتية قبل تقديم طلب الصلاحية'
                                        : 'You need to complete your CV profile before submitting a request'}
                                </p>
                                <Link
                                    to="/profile"
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-all inline-block"
                                >
                                    {isArabic ? 'املأ السيرة الذاتية' : 'Complete CV'}
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                            <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-3">
                                {isArabic ? 'متطلبات الطلب:' : 'Requirements:'}
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-500">
                                <li className="flex items-start gap-2">
                                    <span>✅</span>
                                    <span>{isArabic ? 'سيرة ذاتية مكتملة' : 'Completed CV profile'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>⏱️</span>
                                    <span>{isArabic ? 'وقت المراجعة: 1-3 أيام عمل' : 'Review time: 1-3 business days'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>📧</span>
                                    <span>{isArabic ? 'سيتم إخطارك بالنتيجة' : 'You will be notified of the result'}</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {isArabic ? 'جاري الإرسال...' : 'Submitting...'}
                                </span>
                            ) : (
                                isArabic ? '📮 تقديم الطلب' : '📮 Submit Request'
                            )}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
}
