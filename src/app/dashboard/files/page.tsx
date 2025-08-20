'use client'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useMemo } from 'react'
import FileList from '@/components/FileList'
import FileUpload from '@/components/FileUpload'
import Sidebar from '@/components/Sidebar'
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
      // Go back one level in breadcrumb
      const newBreadcrumb = breadcrumb.slice(0, -1)
      setBreadcrumb(newBreadcrumb)
      setCurrentFolder(newBreadcrumb.length > 0 ? newBreadcrumb[newBreadcrumb.length - 1].id : null)
    } else if (currentFolder) {
      // If no breadcrumb but we're in a folder, go back to root
      setCurrentFolder(null)
      setBreadcrumb([])
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
    { value: 'code', label: 'Code Files', icon: '💻' },
    { value: 'text', label: 'Text Files', icon: '📝' },
    { value: 'executables', label: 'Executable Files', icon: '⚙️' },
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
          <div className="max-w-6xl mx-auto">
            {/* Simple Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                My Files
              </h1>
              
              {/* Search and Filter Bar */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={fileTypeFilter}
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 appearance-none min-w-[200px]"
                  >
                    {fileTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                {(searchTerm || fileTypeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFileTypeFilter('all')
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              {/* Active Filters Display */}
              {(searchTerm || fileTypeFilter !== 'all') && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {fileTypeFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      <FunnelIcon className="h-4 w-4 mr-1" />
                      Type: {fileTypeOptions.find(opt => opt.value === fileTypeFilter)?.label}
                      <button
                        onClick={() => setFileTypeFilter('all')}
                        className="ml-2 hover:text-green-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
              
              {currentFolder && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    console.log('Back button clicked, currentFolder:', currentFolder, 'breadcrumb:', breadcrumb)
                    handleBackClick()
                  }}
                  className="mt-4 flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            {/* Files List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <DocumentIcon className="h-6 w-6 mr-3" />
                  {currentFolder ? 'Folder Contents' : 'All Files'}
                  {(searchTerm || fileTypeFilter !== 'all') && (
                    <span className="ml-2 text-blue-200 text-sm font-normal">
                      (Filtered)
                    </span>
                  )}
                </h2>
                <p className="text-blue-100 mt-1">
                  {currentFolder ? 'Files and folders in current directory' : 'All your files and folders'}
                  {(searchTerm || fileTypeFilter !== 'all') && (
                    <span className="block mt-1 text-blue-200 text-sm">
                      Showing results for your search and filter criteria
                    </span>
                  )}
                </p>
              </div>
              <div className="overflow-y-auto content-scrollable">
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
        
      </main>
    </div>
  )
}
