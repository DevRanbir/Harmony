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
      signInForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL}
      signUpForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL}
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
          {/* Clerk CAPTCHA container - prevent initialization errors */}
          <div id="clerk-captcha" style={{ display: 'none' }}></div>
        </body>
      </html>
    </ClerkProvider>
  );
}
