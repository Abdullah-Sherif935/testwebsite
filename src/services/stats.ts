import { supabase } from './supabase';

export interface DailyStat {
    date: string;
    count: number;
}

export interface DeviceStat {
    device_type: string;
    count: number;
}

export interface PageStat {
    path: string;
    count: number;
}

export interface VisitLog {
    id: string;
    created_at: string;
    path: string;
    user_agent: string | null;
}

export async function getDashboardStats(days = 30) {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Previous Period (for trend calculation)
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);

        // 1. Graph Data
        const { data: graphData } = await supabase.rpc('get_daily_stats', {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        });

        // 2. Counts
        const { count: currentPeriodCount } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate.toISOString());

        const { count: prevPeriodCount } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', prevStartDate.toISOString())
            .lt('created_at', startDate.toISOString());

        // 3. Device Stats
        const { data: deviceData } = await supabase.rpc('get_device_stats');

        // 4. Top Pages
        const { data: topPages } = await supabase.rpc('get_top_pages', { limit_count: 5 });

        // 5. Today's Views
        const todayStart = new Date().toISOString().split('T')[0];
        const { count: todayCount } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart);

        // 6. Recent Logs
        const { data: logs } = await supabase
            .from('page_views')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        // Calculate Trend
        const current = currentPeriodCount || 0;
        const previous = prevPeriodCount || 0;
        const growth = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);

        return {
            graphData: graphData || [],
            totalViews: current,
            todayViews: todayCount || 0,
            growth,
            deviceStats: deviceData || [],
            topPages: topPages || [],
            recentLogs: (logs as VisitLog[]) || []
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
}

// Keep logging function
export async function logVisit(path: string) {
    try {
        await supabase.from('page_views').insert({
            path,
            user_agent: navigator.userAgent
        });
    } catch (error) {
        console.error('Error logging visit:', error);
    }
}

// Lightweight function for footer - just get total count
export async function getTotalViews(): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('page_views')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error getting total views:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Error in getTotalViews:', error);
        return 0;
    }
}
