import type { Metadata } from "next";
import { SessionProvider } from './providers/SessionProvider'
import Footer from '@/components/Footer'
import DynamicFavicon from '@/components/DynamicFavicon'
import SecurityWarning from '@/components/SecurityWarning'
import ChunkErrorBoundary from '@/components/ChunkErrorBoundary'
import { prisma } from '@/lib/prisma'
import '@/lib/chunkErrorHandler' // Global chunk error handling
import "./globals.css";

// Static metadata - database calls during build time cause issues
export const metadata: Metadata = {
  title: "Glomart Real Estates - Cloud Storage System",
  description: "Secure cloud storage and file sharing for Glomart Real Estates",
  icons: {
    icon: '/api/favicon',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        <DynamicFavicon />
        <SecurityWarning />
        <ChunkErrorBoundary>
          <SessionProvider>
            <div className="h-full">
              {children}
            </div>
          </SessionProvider>
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
