'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CloudIcon } from '@heroicons/react/24/outline'

interface CompanySettings {
  companyName: string;
  companyLogo: string | null;
}

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'Glomart Real Estates',
    companyLogo: '/logo-glomart.png'
  })

  useEffect(() => {
    // Security: Clear any sensitive URL parameters
    const url = new URL(window.location.href)
    const sensitiveParams = ['password', 'token', 'secret', 'key', 'credentials']
    let hasSensitiveData = false
    
    sensitiveParams.forEach(param => {
      if (url.searchParams.has(param)) {
        console.warn('🚨 SECURITY: Removing sensitive parameter from URL:', param)
        url.searchParams.delete(param)
        hasSensitiveData = true
      }
    })
    
    // If we found sensitive data, clean the URL
    if (hasSensitiveData) {
      window.history.replaceState({}, document.title, url.pathname)
    }
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
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

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center animate-fade-in">
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
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Sign in to {companySettings.companyName}
            </p>
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-200"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* Sign In Form */}
          <div className="animate-slide-in-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:bg-white/70"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:bg-white/70"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <svg className="h-5 w-5 text-white group-hover:text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    )}
                  </span>
                  {loading ? 'Signing you in...' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-4 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
