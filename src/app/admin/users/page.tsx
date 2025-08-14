'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  UserIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'

interface User {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE'
  isActive: boolean
  isExternal: boolean
  department?: string
  employeeId?: string
  mobile?: string
  phoneExt?: string
  title?: string
  createdAt: string
  updatedAt: string
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

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
    // Add defensive checks
    if (!router) return
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.role
      if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
      
      fetchUsers()
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        // The API returns { users: [...] } structure
        setUsers(Array.isArray(data.users) ? data.users : [])
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        setError(errorData.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId))
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Error deleting user')
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isActive: !currentStatus }
            : user
        ))
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      setError('Error updating user status')
    }
  }

  const handleEditUser = async (userId: string) => {
    // For now, we'll show an alert. Later this can be expanded to a modal
    const user = users.find(u => u.id === userId)
    if (user) {
      const newRole = prompt(
        `Edit role for ${user.name}\nCurrent role: ${user.role}\n\nEnter new role (EMPLOYEE, ADMIN, SUPER_ADMIN):`,
        user.role
      )
      
      if (newRole && ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'].includes(newRole.toUpperCase())) {
        try {
          const response = await fetch(`/api/users/${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              role: newRole.toUpperCase()
            }),
          })

          if (response.ok) {
            const data = await response.json()
            setUsers(users.map(user => 
              user.id === userId 
                ? { ...user, role: newRole.toUpperCase() as 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' }
                : user
            ))
            setError(null)
          } else {
            const errorData = await response.json()
            setError(errorData.error || 'Failed to update user role')
          }
        } catch (error) {
          console.error('Error updating user role:', error)
          setError('Error updating user role')
        }
      } else if (newRole !== null) {
        setError('Invalid role. Please use EMPLOYEE, ADMIN, or SUPER_ADMIN')
      }
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-gradient-to-r from-red-500 to-pink-600'
      case 'ADMIN':
        return 'bg-gradient-to-r from-blue-500 to-purple-600'
      case 'EMPLOYEE':
        return 'bg-gradient-to-r from-green-500 to-emerald-600'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <ShieldExclamationIcon className="h-3 w-3 mr-1" />
      case 'ADMIN':
        return <ShieldCheckIcon className="h-3 w-3 mr-1" />
      case 'EMPLOYEE':
        return <UserIcon className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  // Get unique departments for filter (combine predefined and existing)
  const existingDepartments = Array.from(new Set(
    users
      .map(user => user.department)
      .filter(dept => dept && dept.trim() !== '')
  ))
  
  const departments = Array.from(new Set([
    ...predefinedDepartments,
    ...existingDepartments
  ])).sort()

  // Filter users based on search term and department
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase().trim()
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.employeeId && user.employeeId.toLowerCase().includes(searchLower)) ||
      (user.mobile && user.mobile.replace(/\s/g, '').includes(searchTerm.replace(/\s/g, ''))) ||
      (user.phoneExt && user.phoneExt.includes(searchTerm.trim())) ||
      (user.department && user.department.toLowerCase().includes(searchLower)) ||
      (user.title && user.title.toLowerCase().includes(searchLower))

    const matchesDepartment = departmentFilter === '' || 
      (user.department && user.department === departmentFilter)

    return matchesSearch && matchesDepartment
  })

  if (status === 'loading') {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto content-scrollable p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const totalUsers = users.length
  const activeUsers = users.filter(user => user.isActive).length
  const adminUsers = users.filter(user => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN').length

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
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      User Management
                    </h1>
                    <p className="text-gray-600 text-lg">Manage system users, roles, and permissions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                    <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <div className="h-4 w-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                    <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Administrators</h3>
                    <p className="text-2xl font-bold text-purple-600">{adminUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Bar */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, employee ID, mobile, or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
                    />
                  </div>
                </div>

                {/* Department Filter */}
                <div>
                  <div className="relative">
                    <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm appearance-none bg-white"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              {(searchTerm || departmentFilter) && (
                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredUsers.length} of {totalUsers} users
                  {searchTerm && (
                    <span className="ml-2">
                      matching "<span className="font-medium text-blue-600">{searchTerm}</span>"
                    </span>
                  )}
                  {departmentFilter && (
                    <span className="ml-2">
                      in <span className="font-medium text-green-600">{departmentFilter}</span> department
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">All Users</h2>
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center shadow-lg transform hover:scale-105">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add User
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users match your search criteria</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto content-scrollable">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
                                  <UserIcon className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                                {user.employeeId && (
                                  <div className="text-xs text-gray-400">ID: {user.employeeId}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.department || 'Not assigned'}
                            </div>
                            {user.title && (
                              <div className="text-xs text-gray-500">{user.title}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.mobile && (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-1">Mobile:</span>
                                  {user.mobile}
                                </div>
                              )}
                              {user.phoneExt && (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-1">Ext:</span>
                                  {user.phoneExt}
                                </div>
                              )}
                              {!user.mobile && !user.phoneExt && (
                                <span className="text-xs text-gray-400">No contact info</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${getRoleBadgeColor(user.role)} text-white`}>
                              {getRoleIcon(user.role)}
                              <span className="ml-1">{user.role.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${
                                user.isActive 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                user.isExternal ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.isExternal ? 'External' : 'Internal'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {/* Activate/Deactivate Toggle */}
                              <button
                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                  user.isActive
                                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                }`}
                                title={user.isActive ? 'Deactivate User' : 'Activate User'}
                              >
                                {user.isActive ? (
                                  <ShieldExclamationIcon className="h-4 w-4" />
                                ) : (
                                  <ShieldCheckIcon className="h-4 w-4" />
                                )}
                              </button>
                              
                              {/* Edit User */}
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                title="Edit User Role"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              
                              {/* Delete User - Only Super Admin */}
                              {session?.user?.role === 'SUPER_ADMIN' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                  title="Delete User"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </main>
    </div>
  )
}
