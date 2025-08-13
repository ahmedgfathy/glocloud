'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { ShareIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPermissionBadge = (permission: string) => {
    const colors = {
      VIEW: 'bg-blue-100 text-blue-800',
      DOWNLOAD: 'bg-green-100 text-green-800',
      EDIT: 'bg-yellow-100 text-yellow-800'
    }
    return colors[permission as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleView = (fileId: string) => {
    window.open(`/api/files/${fileId}/view`, '_blank')
  }

  const handleDownload = (fileId: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = `/api/files/${fileId}/download`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShareIcon className="h-8 w-8 mr-3 text-blue-600" />
              Shared with Me
            </h1>
            <p className="text-gray-600 mt-2">
              Files and folders that have been shared with you
            </p>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12">
              <ShareIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No shared files
              </h3>
              <p className="text-gray-500">
                Files shared with you will appear here
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shared By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shared Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                file.isFolder 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {file.isFolder ? '📁' : '📄'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {file.originalName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {file.mimeType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{file.share.sharedBy.name}</div>
                          <div className="text-sm text-gray-500">{file.share.sharedBy.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPermissionBadge(file.share.permissions)}`}>
                            {file.share.permissions}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {file.isFolder ? '-' : formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(file.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {file.share.expiresAt ? formatDate(file.share.expiresAt) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(file.id)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {(file.share.permissions === 'DOWNLOAD' || file.share.permissions === 'EDIT') && (
                              <button
                                onClick={() => handleDownload(file.id, file.originalName)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Download"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
