'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { 
  FileText, 
  Filter, 
  Search, 
  Check, 
  Trash2,
  Eye,
  X,
  Clock,
  MapPin,
  Phone,
  Bus,
  AlertTriangle,
  Package,
  CheckCircle
} from 'lucide-react';
import { getAllReports, getResolvedReports, resolveReport, deleteReport } from '@/lib/admin-api';
import { BUS_LINES_PLOVDIV } from '@/lib/types';

interface Report {
  id: string;
  reportType: 'problem' | 'lost' | 'found';
  title?: string;
  itemName?: string;
  description: string;
  busLine: string;
  busRegistration: string;
  date: string;
  time: string;
  location: string;
  photoUrl?: string;
  isAnonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  finderName?: string;
  finderPhone?: string;
  createdAt: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [resolvedReports, setResolvedReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    type: '',
    busLine: '',
    date: '',
  });
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadReports();
  }, [activeTab, filters]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'resolved') {
        const data = await getResolvedReports();
        setReports(data.reports);
        setResolvedReports(data.reports);
      } else {
        const data = await getAllReports();
        let filtered = data.reports;
        
        if (filters.type) {
          filtered = filtered.filter((r: any) => r.reportType === filters.type);
        }
        if (filters.busLine) {
          filtered = filtered.filter((r: any) => r.busLine === filters.busLine);
        }
        if (filters.date) {
          filtered = filtered.filter((r: any) => r.date === filters.date);
        }
        
        setReports(filtered);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (report: Report) => {
    setIsResolving(true);
    try {
      await resolveReport({
        type: report.reportType,
        id: report.id,
      });
      setShowDetail(false);
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error('Failed to resolve report:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleDelete = async (report: Report) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    setIsDeleting(true);
    try {
      await deleteReport(report.id, report.reportType);
      setShowDetail(false);
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const badges: any = {
      problem: 'bg-amber-100 text-amber-700 border-amber-200',
      lost: 'bg-red-100 text-red-700 border-red-200',
      found: 'bg-green-100 text-green-700 border-green-200',
    };
    return badges[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getTypeIcon = (type: string) => {
    const icons: any = {
      problem: AlertTriangle,
      lost: Package,
      found: CheckCircle,
    };
    return icons[type] || FileText;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-500">Manage all user-submitted reports</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'resolved'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Resolved ({resolvedReports.length})
          </button>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-slate-500"
              >
                <option value="">All Types</option>
                <option value="problem">Problem</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bus Line
              </label>
              <select
                value={filters.busLine}
                onChange={(e) => setFilters({ ...filters, busLine: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-slate-500"
              >
                <option value="">All Lines</option>
                {BUS_LINES_PLOVDIV.map((line) => (
                  <option key={line.line} value={line.line}>
                    Line {line.line}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-slate-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: '', busLine: '', date: '' })}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FileText className="w-12 h-12 mb-2" />
            <p>No reports found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Title/Item</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Bus Line</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Location</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Anonymous</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reports.map((report) => {
                const TypeIcon = getTypeIcon(report.reportType);
                return (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadge(report.reportType)}`}>
                        <TypeIcon className="w-3 h-3" />
                        {report.reportType === 'problem' ? 'Problem' : 
                         report.reportType === 'lost' ? 'Lost' : 'Found'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">
                        {report.title || report.itemName || 'Untitled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">Line {report.busLine}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">{report.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600">{report.location}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${report.isAnonymous ? 'text-slate-400' : 'text-slate-600'}`}>
                        {report.isAnonymous ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetail(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {activeTab === 'active' && (
                          <>
                            <button
                              onClick={() => handleResolve(report)}
                              disabled={isResolving}
                              className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as Resolved"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(report)}
                              disabled={isDeleting}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showDetail && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeBadge(selectedReport.reportType)}`}>
                  {React.createElement(getTypeIcon(selectedReport.reportType), { className: "w-5 h-5" })}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">
                    {selectedReport.title || selectedReport.itemName || 'Report Details'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedReport.reportType === 'problem' ? 'Problem Report' : 
                     selectedReport.reportType === 'lost' ? 'Lost Item' : 'Found Item'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedReport(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {selectedReport.photoUrl && (
                <div className="rounded-lg overflow-hidden bg-slate-100">
                  <img 
                    src={selectedReport.photoUrl} 
                    alt="Report" 
                    className="w-full max-h-64 object-contain"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Bus Line</p>
                  <p className="font-medium text-slate-800">Line {selectedReport.busLine}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Bus Registration</p>
                  <p className="font-medium text-slate-800">{selectedReport.busRegistration || 'N/A'}</p>
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-slate-800">{selectedReport.description || 'No description'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{selectedReport.date} {selectedReport.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedReport.location}</span>
                </div>
              </div>
              
              {!selectedReport.isAnonymous && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Reporter Info</p>
                  <div className="grid grid-cols-2 gap-4">
                    {(selectedReport as any).reporterName && (
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="text-slate-800">{(selectedReport as any).reporterName}</p>
                      </div>
                    )}
                    {(selectedReport as any).reporterPhone && (
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-slate-800 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {(selectedReport as any).reporterPhone}
                        </p>
                      </div>
                    )}
                    {(selectedReport as any).finderName && (
                      <div>
                        <p className="text-xs text-slate-500">Finder Name</p>
                        <p className="text-slate-800">{(selectedReport as any).finderName}</p>
                      </div>
                    )}
                    {(selectedReport as any).finderPhone && (
                      <div>
                        <p className="text-xs text-slate-500">Finder Phone</p>
                        <p className="text-slate-800 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {(selectedReport as any).finderPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedReport.isAnonymous && (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-center">
                  This is an anonymous report - no reporter information available
                </div>
              )}
            </div>
            
            {activeTab === 'active' && (
              <div className="flex gap-3 p-4 border-t border-slate-200">
                <button
                  onClick={() => handleResolve(selectedReport)}
                  disabled={isResolving}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isResolving ? 'Resolving...' : 'Mark as Resolved'}
                </button>
                <button
                  onClick={() => handleDelete(selectedReport)}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}