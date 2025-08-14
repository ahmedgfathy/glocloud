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
    <footer className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white py-3">
      <div className="px-8 flex items-center justify-between">
        <span className="text-sm">
          © 2025 {companySettings?.companyName || 'PMS Cloud'}
        </span>
        <span className="text-sm">
          Ahmed Fathy
        </span>
      </div>
    </footer>
  )
}
