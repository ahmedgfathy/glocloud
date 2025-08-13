'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'
import Sidebar from '@/components/Sidebar'
import { 
  FolderIcon, 
  ArrowLeftIcon, 
  CloudArrowUpIcon, 
  FolderPlusIcon, 
  ShareIcon 
} from '@heroicons/react/24/outline'

export default function FilesPage() {
  const { data: session, status } = useSession()
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [breadcrumb, setBreadcrumb] = useState<Array<{id: string, name: string}>>([])

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
  }

  const handleFolderClick = (folderId: string, folderName?: string) => {
    setCurrentFolder(folderId)
    if (folderName) {
      setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }])
    }
  }

  const handleBackClick = () => {
    if (breadcrumb.length > 0) {
      const newBreadcrumb = breadcrumb.slice(0, -1)
      setBreadcrumb(newBreadcrumb)
      setCurrentFolder(newBreadcrumb.length > 0 ? newBreadcrumb[newBreadcrumb.length - 1].id : null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    My Files
                  </h1>
                  <p className="text-gray-600 mt-1">Organize and share your documents</p>
                </div>
                
                {currentFolder && (
                  <button
                    onClick={handleBackClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                )}
              </div>
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3 border">
                <FolderIcon className="h-4 w-4 text-blue-600" />
                <span 
                  className={`cursor-pointer hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-white ${!currentFolder ? 'font-semibold text-blue-600 bg-white shadow-sm' : ''}`}
                  onClick={() => {
                    setCurrentFolder(null)
                    setBreadcrumb([])
                  }}
                >
                  Root
                </span>
                {breadcrumb.map((folder, index) => (
                  <div key={folder.id} className="flex items-center space-x-2">
                    <span className="text-gray-400">/</span>
                    <span 
                      className={`cursor-pointer hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-white ${index === breadcrumb.length - 1 ? 'font-semibold text-blue-600 bg-white shadow-sm' : ''}`}
                      onClick={() => {
                        const newBreadcrumb = breadcrumb.slice(0, index + 1)
                        setBreadcrumb(newBreadcrumb)
                        setCurrentFolder(folder.id)
                      }}
                    >
                      {folder.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                    Upload Files
                  </h2>
                  <p className="text-blue-100 mt-1">Upload files to {currentFolder ? 'current folder' : 'root directory'}</p>
                </div>
                <div className="p-6">
                  <FileUpload 
                    parentId={currentFolder}
                    onUploadSuccess={handleUploadSuccess}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FolderIcon className="h-6 w-6 mr-3" />
                    {currentFolder ? 'Folder Contents' : 'All Files'}
                  </h2>
                  <p className="text-green-100 mt-1">
                    {currentFolder ? 'Files and folders in current directory' : 'All your files and folders'}
                  </p>
                </div>
                <FileList 
                  parentId={currentFolder}
                  onFolderClick={handleFolderClick}
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
                    <span className="font-bold text-gray-900">0 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Available</span>
                    <span className="font-bold text-green-600">Unlimited</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" style={{width: '0%'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">0% of storage used</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3"></div>
                  Folder Actions
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    {currentFolder ? 'Current folder actions' : 'Root directory actions'}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center">
                        <FolderPlusIcon className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-semibold text-blue-700">Create Folder</p>
                          <p className="text-xs text-blue-600">Use sidebar action</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center">
                        <CloudArrowUpIcon className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-semibold text-green-700">Upload Files</p>
                          <p className="text-xs text-green-600">Use form above</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center">
                        <ShareIcon className="h-6 w-6 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-semibold text-purple-700">Share Files</p>
                          <p className="text-xs text-purple-600">Click file actions</p>
                        </div>
                      </div>
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
