'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  DocumentIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  LockClosedIcon,
  CheckIcon,
  XMarkIcon,
  FolderIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'

interface PublicFileData {
  id: string
  originalName: string
  size: number
  calculatedSize?: number
  mimeType: string
  isFolder: boolean
  createdAt: string
  hasPassword: boolean
  downloads: number
  maxDownloads?: number
  expiresAt?: string
}

export default function PublicSharePage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const [fileData, setFileData] = useState<PublicFileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (token) {
      fetchFileData()
    }
  }, [token])

  const fetchFileData = async () => {
    try {
      const response = await fetch(`/api/share/${token}`)
      
      if (response.status === 401) {
        setPasswordRequired(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'File not found or link expired')
        setLoading(false)
        return
      }

      const data = await response.json()
      setFileData(data.file)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching file data:', error)
      setError('Failed to load file data')
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/share/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Invalid password')
        setLoading(false)
        return
      }

      const data = await response.json()
      setFileData(data.file)
      setPasswordRequired(false)
      setLoading(false)
    } catch (error) {
      console.error('Error verifying password:', error)
      setError('Failed to verify password')
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)

    try {
      const response = await fetch(`/api/share/${token}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: passwordRequired ? password : undefined })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Download failed')
        setDownloading(false)
        return
      }

      // Get filename from response headers or use original name
      const contentDisposition = response.headers.get('content-disposition')
      let filename = fileData?.originalName || 'download'
      
      if (contentDisposition) {
        const matches = /filename="(.+)"/.exec(contentDisposition)
        if (matches) filename = matches[1]
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Refresh file data to update download count
      fetchFileData()
    } catch (error) {
      console.error('Error downloading file:', error)
      setError('Download failed')
    } finally {
      setDownloading(false)
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

  const getFileIcon = () => {
    if (fileData?.isFolder) {
      return <FolderIcon className="h-8 w-8 text-white" />
    }

    const mimeType = fileData?.mimeType || ''
    
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-white" />
    } else if (mimeType.startsWith('video/')) {
      return <FilmIcon className="h-8 w-8 text-white" />
    } else if (mimeType.startsWith('audio/')) {
      return <MusicalNoteIcon className="h-8 w-8 text-white" />
    } else if (mimeType.includes('text/') || mimeType.includes('json') || mimeType.includes('css') || mimeType.includes('javascript')) {
      return <CodeBracketIcon className="h-8 w-8 text-white" />
    } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) {
      return <DocumentTextIcon className="h-8 w-8 text-white" />
    } else {
      return <DocumentIcon className="h-8 w-8 text-white" />
    }
  }

  const isExpired = fileData?.expiresAt ? new Date(fileData.expiresAt) < new Date() : false
  const isDownloadLimitReached = fileData?.maxDownloads ? fileData.downloads >= fileData.maxDownloads : false

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <LockClosedIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Required</h1>
            <p className="text-gray-600">This shared file is password protected</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Access File'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared File</h1>
            <p className="text-gray-600">Download the file shared with you</p>
          </div>

          {/* File Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center space-x-4 text-white">
                <div className="bg-white/20 rounded-lg p-3 text-white">
                  {getFileIcon()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{fileData?.originalName}</h2>
                  <p className="text-blue-100">{formatFileSize(fileData?.calculatedSize || fileData?.size || 0)}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* File Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">File Type</p>
                  <p className="font-medium text-gray-900">
                    {fileData?.isFolder ? 'Folder' : (fileData?.mimeType || 'Unknown')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uploaded</p>
                  <p className="font-medium text-gray-900">
                    {fileData?.createdAt ? formatDate(fileData.createdAt) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Downloads</p>
                  <p className="font-medium text-gray-900">
                    {fileData?.downloads || 0}
                    {fileData?.maxDownloads && ` / ${fileData.maxDownloads}`}
                  </p>
                </div>
                {fileData?.expiresAt && (
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(fileData.expiresAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {isExpired && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <XMarkIcon className="h-5 w-5 inline mr-2" />
                  This share link has expired
                </div>
              )}

              {isDownloadLimitReached && (
                <div className="bg-orange-100 border border-orange-300 text-orange-700 px-4 py-3 rounded-lg mb-4">
                  <XMarkIcon className="h-5 w-5 inline mr-2" />
                  Download limit reached
                </div>
              )}

              {/* Download Button */}
              <div className="flex space-x-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading || isExpired || isDownloadLimitReached}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>{downloading ? 'Downloading...' : 'Download File'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Powered by PM Cloud Storage System
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
