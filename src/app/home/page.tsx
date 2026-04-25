'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, PackageOpen, PackageSearch, Bell } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import Header from '@/components/Header';
import NavMenu from '@/components/NavMenu';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    const { logout } = useAuth();
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <PhoneFrame>
        <Header 
          title="BusP" 
          onMenuClick={() => setMenuOpen(true)}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        
        <div className="flex-1 p-4 overflow-y-auto pb-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Здравейте, {user?.firstName}!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Какво искате да направите?
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Bell className="w-8 h-8 text-white" />
              <h3 className="text-xl font-bold text-white">Подай сигнал</h3>
            </div>
            <p className="text-blue-100 text-center text-sm">
              Съобщете за проблем или загубена/намерена вещ
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/problem')}
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Проблем</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Съобщете за технически проблем
                </p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/lost')}
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <PackageOpen className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Изгубено</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Търсете или обявете изгубена вещ
                </p>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/found')}
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <PackageSearch className="w-6 h-6 text-green-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Намерено</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Преглед или обявяване на намерена вещ
                </p>
              </div>
            </button>
          </div>
        </div>
        
        <NavMenu 
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSettingsClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
        />
        
        {settingsOpen && (
          <SettingsModal onClose={() => setSettingsOpen(false)} />
        )}
      </PhoneFrame>
    </ProtectedRoute>
  );

  function SettingsModal({ onClose }: { onClose: () => void }) {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
      logout();
      router.push('/login');
    };

    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-800 rounded-t-3xl p-6 pb-8 space-y-4">
          <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
          
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-3 px-2"
          >
            <span className="text-slate-800 dark:text-slate-100">
              {theme === 'light' ? 'Тъмна тема' : 'Светла тема'}
            </span>
            <div className={`w-12 h-7 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
            </div>
          </button>
          
          <button
            onClick={() => { router.push('/profile'); onClose(); }}
            className="w-full flex items-center justify-between py-3 px-2"
          >
            <span className="text-slate-800 dark:text-slate-100">Редакция на профил</span>
            <span className="text-slate-400">›</span>
          </button>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full py-3 text-red-500 font-medium text-center"
            >
              Изход
            </button>
          </div>
        </div>
      </>
    );
  }
}