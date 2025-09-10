import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from '@/contexts/auth-context';
import { BookmarksProvider } from '@/contexts/bookmarks-context';
import { ChatWithHistoryProvider } from '@/contexts/chat-with-history-provider';
import { RouteGuard } from '@/components/route-guard';
import { PagePreloader } from '@/components/page-preloader';
import { NavigationLoader } from '@/components/navigation-loader';
import { PageTransition } from '@/components/page-transition';

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
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        elements: {
          loadingIndicator: "bg-primary",
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${fontSans.variable} font-sans antialiased`}>
          <NavigationLoader />
          <AuthProvider>
            <BookmarksProvider>
              <ChatWithHistoryProvider>
                <RouteGuard protectedRoutes={['/dashboard', '/admin', '/*/data']}>
                  <PageTransition>
                    {children}
                  </PageTransition>
                </RouteGuard>
              </ChatWithHistoryProvider>
            </BookmarksProvider>
            <PagePreloader />
          </AuthProvider>
          {/* Global Clerk CAPTCHA container */}
          <div id="clerk-captcha" style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}></div>
        </body>
      </html>
    </ClerkProvider>
  );
}
