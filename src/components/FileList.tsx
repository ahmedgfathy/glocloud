'use client'

import { useEffect, useState } from 'react'
import { 
  DocumentIcon, 
  FolderIcon, 
  ShareIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  ListBulletIcon
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FolderIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No files or folders yet</h3>
        <p className="text-gray-500">Upload some files to get started</p>
      </div>
    )
  }

  const GridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
      {files.map((file) => (
        <div key={file.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 p-4 group">
          <div className="flex flex-col items-center text-center">
            {/* File Icon */}
            <div className="w-12 h-12 mb-3 flex items-center justify-center">
              {file.isFolder ? (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FolderIcon className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DocumentIcon className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            
            {/* File Name */}
            <button
              onClick={() => file.isFolder && onFolderClick?.(file.id)}
              className={`text-sm font-medium truncate w-full ${
                file.isFolder 
                  ? 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline' 
                  : 'text-gray-900'
              }`}
              title={file.originalName}
            >
              {file.originalName}
            </button>
            
            {/* File Size */}
            <p className="text-xs text-gray-500 mt-1">
              {file.isFolder ? "Folder" : formatFileSize(file.size)}
            </p>
            
            {/* Actions - Show on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3 flex space-x-1">
              {!file.isFolder && (
                <>
                  <button
                    onClick={() => handleView(file.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View file"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(file.id, file.originalName)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title="Download file"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => handleShare(file.id, file.originalName)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Share"
              >
                <ShareIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => confirmDelete(file.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const ListView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Modified
            </th>
            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-200">
              <td className="px-8 py-6 whitespace-nowrap">
                <div className="flex items-center space-x-4">
                  {file.isFolder ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FolderIcon className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                      <DocumentIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => file.isFolder && onFolderClick?.(file.id)}
                      className={`text-sm font-semibold truncate block ${
                        file.isFolder 
                          ? 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline' 
                          : 'text-gray-900'
                      }`}
                    >
                      {file.originalName}
                    </button>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {file.mimeType}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                {file.isFolder ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  formatFileSize(file.size)
                )}
              </td>
              <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-medium">
                {formatDate(file.createdAt)}
              </td>
              <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-semibold text-white">
                      {file.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="truncate font-medium">{file.owner.name}</span>
                </div>
              </td>
              <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                <div className="flex justify-end space-x-2">
                  {!file.isFolder && (
                    <>
                      <button
                        onClick={() => handleView(file.id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                        title="View file"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(file.id, file.originalName)}
                        className="inline-flex items-center p-2 border border-transparent rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                        title="Download file"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleShare(file.id, file.originalName)}
                    className="inline-flex items-center p-2 border border-transparent rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                    title="Share"
                  >
                    <ShareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(file.id)}
                    className="inline-flex items-center p-2 border border-transparent rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
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
  )

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
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-2xl bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <TrashIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">Delete File</h3>
              <div className="mt-3 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this file? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header with view toggle */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Browse and manage your files</h3>
              <p className="text-sm text-gray-600 mt-1">View, organize, and share your documents</p>
            </div>
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ListBulletIcon className="h-4 w-4 mr-2" />
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4 mr-2" />
                Grid
              </button>
            </div>
          </div>
        </div>
        
        {/* File content */}
        {viewMode === 'grid' ? <GridView /> : <ListView />}
      </div>
    </>
  )
}
