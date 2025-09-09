import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from '@/contexts/auth-context';
import { RouteGuard } from '@/components/route-guard';

import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${fontSans.variable} font-sans antialiased`}>
          <AuthProvider>
            <RouteGuard protectedRoutes={['/dashboard', '/admin', '/*/data']}>
              {children}
            </RouteGuard>
          </AuthProvider>
          {/* Global Clerk CAPTCHA container */}
          <div id="clerk-captcha" style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}></div>
        </body>
      </html>
    </ClerkProvider>
  );
}
