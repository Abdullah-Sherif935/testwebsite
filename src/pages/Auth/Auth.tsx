import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';

export function Auth() {
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (authError) throw authError;
            } else {
                const { error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (authError) throw authError;

                alert(isArabic ? 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتنشيط الحساب.' : 'Account created! Please check your email to activate it.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans selection:bg-blue-500/30">
            <Helmet>
                <title>{isLogin ? (isArabic ? 'تسجيل الدخول' : 'Login') : (isArabic ? 'إنشاء حساب' : 'Sign Up')}</title>
            </Helmet>

            {/* Premium Mesh Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/5 blur-[100px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px] z-10 px-6"
            >
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-white/10"
                    >
                        <span className="text-black text-2xl font-black">R</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isLogin ? (isArabic ? 'تسجيل الدخول' : 'Welcome back') : (isArabic ? 'إنشاء حساب جديد' : 'Create an Account')}
                    </h1>
                    <p className="text-slate-500 text-sm flex gap-1.5 items-center">
                        {isLogin ? (isArabic ? 'ليس لديك حساب؟' : 'New here?') : (isArabic ? 'لديك حساب بالفعل؟' : 'Already have an account?')}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white hover:underline focus:outline-none transition-all font-medium"
                        >
                            {isLogin ? (isArabic ? 'سجل الآن' : 'Sign up') : (isArabic ? 'سجل دخولك' : 'Log in')}
                        </button>
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Social Logins */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-3 py-3.5 px-4 bg-[#111] hover:bg-[#181818] border border-white/5 rounded-xl text-white text-sm font-semibold transition-all hover:border-white/10 active:scale-[0.98] w-full"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.67-.35-1.38-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>{isArabic ? 'تسجيل الدخول بواسطة جوجل' : 'Continue with Google'}</span>
                        </button>
                    </div>

                    <div className="relative flex items-center justify-center py-2">
                        <div className="w-full h-[1px] bg-white/5"></div>
                        <span className="absolute px-4 bg-[#050505] text-[10px] uppercase tracking-widest text-slate-600 font-bold">
                            {isArabic ? 'أو' : 'or'}
                        </span>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold ml-1">
                                    {isArabic ? 'الاسم' : 'Name'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white text-sm focus:border-white/20 focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-slate-700"
                                    placeholder={isArabic ? 'عبدالله شريف' : 'John Doe'}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold ml-1">
                                {isArabic ? 'البريد الإلكتروني' : 'Email'}
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white text-sm focus:border-white/20 focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-slate-700"
                                placeholder="name@email.com"
                            />
                        </div>

                        <div className="space-y-2 text-start">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                                    {isArabic ? 'كلمة المرور' : 'Password'}
                                </label>
                                {isLogin && (
                                    <button className="text-[10px] text-slate-500 hover:text-white transition-all font-bold uppercase tracking-wider">
                                        {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot?'}
                                    </button>
                                )}
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white text-sm focus:border-white/20 focus:ring-4 focus:ring-white/5 outline-none transition-all placeholder:text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-white hover:bg-slate-200 disabled:bg-slate-500 text-black rounded-xl font-bold text-sm shadow-xl shadow-white/5 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                isLogin ? (isArabic ? 'دخول' : 'Sign In') : (isArabic ? 'إنشاء حساب' : 'Create Account')
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest leading-loose">
                        {isArabic ? (
                            <>بإنشاء حساب، أنت توافق على <a href="#" className="underline">الشروط</a> و <a href="#" className="underline">الخصوصية</a></>
                        ) : (
                            <>By signing up, you agree to our <a href="#" className="underline">Terms</a>, <a href="#" className="underline">Acceptable Use</a>, and <a href="#" className="underline">Privacy Policy</a>.</>
                        )}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
