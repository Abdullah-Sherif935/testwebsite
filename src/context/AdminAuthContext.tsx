import { createContext, useContext, useEffect, useState } from 'react';
import { adminSupabase } from '../services/adminSupabase';
import type { User, Session } from '@supabase/supabase-js';

interface AdminAuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check active sessions
        adminSupabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Check if user is admin (Case-insensitive & trimmed)
            const userEmail = session?.user?.email?.toLowerCase().trim();
            const userIsAdmin = userEmail === ADMIN_EMAIL && ADMIN_EMAIL !== '';
            setIsAdmin(userIsAdmin);

            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = adminSupabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Check if user is admin (Case-insensitive & trimmed)
            const userEmail = session?.user?.email?.toLowerCase().trim();
            const userIsAdmin = userEmail === ADMIN_EMAIL && ADMIN_EMAIL !== '';
            setIsAdmin(userIsAdmin);

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await adminSupabase.auth.signOut();
        setIsAdmin(false);
    };

    const value = {
        user,
        session,
        loading,
        isAdmin,
        signOut
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
