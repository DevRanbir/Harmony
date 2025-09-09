'use client';

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";
import {
  SettingsPanelProvider,
  SettingsPanel,
} from "@/components/settings-panel";
import Chat from "@/components/chat";
import { ClientRouteGuard } from "@/components/client-route-guard";

export default function Page() {
  return (
    <ClientRouteGuard requireAuth={true}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-sidebar group/sidebar-inset">
          <SettingsPanelProvider>
            <div className="flex h-[calc(100svh)] bg-[hsl(240_5%_92.16%)] md:rounded-s-3xl md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none transition-all ease-in-out duration-300">
              <Chat />
              <SettingsPanel />
            </div>
          </SettingsPanelProvider>
        </SidebarInset>
      </SidebarProvider>
    </ClientRouteGuard>
  );
}
