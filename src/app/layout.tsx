import type { Metadata } from "next";
import { SessionProvider } from './providers/SessionProvider'
import Footer from '@/components/Footer'
import "./globals.css";

export const metadata: Metadata = {
  title: "PM Cloud - Cloud Storage System",
  description: "Secure cloud storage and file sharing for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
