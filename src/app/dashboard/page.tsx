'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { 
  FolderIcon, 
  CloudIcon, 
  ShareIcon, 
  CloudArrowUpIcon,
  ClockIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface UserStats {
  totalFiles: number
  storageUsed: number
  sharedFiles: number
}

interface FileTypeStats {
  documents: number
  images: number
  videos: number
  audio: number
  archives: number
  misc: number
}

interface Activity {
  id: string
  action: string
  details: string
  createdAt: string
  file?: {
    name: string
    originalName: string
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [userStats, setUserStats] = useState<UserStats>({
    totalFiles: 0,
    storageUsed: 0,
    sharedFiles: 0
  })
  const [fileTypeStats, setFileTypeStats] = useState<FileTypeStats>({
    documents: 0,
    images: 0,
    videos: 0,
    audio: 0,
    archives: 0,
    misc: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchUserStats()
      fetchActivities()
    }
  }, [session, refreshTrigger])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/files')
      if (response.ok) {
        const data = await response.json()
        const files = data.files || []
        
        const totalFiles = files.length
        const storageUsed = files.reduce((total: number, file: any) => total + (file.size || 0), 0)
        const sharedFiles = 0
        
        // Calculate file type statistics
        const fileTypeStats = {
          documents: 0,
          images: 0,
          videos: 0,
          audio: 0,
          archives: 0,
          misc: 0
        }

        files.forEach((file: any) => {
          const extension = file.originalName?.split('.').pop()?.toLowerCase() || ''
          
          if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
            fileTypeStats.documents++
          } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
            fileTypeStats.images++
          } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension)) {
            fileTypeStats.videos++
          } else if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(extension)) {
            fileTypeStats.audio++
          } else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
            fileTypeStats.archives++
          } else {
            fileTypeStats.misc++
          }
        })
        
        setUserStats({
          totalFiles,
          storageUsed,
          sharedFiles
        })
        
        setFileTypeStats(fileTypeStats)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setActivitiesLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 GB'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
    return size + ' ' + sizes[i]
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    fetchUserStats()
    fetchActivities()
  }

  // Chart data for file type statistics
  const chartData = {
    labels: ['Documents', 'Images', 'Videos', 'Audio', 'Archives', 'Misc'],
    datasets: [
      {
        data: [
          fileTypeStats.documents,
          fileTypeStats.images,
          fileTypeStats.videos,
          fileTypeStats.audio,
          fileTypeStats.archives,
          fileTypeStats.misc
        ],
        backgroundColor: [
          '#3B82F6', // Blue for documents
          '#10B981', // Green for images
          '#F59E0B', // Yellow for videos
          '#EF4444', // Red for audio
          '#8B5CF6', // Purple for archives
          '#6B7280'  // Gray for misc
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
          '#4B5563'
        ],
        borderWidth: 2
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            return `${label}: ${value} files (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {session?.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome back, {session?.user?.name}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Manage your files and folders securely
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Total Files</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {statsLoading ? '...' : userStats.totalFiles}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FolderIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Storage Used</p>
                        <p className="text-2xl font-bold text-green-700">
                          {statsLoading ? '...' : formatFileSize(userStats.storageUsed)}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <CloudIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Shared Files</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {statsLoading ? '...' : userStats.sharedFiles}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <ShareIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Upload Files Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                      Upload Files
                    </h2>
                    <p className="text-blue-100 mt-1">Drag and drop or click to upload</p>
                  </div>
                  <div className="p-6">
                    <FileUpload 
                      parentId={null}
                      onUploadSuccess={handleUploadSuccess}
                    />
                  </div>
                </div>

                {/* File Type Statistics Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <ChartPieIcon className="h-6 w-6 mr-3" />
                      File Types Statistics
                    </h2>
                    <p className="text-indigo-100 mt-1">Your uploaded file distribution</p>
                  </div>
                  <div className="p-6">
                    {statsLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : (
                      <div className="h-64">
                        <Pie data={chartData} options={chartOptions} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Actions Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <FolderIcon className="h-6 w-6 mr-3" />
                      Quick Actions
                    </h2>
                    <p className="text-green-100 mt-1">Access your files and folders</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Link 
                        href="/dashboard/files"
                        className="group flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all duration-200 hover:scale-105"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                          <FolderIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-blue-700 font-medium text-sm">My Files</span>
                      </Link>

                      <Link 
                        href="/dashboard/shared"
                        className="group flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-all duration-200 hover:scale-105"
                      >
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-600 transition-colors">
                          <ShareIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-purple-700 font-medium text-sm">Shared Files</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Storage Info Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <CloudIcon className="h-6 w-6 mr-3" />
                      Storage Info
                    </h2>
                    <p className="text-cyan-100 mt-1">Your storage usage overview</p>
                  </div>
                  <div className="p-6">
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Files</span>
                          <span className="text-2xl font-bold text-blue-600">{userStats.totalFiles}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Storage Used</span>
                          <span className="text-2xl font-bold text-green-600">{formatFileSize(userStats.storageUsed)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Shared Files</span>
                          <span className="text-2xl font-bold text-purple-600">{userStats.sharedFiles}</span>
                        </div>
                        
                        <div className="bg-gray-100 rounded-lg p-4 mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Storage Usage</span>
                            <span className="text-sm text-gray-600">
                              {formatFileSize(userStats.storageUsed)} / 10 GB
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                              style={{ 
                                width: `${Math.min((userStats.storageUsed / (10 * 1024 * 1024 * 1024)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {((userStats.storageUsed / (10 * 1024 * 1024 * 1024)) * 100).toFixed(1)}% of your storage is used
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <ClockIcon className="h-6 w-6 mr-3" />
                      Recent Activity
                    </h2>
                    <p className="text-orange-100 mt-1">Your latest file operations</p>
                  </div>
                  <div className="p-6">
                    {activitiesLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      </div>
                    ) : activities.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {activities.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {activity.action === 'upload' && <ArrowDownTrayIcon className="h-4 w-4 text-orange-600" />}
                              {activity.action === 'download' && <ArrowDownTrayIcon className="h-4 w-4 text-green-600" />}
                              {activity.action === 'delete' && <TrashIcon className="h-4 w-4 text-red-600" />}
                              {activity.action === 'view' && <EyeIcon className="h-4 w-4 text-blue-600" />}
                              {!['upload', 'download', 'delete', 'view'].includes(activity.action) && <DocumentIcon className="h-4 w-4 text-gray-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)} {activity.file?.originalName || 'file'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.createdAt).toLocaleDateString()} at {new Date(activity.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  )
}
