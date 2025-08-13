'use client';

import { useEffect } from 'react';

export default function DynamicFavicon() {
  useEffect(() => {
    // Function to update favicon
    const updateFavicon = () => {
      // Remove existing favicon
      const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Add new favicon that points to our dynamic API
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/x-icon';
      newFavicon.href = `/api/favicon?t=${Date.now()}`; // Add timestamp to prevent caching
      document.head.appendChild(newFavicon);
    };

    // Update favicon on component mount
    updateFavicon();

    // Listen for company settings changes (optional - for real-time updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'companySettingsUpdated') {
        updateFavicon();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null; // This component doesn't render anything
}
