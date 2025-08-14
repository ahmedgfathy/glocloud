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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {companySettings.companyLogo ? (
              <Image
                src={companySettings.companyLogo}
                alt={`${companySettings.companyName} Logo`}
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallbackIcon) {
                    fallbackIcon.classList.remove('hidden')
                  }
                }}
              />
            ) : null}
            <CloudIcon className={`h-16 w-16 text-blue-600 ${companySettings.companyLogo ? 'hidden' : ''}`} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to {companySettings.companyName}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Secure cloud storage and file sharing for your business
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Create Account
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Secure File Storage</h3>
              <p className="text-gray-600">
                Store your files securely in the cloud with advanced encryption and access controls.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Easy File Sharing</h3>
              <p className="text-gray-600">
                Share files and folders with team members and external users with customizable permissions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Admin Control</h3>
              <p className="text-gray-600">
                Comprehensive admin panel to manage users, monitor activities, and control system settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
