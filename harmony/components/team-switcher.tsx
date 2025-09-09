"use client";

import * as React from "react";
import { useClerk, useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar";
import { RiExpandUpDownLine, RiAddLine, RiLogoutBoxLine, RiSettings3Line, RiVipCrownLine } from "@remixicon/react";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: string;
  }[];
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0] ?? null);
  const [mounted, setMounted] = React.useState(false);
  const { openUserProfile, signOut, openSignUp } = useClerk();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update active team when teams change (e.g., user loads)
  React.useEffect(() => {
    if (mounted && teams.length > 0 && (!activeTeam || activeTeam.name === "Loading...")) {
      setActiveTeam(teams[0]);
    }
  }, [teams, activeTeam, mounted]);

  if (!teams.length) return null;

  // Check if user is signed in using Clerk hooks
  const isUserSignedIn = isSignedIn && isLoaded && user;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground gap-3 [&>svg]:size-auto"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-md overflow-hidden bg-sidebar-primary text-sidebar-primary-foreground relative after:rounded-[inherit] after:absolute after:inset-0 after:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)] after:pointer-events-none">
                {mounted && activeTeam && activeTeam.logo ? (
                  <img
                    src={activeTeam.logo}
                    width={36}
                    height={36}
                    alt={activeTeam.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold" suppressHydrationWarning>
                    {mounted ? (activeTeam?.name?.charAt(0)?.toUpperCase() || "U") : "L"}
                  </span>
                )}
              </div>
              <div className="grid flex-1 text-left text-base leading-tight">
                <span className="truncate font-medium" suppressHydrationWarning>
                  {mounted ? (activeTeam?.name ?? "Select a User") : "Loading..."}
                </span>
                {!isUserSignedIn && activeTeam?.name === "Not signed in" && (
                  <span className="text-xs text-muted-foreground">
                    Click to sign in
                  </span>
                )}
              </div>
              <RiExpandUpDownLine
                className="ms-auto text-sidebar-foreground/50"
                size={20}
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="dark w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="uppercase text-muted-foreground/70 text-xs">
              {isUserSignedIn ? "User" : "Authentication"}
            </DropdownMenuLabel>
            {isUserSignedIn ? (
              // Show user accounts when signed in
              teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md overflow-hidden bg-sidebar-primary text-sidebar-primary-foreground">
                    {team.logo ? (
                      <img 
                        src={team.logo} 
                        width={24} 
                        height={24} 
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold">
                        {team.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  {team.name}
                </DropdownMenuItem>
              ))
            ) : (
              // Show sign in option when not signed in
              <DropdownMenuItem 
                className="gap-2 p-2"
                onClick={() => router.push('/login')}
              >
                <RiAddLine className="opacity-60" size={16} aria-hidden="true" />
                <div className="font-medium">Sign In / Sign Up</div>
              </DropdownMenuItem>
            )}
            
            {isUserSignedIn && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 p-2"
                  onClick={() => openUserProfile()}
                >
                  <RiSettings3Line className="opacity-60" size={16} aria-hidden="true" />
                  <div className="font-medium">Manage Account</div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2 p-2"
                  onClick={() => router.push('/prices')}
                >
                  <RiVipCrownLine className="opacity-60" size={16} aria-hidden="true" />
                  <div className="font-medium">Billing & Plans</div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2 p-2 text-destructive focus:text-destructive"
                  onClick={() => {
                    // Clear localStorage before signing out
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('harmony_auth_state');
                    }
                    signOut();
                  }}
                >
                  <RiLogoutBoxLine className="opacity-60" size={16} aria-hidden="true" />
                  <div className="font-medium">Sign Out</div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
