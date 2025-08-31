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
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full animate-float"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen relative z-10 pr-8">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm animate-fade-in">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-float"></div>
                <div className="absolute bottom-4 left-1/3 w-16 h-16 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
              </div>
              
              <div className="relative p-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 animate-scale-in">
                  <DocumentIcon className="inline-block h-10 w-10 mr-3 text-blue-600" />
                  My Files
                </h1>
                <p className="text-lg text-gray-600 flex items-center animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                  <FolderIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Organize and manage your files securely
                </p>
              </div>
            </div>

            {/* Enhanced Search and Filter Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Search Bar */}
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200 group-hover:bg-white/70"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FunnelIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <select
                    value={fileTypeFilter}
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                    className="block w-full pl-12 pr-10 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 appearance-none min-w-[200px] transition-all duration-200 group-hover:bg-white/70"
                  >
                    {fileTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
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
                    className="group relative px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-105 whitespace-nowrap font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              {/* Active Filters Display */}
              {(searchTerm || fileTypeFilter !== 'all') && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {searchTerm && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-blue-100/80 backdrop-blur-sm text-blue-800 border border-blue-200">
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-3 hover:text-blue-600 text-lg font-semibold"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {fileTypeFilter !== 'all' && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-purple-100/80 backdrop-blur-sm text-purple-800 border border-purple-200">
                      <FunnelIcon className="h-4 w-4 mr-2" />
                      Type: {fileTypeOptions.find(opt => opt.value === fileTypeFilter)?.label}
                      <button
                        onClick={() => setFileTypeFilter('all')}
                        className="ml-3 hover:text-purple-600 text-lg font-semibold"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
              
              {currentFolder && (
                <div className="mt-6">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      console.log('Back button clicked, currentFolder:', currentFolder, 'breadcrumb:', breadcrumb)
                      handleBackClick()
                    }}
                    className="group relative flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg"
                  >
                    <ArrowLeftIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Back to Parent Folder</span>
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Files List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden mb-8 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
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
