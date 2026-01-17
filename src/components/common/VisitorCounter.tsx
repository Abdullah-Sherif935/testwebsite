import { useEffect, useState } from 'react';
import { logVisit, getDashboardStats } from '../../services/stats';

export function VisitorCounter() {
    const [views, setViews] = useState<number | null>(null);

    useEffect(() => {
        const initCounter = async () => {
            const hasCounted = sessionStorage.getItem('visit_counted');

            // Increment logic: Log visit if new session
            if (!hasCounted) {
                await logVisit(window.location.pathname);
                sessionStorage.setItem('visit_counted', 'true');
            }

            // Always fetch total for display
            // We can optimize this by creating a lightweight RPC later if needed
            // For now, let's just get the dashboard stats lightly or create a specific function
            // To keep it fast, we will assume getDashboardStats is overkill for just footer.
            // But reuse is cleaner for now.
            const stats = await getDashboardStats(1); // minimal check
            if (stats) setViews(stats.totalViews);
        };

        initCounter();
    }, []);

    if (views === null) return null;

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
