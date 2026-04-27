'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isConfigured } from '@/lib/supabase';
import { loginAdmin as localLoginAdmin, getAdminToken, clearAdminToken } from '@/lib/admin-api';

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

const ADMIN_TOKEN_KEY = 'busp_admin_token';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (isConfigured && supabase) {
        await checkSupabaseAdminAuth();
      } else {
        checkLocalAdminAuth();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const checkLocalAdminAuth = () => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    
    if (!token) {
      return;
    }

    try {
      const decoded = atob(token);
      const [id, email, role] = decoded.split(':');
      
      if (role === 'admin') {
        setAdmin({
          id,
          email,
          firstName: 'Admin',
          lastName: 'User',
          role,
        });
      }
    } catch (e) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  };

  const checkSupabaseAdminAuth = async () => {
    if (!supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile && profile.role === 'admin') {
        setAdmin({
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
        });
      }
    } catch (error) {
      console.error('Admin auth check error:', error);
    }
  };

  const login = async (email: string, password: string) => {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (!data.user) {
          return { success: false, error: 'Login failed' };
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          await supabase.auth.signOut();
          return { success: false, error: 'Access denied. Admin role required.' };
        }

        setAdmin({
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
        });

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message || 'Login failed' };
      }
    } else {
      try {
        const result = await localLoginAdmin(email, password);
        if (!result.success) {
          return { success: false, error: 'Invalid credentials' };
        }
        
        setAdmin({
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
        });
        
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message || 'Login failed' };
      }
    }
  };

  const logout = async () => {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(ADMIN_TOKEN_KEY);
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