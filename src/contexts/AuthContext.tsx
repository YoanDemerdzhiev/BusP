'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { supabase, isConfigured } from '@/lib/supabase';
import { verifyUser as localVerifyUser, createUser as localCreateUser, getUserById as localGetUserById } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

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

  useEffect(() => {
    const initAuth = async () => {
      if (isConfigured && supabase) {
        try {
          await initSupabaseAuth();
        } catch (e) {
          console.error('Supabase auth error:', e);
        }
      }
      initLocalAuth();
      setIsLoading(false);
    };

    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    initAuth();

    return () => clearTimeout(timeoutId);
  }, []);

  const initLocalAuth = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      const userData = localGetUserById(token);
      if (userData) {
        setUser(userData);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  };

  const fetchProfile = async (userId: string): Promise<User | null> => {
    if (!supabase) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
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
    return null;
  };

  const initSupabaseAuth = async () => {
    if (!supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          setUser(userProfile);
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const userProfile = await fetchProfile(session.user.id);
            if (userProfile) {
              setUser(userProfile);
            }
          } else {
            setUser(null);
          }
        });

        return () => subscription.unsubscribe();
      }
    } catch (error) {
      console.error('Auth init error:', error);
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
    } else {
      const foundUser = localVerifyUser(email, password);
      if (!foundUser) {
        return { success: false, error: 'Невалиден имейл или парола' };
      }
      localStorage.setItem(AUTH_TOKEN_KEY, foundUser.id);
      setUser(foundUser);
      return { success: true };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    if (isConfigured && supabase) {
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
    } else {
      const existingUser = localGetUserById(email);
      if (existingUser) {
        return { success: false, error: 'Този имейл вече е регистриран' };
      }

      const newUser: User = {
        id: uuidv4(),
        email,
        password,
        firstName,
        lastName,
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      localCreateUser(newUser);
      localStorage.setItem(AUTH_TOKEN_KEY, newUser.id);
      setUser(newUser);
      return { success: true };
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