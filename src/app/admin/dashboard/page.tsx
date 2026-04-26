'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  AlertTriangle, 
  Package, 
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { getAllReports, getResolvedReports } from '@/lib/admin-api';

interface Stats {
  problems: number;
  lost: number;
  found: number;
  total: number;
  resolved: number;
}

interface RecentReport {
  id: string;
  reportType: string;
  title?: string;
  itemName?: string;
  busLine: string;
  location: string;
  date: string;
  time: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    problems: 0,
    lost: 0,
    found: 0,
    total: 0,
    resolved: 0,
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const reportsData = await getAllReports();
      const resolvedData = await getResolvedReports();
      
      const problems = reportsData.reports.filter((r: any) => r.reportType === 'problem').length;
      const lost = reportsData.reports.filter((r: any) => r.reportType === 'lost').length;
      const found = reportsData.reports.filter((r: any) => r.reportType === 'found').length;
      
      setStats({
        problems,
        lost,
        found,
        total: reportsData.total,
        resolved: resolvedData.total,
      });
      
      setRecentReports(reportsData.reports.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Reports', 
      value: stats.total, 
      icon: FileText, 
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Problems', 
      value: stats.problems, 
      icon: AlertTriangle, 
      color: 'bg-amber-500',
      textColor: 'text-amber-600'
    },
    { 
      label: 'Lost Items', 
      value: stats.lost, 
      icon: Package, 
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    { 
      label: 'Found Items', 
      value: stats.found, 
      icon: CheckCircle, 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
  ];

  const getTypeBadge = (type: string) => {
    const badges: any = {
      problem: 'bg-amber-100 text-amber-700',
      lost: 'bg-red-100 text-red-700',
      found: 'bg-green-100 text-green-700',
    };
    return badges[type] || 'bg-slate-100 text-slate-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Overview of all reports</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Recent Reports</h2>
          <Link 
            href="/admin/reports" 
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            View All →
          </Link>
        </div>
        
        {recentReports.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No reports yet
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {recentReports.map((report) => (
              <div 
                key={report.id} 
                className="p-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(report.reportType)}`}>
                    {report.reportType === 'problem' ? 'Problem' : 
                     report.reportType === 'lost' ? 'Lost' : 'Found'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {report.title || report.itemName || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>Line {report.busLine}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  {report.date} {report.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}