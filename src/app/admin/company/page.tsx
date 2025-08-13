'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  BuildingOfficeIcon,
  PhotoIcon,
  PaintBrushIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface CompanySettings {
  id: string;
  companyName: string;
  companyLogo: string | null;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  isConfigured: boolean;
}

export default function CompanySettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#1e40af');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') redirect('/auth/signin');
    if (session?.user?.role !== 'SUPER_ADMIN') redirect('/dashboard');

    fetchSettings();
  }, [session, status]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/company');
      if (response.ok) {
        const data = await response.json();
        const settings = data.settings;
        setSettings(settings);
        setCompanyName(settings.companyName);
        setPrimaryColor(settings.primaryColor);
        setSecondaryColor(settings.secondaryColor);
        setContactEmail(settings.contactEmail || '');
        setContactPhone(settings.contactPhone || '');
        setAddress(settings.address || '');
        setWebsite(settings.website || '');
        setDescription(settings.description || '');
        if (settings.companyLogo) {
          setLogoPreview(settings.companyLogo);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('companyName', companyName);
      formData.append('primaryColor', primaryColor);
      formData.append('secondaryColor', secondaryColor);
      formData.append('contactEmail', contactEmail);
      formData.append('contactPhone', contactPhone);
      formData.append('address', address);
      formData.append('website', website);
      formData.append('description', description);
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch('/api/admin/company', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'Company settings updated successfully!' });
        
        // Trigger favicon update
        localStorage.setItem('companySettingsUpdated', Date.now().toString());
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'companySettingsUpdated',
          newValue: Date.now().toString()
        }));
        
        // Refresh the page to apply new styles and metadata
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings' });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating settings' });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      <main className="ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
            </div>
            <p className="text-gray-600">
              Configure your company branding and information. This will be displayed throughout the application.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Branding Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <PaintBrushIcon className="h-6 w-6 text-blue-600" />
                <span>Company Branding</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {logoPreview && (
                      <div className="w-16 h-16 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-300 hover:bg-blue-100 flex items-center space-x-2"
                      >
                        <PhotoIcon className="h-5 w-5" />
                        <span>Upload Logo</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-12 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                <span>Company Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>Contact Email</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                    <PhoneIcon className="h-4 w-4" />
                    <span>Contact Phone</span>
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                    <GlobeAltIcon className="h-4 w-4" />
                    <span>Website</span>
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>Address</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Company Description</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your company..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
