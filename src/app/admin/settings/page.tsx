'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  CogIcon, 
  ServerIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  PaintBrushIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'

interface CompanySettings {
  id: string;
  companyName: string;
  companyLogo: string | null;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  isConfigured: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('system')
  
  // System Settings State
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

  // Company Settings State
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)
  const [companySaving, setCompanySaving] = useState(false)
  const [companyMessage, setCompanyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Company Form states
  const [companyName, setCompanyName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [secondaryColor, setSecondaryColor] = useState('#1e40af')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'company') {
      fetchCompanySettings()
    }
  }, [activeTab])

  const fetchCompanySettings = async () => {
    try {
      const response = await fetch('/api/admin/company')
      if (response.ok) {
        const data = await response.json()
        const settings = data.settings
        setCompanySettings(settings)
        setCompanyName(settings.companyName)
        setPrimaryColor(settings.primaryColor)
        setSecondaryColor(settings.secondaryColor)
        setContactEmail(settings.contactEmail || '')
        setContactPhone(settings.contactPhone || '')
        setAddress(settings.address || '')
        setWebsite(settings.website || '')
        setDescription(settings.description || '')
        if (settings.companyLogo) {
          setLogoPreview(settings.companyLogo)
        }
      }
    } catch (error) {
      console.error('Error fetching company settings:', error)
    } finally {
      setCompanyLoading(false)
    }
  }

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCompanySaving(true)
    setCompanyMessage(null)

    try {
      const formData = new FormData()
      formData.append('companyName', companyName)
      formData.append('primaryColor', primaryColor)
      formData.append('secondaryColor', secondaryColor)
      formData.append('contactEmail', contactEmail)
      formData.append('contactPhone', contactPhone)
      formData.append('address', address)
      formData.append('website', website)
      formData.append('description', description)
      
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const response = await fetch('/api/admin/company', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setCompanySettings(data.settings)
        setCompanyMessage({ type: 'success', text: 'Company settings updated successfully!' })
        
        // Trigger favicon update
        localStorage.setItem('companySettingsUpdated', Date.now().toString())
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'companySettingsUpdated',
          newValue: Date.now().toString()
        }))
        
        // Refresh the page to apply new styles and metadata
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setCompanyMessage({ type: 'error', text: 'Failed to update settings' })
      }
    } catch (error) {
      console.error('Error updating company settings:', error)
      setCompanyMessage({ type: 'error', text: 'An error occurred while updating settings' })
    } finally {
      setCompanySaving(false)
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

  const tabs = [
    { id: 'system', name: 'System Settings', icon: CogIcon },
    ...(session.user.role === 'SUPER_ADMIN' ? [{ id: 'company', name: 'Company Settings', icon: BuildingOfficeIcon }] : [])
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
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
                      Settings
                    </h1>
                    <p className="text-gray-600 text-lg">Manage system configuration and company settings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
                <nav className="flex space-x-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

          {/* Tab Content */}
          {activeTab === 'system' && (
            <div>
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
          )}

          {activeTab === 'company' && session.user.role === 'SUPER_ADMIN' && (
            <div>
              {companyMessage && (
                <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                  companyMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {companyMessage.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
                  <span>{companyMessage.text}</span>
                </div>
              )}

              {companyLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <form onSubmit={handleCompanySubmit} className="space-y-8">
                  {/* Company Branding Section */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                      <PaintBrushIcon className="h-6 w-6 text-blue-600" />
                      <span>Company Branding</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Logo
                        </label>
                        <div className="flex items-center space-x-4">
                          {logoPreview && (
                            <div className="w-16 h-16 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden">
                              <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label
                              htmlFor="logo-upload"
                              className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-100 flex items-center space-x-2"
                            >
                              <PhotoIcon className="h-5 w-5" />
                              <span>Upload Logo</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-12 h-12 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-12 h-12 rounded border border-gray-300"
                          />
                          <input
                            type="text"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Information Section */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                      <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                      <span>Company Information</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>Contact Email</span>
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                          <PhoneIcon className="h-4 w-4" />
                          <span>Contact Phone</span>
                        </label>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                          <GlobeAltIcon className="h-4 w-4" />
                          <span>Website</span>
                        </label>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>Address</span>
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                          <DocumentTextIcon className="h-4 w-4" />
                          <span>Company Description</span>
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Brief description of your company..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={companySaving}
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {companySaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5" />
                          <span>Save Company Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          </div>
        </div>
        
        {/* Footer for content area only */}
        <Footer />
      </main>
    </div>
  )
}
