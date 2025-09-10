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
import { 
  getChatHistory, 
  getBookmarks, 
  getAllChatDates,
  getChatMessages,
  type ChatHistory,
  type BookmarkData 
} from "@/lib/firebase-service";
import { formatDistanceToNow } from "date-fns";

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
    <ClientRouteGuard requireAuth={true}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-sidebar group/sidebar-inset">
          <div className="flex h-[calc(100svh)] bg-[hsl(240_5%_92.16%)] md:rounded-s-3xl md:group-peer-data-[state=collapsed]/sidebar-inset:rounded-s-none transition-all ease-in-out duration-300">
            <ScrollArea className="flex-1 [&>div>div]:h-full w-full shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
              <div className="h-full flex flex-col px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="py-5 bg-background sticky top-0 z-10 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
                  <div className="flex items-center justify-between gap-2">
                    <Breadcrumb>
                      <BreadcrumbList className="sm:gap-1.5">
                        <BreadcrumbItem>
                          <BreadcrumbLink href="#">Harmony</BreadcrumbLink>
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
                    <div className="flex items-center gap-1 -my-2 -me-2">
                      <span className="text-sm text-muted-foreground/70 px-2">
                        {analytics?.totalDays || 0} active days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative grow">
                  <div className="max-w-7xl mx-auto mt-4 space-y-6">
                    {/* User Profile Section */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Profile & Analytics</h1>
                      
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          {user?.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.fullName || "User"}
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold border-2 border-gray-200">
                              {user.fullName?.charAt(0) || user.firstName?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Anonymous User"}
                              </h2>
                              <p className="text-gray-600 mb-4">
                                {user?.emailAddresses[0]?.emailAddress}
                              </p>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">User ID:</span>
                                  <span className="text-gray-900 font-mono text-xs">{user?.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Member since:</span>
                                  <span className="text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Last active:</span>
                                  <span className="text-gray-900">
                                    {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Primary Email:</span>
                                  <span className="text-gray-900">{user?.emailAddresses[0]?.emailAddress}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Phone:</span>
                                  <span className="text-gray-900">{user?.phoneNumbers[0]?.phoneNumber || "Not provided"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Username:</span>
                                  <span className="text-gray-900">{username}</span>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-600">Active Account</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Dashboard Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Analytics Dashboard
                      </h2>
                      <p className="text-gray-600">
                        Welcome back, {user?.firstName || user?.fullName || "User"}! Here's your usage overview.
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Chats</p>
                            <p className="text-2xl font-bold text-gray-900">{analytics?.totalChats || 0}</p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-gray-600 text-sm">Chat sessions created</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Messages</p>
                            <p className="text-2xl font-bold text-gray-900">{analytics?.totalMessages || 0}</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-gray-600 text-sm">Messages exchanged</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Bookmarks</p>
                            <p className="text-2xl font-bold text-gray-900">{analytics?.totalBookmarks || 0}</p>
                          </div>
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-gray-600 text-sm">Messages saved</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Avg Messages/Day</p>
                            <p className="text-2xl font-bold text-gray-900">{analytics?.averageMessagesPerDay || 0}</p>
                          </div>
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-gray-600 text-sm">Daily usage rate</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-white rounded-lg shadow-sm border">
                      <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Recent Activity
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Event
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {analytics.recentActivity.map((activity, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {activity.event}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {activity.details}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDistanceToNow(activity.time, { addSuffix: true })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Completed
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-6 text-center text-gray-500">
                            No recent activity found. Start chatting to see your activity here!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer spacing */}
                <div className="pb-8" />
              </div>
            </ScrollArea>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ClientRouteGuard>
  );
}
