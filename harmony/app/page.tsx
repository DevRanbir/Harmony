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
import Dock from "@/components/Dock";
import { useAuthContext } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiChatSmileLine, RiMoneyRupeeCircleLine, RiSeedlingLine } from "@remixicon/react";
export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleSidebar = () => {
    // Use the SidebarTrigger approach or dispatch a custom event
    const sidebarTrigger = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
    if (sidebarTrigger) {
      sidebarTrigger.click();
    } else {
      // Fallback to direct DOM manipulation
      const sidebarElement = document.querySelector('[data-sidebar="sidebar"]');
      if (sidebarElement) {
        const currentState = sidebarElement.getAttribute('data-state');
        sidebarElement.setAttribute('data-state', currentState === 'collapsed' ? 'expanded' : 'collapsed');
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const dockItems = [
    {
      icon: (
        <RiChatSmileLine className="w-6 h-6" />
      ),
      label: isAuthenticated ? "Go to Chat" : "Get Started",
      onClick: () => router.push("/login"),
    },
    {
      icon: (
        <RiMoneyRupeeCircleLine className="w-6 h-6" />
      ),
      label: "Pricing",
      onClick: () => router.push("/prices"),
    },
    {
      icon: (
        <RiSeedlingLine className="w-6 h-6" />
      ),
      label: "FAQ",
      onClick: () => router.push("/faq"),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      label: "Trigger Sidebar",
      onClick: toggleSidebar,
    },
    {
      icon: isDarkMode ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      label: isDarkMode ? "Light Mode" : "Dark Mode",
      onClick: toggleTheme,
    },
  ];

  useEffect(() => {
    // Ensure sidebar is closed by default
    const sidebarElement = document.querySelector('[data-sidebar="sidebar"]');
    if (sidebarElement) {
      sidebarElement.setAttribute('data-state', 'collapsed');
    }

    // Initialize theme
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, [isAuthenticated, isLoading]);

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar collapsible={isAuthenticated ? "offcanvas" : "hidden"} />
      <SidebarInset className="bg-sidebar group/sidebar-inset">
        {/* Hidden sidebar trigger for programmatic access */}
        <SidebarTrigger className="hidden" data-sidebar="trigger" />
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
          {/* Hero Section */}
          <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-foreground mb-6 drop-shadow-lg">
            Collaborate with
            <span className="text-primary block">Harmony</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto drop-shadow-md">
            The ultimate collaboration platform that brings your team together. 
            Work smarter, faster, and more efficiently than ever before.
          </p>
          
          {/* Dock Navigation - Centered in hero */}
          <div className="flex justify-center mt-8">
            <div className="h-20 flex items-center justify-center opacity-100">
              <Dock 
                items={dockItems}
                className={`${isDarkMode ? 'text-white' : 'text-gray-800'} bg-transparent`}
                magnification={80}
                distance={100}
                panelHeight={64}
              />
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
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
