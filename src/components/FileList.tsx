'use client'

import { useEffect, useState } from 'react'
import { 
  DocumentIcon, 
  FolderIcon, 
  ShareIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline'
import ShareModal from './ShareModal'

interface FileItem {
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
}

interface FileListProps {
  parentId?: string | null
  onFolderClick?: (folderId: string) => void
  refreshTrigger?: number
}

export default function FileList({ parentId, onFolderClick, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [shareModal, setShareModal] = useState<{ fileId: string; fileName: string } | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)
        const url = parentId 
          ? `/api/files?parentId=${parentId}`
          : '/api/files'
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setFiles(data.files || [])
        }
      } catch (error) {
        console.error('Error fetching files:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [parentId, refreshTrigger])

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

  const handleView = (fileId: string) => {
    // Open file in new tab for viewing
    window.open(`/api/files/${fileId}/view`, '_blank')
  }

  const handleDownload = (fileId: string, fileName: string) => {
    // Create download link
    const link = document.createElement('a')
    link.href = `/api/files/${fileId}/download`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = (fileId: string, fileName: string) => {
    setShareModal({ fileId, fileName })
  }

  const closeShareModal = () => {
    setShareModal(null)
  }

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/delete`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Refresh the file list
        const url = parentId 
          ? `/api/files?parentId=${parentId}`
          : '/api/files'
        
        const refreshResponse = await fetch(url)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setFiles(data.files || [])
        }
        setDeleteConfirm(null)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  const confirmDelete = (fileId: string) => {
    setDeleteConfirm(fileId)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading files...</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No files or folders yet</p>
        <p className="text-sm">Upload some files to get started</p>
      </div>
    )
  }

  return (
    <>
      {/* Share Modal */}
      {shareModal && (
        <ShareModal
          isOpen={true}
          onClose={closeShareModal}
          fileId={shareModal.fileId}
          fileName={shareModal.fileName}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete File</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this file? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Files & Folders</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {file.isFolder ? (
                        <FolderIcon className="h-6 w-6 text-blue-500" />
                      ) : (
                        <DocumentIcon className="h-6 w-6 text-gray-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => file.isFolder && onFolderClick?.(file.id)}
                          className={`text-sm font-medium truncate block ${
                            file.isFolder 
                              ? 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline' 
                              : 'text-gray-900'
                          }`}
                        >
                          {file.originalName}
                        </button>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {file.mimeType}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {file.isFolder ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      formatFileSize(file.size)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(file.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {file.owner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="truncate">{file.owner.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex justify-end space-x-1">
                      {!file.isFolder && (
                        <>
                          <button
                            onClick={() => handleView(file.id)}
                            className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View file"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(file.id, file.originalName)}
                            className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Download file"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleShare(file.id, file.originalName)}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Share"
                      >
                        <ShareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(file.id)}
                        className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
