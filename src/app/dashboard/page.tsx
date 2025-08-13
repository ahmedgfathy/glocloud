'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'
import Sidebar from '@/components/Sidebar'
import { 
  FolderIcon, 
  CloudIcon, 
  ShareIcon, 
  CloudArrowUpIcon 
} from '@heroicons/react/24/outline'

interface UserStats {
  totalFiles: number
  storageUsed: number
  sharedFiles: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [userStats, setUserStats] = useState<UserStats>({
    totalFiles: 0,
    storageUsed: 0,
    sharedFiles: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchUserStats()
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
        
        setUserStats({
          totalFiles,
          storageUsed,
          sharedFiles
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setStatsLoading(false)
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
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
                    parentId={currentFolder}
                    onUploadSuccess={handleUploadSuccess}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <FileList 
                  parentId={currentFolder}
                  onFolderClick={setCurrentFolder}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mr-3"></div>
                  Storage Info
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Used</span>
                    <span className="font-bold text-gray-900">
                      {statsLoading ? '...' : formatFileSize(userStats.storageUsed)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Available</span>
                    <span className="font-bold text-green-600">Unlimited</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" style={{width: '5%'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {userStats.totalFiles} files stored
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg mr-3"></div>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FolderIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <p className="text-gray-400 text-xs">Upload files to see activity here</p>
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
