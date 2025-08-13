'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { CloudIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

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
            <CloudIcon className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to PMS Cloud
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
