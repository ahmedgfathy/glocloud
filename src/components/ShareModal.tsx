'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, UserIcon, CheckIcon, LinkIcon, ClipboardIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  name: string
  role: string
  isExternal: boolean
}

interface PublicShare {
  id: string
  token: string
  shareUrl: string
  hasPassword: boolean
  downloads: number
  maxDownloads?: number
  expiresAt?: string
  createdAt: string
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  fileName: string
}

export default function ShareModal({ isOpen, onClose, fileId, fileName }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'public'>('users')
  
  // User sharing state
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [permission, setPermission] = useState('VIEW')
  const [expiresAt, setExpiresAt] = useState('')
  
  // Public sharing state
  const [publicShares, setPublicShares] = useState<PublicShare[]>([])
  const [publicPassword, setPublicPassword] = useState('')
  const [publicMaxDownloads, setPublicMaxDownloads] = useState('')
  const [publicExpiresAt, setPublicExpiresAt] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      fetchPublicShares()
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchPublicShares = async () => {
    try {
      const response = await fetch(`/api/files/${fileId}/public-share`)
      if (response.ok) {
        const data = await response.json()
        setPublicShares(data.shares || [])
      }
    } catch (error) {
      console.error('Error fetching public shares:', error)
    }
  }

  const handleUserShare = async () => {
    if (!selectedUser) {
      setMessage('Please select a user to share with')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/files/${fileId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sharedWith: selectedUser,
          permissions: permission,
          expiresAt: expiresAt || null
        })
      })

      if (response.ok) {
        setMessage('File shared successfully!')
        setTimeout(() => {
          setMessage('')
          setSelectedUser('')
          setPermission('VIEW')
          setExpiresAt('')
        }, 1500)
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to share file')
      }
    } catch (error) {
      console.error('Error sharing file:', error)
      setMessage('Failed to share file')
    } finally {
      setLoading(false)
    }
  }

  const handlePublicShare = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/files/${fileId}/public-share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: publicPassword || null,
          maxDownloads: publicMaxDownloads ? parseInt(publicMaxDownloads) : null,
          expiresAt: publicExpiresAt || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage('Public share link created successfully!')
        fetchPublicShares() // Refresh the list
        
        // Clear form
        setPublicPassword('')
        setPublicMaxDownloads('')
        setPublicExpiresAt('')
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to create public share link')
      }
    } catch (error) {
      console.error('Error creating public share:', error)
      setMessage('Failed to create public share link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl)
    setMessage('Link copied to clipboard!')
    setTimeout(() => setMessage(''), 2000)
  }

  const handleDeletePublicShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/public-share?shareId=${shareId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('Share link deleted successfully!')
        fetchPublicShares() // Refresh the list
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to delete share link')
      }
    } catch (error) {
      console.error('Error deleting public share:', error)
      setMessage('Failed to delete share link')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Share File</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Sharing: <span className="font-medium">{fileName}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserIcon className="h-4 w-4 inline mr-2" />
            Share with Users
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'public'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LinkIcon className="h-4 w-4 inline mr-2" />
            Public Links
          </button>
        </div>

        {/* User Sharing Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share with user
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                    {user.isExternal && ' - External'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission level
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VIEW">View only</option>
                <option value="DOWNLOAD">View and download</option>
                <option value="EDIT">Full access (view, download, edit)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires on (optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <button
              onClick={handleUserShare}
              disabled={loading || !selectedUser}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sharing...' : 'Share with User'}
            </button>
          </div>
        )}

        {/* Public Sharing Tab */}
        {activeTab === 'public' && (
          <div className="space-y-4">
            {/* Create new public share */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Create Public Share Link</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password protection (optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={publicPassword}
                    onChange={(e) => setPublicPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Download limit (optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 10"
                    value={publicMaxDownloads}
                    onChange={(e) => setPublicMaxDownloads(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires on (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={publicExpiresAt}
                    onChange={(e) => setPublicExpiresAt(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <button
                  onClick={handlePublicShare}
                  disabled={loading}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Creating...' : 'Create Public Link'}
                </button>
              </div>
            </div>

            {/* Existing public shares */}
            {publicShares.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Existing Public Links</h4>
                <div className="space-y-2">
                  {publicShares.map((share) => (
                    <div key={share.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex-1 bg-white border rounded px-3 py-2 font-mono text-sm text-gray-900 break-all">
                            {share.shareUrl}
                          </div>
                          {share.hasPassword && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex-shrink-0">
                              🔒 Protected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Downloads: {share.downloads}
                          {share.maxDownloads && ` / ${share.maxDownloads}`}
                          {share.expiresAt && ` • Expires: ${new Date(share.expiresAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1 flex-shrink-0">
                        <button
                          onClick={() => handleCopyLink(share.shareUrl)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded text-xs"
                          title="Copy link"
                        >
                          <ClipboardIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePublicShare(share.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded text-xs"
                          title="Delete link"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            message.includes('successfully') || message.includes('copied')
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {(message.includes('successfully') || message.includes('copied')) && <CheckIcon className="h-4 w-4 inline mr-1" />}
            {message}
          </div>
        )}

        <div className="flex space-x-3 pt-4 mt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
