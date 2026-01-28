import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function PWAInstallPrompt() {
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
        if (isStandalone) return;

        // Listen for install prompt logic
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, simple time-delayed prompt if not in standalone
        if (isIosDevice && !isStandalone) {
            // Maybe show it after a few seconds?
            // For now, let's only rely on explicit trigger or immediate if preferred.
            // User requested "Whenever I open site, it shows install option".
            setShowPrompt(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            // Show iOS instructions (Tooltip or Modal)
            alert(isArabic
                ? "للتثبيت على iPhone: اضغط على زر المشاركة ⎋ ثم اختر 'إضافة إلى الشاشة الرئيسية' ➕"
                : "To install on iPhone: Tap Share ⎋ then 'Add to Home Screen' ➕");
            return;
        }

        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
            >
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 max-w-md w-full flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20">
                            A
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                {isArabic ? 'تثبيت التطبيق' : 'Install App'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isArabic
                                    ? 'احصل على تجربة أفضل وتصفح أسرع'
                                    : 'Get a better experience and faster browsing'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            ✕
                        </button>
                        <button
                            onClick={handleInstallClick}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            {isArabic ? 'تثبيت' : 'Install'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
