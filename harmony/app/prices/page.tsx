import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";
import { PricingTable } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "Pricing - Harmony",
  description: "Choose the perfect plan for your team",
};

export default function PricingPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar group/sidebar-inset">
        <div className="min-h-screen bg-background">
          {/* Header with Sidebar Trigger */}
          <div className="border-b bg-card/50">
            <div className="container mx-auto px-4 py-4">
              <SidebarTrigger className="mb-4" />
            </div>
            <div className="container mx-auto px-4 pb-16 text-center">
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
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
              <PricingTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
