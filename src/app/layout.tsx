import type { Metadata } from "next";
import { SessionProvider } from './providers/SessionProvider'
import Footer from '@/components/Footer'
import DynamicFavicon from '@/components/DynamicFavicon'
import { prisma } from '@/lib/prisma'
import "./globals.css";

// Dynamic metadata generation
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.companySettings.findFirst();
    const companyName = settings?.companyName || 'PM Cloud';
    
    return {
      title: `${companyName} - Cloud Storage System`,
      description: "Secure cloud storage and file sharing for your business",
      icons: {
        icon: '/api/favicon',
      },
    };
  } catch (error) {
    return {
      title: "PM Cloud - Cloud Storage System",
      description: "Secure cloud storage and file sharing for your business",
      icons: {
        icon: '/api/favicon',
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        <DynamicFavicon />
        <SessionProvider>
          <div className="h-full">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
