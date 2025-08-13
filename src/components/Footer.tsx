'use client'

import { useState, useEffect } from 'react'

interface CompanySettings {
  companyName: string
  primaryColor: string
  logoUrl?: string
}

export default function Footer() {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'GET',
          cache: 'no-store',
        })
        if (response.ok) {
          const settings = await response.json()
          setCompanySettings(settings)
        }
      } catch (error) {
        console.error('Failed to fetch company settings:', error)
      }
    }

    fetchCompanySettings()
  }, [])

  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              © 2025 {companySettings?.companyName || 'PMS Cloud'}. All rights reserved.
            </span>
          </div>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span className="text-sm">
              Developed and designed by
            </span>
            <a
              href="mailto:ahmed.fathy@pms.eg"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Ahmed Fathy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
