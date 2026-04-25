'use client';

import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] min-h-[90vh] sm:min-h-[85vh] bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl overflow-hidden relative border-[8px] border-slate-800 dark:border-slate-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 dark:bg-slate-700 rounded-b-2xl z-10" />
        <div className="min-h-[90vh] flex flex-col pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}