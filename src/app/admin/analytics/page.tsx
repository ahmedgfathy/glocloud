'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ChartBarIcon, UsersIcon, DocumentIcon, ShareIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'

interface AnalyticsData {
  totalUsers: number
  totalFiles: number
  totalShares: number
  storageUsed: number
  recentActivities: any[]
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to view this page.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="ml-64 p-8">
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

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h3>
              <div className="mt-5">
                {analytics?.recentActivities?.length ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {analytics.recentActivities.map((activity, activityIdx) => (
                        <li key={activity.id}>
                          <div className="relative pb-8">
                            {activityIdx !== analytics.recentActivities.length - 1 ? (
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
      </main>
    </div>
  )
}
