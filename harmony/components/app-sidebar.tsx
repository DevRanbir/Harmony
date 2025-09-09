"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { useAuthContext } from "@/contexts/auth-context";

import { TeamSwitcher } from "@/components/team-switcher";
import { SubscriptionInfo } from "@/components/subscription-info";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar";
import {
  RiChat1Line,
  RiBardLine,
  RiMickeyLine,
  RiMicLine,
  RiCheckDoubleLine,
  RiBracesLine,
  RiPlanetLine,
  RiSeedlingLine,
  RiSettings3Line,
} from "@remixicon/react";

// Navigation data
const navData = {
  navMain: [
    {
      title: "Harmony",
      url: "#",
      items: [
        {
          title: "Chat",
          url: "/dashboard",
          icon: RiChat1Line,
        },
        {
          title: "Gallery",
          url: "#",
          icon: RiBardLine,
        },
        {
          title: "Prices",
          url: "/prices",
          icon: RiMickeyLine,
        },
        {
          title: "Metrics",
          url: "/user/data",
          icon: RiCheckDoubleLine,
        }
      ],
    },
    {
      title: "More",
      url: "#",
      items: [
        {
          title: "Help Centre",
          url: "#",
          icon: RiSeedlingLine,
        },
        {
          title: "Settings",
          url: "#",
          icon: RiSettings3Line,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useAuthContext();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Create teams data based on user information
  const teams = React.useMemo(() => {
    // Show consistent data until mounted and loaded
    if (!mounted || isLoading) {
      return [{
        name: "Loading...",
        logo: "",
      }];
    }
    
    if (!isAuthenticated || !user) {
      return [{
        name: "Not signed in",
        logo: "",
      }];
    }

    return [{
      name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "User",
      logo: user.imageUrl || "",
    }];
  }, [user, isAuthenticated, isLoading, mounted]);

  const data = {
    teams,
    navMain: navData.navMain,
  };

  // Filter navigation items based on authentication status
  const getFilteredNavItems = (items: typeof navData.navMain[0]["items"]) => {
    if (!isAuthenticated || !user) {
      // If user is not signed in, exclude Metrics and Gallery
      return items.filter(item => 
        item.title !== "Metrics" && 
        item.title !== "Gallery"
      );
    }
    // If user is signed in, show all items
    return items;
  };
  
  // Function to check if an item is active based on current path
  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    if (itemUrl === "/user/data") {
      return pathname.includes("/data");
    }
    if (itemUrl === "/prices") {
      return pathname === "/prices";
    }
    return pathname === itemUrl;
  };

  return (
    <Sidebar {...props} className="dark !border-none">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* We only show the first parent group */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase text-sidebar-foreground/50">
            {data.navMain[0]?.title}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {getFilteredNavItems(data.navMain[0]?.items || []).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="group/menu-button font-medium gap-3 h-9 rounded-md data-[active=true]:hover:bg-transparent data-[active=true]:bg-gradient-to-b data-[active=true]:from-sidebar-primary data-[active=true]:to-sidebar-primary/70 data-[active=true]:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)] [&>svg]:size-auto"
                    isActive={isItemActive(item.url)}
                  >
                    <a href={item.url}>
                      {item.icon && (
                        <item.icon
                          className="text-sidebar-foreground/50 group-data-[active=true]/menu-button:text-sidebar-foreground"
                          size={22}
                          aria-hidden="true"
                        />
                      )}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Subscription Info */}
        <SubscriptionInfo />
        
        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase text-sidebar-foreground/50">
            {data.navMain[1]?.title}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {data.navMain[1]?.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="group/menu-button font-medium gap-3 h-9 rounded-md [&>svg]:size-auto"
                    isActive={isItemActive(item.url)}
                  >
                    <a href={item.url}>
                      {item.icon && (
                        <item.icon
                          className="text-sidebar-foreground/50 group-data-[active=true]/menu-button:text-primary"
                          size={22}
                          aria-hidden="true"
                        />
                      )}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
