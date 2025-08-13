'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { CogIcon, ServerIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [settings, setSettings] = useState({
    maxFileSize: '100',
    allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,mp4,mov,avi,zip,rar',
    emailNotifications: true,
    autoApproveUsers: false,
    maxStoragePerUser: '1000',
    sessionTimeout: '24'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage('Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Error saving settings')
      }
    } catch (error) {
      setMessage('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to view this page.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CogIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    System Settings
                  </h1>
                  <p className="text-gray-600 text-lg">Manage system configuration and preferences</p>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mb-6 rounded-2xl p-4 border ${message.includes('Error') 
              ? 'bg-red-50 text-red-800 border-red-200' 
              : 'bg-green-50 text-green-800 border-green-200'}`}>
              {message}
            </div>
          )}

          <div className="space-y-8">
            {/* File Upload Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <ServerIcon className="h-5 w-5 text-white" />
                  </div>
                  File Upload Settings
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max File Size (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.maxFileSize}
                        onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Storage Per User (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.maxStoragePerUser}
                        onChange={(e) => setSettings({...settings, maxStoragePerUser: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Allowed File Types (comma-separated)
                    </label>
                    <textarea
                      value={settings.allowedFileTypes}
                      onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                    <ShieldCheckIcon className="h-5 w-5 text-white" />
                  </div>
                  Security Settings
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Auto-approve new users
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Automatically approve new user registrations
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({...settings, autoApproveUsers: !settings.autoApproveUsers})}
                      className={`${
                        settings.autoApproveUsers ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg`}
                    >
                      <span
                        className={`${
                          settings.autoApproveUsers ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                      className="w-full sm:w-48 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
                    <EnvelopeIcon className="h-5 w-5 text-white" />
                  </div>
                  Email Settings
                </h3>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Send email notifications for file shares and system updates
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                      className={`${
                        settings.emailNotifications ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg`}
                    >
                      <span
                        className={`${
                          settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CogIcon className="h-5 w-5 mr-3" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
