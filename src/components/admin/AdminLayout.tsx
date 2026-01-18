import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const { signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const navItems = [
        { label: 'Analytics', path: '/admin/dashboard', icon: '📊' },
        { label: 'Messages', path: '/admin/messages', icon: '📩' },
        { label: 'Articles', path: '/admin/articles', icon: '📝' },
        { label: 'Projects', path: '/admin/projects', icon: '🚀' },
        { label: 'Videos', path: '/admin/videos', icon: '🎥' },
        { label: 'Resources', path: '/admin/resources', icon: '📁' },
        { label: 'Profile', path: '/admin/profile', icon: '👤' },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans rtl:font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-blue-600">🛡️</span> Control Panel
                </h1>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 
                flex-col fixed inset-y-0 z-50 transition-all duration-300
                ${sidebarOpen ? 'flex' : 'hidden'} lg:flex
            `}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-blue-600">🛡️</span> Control Panel
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.startsWith(item.path)
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span>{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors font-medium"
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                    <Link
                        to="/"
                        className="flex items-center gap-3 w-full px-4 py-3 mt-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                    >
                        <span>🌐</span>
                        <span>View Website</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ms-64 pt-16 lg:pt-0 min-w-0 overflow-hidden">
                <div className="p-4 md:p-6 lg:p-8 max-w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
