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
  CloudIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface CompanySettings {
  companyName: string;
  companyLogo: string | null;
}

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN'
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  
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

  const superAdminNavigation = [
    { name: 'Company Settings', href: '/admin/company', icon: BuildingOfficeIcon },
  ]

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 flex flex-col w-64 bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl z-30">
      {/* Combined Logo and User Info */}
      {session?.user && (
        <div className="px-6 py-6 bg-black border-b border-gray-700">
          {/* Logo and Company Name */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              {companySettings.companyLogo ? (
                <Image
                  src={companySettings.companyLogo}
                  alt="Company Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to CloudIcon if logo fails to load
                    e.currentTarget.style.display = 'none'
                    const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallbackIcon) {
                      fallbackIcon.classList.remove('hidden')
                    }
                  }}
                />
              ) : (
                <CloudIcon className="h-8 w-8 text-blue-600" />
              )}
              <CloudIcon className="h-8 w-8 text-blue-600 hidden" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl font-bold tracking-tight">{companySettings.companyName}</h1>
              <p className="text-gray-300 text-xs font-medium">File Management System</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <Link 
                href="/profile"
                className="text-white text-sm font-semibold truncate hover:text-blue-300 transition-colors cursor-pointer block"
              >
                {session.user.name}
              </Link>
              <p className="text-gray-300 text-xs truncate mb-1">
                {session.user.email}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm">
                {session.user.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        <nav className="flex-1 px-6 space-y-2">
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

          {isSuperAdmin && (
            <>
              <div className="border-t border-gray-700 mt-6 pt-6">
                <h3 className="px-4 text-xs font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Super Admin
                </h3>
                <div className="space-y-2">
                  {superAdminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-300 hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20 hover:text-white'
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
