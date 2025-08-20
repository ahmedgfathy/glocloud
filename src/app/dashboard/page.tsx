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
      const [filesResponse, sharedResponse] = await Promise.all([
        fetch('/api/files'),
        fetch('/api/files/shared')
      ])
      
      let totalFiles = 0
      let storageUsed = 0
      let sharedFiles = 0
      
      if (filesResponse.ok) {
        const filesData = await filesResponse.json()
        const files = filesData.files || []
        
        totalFiles = files.length
        storageUsed = files.reduce((total: number, file: any) => total + (file.size || 0), 0)
        
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
        
        setFileTypeStats(fileTypeStats)
      }
      
      if (sharedResponse.ok) {
        const sharedData = await sharedResponse.json()
        sharedFiles = sharedData.length || 0
      }
      
      setUserStats({
        totalFiles,
        storageUsed,
        sharedFiles
      })
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
            <div className="mb-8">
              <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-float"></div>
                  <div className="absolute top-1/2 -left-8 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-4 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
                </div>
                
                <div className="relative p-8">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-3xl animate-scale-in">
                          {session?.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold mb-2 animate-slide-in-right">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                          Welcome back, {session?.user?.name}
                        </span>
                      </h1>
                      <p className="text-gray-600 text-lg flex items-center animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                        <CloudIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Manage your files and folders securely in the cloud
                      </p>
                      <div className="flex items-center mt-3 space-x-4 animate-slide-in-right" style={{animationDelay: '0.4s'}}>
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          System Online
                        </div>
                        <div className="text-sm text-gray-500">
                          Last login: {new Date().toLocaleDateString('en-EG', {
                            timeZone: 'Africa/Cairo',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block animate-fade-in" style={{animationDelay: '0.6s'}}>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Role</div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                          {session?.user?.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <FolderIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-white/80 text-xs font-medium">Total Files</div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {statsLoading ? (
                          <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                        ) : (
                          <span className="block animate-fade-in">{userStats.totalFiles}</span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm">Files in storage</p>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-white/40 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <CloudIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-white/80 text-xs font-medium">Storage Used</div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {statsLoading ? (
                          <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                        ) : (
                          <span className="block animate-fade-in">{formatFileSize(userStats.storageUsed)}</span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm">Space utilized</p>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-white/40 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <ShareIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-white/80 text-xs font-medium">Shared Files</div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {statsLoading ? (
                          <div className="h-8 bg-white/20 rounded animate-pulse"></div>
                        ) : (
                          <span className="block animate-fade-in">{userStats.sharedFiles}</span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm">Shared with you</p>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-white/40 rounded-full animate-pulse"></div>
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
        </div>
        
      </main>
    </div>
  )
}
