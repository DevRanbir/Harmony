'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
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
import { ScrollArea } from "@/components/scroll-area";
import { ClientRouteGuard } from "@/components/client-route-guard";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { 
  getChatHistory, 
  getBookmarks, 
  getAllChatDates,
  getChatMessages,
  type ChatHistory,
  type BookmarkData 
} from "@/lib/firebase-service";
import { formatDistanceToNow } from "date-fns";
import {
  RiBarChartBoxLine,
  RiMessageLine,
  RiBookmarkLine,
  RiCalendarLine,
  RiLineChartLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiTimeLine,
  RiStarLine,
  RiArrowRightUpLine,
  RiChatSmile3Line,
  RiHeartLine,
} from "@remixicon/react";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

interface UserAnalytics {
  totalChats: number;
  totalMessages: number;
  totalBookmarks: number;
  totalDays: number;
  averageMessagesPerDay: number;
  mostActiveDay?: string;
  recentActivity: {
    event: string;
    time: Date;
    details: string;
  }[];
}

export default function MetricsPage({ params }: PageProps) {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState<string>('');
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    const getUsername = async () => {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    };
    getUsername();
  }, [params]);

  useEffect(() => {
    const loadUserAnalytics = async () => {
      // Use Clerk username or fallback to user ID
      const userIdentifier = user?.username || user?.id;
      if (!userIdentifier || !user) {
        return;
      }
      
      setIsLoadingAnalytics(true);
      try {
        // Get all user data from Firebase using Clerk username or ID
        const chatHistory = await getChatHistory(userIdentifier);
        const bookmarks = await getBookmarks(userIdentifier);
        const chatDates = await getAllChatDates(userIdentifier);

        // Calculate total messages across all chats
        let totalMessages = 0;
        const recentActivity = [];
        
        for (const date of chatDates.slice(0, 5)) { // Get recent dates only
          const messages = await getChatMessages(userIdentifier, date);
          totalMessages += messages.length;
          
          // Add recent chat activity
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            recentActivity.push({
              event: 'Chat Session',
              time: new Date(lastMessage.timestamp),
              details: `${messages.length} messages on ${new Date(date).toLocaleDateString()}`
            });
          }
        }

        // Add bookmark activity
        bookmarks.slice(0, 3).forEach(bookmark => {
          recentActivity.push({
            event: 'Message Bookmarked',
            time: new Date(bookmark.bookmarkedAt),
            details: bookmark.content.substring(0, 50) + (bookmark.content.length > 50 ? '...' : '')
          });
        });

        // Sort recent activity by time
        recentActivity.sort((a, b) => b.time.getTime() - a.time.getTime());

        const analyticsData: UserAnalytics = {
          totalChats: chatHistory.length,
          totalMessages,
          totalBookmarks: bookmarks.length,
          totalDays: chatDates.length,
          averageMessagesPerDay: chatDates.length > 0 ? Math.round(totalMessages / chatDates.length) : 0,
          mostActiveDay: chatHistory.length > 0 ? chatHistory[0].date : undefined,
          recentActivity: recentActivity.slice(0, 10)
        };

        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading user analytics:', error);
        // Set empty analytics on error to show zeros instead of loading forever
        setAnalytics({
          totalChats: 0,
          totalMessages: 0,
          totalBookmarks: 0,
          totalDays: 0,
          averageMessagesPerDay: 0,
          recentActivity: []
        });
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    loadUserAnalytics();
  }, [user?.username, user?.id, user]);

  if (!isLoaded || isLoadingAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Please sign in to access this page.</div>
      </div>
    );
  }

  return (
    <ClientRouteGuard requireAuth={true} lightLoading={true}>
      <SidebarProvider>
        <AppSidebar collapsible="hidden" />
        <SidebarInset className="bg-sidebar group/sidebar-inset">
          <div className="flex h-[calc(100svh)] bg-[hsl(240_5%_92.16%)] md:rounded-s-3xl md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none transition-all ease-in-out duration-300">
            <ScrollArea className="flex-1 [&>div>div]:h-full w-full shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
              <div className="h-full flex flex-col px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="py-5 bg-background sticky top-0 z-10 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <SidebarTrigger />
                      <Breadcrumb>
                        <BreadcrumbList className="sm:gap-1.5">
                          <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Harmony</BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbLink href="#">{username}</BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>Analytics</BreadcrumbPage>
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1">
                        <RiStarLine className="mr-1.5 h-3 w-3" />
                        {analytics?.totalDays || 0} active days
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative grow pb-8">
                  <div className="space-y-6 mt-4">
                    {/* Welcome Section */}
                    <div className="flex flex-col space-y-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back, {user?.firstName || user?.fullName?.split(' ')[0] || "User"}
                      </h1>
                      <p className="text-muted-foreground">
                        Here's an overview of your activity on Harmony
                      </p>
                    </div>

                    {/* User Profile Card */}
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                          <div className="flex-shrink-0">
                            {user?.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={user.fullName || "User"}
                                className="w-16 h-16 rounded-full object-cover border-2 border-border/50"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold border-2 border-border/50">
                                {user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div>
                              <h2 className="text-xl font-semibold">
                                {user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Anonymous User"}
                              </h2>
                              <p className="text-muted-foreground text-sm">
                                @{username} • Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <RiMailLine className="h-4 w-4 text-muted-foreground/70" />
                                <span className="text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</span>
                              </div>
                              {user?.phoneNumbers[0]?.phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <RiPhoneLine className="h-4 w-4 text-muted-foreground/70" />
                                  <span className="text-muted-foreground">{user.phoneNumbers[0].phoneNumber}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <RiTimeLine className="h-4 w-4 text-muted-foreground/70" />
                                <span className="text-muted-foreground">
                                  Last active: {user?.lastSignInAt ? formatDistanceToNow(new Date(user.lastSignInAt), { addSuffix: true }) : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-muted-foreground">Active Account</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Chats</p>
                            <p className="text-2xl font-bold">{analytics?.totalChats || 0}</p>
                            <p className="text-xs text-muted-foreground">Chat sessions</p>
                          </div>
                          <div className="p-3 bg-blue-500/10 rounded-lg">
                            <RiChatSmile3Line className="h-6 w-6 text-blue-500" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Messages</p>
                            <p className="text-2xl font-bold">{analytics?.totalMessages || 0}</p>
                            <p className="text-xs text-muted-foreground">Messages sent</p>
                          </div>
                          <div className="p-3 bg-green-500/10 rounded-lg">
                            <RiMessageLine className="h-6 w-6 text-green-500" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Bookmarks</p>
                            <p className="text-2xl font-bold">{analytics?.totalBookmarks || 0}</p>
                            <p className="text-xs text-muted-foreground">Saved messages</p>
                          </div>
                          <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <RiBookmarkLine className="h-6 w-6 text-yellow-500" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                            <p className="text-2xl font-bold">{analytics?.averageMessagesPerDay || 0}</p>
                            <p className="text-xs text-muted-foreground">Messages per day</p>
                          </div>
                          <div className="p-3 bg-purple-500/10 rounded-lg">
                            <RiLineChartLine className="h-6 w-6 text-purple-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-card rounded-xl border shadow-sm">
                      <div className="p-6 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">Recent Activity</h3>
                            <p className="text-sm text-muted-foreground">Your latest interactions with Harmony</p>
                          </div>
                          <RiTimeLine className="h-5 w-5 text-muted-foreground/70" />
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                          <div className="space-y-4">
                            {analytics.recentActivity.slice(0, 8).map((activity, index) => (
                              <div key={index} className="flex items-start gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-border/30">
                                <div className="flex-shrink-0 mt-1">
                                  <div className={`p-2 rounded-lg ${
                                    activity.event === 'Chat Session' 
                                      ? 'bg-blue-500/10' 
                                      : 'bg-yellow-500/10'
                                  }`}>
                                    {activity.event === 'Chat Session' ? (
                                      <RiChatSmile3Line className={`h-4 w-4 ${
                                        activity.event === 'Chat Session' 
                                          ? 'text-blue-500' 
                                          : 'text-yellow-500'
                                      }`} />
                                    ) : (
                                      <RiBookmarkLine className={`h-4 w-4 ${
                                        activity.event === 'Chat Session' 
                                          ? 'text-blue-500' 
                                          : 'text-yellow-500'
                                      }`} />
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium">{activity.event}</p>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                      {formatDistanceToNow(activity.time, { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1 break-words">
                                    {activity.details}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="mx-auto w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center mb-4">
                              <RiHeartLine className="h-6 w-6 text-muted-foreground/70" />
                            </div>
                            <h4 className="text-sm font-medium mb-2">No activity yet</h4>
                            <p className="text-sm text-muted-foreground">
                              Start chatting to see your activity timeline here!
                            </p>
                            <Button className="mt-4" size="sm">
                              <RiArrowRightUpLine className="mr-2 h-4 w-4" />
                              Start Chatting
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ClientRouteGuard>
  );
}
