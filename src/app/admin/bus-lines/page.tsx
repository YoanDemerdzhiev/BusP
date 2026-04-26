'use client';

import { useState, useEffect } from 'react';
import { Bus, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { getBusLinesData } from '@/lib/admin-api';

interface BusLineData {
  line: string;
  route: string;
  totalReports: number;
  problems: number;
  lost: number;
  found: number;
}

export default function AdminBusLinesPage() {
  const [busLines, setBusLines] = useState<BusLineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBusLines();
  }, []);

  const loadBusLines = async () => {
    try {
      const data = await getBusLinesData();
      setBusLines(data.busLines);
    } catch (error) {
      console.error('Failed to load bus lines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLines = busLines.filter(line => 
    line.line.includes(searchQuery) || 
    line.route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReports = busLines.reduce((sum, line) => sum + line.totalReports, 0);

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
          <h1 className="text-2xl font-bold text-slate-800">Bus Lines</h1>
          <p className="text-slate-500">View reports by bus line</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-800">{totalReports}</p>
          <p className="text-sm text-slate-500">Total Reports</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by line number or route..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-slate-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Bus Line</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Route</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Problems</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Lost</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Found</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredLines.map((line) => (
              <tr key={line.line} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">{line.line}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-800">{line.route}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                    line.problems > 0 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-slate-400'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {line.problems}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                    line.lost > 0 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-slate-400'
                  }`}>
                    <Package className="w-3 h-3" />
                    {line.lost}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                    line.found > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-slate-400'
                  }`}>
                    <CheckCircle className="w-3 h-3" />
                    {line.found}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${
                    line.totalReports > 0 
                      ? 'text-slate-800' 
                      : 'text-slate-400'
                  }`}>
                    {line.totalReports}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLines.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Bus className="w-12 h-12 mb-2" />
            <p>No bus lines found</p>
          </div>
        )}
      </div>
    </div>
  );
}