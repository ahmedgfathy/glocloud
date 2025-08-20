'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ShareIcon, UserIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  email: string
  employeeId?: string
}

interface BulkShareModalProps {
  isOpen: boolean
  onClose: () => void
  fileIds: string[]
  fileNames: string[]
  onSuccess?: () => void
}

export default function BulkShareModal({ isOpen, onClose, fileIds, fileNames, onSuccess }: BulkShareModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [permission, setPermission] = useState('VIEW')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
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

  const handleBulkShare = async () => {
    if (!selectedUser) {
      setMessage('Please select a user to share with')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const sharePromises = fileIds.map(fileId => 
        fetch(`/api/files/${fileId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sharedWith: selectedUser,
            permissions: permission
          })
        })
      )

      const results = await Promise.all(sharePromises)
      const failed = results.filter(r => !r.ok)

      if (failed.length === 0) {
        setMessage(`Successfully shared ${fileIds.length} files!`)
        setTimeout(() => {
          setMessage('')
          setSelectedUser('')
          setPermission('VIEW')
          onSuccess?.()
          onClose()
        }, 2000)
      } else {
        setMessage(`Shared ${results.length - failed.length} of ${fileIds.length} files. ${failed.length} failed.`)
      }
    } catch (error) {
      console.error('Error bulk sharing files:', error)
      setMessage('Failed to share files')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ShareIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Share Multiple Files</h3>
              <p className="text-sm text-gray-500">Share {fileIds.length} files with another user</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* File List */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Files to share:</h4>
          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-1">
            {fileNames.slice(0, 5).map((name, index) => (
              <div key={index} className="text-sm text-gray-600 truncate">
                • {name}
              </div>
            ))}
            {fileNames.length > 5 && (
              <div className="text-sm text-gray-500 italic">
                ... and {fileNames.length - 5} more files
              </div>
            )}
          </div>
        </div>

        {/* User Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <div className="relative">
            <UserIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Permission Level */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permission Level
          </label>
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
          >
            <option value="VIEW">View Only</option>
            <option value="DOWNLOAD">View & Download</option>
          </select>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('Successfully') || message.includes('shared')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleBulkShare}
            disabled={loading || !selectedUser}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <ShareIcon className="h-4 w-4" />
                <span>Share Files</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
