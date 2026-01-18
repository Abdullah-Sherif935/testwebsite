import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDashboardStats } from '../../services/stats';
import type { DailyStat, DeviceStat, PageStat, VisitLog } from '../../services/stats';

// Icons
const TrendUp = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
const TrendDown = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
);

export function Dashboard() {
    const [stats, setStats] = useState<{
        graphData: DailyStat[];
        totalViews: number;
        todayViews: number;
        growth: number;
        deviceStats: DeviceStat[];
        topPages: PageStat[];
        recentLogs: VisitLog[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterDays, setFilterDays] = useState(30);

    const COLORS = ['#8B5CF6', '#F472B6', '#3B82F6', '#10B981'];

    useEffect(() => {
        loadStats();
    }, [filterDays]);

    async function loadStats() {
        setLoading(true);
        const data = await getDashboardStats(filterDays);
        if (data) setStats(data);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!stats) return <div className="p-8 text-center">Failed to load analytics.</div>;

    const isPositive = stats.growth >= 0;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your website performance and insights</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setFilterDays(days)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filterDays === days
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Last {days} days
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Views Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-2xl">
                            <span className="text-2xl">👁️</span>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isPositive ? <TrendUp /> : <TrendDown />}
                            {Math.abs(stats.growth)}%
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {stats.totalViews.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Total Page Views
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        vs. previous {filterDays} days
                    </div>
                </div>

                {/* Live Today's Visits */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                            <span className="text-2xl">🔥</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-600 animate-pulse">
                            Live
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        {stats.todayViews.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Today's Visitors
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Updated in real-time
                    </div>
                </div>
            </div>

            {/* Split Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Graph (2 Cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)]">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Performance Trends</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.graphData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    tickFormatter={(str) => {
                                        const d = new Date(str);
                                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                    }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8B5CF6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart (1 Col) */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] flex flex-col items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 w-full text-left">Device Breakdown</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.deviceStats as any}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="device_type"
                                >
                                    {stats.deviceStats.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center text-sm text-slate-500 w-full">
                        Split based on user agent
                    </div>
                </div>
            </div>

            {/* Top Pages Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Most Visited Pages</h3>
                </div>
                <div className="w-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Path</th>
                                <th className="px-6 py-4 font-semibold text-right">Views</th>
                                <th className="px-6 py-4 font-semibold text-right sm:table-cell">Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {stats.topPages.map((page, idx) => (
                                <tr key={page.path} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="shrink-0 w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 break-all text-xs sm:text-sm">
                                                {page.path}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                        {page.count.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 text-[10px] sm:text-xs">
                                        {Math.round((page.count / Math.max(stats.totalViews, 1)) * 100)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                </div>
                <div className="w-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Info</th>
                                <th className="px-6 py-4 font-semibold text-right">Device Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {stats.recentLogs.map((log) => (
                                <tr key={log.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase">
                                                    {log.path}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="text-[9px] text-slate-400">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{log.user_agent?.includes('Mobile') ? '📱' : '💻'}</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                                    {log.user_agent?.includes('Windows') ? 'Windows' :
                                                        log.user_agent?.includes('Android') ? 'Android' :
                                                            log.user_agent?.includes('iPhone') ? 'iPhone' :
                                                                log.user_agent?.includes('Macintosh') ? 'Mac' : 'Other'}
                                                </span>
                                            </div>
                                            <div className="text-[9px] text-slate-400 max-w-[120px] sm:max-w-[250px] break-words line-clamp-2" title={log.user_agent || ''}>
                                                {log.user_agent}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
