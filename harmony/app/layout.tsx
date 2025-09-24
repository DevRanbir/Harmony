import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from '@/contexts/auth-context';
import { BookmarksProvider } from '@/contexts/bookmarks-context';
import { ChatWithHistoryProvider } from '@/contexts/chat-with-history-provider';
import { ThemeProvider } from '@/contexts/theme-context';
import { SettingsProvider } from '@/contexts/settings-context';
import { RouteGuard } from '@/components/route-guard';
import { PagePreloader } from '@/components/page-preloader';
import { NavigationLoader } from '@/components/navigation-loader';
import { PageTransition } from '@/components/page-transition';
import { getClerkUrls, logClerkConfig } from '@/lib/clerk-config';
import { EnvDebugger } from '@/components/env-debugger';

import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Harmony - Collaborate with ease",
  description: "The ultimate collaboration platform for modern teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get properly configured URLs for production
  const clerkUrls = getClerkUrls();
  
  // Log configuration in development
  if (process.env.NODE_ENV === 'development') {
    logClerkConfig();
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        elements: {
          loadingIndicator: "bg-primary",
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || clerkUrls.signInUrl}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || clerkUrls.signUpUrl}
      afterSignInUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || clerkUrls.afterSignInUrl}
      afterSignUpUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || clerkUrls.afterSignUpUrl}
      signInForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL}
      signUpForceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${fontSans.variable} font-sans antialiased`}>
          <ThemeProvider>
            <NavigationLoader />
            <SettingsProvider>
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
            </SettingsProvider>
          </ThemeProvider>
          {/* Development environment debugger */}
          <EnvDebugger />
          {/* Clerk CAPTCHA container - prevent initialization errors */}
          <div id="clerk-captcha" style={{ display: 'none' }}></div>
        </body>
      </html>
    </ClerkProvider>
  );
}
