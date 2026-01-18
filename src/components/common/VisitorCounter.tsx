import { useEffect, useState } from 'react';
import { logVisit, getTotalViews } from '../../services/stats';

export function VisitorCounter() {
    const [views, setViews] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initCounter = async () => {
            try {
                const hasCounted = sessionStorage.getItem('visit_counted');

                // Increment logic: Log visit if new session
                if (!hasCounted) {
                    await logVisit(window.location.pathname);
                    sessionStorage.setItem('visit_counted', 'true');
                }

                // Fetch total views using lightweight function
                const totalViews = await getTotalViews();
                setViews(totalViews);
            } catch (error) {
                console.error('VisitorCounter error:', error);
                // Keep views at 0 on error
            } finally {
                setIsLoading(false);
            }
        };

        initCounter();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse"></span>
                    Loading...
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Visitors
            </span>
            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                {views.toLocaleString()}
            </span>
        </div>
    );
}
