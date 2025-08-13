import type { Metadata } from "next";
import { SessionProvider } from './providers/SessionProvider'
import "./globals.css";

export const metadata: Metadata = {
  title: "PMS Cloud - Cloud Storage System",
  description: "Secure cloud storage and file sharing for your business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
