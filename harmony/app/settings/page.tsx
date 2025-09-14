'use client';

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/contexts/theme-context";
import { 
  saveUserSettings, 
  getUserSettings, 
  updateUserSetting, 
  deleteUserData,
  UserSettings 
} from "@/lib/firebase-service";
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
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Separator } from "@/components/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert-dialog";
import {
  RiSettings3Line,
  RiDeleteBinLine,
  RiMoonLine,
  RiSunLine,
  RiComputerLine,
  RiUser3Line,
  RiShieldCheckLine,
  RiNotification3Line,
  RiPaletteLine,
  RiDatabase2Line,
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "@remixicon/react";

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState<UserSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load user settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (user?.username) {
        try {
          const userSettings = await getUserSettings(user.username);
          setSettings(userSettings);
          
          // Check browser notification permission
          if ('Notification' in window) {
            const permission = Notification.permission;
            await updateUserSetting(user.username, 'notifications.browser.permission', permission);
            setSettings(prev => ({
              ...prev,
              notifications: {
                ...prev.notifications,
                browser: {
                  ...prev.notifications?.browser,
                  permission: permission as 'default' | 'granted' | 'denied',
                  enabled: permission === 'granted' && (prev.notifications?.browser?.enabled ?? false)
                }
              }
            }));
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSettings();
  }, [user?.username]);

  const updateSetting = async (path: string, value: any) => {
    if (!user?.username) return;
    
    try {
      await updateUserSetting(user.username, path, value);
      
      // Update local state
      const pathParts = path.split('.');
      setSettings(prev => {
        const newSettings = { ...prev };
        let current: any = newSettings;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = value;
        
        return newSettings;
      });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleDeleteData = async (dataType: 'chats' | 'bookmarks' | 'faqs' | 'all') => {
    if (!user?.username) return;
    
    try {
      const success = await deleteUserData(user.username, dataType);
      
      if (success) {
        alert(`${dataType} data has been successfully deleted.`);
      } else {
        alert(`Failed to delete ${dataType} data. Please try again.`);
      }
    } catch (error) {
      console.error(`Error deleting ${dataType} data:`, error);
      alert(`Failed to delete ${dataType} data. Please try again.`);
    }
  };

  const handleBrowserNotificationToggle = async () => {
    if (!user?.username) return;
    
    try {
      if ('Notification' in window) {
        const currentPermission = Notification.permission;
        
        if (currentPermission === 'default') {
          const permission = await Notification.requestPermission();
          await updateSetting('notifications.browser.permission', permission);
          await updateSetting('notifications.browser.enabled', permission === 'granted');
        } else if (currentPermission === 'granted') {
          // Toggle the enabled state
          const newEnabled = !settings.notifications?.browser?.enabled;
          await updateSetting('notifications.browser.enabled', newEnabled);
        } else {
          alert('Notifications are blocked. Please enable them in your browser settings.');
        }
      }
    } catch (error) {
      console.error('Error handling browser notification toggle:', error);
    }
  };

  if (isLoading) {
    return (
      <ClientRouteGuard requireAuth={true} lightLoading={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground/30 border-t-foreground"></div>
        </div>
      </ClientRouteGuard>
    );
  }

  // Settings sections
  const settingsSections = [
    {
      id: 'general',
      title: 'General',
      icon: RiSettings3Line,
      description: 'Basic account and profile settings'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: RiPaletteLine,
      description: 'Theme and visual preferences'
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: RiDatabase2Line,
      description: 'Manage your stored data and privacy'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: RiNotification3Line,
      description: 'Email and push notification settings'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: RiShieldCheckLine,
      description: 'Security settings and data privacy'
    }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={user?.username || user?.firstName + ' ' + user?.lastName || ''} 
              readOnly 
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              value={user?.emailAddresses[0]?.emailAddress || ''} 
              readOnly 
              className="bg-muted"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Profile information is managed through your account provider and cannot be edited here.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account Status</p>
              <p className="text-sm text-muted-foreground">Your account is active and verified</p>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <RiCheckLine className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account Management</p>
              <p className="text-sm text-muted-foreground">Manage your account settings, security, and preferences</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Open Clerk user profile modal
                const clerk = (window as any).Clerk;
                if (clerk) {
                  clerk.openUserProfile();
                }
              }}
            >
              Open Account Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Theme Preferences</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme">Color Theme</Label>
            <Select 
              value={theme} 
              onValueChange={(value: 'light' | 'dark' | 'system') => {
                setTheme(value);
                updateSetting('theme', value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <RiSunLine className="w-4 h-4" />
                    Light Mode
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <RiMoonLine className="w-4 h-4" />
                    Dark Mode
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <RiComputerLine className="w-4 h-4" />
                    System Default
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Choose your preferred color theme. System default will match your device settings.
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Display Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Animation Effects</p>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                </div>
                <Button 
                  variant={settings.appearance?.animationEffects !== false ? "default" : "outline"} 
                  size="sm"
                  onClick={() => updateSetting('appearance.animationEffects', !(settings.appearance?.animationEffects !== false))}
                >
                  {settings.appearance?.animationEffects !== false ? (
                    <>
                      <RiCheckLine className="w-4 h-4 mr-1" />
                      Enabled
                    </>
                  ) : (
                    "Disabled"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <RiErrorWarningLine className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Data Deletion Warning</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Deleted data cannot be recovered. Please make sure you want to permanently remove this information.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Chat Data</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Delete All Conversations</p>
              <p className="text-sm text-muted-foreground">Permanently remove all your chat history and messages</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <RiDeleteBinLine className="w-4 h-4 mr-2" />
                  Delete Chats
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Conversations?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all your chat conversations and messages. 
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => handleDeleteData('chats')}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete All Chats
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Bookmarks Data</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Delete All Bookmarks</p>
              <p className="text-sm text-muted-foreground">Remove all saved bookmarks and favorites</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <RiDeleteBinLine className="w-4 h-4 mr-2" />
                  Delete Bookmarks
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Bookmarks?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all your saved bookmarks. 
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteData('bookmarks')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All Bookmarks
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">FAQ Data</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Delete Asked FAQs</p>
              <p className="text-sm text-muted-foreground">Remove your FAQ submission history</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <RiDeleteBinLine className="w-4 h-4 mr-2" />
                  Delete FAQs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete FAQ History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all your submitted FAQs and questions. 
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteData('faqs')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete FAQ History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Complete Data Removal</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-800">Delete All Data</p>
              <p className="text-sm text-red-600">Permanently remove all your data including chats, bookmarks, and settings</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <RiDeleteBinLine className="w-4 h-4 mr-2" />
                  Delete Everything
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Your Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete ALL your data including conversations, 
                    bookmarks, FAQ submissions, and preferences. This action is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteData('all')}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete All Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-muted-foreground">Important security and account notifications</p>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <RiCheckLine className="w-3 h-3 mr-1" />
              Always Active
            </Badge>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Product Updates</p>
              <p className="text-sm text-muted-foreground">New features and improvements</p>
            </div>
            <Button 
              variant={settings.notifications?.email?.productUpdates ? "default" : "outline"} 
              size="sm"
              onClick={() => updateSetting('notifications.email.productUpdates', !settings.notifications?.email?.productUpdates)}
            >
              {settings.notifications?.email?.productUpdates ? (
                <>
                  <RiCheckLine className="w-4 h-4 mr-1" />
                  Enabled
                </>
              ) : (
                "Disabled"
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Browser Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Desktop Notifications</p>
              <p className="text-sm text-muted-foreground">
                {settings.notifications?.browser?.permission === 'granted' 
                  ? 'Show notifications in your browser'
                  : settings.notifications?.browser?.permission === 'denied'
                  ? 'Notifications are blocked - enable in browser settings'
                  : 'Click to request notification permission'
                }
              </p>
            </div>
            <Button 
              variant={settings.notifications?.browser?.enabled ? "default" : "outline"} 
              size="sm"
              onClick={handleBrowserNotificationToggle}
              disabled={settings.notifications?.browser?.permission === 'denied'}
            >
              {settings.notifications?.browser?.permission === 'granted' ? (
                settings.notifications?.browser?.enabled ? (
                  <>
                    <RiCheckLine className="w-4 h-4 mr-1" />
                    Enabled
                  </>
                ) : (
                  "Enable"
                )
              ) : settings.notifications?.browser?.permission === 'denied' ? (
                "Blocked"
              ) : (
                "Request Permission"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Data Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Data Processing</p>
              <p className="text-sm text-muted-foreground">Allow processing of your data for service improvement</p>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <RiCheckLine className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Analytics</p>
              <p className="text-sm text-muted-foreground">Help improve our service by sharing usage analytics</p>
            </div>
            <Button 
              variant={settings.privacy?.analytics !== false ? "default" : "outline"} 
              size="sm"
              onClick={() => updateSetting('privacy.analytics', !(settings.privacy?.analytics !== false))}
            >
              {settings.privacy?.analytics !== false ? (
                <>
                  <RiCheckLine className="w-4 h-4 mr-1" />
                  Enabled
                </>
              ) : (
                "Disabled"
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Account Settings</p>
              <p className="text-sm text-muted-foreground">Manage your security, password, and account preferences</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Open Clerk user profile modal
                const clerk = (window as any).Clerk;
                if (clerk) {
                  clerk.openUserProfile();
                }
              }}
            >
              Open Account Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'data':
        return renderDataSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      default:
        return renderGeneralSettings();
    }
  };

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
                            <BreadcrumbLink href="/">Harmony</BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>Settings</BreadcrumbPage>
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 py-8">
                  <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                      <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                      <p className="text-muted-foreground">
                        Manage your account preferences and application settings.
                      </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Settings Navigation */}
                      <div className="lg:w-80 space-y-1">
                        {settingsSections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left p-4 rounded-lg transition-all duration-200 hover:translate-x-1 hover:shadow-md ${
                              activeSection === section.id
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <section.icon className={`w-5 h-5 mt-0.5 ${
                                activeSection === section.id ? 'text-primary-foreground' : 'text-muted-foreground'
                              }`} />
                              <div>
                                <h3 className={`font-medium ${
                                  activeSection === section.id ? 'text-primary-foreground' : 'text-foreground'
                                }`}>
                                  {section.title}
                                </h3>
                                <p className={`text-sm ${
                                  activeSection === section.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                }`}>
                                  {section.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Settings Content */}
                      <div className="flex-1">
                        <div className="bg-card border rounded-lg p-6">
                          {renderSettingsContent()}
                        </div>
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