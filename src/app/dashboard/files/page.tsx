'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useMemo } from 'react'
import FileList from '@/components/FileList'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import { 
  FolderIcon, 
  ArrowLeftIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'

export default function FilesPage() {
  const { data: session, status } = useSession()
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [breadcrumb, setBreadcrumb] = useState<Array<{id: string, name: string}>>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('all')

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

  const fileTypeOptions = [
    { value: 'all', label: 'All Files', icon: '📁' },
    { value: 'documents', label: 'Documents', icon: '📄' },
    { value: 'images', label: 'Images', icon: '🖼️' },
    { value: 'videos', label: 'Videos', icon: '🎥' },
    { value: 'audio', label: 'Audio', icon: '🎵' },
    { value: 'archives', label: 'Archives', icon: '🗜️' },
    { value: 'spreadsheets', label: 'Spreadsheets', icon: '📊' },
    { value: 'presentations', label: 'Presentations', icon: '📈' },
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      My Files
                    </h1>
                    <p className="text-gray-600 mt-1">Browse and manage your documents</p>
                  </div>
                  
                  {currentFolder && (
                    <button
                      onClick={handleBackClick}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                      <span>Back</span>
                    </button>
                  )}
                </div>
                
                {/* Breadcrumb - Only show when in subfolder */}
                {currentFolder && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 border mb-6">
                    <FolderIcon className="h-5 w-5 text-blue-600" />
                    <span 
                      className="cursor-pointer hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-white font-medium"
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
                          className={`cursor-pointer hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-white font-medium ${index === breadcrumb.length - 1 ? 'font-bold text-blue-600 bg-white shadow-sm' : ''}`}
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
                )}

                {/* Search and Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search files by name, date, or extension (.docx, .pdf, etc.)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
                    />
                  </div>

                  {/* File Type Filter */}
                  <div className="relative">
                    <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={fileTypeFilter}
                      onChange={(e) => setFileTypeFilter(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm appearance-none bg-white"
                    >
                      {fileTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Files List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <DocumentIcon className="h-6 w-6 mr-3" />
                  {currentFolder ? 'Folder Contents' : 'All Files'}
                </h2>
                <p className="text-blue-100 mt-1">
                  {searchTerm ? `Search results for "${searchTerm}"` : 
                   currentFolder ? 'Files and folders in current directory' : 'All your files and folders'}
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto content-scrollable">
                <FileList 
                  parentId={currentFolder}
                  onFolderClick={handleFolderClick}
                  refreshTrigger={refreshTrigger}
                  searchTerm={searchTerm}
                  fileTypeFilter={fileTypeFilter}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer for content area only */}
        <Footer />
      </main>
    </div>
  )
}
