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
    companyName: 'Glo Cloud',
    companyLogo: null
  })

  useEffect(() => {
    // Fetch company settings for display
    const fetchCompanySettings = async () => {
      try {
        const response = await fetch('/api/company')
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
    <div className="fixed left-0 top-0 bottom-0 flex flex-col w-64 bg-white border-r border-gray-200 shadow-lg z-30 h-screen">
      {/* Company Logo Section - Clean & Minimal */}
      <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
        {/* Logo Section */}
        <div className="flex justify-center mb-3">
          <Link href="/dashboard" className="w-24 h-24 flex items-center justify-center">
            {companySettings.companyLogo ? (
              <Image
                src={companySettings.companyLogo}
                alt="Company Logo"
                width={192}
                height={192}
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallbackIcon) {
                    fallbackIcon.classList.remove('hidden')
                  }
                }}
              />
            ) : (
              <CloudIcon className="h-48 w-48 text-gray-400" />
            )}
            <CloudIcon className="h-48 w-48 text-gray-400 hidden" />
          </Link>
        </div>
        
        {/* Title Section - Independent */}
        <div className="text-center">
          <h1 className="text-gray-900 text-base font-semibold">{companySettings.companyName}</h1>
          <p className="text-gray-500 text-xs">File Management</p>
        </div>
      </div>

      {/* User Profile Section - Simplified */}
      {session?.user && (
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <Link href="/profile" className="flex items-center space-x-3 group hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {session.user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm font-medium truncate group-hover:text-blue-600 transition-colors">
                {session.user.name}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  {session.user.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}
      
      <div className="flex-1 flex flex-col py-6 min-h-0 overflow-hidden">
        <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  isActive(item.href)
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Admin Navigation */}
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Administration
              </h3>
              <div className="space-y-1">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Sign Out Button and Footer - Sticky at bottom */}
        <div className="flex-shrink-0 px-6 py-4 mt-auto">
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={async () => {
                try {
                  await signOut({ callbackUrl: '/auth/signin', redirect: true })
                } catch (error) {
                  console.error('Logout error:', error)
                  window.location.href = '/auth/signin'
                }
              }}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors mb-4"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              Sign Out
            </button>
            
            {/* Footer - Stuck at bottom */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>© 2025 {companySettings.companyName}</span>
                <span>Ahmed Fathy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
