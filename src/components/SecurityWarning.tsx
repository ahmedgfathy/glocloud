'use client'

import { useEffect, useState } from 'react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function SecurityWarning() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDevelopment, setIsDevelopment] = useState(false)

  useEffect(() => {
    // Only show in development mode
    const isDev = process.env.NODE_ENV === 'development'
    setIsDevelopment(isDev)
    
    if (isDev) {
      // Check if URL contains sensitive information
      const url = new URL(window.location.href)
      const sensitiveParams = ['password', 'token', 'secret', 'key', 'credentials']
      const hasSensitiveData = sensitiveParams.some(param => url.searchParams.has(param))
      
      if (hasSensitiveData) {
        setIsVisible(true)
      }
    }
  }, [])

  if (!isDevelopment || !isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-50 border-l-4 border-red-400 p-4 max-w-md rounded-lg shadow-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            <strong>🚨 Security Warning!</strong><br />
            Sensitive data detected in URL. This could expose credentials to attackers.
            URLs are automatically cleaned for security.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
