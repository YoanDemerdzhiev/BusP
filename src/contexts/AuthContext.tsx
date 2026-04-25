'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { verifyUser, createUser, getUserById } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (email: string, password: string, firstName: string, lastName: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'busp_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      const userData = getUserById(token);
      if (userData) {
        setUser(userData);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const foundUser = verifyUser(email, password);
    if (!foundUser) {
      return { success: false, error: 'Невалиден имейл или парола' };
    }
    localStorage.setItem(AUTH_TOKEN_KEY, foundUser.id);
    setUser(foundUser);
    return { success: true };
  };

  const register = (email: string, password: string, firstName: string, lastName: string) => {
    const existingUser = getUserById(email);
    if (existingUser) {
      return { success: false, error: 'Този имейл вече е регистриран' };
    }
    
    const newUser: User = {
      id: uuidv4(),
      email,
      password,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    };
    
    createUser(newUser);
    localStorage.setItem(AUTH_TOKEN_KEY, newUser.id);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
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