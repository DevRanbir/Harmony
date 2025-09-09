'use client';

import React from 'react';
import { useUser } from "@clerk/nextjs";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";
import { ClientRouteGuard } from "@/components/client-route-guard";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function MetricsPage({ params }: PageProps) {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = React.useState<string>('');

  React.useEffect(() => {
    const getUsername = async () => {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    };
    getUsername();
  }, [params]);

  if (!isLoaded) {
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
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {/* User Profile Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger className="md:hidden" />
                    <h1 className="text-2xl font-bold text-gray-900">User Profile & Analytics</h1>
                  </div>
                  
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Analytics Dashboard
                  </h2>
                  <p className="text-gray-600">
                    Welcome back, {user?.firstName || user?.fullName || "User"}! Here's your data overview.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">2,543</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-green-500 text-sm font-medium">+12%</span>
                      <span className="text-gray-600 text-sm ml-2">from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">$12,845</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-green-500 text-sm font-medium">+8%</span>
                      <span className="text-gray-600 text-sm ml-2">from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-green-500 text-sm font-medium">+15%</span>
                      <span className="text-gray-600 text-sm ml-2">from last hour</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">3.24%</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-red-500 text-sm font-medium">-2%</span>
                      <span className="text-gray-600 text-sm ml-2">from last month</span>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      User Growth
                    </h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Chart placeholder - User Growth</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Revenue Trends
                    </h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Chart placeholder - Revenue Trends</p>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
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
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            User Registration
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            john.doe@example.com
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2 minutes ago
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Payment Processing
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            jane.smith@example.com
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            5 minutes ago
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Processing
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Data Export
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            admin@company.com
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            10 minutes ago
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </SidebarInset>
    </SidebarProvider>
    </ClientRouteGuard>
  );
}
