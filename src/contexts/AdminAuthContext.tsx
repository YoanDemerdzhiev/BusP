'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isConfigured } from '@/lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!isConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        setIsLoading(false);
        return;
      }

      const token = session.access_token;
      const response = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        console.warn('[AdminAuth] Admin profile not found, signing out');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setAdmin({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });
    } catch (e) {
      console.error('Admin auth check error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Login failed' };
      }

      const token = data.session.access_token;
      const response = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        await supabase.auth.signOut();
        return { success: false, error: 'Access denied. Admin role required.' };
      }

      const profileData = await response.json();
      setAdmin({
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: profileData.role,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAdmin(null);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
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