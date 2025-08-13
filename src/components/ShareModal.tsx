'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, UserIcon, CheckIcon, LinkIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  name: string
  role: string
  isExternal: boolean
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: string
  fileName: string
}

export default function ShareModal({ isOpen, onClose, fileId, fileName }: ShareModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [permission, setPermission] = useState('VIEW')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [shareType, setShareType] = useState<'user' | 'public'>('user')
  const [publicLink, setPublicLink] = useState('')
  const [publicLinkCopied, setPublicLinkCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      // Reset form state when opening
      setSelectedUser('')
      setPermission('VIEW')
      setExpiresAt('')
      setMessage('')
      setPublicLink('')
      setPublicLinkCopied(false)
      setShareType('user')
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

  const handleShare = async () => {
    if (shareType === 'user' && !selectedUser) {
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
        // Auto-close after 1 second
        setTimeout(() => {
          onClose()
        }, 1000)
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

  const handleCreatePublicLink = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/files/${fileId}/public-share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: permission,
          expiresAt: expiresAt || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPublicLink(data.publicLink)
        setMessage('Public link created successfully!')
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to create public link')
      }
    } catch (error) {
      console.error('Error creating public link:', error)
      setMessage('Failed to create public link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setPublicLinkCopied(true)
      setTimeout(() => setPublicLinkCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Share File</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Sharing: <span className="font-medium">{fileName}</span>
            </p>
          </div>

          {/* Share Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setShareType('user')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  shareType === 'user'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserIcon className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Specific User</div>
                <div className="text-xs text-gray-500">Share with company users</div>
              </button>
              <button
                type="button"
                onClick={() => setShareType('public')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  shareType === 'public'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <LinkIcon className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Public Link</div>
                <div className="text-xs text-gray-500">Share with anyone</div>
              </button>
            </div>
          </div>

          {shareType === 'user' && (
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
          )}

          {shareType === 'public' && publicLink && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public Link
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={publicLink}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(publicLink)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    publicLinkCopied
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {publicLinkCopied ? (
                    <>
                      <CheckIcon className="h-4 w-4 inline mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="h-4 w-4 inline mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

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

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message.includes('successfully') && <CheckIcon className="h-4 w-4 inline mr-1" />}
              {message}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            {shareType === 'user' ? (
              <button
                onClick={handleShare}
                disabled={loading || !selectedUser}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sharing...' : 'Share File'}
              </button>
            ) : (
              <button
                onClick={handleCreatePublicLink}
                disabled={loading}
                className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Link...' : publicLink ? 'Update Link' : 'Create Public Link'}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {shareType === 'public' && publicLink ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
