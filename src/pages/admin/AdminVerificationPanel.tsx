import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
    getAllPendingRequests,
    getAllVerifiedUsers,
    approveCreatorRequest,
    rejectCreatorRequest,
    revokeVerification,
} from '../../services/verification';
import { fadeInUp, pageTransition } from '../../utils/animations';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';

export function AdminVerificationPanel() {
    const { user } = useAdminAuth();
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');

    const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');
    const [loading, setLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [verifiedUsers, setVerifiedUsers] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // Load both pending requests and verified users at once
            const [pendingData, verifiedData] = await Promise.all([
                getAllPendingRequests(),
                getAllVerifiedUsers()
            ]);
            setPendingRequests(pendingData);
            setVerifiedUsers(verifiedData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(requestId: string) {
        if (!user || !window.confirm(isArabic ? 'هل تريد الموافقة على هذا الطلب؟' : 'Approve this request?')) return;

        setProcessing(true);
        try {
            // Find the request to get user_id
            const request = pendingRequests.find(r => r.id === requestId);

            await approveCreatorRequest(requestId, user.id, adminNote || 'Approved');

            // Update cache for the approved user
            if (request?.user_id) {
                localStorage.setItem(`verified_${request.user_id}`, 'true');
            }

            alert(isArabic ? '✅ تمت الموافقة' : '✅ Approved');
            setAdminNote('');
            setSelectedRequest(null);
            loadData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    }

    async function handleReject(requestId: string) {
        if (!adminNote.trim()) {
            alert(isArabic ? 'يرجى كتابة سبب الرفض' : 'Please provide a rejection reason');
            return;
        }
        if (!user || !window.confirm(isArabic ? 'هل تريد رفض هذا الطلب؟' : 'Reject this request?')) return;

        setProcessing(true);
        try {
            await rejectCreatorRequest(requestId, user.id, adminNote);
            alert(isArabic ? '❌ تم الرفض' : '❌ Rejected');
            setAdminNote('');
            setSelectedRequest(null);
            loadData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessing(false);
        }
    }

    async function handleRevoke(userId: string, userName: string) {
        if (!window.confirm(isArabic ? `هل تريد إلغاء توثيق "${userName}"؟` : `Revoke verification for "${userName}"?`)) return;

        try {
            await revokeVerification(userId);
            // Clear cache for this user
            localStorage.removeItem(`verified_${userId}`);
            localStorage.removeItem(`profile_${userId}`);
            alert(isArabic ? '🔒 تم إلغاء التوثيق' : '🔒 Verification revoked');
            loadData();
        } catch (err: any) {
            console.error('Revoke error:', err);
            alert(err.message || (isArabic ? 'حدث خطأ' : 'An error occurred'));
        }
    }

    return (
        <motion.div
            className="p-6"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Helmet>
                <title>{isArabic ? 'التحقق من الكتّاب' : 'Content Creator Verification'}</title>
            </Helmet>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {isArabic ? 'التحقق من الكتّاب' : 'Content Creator Verification'}
                </h1>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                    <button
                        onClick={() => { setActiveTab('pending'); setSelectedRequest(null); }}
                        className={`px-6 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'pending'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {isArabic ? `الطلبات المعلقة (${pendingRequests.length})` : `Pending Requests (${pendingRequests.length})`}
                    </button>
                    <button
                        onClick={() => { setActiveTab('verified'); setSelectedRequest(null); }}
                        className={`px-6 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'verified'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        {isArabic ? `المستخدمون الموثقون (${verifiedUsers.length})` : `Verified Users (${verifiedUsers.length})`}
                    </button>
                </div>
            </div>

            {activeTab === 'pending' ? (
                loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Requests List */}
                        <div className="space-y-4">
                            {pendingRequests.length === 0 ? (
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                    <span className="text-4xl mb-4 block">📭</span>
                                    <p className="text-slate-500 font-bold">{isArabic ? 'لا توجد طلبات معلقة' : 'No pending requests'}</p>
                                </div>
                            ) : (
                                pendingRequests.map((req) => (
                                    <motion.button
                                        key={req.id}
                                        onClick={() => { setSelectedRequest(req); setAdminNote(''); }}
                                        className={`w-full text-start p-6 rounded-2xl border transition-all ${selectedRequest?.id === req.id
                                            ? 'bg-blue-600 border-blue-600 shadow-lg'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
                                        variants={fadeInUp}
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                {req.profile_data?.avatar_url ? (
                                                    <img src={req.profile_data.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="w-full h-full flex items-center justify-center text-xl">👤</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-bold text-base ${selectedRequest?.id === req.id ? 'text-white' : 'text-slate-900 dark:text-white'} truncate max-w-[150px] sm:max-w-[250px]`}>
                                                    {req.profile_data?.full_name_ar || req.profile_data?.full_name_en || 'No Name'}
                                                </p>
                                                <p className={`text-[10px] ${selectedRequest?.id === req.id ? 'text-blue-100' : 'text-slate-500'} truncate max-w-[150px] sm:max-w-[250px]`}>
                                                    {req.profile_data?.email || 'No email'} • ID: {req.user_id?.substring(0, 8)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(req.created_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>

                        {/* Review Panel */}
                        <div className="lg:sticky lg:top-6 h-fit">
                            {selectedRequest ? (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
                                    <h2 className="text-xl font-bold mb-4">{isArabic ? 'تفاصيل الطلب' : 'Request Details'}</h2>

                                    {/* Profile Data */}
                                    {selectedRequest.profile_data && (
                                        <div className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl max-h-[400px] overflow-y-auto">
                                            {selectedRequest.profile_data.full_name_ar && (
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500">الاسم (عربي)</label>
                                                    <p className="text-sm">{selectedRequest.profile_data.full_name_ar}</p>
                                                </div>
                                            )}
                                            {selectedRequest.profile_data.full_name_en && (
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500">Name (English)</label>
                                                    <p className="text-sm">{selectedRequest.profile_data.full_name_en}</p>
                                                </div>
                                            )}
                                            {selectedRequest.profile_data.university && (
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500">{isArabic ? 'الجامعة' : 'University'}</label>
                                                    <p className="text-sm">{selectedRequest.profile_data.university}</p>
                                                </div>
                                            )}
                                            {selectedRequest.profile_data.about_me && (
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500">{isArabic ? 'نبذة' : 'About'}</label>
                                                    <p className="text-sm">{selectedRequest.profile_data.about_me}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Admin Note */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-bold mb-2">
                                            {isArabic ? 'ملاحظة (اختياري للموافقة، إلزامي للرفض)' : 'Note (optional for approval, required for rejection)'}
                                        </label>
                                        <textarea
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm"
                                            placeholder={isArabic ? 'اكتب ملاحظة...' : 'Write a note...'}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleReject(selectedRequest.id)}
                                            disabled={processing}
                                            className="py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 text-sm"
                                        >
                                            {isArabic ? 'رفض' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedRequest.id)}
                                            disabled={processing}
                                            className="py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 text-sm"
                                        >
                                            {isArabic ? 'موافقة' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden lg:flex flex-col items-center justify-center h-[500px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                                    <span className="text-6xl mb-4">👈</span>
                                    <p className="text-slate-500 font-bold">{isArabic ? 'اختر طلباً للمراجعة' : 'Select a request to review'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            ) : (
                /* Verified Users List */
                <div className="grid gap-4">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : verifiedUsers.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                            <span className="text-4xl mb-4 block">👥</span>
                            <p className="text-slate-500 font-bold">{isArabic ? 'لا يوجد مستخدمون موثقون' : 'No verified users'}</p>
                        </div>
                    ) : (
                        verifiedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">👤</span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1">
                                            <VerifiedBadge size="sm" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                                                {user.full_name_ar || user.full_name_en || 'No Name'}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{user.email || 'No email'}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {isArabic ? 'تم التوثيق:' : 'Verified:'} {user.verification_date ? new Date(user.verification_date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevoke(user.user_id, user.full_name_ar || user.full_name_en || 'User')}
                                    className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all text-center"
                                >
                                    {isArabic ? '🔒 إلغاء التوثيق' : '🔒 Revoke'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </motion.div>
    );
}
