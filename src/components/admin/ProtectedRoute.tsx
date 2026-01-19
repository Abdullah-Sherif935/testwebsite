import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, loading } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Not logged in at all
    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Logged in but not admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
                <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center">
                    <div className="w-16 h-16 bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⛔</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400 mb-6">
                        You don't have permission to access the admin panel.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
