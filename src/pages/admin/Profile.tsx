import { useState, useEffect } from 'react';
import { getCVUrl, updateCV, deleteCV } from '../../services/profile';

export function AdminProfile() {
    const [currentCvUrl, setCurrentCvUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadCV();
    }, []);

    async function loadCV() {
        const url = await getCVUrl();
        if (url) setCurrentCvUrl(url);
    }

    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (!currentCvUrl) return;

        // If not yet confirmed, switch state to confirmation mode
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            // Auto-reset confirmation after 3 seconds
            setTimeout(() => setDeleteConfirm(false), 3000);
            return;
        }

        setUploading(true);
        try {
            await deleteCV(currentCvUrl);
            setCurrentCvUrl(null);
            setDeleteConfirm(false);
            setMessage({ type: 'success', text: 'CV deleted successfully' });
        } catch (error: any) {
            console.error('Delete error:', error);
            const errorMessage = error?.message || 'Failed to delete CV';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setMessage({ type: 'error', text: 'Please upload a PDF file.' });
            return;
        }

        setUploading(true);
        setMessage(null);

        try {
            const newUrl = await updateCV(file);
            setCurrentCvUrl(newUrl);
            setMessage({ type: 'success', text: 'CV uploaded successfully!' });
        } catch (error: any) {
            console.error(error);
            const errorMessage = error?.message || 'Failed to upload CV. Please try again.';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Management</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Update your personal information and documents</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
                <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    📄 Resume / CV
                </h2>

                <div className="space-y-6">
                    {currentCvUrl && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📑</span>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">Current CV</div>
                                    <div className="text-xs text-slate-500">Available for download</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={currentCvUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                                >
                                    View / Download
                                </a>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={uploading}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${deleteConfirm
                                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-md animate-pulse'
                                            : 'bg-white dark:bg-slate-800 text-red-600 hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900'
                                        }`}
                                >
                                    {uploading ? 'Deleting...' : (deleteConfirm ? 'Confirm Delete?' : 'Delete')}
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                            Upload New CV (PDF)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="block w-full text-sm text-slate-500
                                    file:mr-4 file:py-2.5 file:px-4
                                    file:rounded-xl file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                "
                            />
                            {uploading && (
                                <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
