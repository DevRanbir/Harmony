"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser, useAuth } from "@clerk/nextjs";
import { useAuthContext } from "@/contexts/auth-context";

import { TeamSwitcher } from "@/components/team-switcher";
import { SubscriptionInfo } from "@/components/subscription-info";
import { Button } from "@/components/button";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/sidebar";
import {
  RiChat1Line,
  RiBardLine,
  RiMickeyLine,
  RiMicLine,
  RiUser5Line,
  RiMoneyRupeeCircleLine,
  RiChatSmileLine,
  RiSeedlingLine,
  RiSettings3Line,
  RiBookmarkLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiGlobeLine,
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
          icon: RiChatSmileLine,
        },
        {
          title: "Bookmarks",
          url: "/bookmarks",
          icon: RiBookmarkLine,
        },
        {
          title: "Map",
          url: "/map",
          icon: RiGlobeLine,
        },
        {
          title: "Prices",
          url: "/prices",
          icon: RiMoneyRupeeCircleLine,
        },
        {
          title: "Metrics",
          url: "/user/data",
          icon: RiUser5Line,
        }
      ],
    },
    {
      title: "More",
      url: "#",
      items: [
        {
          title: "About",
          url: "/",
          icon: RiBardLine,
        },
        {
          title: "Help Centre",
          url: "/help",
          icon: RiSeedlingLine,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: RiSettings3Line,
        },
        {
          title: "Toggle Sidebar",
          url: "#",
          icon: null,
          isToggle: true,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useAuthContext();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
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
      // If user is not signed in, show Get Started instead of Chat, and exclude other auth-required items
      const filteredItems = items
        .filter(item => 
          item.title !== "Metrics" && 
          item.title !== "Map" &&
          item.title !== "Bookmarks"
        )
        .map(item => {
          // Replace Chat with Get Started for non-authenticated users
          if (item.title === "Chat") {
            return {
              ...item,
              title: "Get Started",
              url: "/login"
            };
          }
          return item;
        });

      // Add Harmony button at the beginning for non-signed in users
      return [
        {
          title: "Harmony",
          url: "/",
          icon: RiChat1Line, // Using chat icon as a placeholder, you can change this
        },
        ...filteredItems
      ];
    }
    // If user is signed in, show all items
    return items;
  };

  // Filter secondary navigation items (More section)
  const getFilteredSecondaryItems = (items: typeof navData.navMain[1]["items"]) => {
    if (!isAuthenticated || !user) {
      // If user is not signed in, exclude Settings
      return items.filter(item => item.title !== "Settings");
    }
    // If user is signed in, show all items
    return items;
  };
  
  // Function to check if an item is active based on current path
  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/") {
      return pathname === "/";
    }
    if (itemUrl === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (itemUrl === "/login") {
      return pathname === "/login";
    }
    if (itemUrl === "/user/data") {
      return pathname.includes("/data");
    }
    if (itemUrl === "/prices") {
      return pathname === "/prices";
    }
    if (itemUrl === "/bookmarks") {
      return pathname === "/bookmarks";
    }
    if (itemUrl === "/map") {
      return pathname === "/map";
    }
    if (itemUrl === "/settings") {
      return pathname === "/settings";
    }
    return pathname === itemUrl;
  };

  return (
    <Sidebar {...props} className="dark !border-none z-50">
      {/* Mobile close button */}
      {isMobile && (
        <div className="absolute top-4 right-4 z-50 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(false)}
            className="h-8 w-8 bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground rounded-full shadow-lg"
          >
            <RiMenuFoldLine className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      )}
      
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
                    className="group/menu-button font-medium gap-3 h-9 rounded-md data-[active=true]:hover:bg-transparent data-[active=true]:bg-gradient-to-b data-[active=true]:from-sidebar-primary data-[active=true]:to-sidebar-primary/70 data-[active=true]:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)] [&>svg]:size-auto transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                    isActive={isItemActive(item.url)}
                    tooltip={state === "collapsed" ? item.title : undefined}
                  >
                    <Link href={item.url} prefetch={true}>
                      {item.icon && (
                        <item.icon
                          className="text-sidebar-foreground/50 group-data-[active=true]/menu-button:text-sidebar-foreground"
                          size={22}
                          aria-hidden="true"
                        />
                      )}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Subscription Info - only show when user is signed in */}
        {isAuthenticated && user && <SubscriptionInfo />}
        
        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase text-sidebar-foreground/50">
            {data.navMain[1]?.title}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {getFilteredSecondaryItems(data.navMain[1]?.items || []).map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.isToggle ? (
                    <SidebarMenuButton
                      className="group/menu-button font-medium gap-3 h-9 rounded-md hover:bg-sidebar-accent [&>svg]:size-auto transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                      onClick={toggleSidebar}
                      tooltip={state === "collapsed" ? "Toggle Sidebar" : undefined}
                    >
                      {state === "collapsed" ? (
                        <RiMenuUnfoldLine
                          className="text-sidebar-foreground/50"
                          size={22}
                          aria-hidden="true"
                        />
                      ) : (
                        <RiMenuFoldLine
                          className="text-sidebar-foreground/50"
                          size={22}
                          aria-hidden="true"
                        />
                      )}
                      <span>Toggle Sidebar</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button font-medium gap-3 h-9 rounded-md [&>svg]:size-auto transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                      isActive={isItemActive(item.url)}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <Link href={item.url} prefetch={true}>
                        {item.icon && (
                          <item.icon
                            className="text-sidebar-foreground/50 group-data-[active=true]/menu-button:text-primary"
                            size={22}
                            aria-hidden="true"
                          />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
