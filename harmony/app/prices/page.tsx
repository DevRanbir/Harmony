import type { Metadata } from "next";
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
import { PricingTable } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "Pricing - Harmony",
  description: "Choose the perfect plan for your team",
};

export default function PricingPage() {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="hidden" />
      <SidebarInset className="bg-sidebar group/sidebar-inset">
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="py-5 bg-background sticky top-0 z-10 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
            <div className="flex items-center justify-between gap-2 px-4 md:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Breadcrumb>
                  <BreadcrumbList className="sm:gap-1.5">
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Harmony</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Pricing</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="border-b bg-card/50">
            <div className="container mx-auto px-4 pb-16 pt-10 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Choose Your Plan
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start with our free plan and upgrade as your team grows. 
                All plans include our core collaboration features.
              </p>
            </div>
          </div>

          {/* Clerk Pricing Table */}
          <div className="container mx-auto px-4 py-16">
            <div style={{margin: '0 auto', padding: '0 1rem' }}>
              <PricingTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
