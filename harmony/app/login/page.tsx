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
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar group/sidebar-inset">
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <SidebarTrigger className="absolute top-4 left-4" />
          <div className="w-full max-w-4xl">
            <SignedOut>
              <div className="bg-card border shadow-sm rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                  {/* Left side - Welcome and buttons */}
                  <div className="bg-muted/50 p-8 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                      <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-foreground mb-4">
                          Welcome to Harmony
                        </h1>
                        <p className="text-muted-foreground mb-8">
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
                        <p className="text-xs text-muted-foreground">
                          By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Clerk forms */}
                  <div className="p-8 flex items-center justify-center">
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
    </SidebarInset>
  </SidebarProvider>
  );
}
