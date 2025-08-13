'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import {
  FolderIcon,
  DocumentIcon,
  UserIcon,
  CalendarIcon,
  CloudArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface OrganizedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: string;
  weekNumber: number;
  uploadPath: string;
  owner: {
    id: string;
    name: string;
    email: string;
    employeeId?: string;
  };
}

interface WeekData {
  weekNumber: number;
  weekKey: string;
  files: OrganizedFile[];
  fileCount: number;
  totalSize: number;
}

interface EmployeeData {
  employeeId: string;
  employee: {
    id: string;
    name: string;
    email: string;
    employeeId?: string;
  };
  weeks: WeekData[];
}

export default function FileStructurePage() {
  const { data: session, status } = useSession();
  const [organizedFiles, setOrganizedFiles] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') redirect('/auth/signin');
    if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'ADMIN') {
      redirect('/dashboard');
    }

    fetchOrganizedFiles();
  }, [session, status, selectedEmployee, selectedWeek]);

  const fetchOrganizedFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      if (selectedWeek) params.append('week', selectedWeek);
      
      const response = await fetch(`/api/files/organized?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrganizedFiles(data.organizedFiles || []);
      }
    } catch (error) {
      console.error('Error fetching organized files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📈';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📁';
  };

  // Get all unique employees for filter
  const allEmployees = organizedFiles.map(emp => ({
    id: emp.employeeId,
    name: emp.employee.name,
    email: emp.employee.email
  }));

  // Get all unique weeks for filter
  const allWeeks = Array.from(
    new Set(
      organizedFiles.flatMap(emp => emp.weeks.map(week => week.weekNumber))
    )
  ).sort((a, b) => a - b);

  // Filter employees based on search term
  const filteredFiles = organizedFiles.filter(employeeData => {
    const matchesSearch = searchTerm === '' || 
      employeeData.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeData.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeData.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto content-scrollable flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
          <Footer />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <FolderIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">File Organization</h1>
              </div>
              <p className="text-gray-600">
                View files organized by employee ID and upload week structure
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Employee Filter */}
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Employees</option>
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id})
                    </option>
                  ))}
                </select>

                {/* Week Filter */}
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Weeks</option>
                  {allWeeks.map(week => (
                    <option key={week} value={week.toString()}>
                      Week {week}
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedEmployee('');
                    setSelectedWeek('');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <FunnelIcon className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>

            {/* File Structure */}
            <div className="space-y-6">
              {filteredFiles.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <FolderIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Files Found</h3>
                  <p className="text-gray-500">No files match your current filter criteria.</p>
                </div>
              ) : (
                filteredFiles.map((employeeData) => (
                  <div key={employeeData.employeeId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Employee Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-blue-400/30">
                            <UserIcon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{employeeData.employee.name}</h3>
                            <p className="text-gray-600 mb-2 flex items-center">
                              <span className="mr-2">📧</span>
                              {employeeData.employee.email}
                            </p>
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm border border-blue-400/30">
                                <span className="mr-1">🆔</span>
                                Employee: {employeeData.employeeId}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                                📁 {employeeData.weeks.reduce((total, week) => total + week.fileCount, 0)} Files
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right bg-white/60 p-4 rounded-xl border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Active Weeks</p>
                          <p className="text-3xl font-bold text-blue-600">{employeeData.weeks.length}</p>
                          <p className="text-xs text-gray-400 mt-1">Upload Periods</p>
                        </div>
                      </div>
                    </div>

                    {/* Weeks */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {employeeData.weeks.map((week) => (
                          <div key={week.weekKey} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Week Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-5 flex items-center justify-between border-b border-gray-200">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                                  <CalendarIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg">Week {week.weekNumber}</h4>
                                  <p className="text-sm text-gray-500">{week.fileCount} files uploaded</p>
                                </div>
                              </div>
                              <div className="text-right bg-white/80 px-4 py-2 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Total Size</p>
                                <p className="text-lg font-bold text-emerald-600">{formatFileSize(week.totalSize)}</p>
                              </div>
                            </div>

                            {/* Files */}
                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {week.files.map((file) => (
                                  <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.originalName}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex space-x-1">
                                      <a
                                        href={`/api/files/${file.id}/download`}
                                        className="p-1 text-blue-600 hover:text-blue-800 rounded"
                                        title="Download"
                                      >
                                        <CloudArrowDownIcon className="h-4 w-4" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Footer for content area only */}
        <Footer />
      </main>
    </div>
  );
}
