'use client';

import { useRouter } from 'next/navigation';
import { Moon, Sun, LogOut } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <PhoneFrame>
        <Header title="Настройки" showBack />
        
        <div className="p-4 space-y-4">
          <div className="bg-white dark:bg-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-400" />
                )}
                <span className="text-slate-800 dark:text-slate-100">
                  {theme === 'light' ? 'Смяна на тъмна тема' : 'Смяна на светла тема'}
                </span>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
              </div>
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => router.push('/profile')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <span className="text-slate-800 dark:text-slate-100">Редакция на профил</span>
              <span className="text-slate-400">›</span>
            </button>
          </div>
          
          <div className="pt-8">
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Изход
            </button>
          </div>
        </div>
      </PhoneFrame>
    </ProtectedRoute>
  );
}