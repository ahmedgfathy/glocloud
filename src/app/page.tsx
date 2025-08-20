'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CloudIcon } from '@heroicons/react/24/outline'

interface CompanySettings {
  companyName: string;
  companyLogo: string | null;
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'PMS Cloud',
    companyLogo: null
  })

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

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

    fetchCompanySettings()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full animate-float"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {companySettings.companyLogo ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative">
                  <Image
                    src={companySettings.companyLogo}
                    alt={`${companySettings.companyName} Logo`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallbackIcon) {
                        fallbackIcon.classList.remove('hidden')
                      }
                    }}
                  />
                </div>
              </div>
            ) : null}
            <div className={`relative group ${companySettings.companyLogo ? 'hidden' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <CloudIcon className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6 animate-fade-in">
            Welcome to {companySettings.companyName}
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
            Secure cloud storage and file sharing for your business
          </p>
          <div className="flex justify-center space-x-4 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            <Link
              href="/auth/signin"
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/auth/signup"
              className="group relative bg-white/80 backdrop-blur-sm text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-white/50"
            >
              <span className="relative z-10">Create Account</span>
            </Link>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-in-up" style={{animationDelay: '0.6s'}}>
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <CloudIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure File Storage</h3>
              <p className="text-gray-600 leading-relaxed">
                Store your files securely in the cloud with advanced encryption and access controls.
              </p>
            </div>
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Easy File Sharing</h3>
              <p className="text-gray-600 leading-relaxed">
                Share files and folders with team members and external users with customizable permissions.
              </p>
            </div>
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Admin Control</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive admin panel to manage users, monitor activities, and control system settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
