'use client';

import { Menu, Settings, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
  showMenu?: boolean;
  showSettings?: boolean;
}

export default function Header({ 
  title, 
  showBack,
  onBackClick,
  onMenuClick, 
  onSettingsClick,
  showMenu = true,
  showSettings = true 
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
      <div className="w-10">
        {showBack ? (
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
          </button>
        ) : showMenu && onMenuClick ? (
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
          </button>
        ) : null}
      </div>
      
      <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate px-2">
        {title}
      </h1>
      
      <div className="w-10 flex justify-end">
        {showSettings && onSettingsClick && (
          <button 
            onClick={onSettingsClick}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Settings className="w-6 h-6 text-slate-700 dark:text-slate-200" />
          </button>
        )}
      </div>
    </div>
  );
}