'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { 
  EyeIcon, 
  ArrowDownTrayIcon, 
  DocumentIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface PublicFile {
  id: string
  name: string
  originalName: string
  size: number
  mimeType: string
  isFolder: boolean
  createdAt: string
  owner: {
    name: string
    email: string
  }
  share: {
    permission: string
    expiresAt: string | null
    accessCount: number
  }
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default function PublicFilePage({ params }: PageProps) {
  const [file, setFile] = useState<PublicFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    const getToken = async () => {
      const resolvedParams = await params
      setToken(resolvedParams.token)
    }
    getToken()
  }, [params])

  useEffect(() => {
    if (token) {
      fetchPublicFile()
    }
  }, [token])

  const fetchPublicFile = async () => {
    try {
      const response = await fetch(`/api/public/file/${token}`)
      if (response.ok) {
        const data = await response.json()
        setFile(data)
      } else if (response.status === 404) {
        setError('File not found or link has expired')
      } else if (response.status === 403) {
        setError('Access denied')
      } else {
        setError('Failed to load file')
      }
    } catch (error) {
      console.error('Error fetching public file:', error)
      setError('Failed to load file')
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleView = () => {
    window.open(`/api/public/file/${token}/view`, '_blank')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `/api/public/file/${token}/download`
    link.download = file?.originalName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isExpired = file?.share.expiresAt && new Date(file.share.expiresAt) < new Date()
  const isExpiring = file?.share.expiresAt && new Date(file.share.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {error || 'File not found'}
          </h1>
          <p className="text-gray-500 text-lg">
            The shared file link may have expired or been removed.
          </p>
        </div>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClockIcon className="h-12 w-12 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Link Expired
          </h1>
          <p className="text-gray-500 text-lg">
            This shared file link has expired and is no longer accessible.
          </p>
        </div>
      </div>
    )
  }

  const permissionConfig = getPermissionBadge(file.share.permission)
  const FileIconComponent = getFileIcon(file.mimeType, file.isFolder)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <DocumentIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Shared File</h1>
              <p className="text-sm text-gray-500">Public file sharing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* File Header */}
          <div className="p-8 border-b border-gray-100">
            {/* Expiration Warning */}
            {isExpiring && !isExpired && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">
                      This link expires on {formatDate(file.share.expiresAt!)}
                    </p>
                    <p className="text-xs text-amber-600">
                      Download or view the file before it becomes inaccessible
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  file.isFolder 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                }`}>
                  {typeof FileIconComponent === 'string' ? (
                    <span className="text-3xl">{FileIconComponent}</span>
                  ) : (
                    <FileIconComponent className="h-8 w-8" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 break-words">
                    {file.originalName}
                  </h2>
                  <p className="text-lg text-gray-500 mt-1">
                    {file.isFolder ? 'Folder' : file.mimeType.split('/')[1]?.toUpperCase() || 'File'}
                  </p>
                </div>
              </div>
              
              {/* Permission Badge */}
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${permissionConfig.bg} ${permissionConfig.text} ${permissionConfig.border}`}>
                <permissionConfig.icon className="h-4 w-4 mr-2" />
                {file.share.permission === 'VIEW' ? 'View Only' : 
                 file.share.permission === 'DOWNLOAD' ? 'View & Download' : 
                 file.share.permission}
              </div>
            </div>
          </div>

          {/* File Details */}
          <div className="p-8 space-y-6">
            {/* Shared By */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Shared by</p>
                <p className="text-lg font-semibold text-gray-900">{file.owner.name}</p>
                <p className="text-sm text-gray-600">{file.owner.email}</p>
              </div>
            </div>

            {/* File Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">File Size</p>
                <p className="text-xl font-bold text-gray-900">
                  {file.isFolder ? '-' : formatFileSize(file.size)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                <p className="text-xl font-bold text-gray-900">{formatDate(file.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Access Count</p>
                <p className="text-xl font-bold text-gray-900">{file.share.accessCount} views</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleView}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-medium py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                >
                  <EyeIcon className="h-5 w-5" />
                  <span>View File</span>
                </button>
                
                {(file.share.permission === 'DOWNLOAD' || file.share.permission === 'EDIT') && !file.isFolder && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-medium py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
