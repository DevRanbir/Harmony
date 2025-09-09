"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";

export default function VerifyEmailPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsVerifying(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Sign up not complete:", completeSignUp);
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err: any) {
      console.error("Resend error:", err);
      setError(err.errors?.[0]?.message || "Failed to resend code.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar group/sidebar-inset">
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <SidebarTrigger className="absolute top-4 left-4" />
          <div className="w-full max-w-md">
            <div className="bg-card border shadow-sm rounded-lg p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Verify Your Email
                </h1>
                <p className="text-muted-foreground">
                  We've sent a verification code to your email address. Enter it below to complete your signup.
                </p>
              </div>

              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isVerifying || !code}
                >
                  {isVerifying ? "Verifying..." : "Verify Email"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button
                    onClick={resendCode}
                    className="text-primary hover:underline"
                  >
                    Resend Code
                  </button>
                </p>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push("/login")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
