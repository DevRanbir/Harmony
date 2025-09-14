"use client";

import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb";
import { ScrollArea } from "@/components/scroll-area";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  const error = searchParams.get('error');

  return (
    <SidebarProvider>
      <AppSidebar collapsible="hidden" />
      <SidebarInset className="bg-sidebar group/sidebar-inset">
        <div className="flex h-[calc(100svh)] bg-[hsl(240_5%_92.16%)] md:rounded-s-3xl md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none transition-all ease-in-out duration-300">
          <ScrollArea className="flex-1 [&>div>div]:h-full w-full shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
            <div className="h-full flex flex-col px-0 md:px-0 lg:px-0">
              {/* Header */}
              <div className="bg-white py-5 sticky top-0 z-10 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06] dark:bg-sidebar dark:before:from-white/[0.06] dark:before:via-white/10 dark:before:to-white/[0.06]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <SidebarTrigger />
                    <Breadcrumb>
                      <BreadcrumbList className="sm:gap-1.5">
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/">Harmony</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Sign In</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative grow flex items-center justify-center pb-8 overflow-hidden">
                {/* Background GIF */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="/1757835988118.gif" 
                    alt="Background animation"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay to ensure content readability */}
                  <div className="absolute inset-0 backdrop-blur-sm shadow-xl border border-white/20"></div>
                </div>
                
                <div className="w-full max-w-4xl relative z-10">{/* The content will continue here... */}
            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        {error === 'sso_failed' ? 'Google sign-in failed. Please try again or use a different method.' : 
                         decodeURIComponent(error)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <SignedOut>
              <div className="rounded-lg overflow-hidden mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                    {/* Left side - Welcome and buttons */}
                    <div className="p-8 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                      <div className="mb-8 text-center lg:text-left">
                      <h1 className="text-3xl font-bold text-white mb-4">
                        Welcome to <span className="text-[2em] text-black inline-block">Harmony</span>
                      </h1>
                      <p className="text-white mb-8">
                        Sign in to access your workspace and collaborate with your team.
                      </p>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-4 mb-8">
                        <button
                          onClick={() => setShowSignUp(false)}
                          className={`w-full py-3 px-6 rounded-lg text-sm font-medium transition-all ${
                            !showSignUp
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-background text-foreground border border-input hover:bg-accent"
                          }`}
                        >
                          Sign In to Your Account
                        </button>
                        <button
                          onClick={() => setShowSignUp(true)}
                          className={`w-full py-3 px-6 rounded-lg text-sm font-medium transition-all ${
                            showSignUp
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-background text-foreground border border-input hover:bg-accent"
                          }`}
                        >
                          Create New Account
                        </button>
                      </div>

                      <div className="text-center lg:text-left">
                        <p className="text-xs text-white">
                          By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Clerk forms */}
                  <div className="p-3 flex items-center justify-center">
                    <div className="w-full max-w-sm">
                      {showSignUp ? (
                        <SignUp 
                          forceRedirectUrl={redirectUrl}
                          fallbackRedirectUrl={redirectUrl}
                          routing="path"
                          path="/login"
                          appearance={{
                            elements: {
                              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                              card: "shadow-none border-none bg-transparent",
                              headerTitle: "hidden",
                              headerSubtitle: "hidden",
                              socialButtonsBlockButton: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                              formFieldInput: "border-input bg-background",
                              footerActionLink: "text-primary hover:text-primary/80",
                              captcha: "border-input bg-background",
                            },
                            layout: {
                              logoImageUrl: undefined,
                              showOptionalFields: false,
                            },
                          }}
                        />
                      ) : (
                        <SignIn 
                          forceRedirectUrl={redirectUrl}
                          fallbackRedirectUrl={redirectUrl}
                          routing="path"
                          path="/login"
                          appearance={{
                            elements: {
                              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                              card: "shadow-none border-none bg-transparent",
                              headerTitle: "hidden",
                              headerSubtitle: "hidden",
                              socialButtonsBlockButton: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
                              formFieldInput: "border-input bg-background",
                              footerActionLink: "text-primary hover:text-primary/80",
                              captcha: "border-input bg-background",
                            },
                            layout: {
                              logoImageUrl: undefined,
                              showOptionalFields: false,
                            },
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SignedOut>

          {/* If user is signed in, show profile and redirect options */}
          <SignedIn>
            <div className="bg-card border shadow-sm rounded-lg p-8 text-center max-w-md mx-auto">
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      You're signed in!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Welcome back to Harmony
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full">
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                  
                  <div className="flex justify-center">
                    <UserButton afterSignOutUrl="/login" />
                  </div>
                </div>
              </div>
            </div>
          </SignedIn>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a href="#" className="text-primary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
