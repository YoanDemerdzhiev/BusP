'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BUS_LINES_PLOVDIV } from '@/lib/types';

export default function FoundLineSelectPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredLines = BUS_LINES_PLOVDIV.filter(line => 
    line.line.includes(searchQuery) || 
    line.route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <PhoneFrame>
        <Header 
          title="Избери линия" 
          showBack 
        />
        
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Търси линия..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredLines.map((line) => (
              <button
                key={line.line}
                onClick={() => router.push(`/found/report?line=${line.line}`)}
                className="w-full flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-slate-600 transition-all"
              >
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{line.line}</span>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    Автобус {line.line}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {line.route}
                  </p>
                </div>
              </button>
            ))}
            
            {filteredLines.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p>Няма намерени линии</p>
              </div>
            )}
          </div>
        </div>
      </PhoneFrame>
    </ProtectedRoute>
  );
}