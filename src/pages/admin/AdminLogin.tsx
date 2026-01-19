import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminSupabase } from '../../services/adminSupabase';
import { motion } from 'framer-motion';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/admin';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await adminSupabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20"
                        >
                            <span className="text-5xl">🔐</span>
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
                        <p className="text-cyan-100 text-sm">Authorized Access Only</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3"
                            >
                                <span className="text-xl">⚠️</span>
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Password
                                </label>
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-400 disabled:to-cyan-400 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔓</span>
                                        <span>Login to Dashboard</span>
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Info Footer */}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                                <span>🛡️</span>
                                <span>Secure admin access - Credentials required</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back to Home Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center"
                >
                    <a
                        href="/"
                        className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>Back to Homepage</span>
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
}
