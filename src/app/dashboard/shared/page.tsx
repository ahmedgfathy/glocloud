'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import { 
  ShareIcon, 
  EyeIcon, 
  ArrowDownTrayIcon, 
  DocumentIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface SharedFile {
  id: string
  name: string
  originalName: string
  size: number
  mimeType: string
  isFolder: boolean
  createdAt: string
  share: {
    id: string
    sharedBy: {
      name: string
      email: string
    }
    permissions: string
    expiresAt: string | null
  }
}

export default function SharedPage() {
  const { data: session, status } = useSession()
  const [files, setFiles] = useState<SharedFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/auth/signin')
    }
    fetchSharedFiles()
  }, [session, status])

  const fetchSharedFiles = async () => {
    try {
      const response = await fetch('/api/files/shared')
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Error fetching shared files:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString('en-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getPermissionBadge = (permission: string) => {
    const configs = {
      VIEW: { 
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        icon: EyeIcon
      },
      DOWNLOAD: { 
        bg: 'bg-gradient-to-r from-green-50 to-green-100', 
        text: 'text-green-700', 
        border: 'border-green-200',
        icon: ArrowDownTrayIcon
      },
      EDIT: { 
        bg: 'bg-gradient-to-r from-amber-50 to-amber-100', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        icon: ShieldCheckIcon
      }
    }
    return configs[permission as keyof typeof configs] || {
      bg: 'bg-gray-100', 
      text: 'text-gray-700', 
      border: 'border-gray-200',
      icon: ShieldCheckIcon
    }
  }

  const getFileIcon = (mimeType: string, isFolder: boolean) => {
    if (isFolder) return FolderIcon
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('video')) return '🎥'
    if (mimeType.includes('audio')) return '🎵'
    if (mimeType.includes('pdf')) return '📕'
    if (mimeType.includes('word')) return '📘'
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️'
    return DocumentIcon
  }

  const handleView = (fileId: string) => {
    // Open in new tab to avoid affecting dashboard navigation
    const newWindow = window.open(`/api/files/${fileId}/view`, '_blank', 'noopener,noreferrer')
    if (newWindow) {
      newWindow.focus()
    }
  }

  const handleDownload = (fileId: string, fileName: string) => {
    // Create download link that doesn't navigate away
    const link = document.createElement('a')
    link.href = `/api/files/${fileId}/download`
    link.download = fileName
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto content-scrollable p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200 mb-6">
                  <div className="h-6 bg-gray-300 rounded-lg w-64 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                      <div className="h-12 bg-gray-300 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto content-scrollable p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShareIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Shared with Me
                  </h1>
                  <p className="text-gray-600 text-base">
                    Files and folders that have been shared with you
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Shared</p>
                      <p className="text-xl font-bold text-blue-700">{files.length}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ShareIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Downloadable</p>
                      <p className="text-xl font-bold text-green-700">
                        {files.filter(f => f.share.permissions === 'DOWNLOAD' || f.share.permissions === 'EDIT').length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <ArrowDownTrayIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Folders</p>
                      <p className="text-xl font-bold text-purple-700">
                        {files.filter(f => f.isFolder).length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <FolderIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {files.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShareIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No shared files yet
                  </h3>
                  <p className="text-gray-500 text-lg max-w-md mx-auto">
                    When someone shares files or folders with you, they'll appear here for easy access.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => {
                  const permissionConfig = getPermissionBadge(file.share.permissions)
                  const FileIconComponent = getFileIcon(file.mimeType, file.isFolder)
                  const isExpiring = file.share.expiresAt && new Date(file.share.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  
                  return (
                    <div key={file.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 group">
                      {/* File Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              file.isFolder 
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                            }`}>
                              {typeof FileIconComponent === 'string' ? (
                                <span className="text-2xl">{FileIconComponent}</span>
                              ) : (
                                <FileIconComponent className="h-6 w-6" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {file.originalName}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">
                                {file.isFolder ? 'Folder' : file.mimeType.split('/')[1]?.toUpperCase() || 'File'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Permission Badge */}
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${permissionConfig.bg} ${permissionConfig.text} ${permissionConfig.border}`}>
                            <permissionConfig.icon className="h-3 w-3 mr-1" />
                            {file.share.permissions}
                          </div>
                        </div>
                        
                        {/* Expiration Warning */}
                        {isExpiring && (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium text-amber-700">
                                Expires {formatDate(file.share.expiresAt!)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File Details */}
                      <div className="p-6 space-y-4">
                        {/* Shared By */}
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.share.sharedBy.name}</p>
                            <p className="text-xs text-gray-500">{file.share.sharedBy.email}</p>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Size</p>
                            <p className="font-medium text-gray-900">
                              {file.isFolder ? '-' : formatFileSize(file.size)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Shared</p>
                            <p className="font-medium text-gray-900">{formatDate(file.createdAt)}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleView(file.id)
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          
                          {(file.share.permissions === 'DOWNLOAD' || file.share.permissions === 'EDIT') && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDownload(file.id, file.originalName)
                              }}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer for content area only */}
        <Footer />
      </main>
    </div>
  )
}
