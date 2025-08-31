'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { 
  ShareIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UserIcon,
  DocumentIcon,
  FolderIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon
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
    permission: string
  }
}

export default function SharedFilesPage() {
  const { data: session, status } = useSession()
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (session) {
      fetchSharedFiles()
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full animate-float"></div>
          <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col h-screen relative z-10 pr-16">
          <div className="flex-1 overflow-y-auto content-scrollable p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin')
  }

  const fetchSharedFiles = async () => {
    try {
      const response = await fetch('/api/files/shared')
      if (response.ok) {
        const data = await response.json()
        // The API returns the array directly, not wrapped in an object
        setSharedFiles(data || [])
      }
    } catch (error) {
      console.error('Error fetching shared files:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (mimeType: string, isFolder: boolean) => {
    if (isFolder) return <FolderIcon className="h-8 w-8 text-yellow-500" />
    
    if (mimeType.startsWith('image/')) return <PhotoIcon className="h-8 w-8 text-green-500" />
    if (mimeType.startsWith('video/')) return <VideoCameraIcon className="h-8 w-8 text-purple-500" />
    if (mimeType.startsWith('audio/')) return <MusicalNoteIcon className="h-8 w-8 text-pink-500" />
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
      return <ArchiveBoxIcon className="h-8 w-8 text-orange-500" />
    }
    
    return <DocumentIcon className="h-8 w-8 text-blue-500" />
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
      'READ': 'bg-blue-100 text-blue-800',
      'WRITE': 'bg-green-100 text-green-800',
      'ADMIN': 'bg-purple-100 text-purple-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[permission as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {permission}
      </span>
    )
  }

  const filteredFiles = sharedFiles.filter(sharedFile =>
    sharedFile.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sharedFile.share.sharedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full animate-float"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen relative z-10 pr-16">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm animate-fade-in">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-float"></div>
                <div className="absolute bottom-4 left-1/3 w-16 h-16 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
              </div>
              
              <div className="relative p-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 animate-scale-in">
                  <ShareIcon className="inline-block h-10 w-10 mr-3 text-blue-600" />
                  Shared with Me
                </h1>
                <p className="text-lg text-gray-600 flex items-center animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                  <UserIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Files and folders that have been shared with you by other users
                </p>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Search Bar */}
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search shared files and owners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200 group-hover:bg-white/70"
                  />
                </div>
                
                {/* Stats Display */}
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <ShareIcon className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{filteredFiles.length}</span>
                    <span>shared files</span>
                  </div>
                </div>
              </div>
              
              {/* Active Search Display */}
              {searchTerm && (
                <div className="mt-6 flex flex-wrap gap-3">
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
                </div>
              )}
            </div>

            {/* Enhanced Files List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden mb-8 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <ShareIcon className="h-6 w-6 mr-3" />
                  Shared Files
                  {searchTerm && (
                    <span className="ml-2 text-blue-200 text-sm font-normal">
                      (Filtered)
                    </span>
                  )}
                </h2>
                <p className="text-blue-100 mt-1">
                  Files and folders shared with you by other users
                  {searchTerm && (
                    <span className="block mt-1 text-blue-200 text-sm">
                      Showing results for your search criteria
                    </span>
                  )}
                </p>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12 bg-white/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-12 text-center bg-white/50">
                  <ShareIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No shared files</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'No files match your search criteria.' : 'No files have been shared with you yet.'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-y-auto content-scrollable">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50/80 backdrop-blur-sm">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            File
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Permission
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Shared
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                        {filteredFiles.map((sharedFile) => (
                          <tr key={sharedFile.id} className="hover:bg-white/80 transition-all duration-200 group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                                  {getFileIcon(sharedFile.mimeType, sharedFile.isFolder)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {sharedFile.originalName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {sharedFile.mimeType}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {sharedFile.share.sharedBy.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {sharedFile.share.sharedBy.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getPermissionBadge(sharedFile.share.permission)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {sharedFile.isFolder ? (
                                <span className="text-gray-500 italic">Folder</span>
                              ) : (
                                formatFileSize(sharedFile.size)
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-500">
                                <ClockIcon className="h-4 w-4 mr-2 text-blue-500" />
                                {formatDate(sharedFile.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-3">
                                <button className="group/btn relative px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center">
                                  <EyeIcon className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                                  View
                                </button>
                                {!sharedFile.isFolder && (
                                  <button className="group/btn relative px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center">
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                                    Download
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
      </main>
    </div>
  )
}
