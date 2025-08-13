'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  UserIcon, 
  EnvelopeIcon,
  KeyIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  IdentificationIcon,
  PhoneIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  isExternal: boolean
  department?: string
  title?: string
  employeeId?: string
  mobile?: string
  photo?: string
  phoneExt?: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    title: '',
    employeeId: '',
    mobile: '',
    phoneExt: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Predefined list of departments
  const predefinedDepartments = [
    'Human Resources',
    'Information Technology',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'Engineering',
    'Design',
    'Customer Service',
    'Administration',
    'Legal',
    'Quality Assurance',
    'Research and Development',
    'Procurement',
    'Security'
  ].sort()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user) {
      fetchUserProfile()
    }
  }, [status, session, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          name: userData.name || session?.user?.name || '',
          email: userData.email || session?.user?.email || '',
          department: userData.department || '',
          title: userData.title || '',
          employeeId: userData.employeeId || '',
          mobile: userData.mobile || '',
          phoneExt: userData.phoneExt || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        // If API fails, at least populate from session
        if (session?.user) {
          setFormData({
            name: session.user.name || '',
            email: session.user.email || '',
            department: '',
            title: '',
            employeeId: '',
            mobile: '',
            phoneExt: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
          setUser({
            id: session.user.id || '',
            email: session.user.email || '',
            name: session.user.name || '',
            role: session.user.role || '',
            isActive: true,
            isExternal: session.user.isExternal || false,
            department: '',
            title: '',
            employeeId: '',
            mobile: '',
            photo: '',
            phoneExt: '',
            createdAt: new Date().toISOString()
          })
        }
        setError('Failed to fetch complete profile. Using session data.')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Fallback to session data
      if (session?.user) {
        setFormData({
          name: session.user.name || '',
          email: session.user.email || '',
          department: '',
          title: '',
          employeeId: '',
          mobile: '',
          phoneExt: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setUser({
          id: session.user.id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          role: session.user.role || '',
          isActive: true,
          isExternal: session.user.isExternal || false,
          department: '',
          title: '',
          employeeId: '',
          mobile: '',
          photo: '',
          phoneExt: '',
          createdAt: new Date().toISOString()
        })
      }
      setError('Error fetching profile. Using session data.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        return
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long')
        return
      }
      if (!formData.currentPassword) {
        setError('Current password is required to change password')
        return
      }
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        title: formData.title,
        employeeId: formData.employeeId,
        mobile: formData.mobile,
        phoneExt: formData.phoneExt
      }

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setSuccess('Profile updated successfully')
        setEditing(false)
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Update session if name changed
        if (session?.user && formData.name !== session.user.name) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: formData.name
            }
          })
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Error updating profile')
    }
  }

  const cancelEdit = () => {
    setEditing(false)
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      title: user?.title || '',
      employeeId: user?.employeeId || '',
      mobile: user?.mobile || '',
      phoneExt: user?.phoneExt || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setError(null)
    setSuccess(null)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto content-scrollable p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto content-scrollable p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Profile Settings
                    </h1>
                    <p className="text-gray-600 text-lg">Manage your account information and settings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center shadow-lg transform hover:scale-105"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 flex items-center"
                      >
                        <XMarkIcon className="h-5 w-5 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center shadow-lg"
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                {/* Success/Error Messages */}
                {success && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={!editing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!editing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <div className="relative">
                          <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                          <select
                            value={formData.department}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                            disabled={!editing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 appearance-none bg-white"
                          >
                            <option value="">Select a department</option>
                            {predefinedDepartments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title
                        </label>
                        <div className="relative">
                          <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            disabled={!editing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your job title"
                          />
                        </div>
                      </div>

                      {/* Employee ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee ID
                        </label>
                        <div className="relative">
                          <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                            disabled={!editing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your employee ID"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Mobile */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                            disabled={!editing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your mobile number"
                          />
                        </div>
                      </div>

                      {/* Phone Extension */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Extension
                        </label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.phoneExt}
                            onChange={(e) => setFormData({...formData, phoneExt: e.target.value})}
                            disabled={!editing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Enter your phone extension"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Role and Status (Read-only) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-gray-700 font-medium">
                          {user?.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-gray-700 font-medium">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  {editing && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="password"
                              value={formData.currentPassword}
                              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter current password"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="password"
                              value={formData.newPassword}
                              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter new password"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Leave password fields empty if you don't want to change your password.
                      </p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer for content area only */}
        <Footer />
      </main>
    </div>
  )
}
