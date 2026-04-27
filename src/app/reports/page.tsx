'use client';

import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, PackageOpen, PackageSearch, Clock } from 'lucide-react';
import PhoneFrame from '@/components/PhoneFrame';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getProblemsByUserId, getLostItemsByUserId, getFoundItemsByUserId } from '@/lib/db-supabase';
import { Problem, LostItem, FoundItem } from '@/lib/types';

type TabType = 'all' | 'problems' | 'lost' | 'found';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function loadReports() {
      if (user) {
        const [problemsData, lostData, foundData] = await Promise.all([
          getProblemsByUserId(user.id),
          getLostItemsByUserId(user.id),
          getFoundItemsByUserId(user.id)
        ]);
        setProblems(problemsData);
        setLostItems(lostData);
        setFoundItems(foundData);
      }
    }
    loadReports();
  }, [user]);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'Всички', count: problems.length + lostItems.length + foundItems.length },
    { key: 'problems', label: 'Проблеми', count: problems.length },
    { key: 'lost', label: 'Изгубени', count: lostItems.length },
    { key: 'found', label: 'Намерени', count: foundItems.length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300';
      case 'in_progress': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300';
      case 'resolved': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300';
      case 'active': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Нов';
      case 'in_progress': return 'В процес';
      case 'resolved': return 'Решен';
      case 'active': return 'Активен';
      default: return status;
    }
  };

  return (
    <ProtectedRoute>
      <PhoneFrame>
        <Header title="Моите сигнали" showBack />
        
        <div className="p-4 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {activeTab === 'all' || activeTab === 'problems' ? (
              problems.map(problem => (
                <div key={problem.id} className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                          {problem.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(problem.status)}`}>
                          {getStatusLabel(problem.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Автобус {problem.busLine} • {problem.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
            
            {activeTab === 'all' || activeTab === 'lost' ? (
              lostItems.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <PackageOpen className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                          {item.itemName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
            
            {activeTab === 'all' || activeTab === 'found' ? (
              foundItems.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <PackageSearch className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                          {item.itemName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
            
            {(problems.length + lostItems.length + foundItems.length) === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Все още нямате сигнали</p>
              </div>
            )}
          </div>
        </div>
      </PhoneFrame>
    </ProtectedRoute>
  );
}