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
                </h2>
                <p className="text-blue-100 mt-1">
                  {currentFolder ? 'Files and folders in current directory' : 'All your files and folders'}
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
