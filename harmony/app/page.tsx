"use client";

import { Button } from "@/components/button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";
import Link from "next/link";
import Hyperspeed from "@/components/Hyperspeed";
import { useAuthContext } from "@/contexts/auth-context";
import { useEffect } from "react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // Close sidebar if user is not signed in
    if (!isLoading && !isAuthenticated) {
      // Force sidebar to be closed for non-authenticated users
      const sidebarElement = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebarElement) {
        sidebarElement.setAttribute('data-state', 'collapsed');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <SidebarProvider defaultOpen={!!isAuthenticated}>
      <AppSidebar collapsible={isAuthenticated ? "icon" : "hidden"} />
      <SidebarInset className="bg-sidebar group/sidebar-inset">
        <div className="min-h-screen bg-background relative">
          {/* Hyperspeed Background */}
          <div className="fixed inset-0 z-0 w-full h-full min-h-screen">
            <Hyperspeed
              effectOptions={{
                distortion: 'turbulentDistortion',
                length: 400,
                roadWidth: 10,
                islandWidth: 2,
                lanesPerRoad: 4,
                fov: 90,
                fovSpeedUp: 150,
                speedUp: 2,
                carLightsFade: 0.4,
                totalSideLightSticks: 20,
                lightPairsPerRoadWay: 40,
                shoulderLinesWidthPercentage: 0.05,
                brokenLinesWidthPercentage: 0.1,
                brokenLinesLengthPercentage: 0.5,
                lightStickWidth: [0.12, 0.5],
                lightStickHeight: [1.3, 1.7],
                movingAwaySpeed: [60, 80],
                movingCloserSpeed: [-120, -160],
                carLightsLength: [400 * 0.03, 400 * 0.2],
                carLightsRadius: [0.05, 0.14],
                carWidthPercentage: [0.3, 0.5],
                carShiftX: [-0.8, 0.8],
                carFloorSeparation: [0, 5],
                colors: {
                  roadColor: 0x080808,
                  islandColor: 0x0a0a0a,
                  background: 0x000000,
                  shoulderLines: 0xFFFFFF,
                  brokenLines: 0xFFFFFF,
                  leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
                  rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
                  sticks: 0x03B3C3,
                }
              }}
            />
          </div>

          {/* Content Layer */}
          <div className="relative z-10">
          {/* Header with Sidebar Trigger */}
          <div className="border-b bg-card/50 backdrop-blur-sm p-4">
            <SidebarTrigger />
          </div>

          {/* Hero Section */}
          <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-foreground mb-6 drop-shadow-lg">
            Collaborate with
            <span className="text-primary block">Harmony</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto drop-shadow-md">
            The ultimate collaboration platform that brings your team together. 
            Work smarter, faster, and more efficiently than ever before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="px-8">
                {isAuthenticated ? "Go to Chat" : "Get Started Free"}
              </Button>
            </Link>
            <Link href="/prices">
              <Button variant="outline" size="lg" className="px-8">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Team Collaboration
              </h3>
              <p className="text-muted-foreground">
                Work together seamlessly with real-time collaboration tools and shared workspaces.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Lightning Fast
              </h3>
              <p className="text-muted-foreground">
                Built for speed with modern technology stack ensuring smooth performance.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Secure & Private
              </h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with end-to-end encryption to keep your data safe.
              </p>
            </div>
            </div>
            </div>
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
