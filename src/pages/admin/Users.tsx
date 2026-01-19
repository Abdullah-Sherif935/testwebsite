import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
}

export function AdminUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('email', { ascending: true });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }

    const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Registered Users</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">View and manage your community members</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Joined</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-6">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        {searchQuery ? 'No users matching your search.' : 'No users registered yet.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center overflow-hidden shrink-0">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg">👤</span>
                                                    )}
                                                </div>
                                                <div className="font-bold text-slate-900 dark:text-white truncate">
                                                    {user.full_name || 'Anonymous User'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600 dark:text-slate-400 text-sm">{user.email || 'No email synced'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notification/Export Placeholder */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-2xl">📧</span>
                    <div>
                        <h4 className="font-bold text-blue-900 dark:text-blue-300">Ready for Marketing?</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400/80">You can now view and export these emails for your future newsletters.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const csv = users.map(u => `${u.full_name},${u.email}`).join('\n');
                        const blob = new Blob([`Name,Email\n${csv}`], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'website_users.csv';
                        a.click();
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-sm whitespace-nowrap"
                >
                    Export Emails (.CSV)
                </button>
            </div>
        </div>
    );
}
