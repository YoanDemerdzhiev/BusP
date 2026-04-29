'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { supabase, isConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'busp_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<User | null> => {
    if (!supabase) return null;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('[Auth] Profile fetch error:', error.message);
        return null;
      }
      
      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          password: '',
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.role,
          createdAt: profile.created_at,
        };
      }
    } catch (err) {
      console.error('[Auth] Profile fetch exception:', err);
    }
    return null;
  };

  const initSupabaseAuth = async () => {
    if (!supabase) return;
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[Auth] Session error:', sessionError.message);
      }
      
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          setUser(userProfile);
        } else {
          // Profile fetch failed (e.g., RLS error) - use auth metadata as fallback
          console.warn('[Auth] Profile fetch failed, using auth metadata');
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            password: '',
            firstName: session.user.user_metadata?.first_name || '',
            lastName: session.user.user_metadata?.last_name || '',
            role: 'user',
            createdAt: session.user.created_at || new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
      }
      
      // Always set up auth listener, regardless of session state
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            setUser(userProfile);
          } else {
            // Profile fetch failed - use auth metadata as fallback
            console.warn('[Auth] Profile fetch failed in listener, using auth metadata');
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              password: '',
              firstName: session.user.user_metadata?.first_name || '',
              lastName: session.user.user_metadata?.last_name || '',
              role: 'user',
              createdAt: session.user.created_at || new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('[Auth] Supabase init error:', error);
    }
  };

  useEffect(() => {
    let subscriptionCleanup: (() => void) | undefined;
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        if (isConfigured && supabase) {
          const cleanup = await initSupabaseAuth();
          subscriptionCleanup = cleanup;
        }
      } catch (e) {
        console.error('[Auth] Supabase auth error:', e);
      } finally {
        // Only set loading to false if component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Safety timeout: ensure loading never gets stuck
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[Auth] Auth initialization timed out after 5 seconds');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (subscriptionCleanup) {
        subscriptionCleanup();
      }
    };
  }, []);

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

      if (data.user) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.user.id);
        
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          password: '',
          firstName: data.user.user_metadata?.first_name || '',
          lastName: data.user.user_metadata?.last_name || '',
          role: 'user',
          createdAt: data.user.created_at || new Date().toISOString(),
        });
        
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!isConfigured || !supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      console.log('[Register] Starting registration for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        console.error('[Register] Auth error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('[Register] Auth user created, ID:', data.user.id);
        console.log('[Register] Profile will be created by database trigger');
        
        localStorage.setItem(AUTH_TOKEN_KEY, data.user.id);
        
        setUser({
          id: data.user.id,
          email,
          password: '',
          firstName,
          lastName,
          role: 'user',
          createdAt: new Date().toISOString(),
        });
        
        return { success: true };
      }

      return { success: false, error: 'Registration failed - no user data' };
    } catch (error: any) {
      console.error('[Register] Catch error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    if (isConfigured && supabase) {
      const updateData: any = {};
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
    }

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}