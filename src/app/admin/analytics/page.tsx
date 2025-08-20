'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ChartBarIcon, UsersIcon, DocumentIcon, ShareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface AnalyticsData {
  totalUsers: number
  totalFiles: number
  totalShares: number
  storageUsed: number
  fileTypeStats: Array<{
    type: string
    count: number
    percentage: number
  }>
  recentActivities: any[]
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter activities based on search term
  const filteredActivities = analytics?.recentActivities?.filter(activity => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    // Search by user name
    if (activity.user?.name?.toLowerCase().includes(searchLower)) return true
    
    // Search by user email
    if (activity.user?.email?.toLowerCase().includes(searchLower)) return true
    
    // Search by employee ID
    if (activity.user?.employeeId?.toLowerCase().includes(searchLower)) return true
    
    // Search by activity details (includes login activities)
    if (activity.details?.toLowerCase().includes(searchLower)) return true
    
    // Search by IP address
    if (activity.ipAddress?.toLowerCase().includes(searchLower)) return true
    
    return false
  }) || []

  if (status === 'loading' || loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto content-scrollable p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto content-scrollable p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-600">You don't have permission to view this page.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      System Analytics
                    </h1>
                    <p className="text-gray-600 text-lg">Monitor your system performance and activity</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <UsersIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {analytics?.totalUsers || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <DocumentIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Files</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {analytics?.totalFiles || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <ShareIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Shares</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {analytics?.totalShares || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Storage Used</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {analytics ? `${(analytics.storageUsed / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* File Type Statistics */}
            {analytics?.fileTypeStats && analytics.fileTypeStats.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Doughnut Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
                    File Types Distribution
                  </h3>
                  <div className="relative h-80">
                    <Doughnut
                      data={{
                        labels: analytics.fileTypeStats.map(stat => stat.type),
                        datasets: [
                          {
                            data: analytics.fileTypeStats.map(stat => stat.count),
                            backgroundColor: [
                              '#8B5CF6', // Documents - Purple
                              '#10B981', // Excel - Green
                              '#F59E0B', // Database - Yellow
                              '#EF4444', // Images - Red
                              '#3B82F6', // Videos - Blue
                              '#EC4899', // Audio - Pink
                              '#6B7280', // Archives - Gray
                              '#84CC16', // Misc - Lime
                            ],
                            borderColor: [
                              '#7C3AED',
                              '#059669',
                              '#D97706',
                              '#DC2626',
                              '#2563EB',
                              '#DB2777',
                              '#4B5563',
                              '#65A30D',
                            ],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const stat = analytics.fileTypeStats[context.dataIndex]
                                return `${context.label}: ${context.parsed} files (${stat.percentage}%)`
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <DocumentIcon className="h-6 w-6 text-blue-600 mr-2" />
                    File Count by Type
                  </h3>
                  <div className="relative h-80">
                    <Bar
                      data={{
                        labels: analytics.fileTypeStats.map(stat => stat.type),
                        datasets: [
                          {
                            label: 'Number of Files',
                            data: analytics.fileTypeStats.map(stat => stat.count),
                            backgroundColor: 'rgba(139, 92, 246, 0.8)',
                            borderColor: 'rgba(139, 92, 246, 1)',
                            borderWidth: 2,
                            borderRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const stat = analytics.fileTypeStats[context.dataIndex]
                                return `${context.parsed.y} files (${stat.percentage}%)`
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Type Statistics Table */}
            {analytics?.fileTypeStats && analytics.fileTypeStats.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">File Type Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            File Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Visual
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.fileTypeStats.map((stat, index) => (
                          <tr key={stat.type} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {stat.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {stat.count} files
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {stat.percentage}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                                  style={{ width: `${stat.percentage}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Recent Activities</h3>
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, employee ID, or activity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-sm text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                  {/* Results Summary */}
                  {searchTerm && (
                    <div className="mt-4 text-sm text-gray-600 flex items-center flex-wrap gap-2">
                      <span>
                        Showing {filteredActivities.length} activities matching
                        <span className="font-medium text-purple-600 mx-1">{searchTerm}</span>
                      </span>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-xs font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Activity Results Info */}
                {searchTerm && (
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      {filteredActivities.length} results for "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 hover:text-purple-600 text-lg font-semibold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="max-h-96 overflow-y-auto content-scrollable">
                  {filteredActivities?.length ? (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {filteredActivities.map((activity, activityIdx) => (
                          <li key={activity.id}>
                            <div className="relative pb-8">
                              {activityIdx !== filteredActivities.length - 1 ? (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-8 ring-white shadow-lg">
                                    <DocumentIcon className="h-4 w-4 text-white" />
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-700 font-medium">
                                      {activity.details}
                                    </p>
                                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                      <span className="font-medium">User: {activity.user?.name || 'Unknown'}</span>
                                      {activity.user?.email && (
                                        <span className="text-blue-600 font-medium">
                                          {activity.user.email}
                                        </span>
                                      )}
                                      {activity.user?.employeeId && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                          EMP: {activity.user.employeeId}
                                        </span>
                                      )}
                                      {activity.ipAddress && activity.ipAddress !== 'unknown' && (
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                          IP: {activity.ipAddress}
                                        </span>
                                      )}
                                      {activity.userAgent && activity.userAgent !== 'unknown' && (
                                        <span className="truncate max-w-xs">
                                          {activity.userAgent.split(' ')[0]}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <div>{new Date(activity.createdAt).toLocaleDateString('en-GB', { timeZone: 'Africa/Cairo' })}</div>
                                    <div className="text-xs">
                                      {new Date(activity.createdAt).toLocaleTimeString('en-GB', { 
                                        timeZone: 'Africa/Cairo',
                                        hour12: false,
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : searchTerm ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg">No activities found</p>
                      <p className="text-gray-400 text-sm">No activities match your search criteria</p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DocumentIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg">No recent activities</p>
                      <p className="text-gray-400 text-sm">Activity will appear here when users interact with the system</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  )
}
