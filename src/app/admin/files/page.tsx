'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
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

      const response = await fetch(`/api/files/organized?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setOrganizedFiles(data.organizedFiles);
      }
    } catch (error) {
      console.error('Error fetching organized files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    return '📄';
  };

  const filteredFiles = organizedFiles.filter(emp => 
    emp.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allEmployees = organizedFiles.map(emp => ({
    id: emp.employeeId,
    name: emp.employee.name,
    email: emp.employee.email
  }));

  const allWeeks = Array.from(
    new Set(
      organizedFiles.flatMap(emp => 
        emp.weeks.map(week => week.weekNumber)
      )
    )
  ).sort((a, b) => b - a);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      <main className="ml-64 p-8">
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
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{employeeData.employee.name}</h3>
                          <p className="text-gray-600">{employeeData.employee.email}</p>
                          <p className="text-sm text-blue-600 font-medium">Employee ID: {employeeData.employeeId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Weeks</p>
                        <p className="text-2xl font-bold text-blue-600">{employeeData.weeks.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Weeks */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {employeeData.weeks.map((week) => (
                        <div key={week.weekKey} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Week Header */}
                          <div className="bg-gray-50 p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CalendarIcon className="h-5 w-5 text-gray-600" />
                              <h4 className="font-semibold text-gray-900">Week {week.weekNumber}</h4>
                              <span className="text-sm text-gray-500">({week.fileCount} files)</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Total: {formatFileSize(week.totalSize)}
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
      </main>
    </div>
  );
}
