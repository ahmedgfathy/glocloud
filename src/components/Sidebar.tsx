'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  HomeIcon,
  FolderIcon,
  ShareIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

interface CompanySettings {
  companyName: string;
  companyLogo: string | null;
}

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN'
  
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'PM Cloud',
    companyLogo: null
  })

  useEffect(() => {
    // Fetch company settings for display
    const fetchCompanySettings = async () => {
      try {
        const response = await fetch('/api/admin/company')
        if (response.ok) {
          const data = await response.json()
          setCompanySettings({
            companyName: data.settings.companyName,
            companyLogo: data.settings.companyLogo
          })
        }
      } catch (error) {
        console.error('Error fetching company settings:', error)
      }
    }

    if (session?.user) {
      fetchCompanySettings()
    }
  }, [session])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Files', href: '/dashboard/files', icon: FolderIcon },
    { name: 'Shared with Me', href: '/dashboard/shared', icon: ShareIcon },
  ]

  const adminNavigation = [
    { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
    { name: 'File Structure', href: '/admin/files', icon: FolderIcon },
    { name: 'System Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ]

  const isActive = (path: string) => {
    // Exact match for most paths, but special handling for dashboard vs dashboard/files
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (path === '/dashboard/files') {
      return pathname === '/dashboard/files'
    }
    if (path === '/dashboard/shared') {
      return pathname === '/dashboard/shared'
    }
    // For admin paths, allow sub-paths
    if (path.startsWith('/admin/')) {
      return pathname === path || pathname.startsWith(path + '/')
    }
    // Exact match for other paths
    return pathname === path
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 flex flex-col w-64 bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl z-30 h-screen">
      {/* Company Logo Section */}
      <div className="px-6 py-6 bg-gradient-to-r from-black to-gray-900 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-blue-400/30">
            {companySettings.companyLogo ? (
              <Image
                src={companySettings.companyLogo}
                alt="Company Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallbackIcon) {
                    fallbackIcon.classList.remove('hidden')
                  }
                }}
              />
            ) : (
              <CloudIcon className="h-10 w-10 text-white" />
            )}
            <CloudIcon className="h-10 w-10 text-white hidden" />
          </div>
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold tracking-tight mb-1">{companySettings.companyName}</h1>
            <p className="text-blue-300 text-sm font-medium opacity-90">Enterprise File Management</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      {session?.user && (
        <div className="px-6 py-4 bg-gray-800/40 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 rounded-xl border border-gray-600/30 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-blue-400/30">
              <span className="text-white font-bold text-lg">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <Link 
                href="/profile"
                className="text-white text-sm font-semibold truncate hover:text-blue-300 transition-colors cursor-pointer block mb-1"
              >
                {session.user.name}
              </Link>
              <p className="text-blue-200 text-sm font-medium truncate mb-2">
                ID: {session.user.employeeId || session.user.id?.substring(0, 12) || 'N/A'}
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm border border-emerald-400/30">
                {session.user.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col pt-6 pb-4 min-h-0">
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="mb-4">
            <h3 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Navigation
            </h3>
          </div>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                isActive(item.href)
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-white'
              }`} />
              {item.name}
            </Link>
          ))}
          
          {isAdmin && (
            <>
              <div className="border-t border-gray-700 mt-8 pt-6">
                <h3 className="px-4 text-xs font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  Administration
                </h3>
                <div className="space-y-2">
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-300 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-pink-600/20 hover:text-white'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-white'
                      }`} />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </nav>

        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-700">
          <button
            onClick={async () => {
              try {
                await signOut({ callbackUrl: '/auth/signin', redirect: true })
              } catch (error) {
                console.error('Logout error:', error)
                // Force redirect if signOut fails
                window.location.href = '/auth/signin'
              }
            }}
            className="w-full group flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-200 transform hover:scale-105"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
