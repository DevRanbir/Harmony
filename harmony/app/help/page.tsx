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
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Checkbox } from "@/components/checkbox";
import {
  RiQuestionLine,
  RiUserLine,
  RiGlobalLine,
  RiSearchLine,
  RiArrowDownSLine,
  RiBookOpenLine,
  RiCustomerService2Line,
  RiLightbulbLine,
  RiShieldCheckLine,
  RiMessageLine,
  RiSendPlaneLine,
  RiThumbUpLine,
  RiAddLine,
  RiSubtractLine,
  RiEyeOffLine,
  RiEditLine,
  RiLockLine,
  RiLoginBoxLine,
} from "@remixicon/react";
import { 
  submitPublicQuestion,
  submitPrivateQuestion,
  voteOnQuestion,
  hasUserVoted,
  listenToPublicQuestions,
  listenToPrivateQuestions,
  type Question,
  type PrivateQuestion
} from "@/lib/firebase-service";

// FAQ Data (remains static)
const faqData = [
  {
    id: 1,
    question: "What is Harmony?",
    answer: "Harmony is an AI-powered chat application that helps you have meaningful conversations with advanced AI models. You can chat, save bookmarks, and track your activity all in one place.",
    category: "general",
    timestamp: Date.now() - 86400000 * 7, // 7 days ago
    votes: 15
  },
  {
    id: 2,
    question: "How do I start a new chat?",
    answer: "Simply navigate to the Dashboard and start typing in the chat input field. Your conversation will be automatically saved and you can access it later from your chat history.",
    category: "usage",
    timestamp: Date.now() - 86400000 * 5, // 5 days ago
    votes: 8
  },
  {
    id: 3,
    question: "How do bookmarks work?",
    answer: "You can bookmark any message in your chat by clicking the bookmark icon. All your bookmarks are saved in the Bookmarks section where you can search, filter, and organize them.",
    category: "features",
    timestamp: Date.now() - 86400000 * 3, // 3 days ago
    votes: 12
  },
  {
    id: 4,
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All your data is encrypted and stored securely. We use industry-standard security practices to protect your information.",
    category: "security",
    timestamp: Date.now() - 86400000 * 10, // 10 days ago
    votes: 22
  },
  {
    id: 5,
    question: "Can I delete my conversations?",
    answer: "Yes, you can manage your conversations through the chat history. You have full control over your data and can delete conversations at any time.",
    category: "privacy",
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    votes: 6
  },
  {
    id: 6,
    question: "How do I view my analytics?",
    answer: "Navigate to your user profile and go to the Analytics section to see detailed insights about your chat activity, message counts, and usage patterns.",
    category: "features",
    timestamp: Date.now() - 86400000 * 1, // 1 day ago
    votes: 9
  }
];

type TabType = 'faq' | 'public' | 'user' | 'ask';

interface UserType {
  id?: string;
  username?: string | null;
  primaryEmailAddress?: {
    emailAddress?: string;
  } | null;
}

// Helper function to get the correct username for database operations
const getUserIdentifier = (user: UserType | null): string | null => {
  if (!user) return null;
  
  // Check if this is the devranbir user based on email or username
  if (user?.primaryEmailAddress?.emailAddress?.includes('devranbir') || 
      user?.username?.toLowerCase() === 'devranbir' ||
      user?.id?.toLowerCase().includes('devranbir')) {
    return 'devranbir';
  }
  
  // For other users, use username or id
  return user.username || user.id || null;
};

export default function HelpPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItems, setHoveredItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'votes' | 'alphabetical'>('newest');
  
  // Firebase state
  const [publicQuestions, setPublicQuestions] = useState<Question[]>([]);
  const [privateQuestions, setPrivateQuestions] = useState<PrivateQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  
  // Form state
  const [questionForm, setQuestionForm] = useState({
    question: '',
    description: '',
    category: 'general',
    isPublic: true,
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load questions from Firebase
  React.useEffect(() => {
    if (!isLoaded) return;

    setIsLoadingQuestions(true);
    
    // Load public questions
    const unsubscribePublic = listenToPublicQuestions((questions) => {
      setPublicQuestions(questions);
      setIsLoadingQuestions(false);
    });

    // Load private questions if user is authenticated
    let unsubscribePrivate: (() => void) | null = null;
    const userIdentifier = getUserIdentifier(user || null);
    if (userIdentifier) {
      unsubscribePrivate = listenToPrivateQuestions(userIdentifier, (questions) => {
        setPrivateQuestions(questions);
      });
    }

    return () => {
      unsubscribePublic();
      if (unsubscribePrivate) {
        unsubscribePrivate();
      }
    };
  }, [user, isLoaded]);

  // Check which questions the user has voted on
  useEffect(() => {
    const checkUserVotes = async () => {
      if (!user?.id || publicQuestions.length === 0) return;

      const votedQuestions = new Set<string>();
      
      await Promise.all(
        publicQuestions.map(async (question) => {
          try {
            const hasVoted = await hasUserVoted(question.id, user.id);
            if (hasVoted) {
              votedQuestions.add(question.id);
            }
          } catch (error) {
            console.error('Error checking vote status:', error);
          }
        })
      );
      
      setUserVotes(votedQuestions);
    };

    checkUserVotes();
  }, [user?.id, publicQuestions]);

  const handleSubmitQuestion = async (isPublic?: boolean) => {
    if (!questionForm.question.trim()) return;
    
    setIsSubmitting(true);
    try {
      const isPublicQuestion = isPublic !== undefined ? isPublic : questionForm.isPublic;
      
      if (isPublicQuestion) {
        // Force anonymous for signed out users, otherwise use user preference
        const forceAnonymous = !isLoaded || !user;
        const authorName = (forceAnonymous || questionForm.isAnonymous)
          ? 'Anonymous User' 
          : (user?.fullName || user?.firstName || 'Anonymous');
          
        await submitPublicQuestion({
          question: questionForm.question,
          description: questionForm.description || undefined,
          category: questionForm.category,
          author: authorName,
          authorEmail: user?.emailAddresses[0]?.emailAddress,
          isAnonymous: forceAnonymous || questionForm.isAnonymous
        });
      } else {
        const userIdentifier = getUserIdentifier(user || null);
        if (!userIdentifier) {
          throw new Error('Must be logged in to submit private questions');
        }
        
        await submitPrivateQuestion(userIdentifier, {
          question: questionForm.question,
          description: questionForm.description || undefined,
          category: questionForm.category
        });
      }
      
      // Reset form
      setQuestionForm({
        question: '',
        description: '',
        category: 'general',
        isPublic: true,
        isAnonymous: false
      });
    } catch (error) {
      console.error('Error submitting question:', error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (questionId: string, increment: boolean) => {
    if (!user) {
      console.error('User must be logged in to vote');
      return;
    }

    try {
      const hasVoted = userVotes.has(questionId);
      
      // If trying to upvote but already voted, or trying to downvote but haven't voted, return
      if ((increment && hasVoted) || (!increment && !hasVoted)) {
        return;
      }

      await voteOnQuestion(questionId, user.id, increment);
      
      // Update local state
      const newUserVotes = new Set(userVotes);
      if (increment) {
        newUserVotes.add(questionId);
      } else {
        newUserVotes.delete(questionId);
      }
      setUserVotes(newUserVotes);
      
    } catch (error) {
      console.error('Error voting:', error);
      // You could add a toast notification here for better UX
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemHover = (id: string, isHovering: boolean) => {
    const newHovered = new Set(hoveredItems);
    if (isHovering) {
      newHovered.add(id);
    } else {
      newHovered.delete(id);
    }
    setHoveredItems(newHovered);
  };

  const isItemExpanded = (id: string) => {
    return expandedItems.has(id) || hoveredItems.has(id);
  };

  const filterAndSortItems = <T extends { id: string | number; question: string; category: string; timestamp?: number; votes?: number; answer?: string; description?: string }>(
    items: T[], 
    searchQuery: string, 
    category: string, 
    sortBy: string
  ): T[] => {
    // Filter items
    const filtered = items.filter(item => {
      const searchText = searchQuery.toLowerCase();
      const matchesSearch = item.question.toLowerCase().includes(searchText) ||
                           (item.answer && item.answer.toLowerCase().includes(searchText)) ||
                           (item.description && item.description.toLowerCase().includes(searchText));
      const matchesCategory = category === 'all' || item.category === category;
      return matchesSearch && matchesCategory;
    });

    // Sort items
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.timestamp || 0) - (a.timestamp || 0);
        case 'oldest':
          return (a.timestamp || 0) - (b.timestamp || 0);
        case 'votes':
          return (b.votes || 0) - (a.votes || 0);
        case 'alphabetical':
          return a.question.localeCompare(b.question);
        default:
          return 0;
      }
    });
  };

  const getFAQCategories = () => {
    const categories = ['all', ...new Set(faqData.map(item => item.category))];
    return categories;
  };

  const getPublicCategories = () => {
    const categories = ['all', ...new Set(publicQuestions.map(item => item.category))];
    return categories;
  };

  const getUserCategories = () => {
    const categories = ['all', ...new Set(privateQuestions.map(item => item.category))];
    return categories;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
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
                          <BreadcrumbPage>Help Center</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                      <RiCustomerService2Line className="mr-1.5 h-3 w-3" />
                      Support
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
                      Help Center
                    </h1>
                    <p className="text-muted-foreground">
                      Find answers to your questions and get the help you need
                    </p>
                  </div>

                  {/* Tab Navigation */}
                  <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="border-b border-border/50">
                      <div className="flex">
                        <button
                          onClick={() => {
                            setActiveTab('faq');
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 ease-in-out border-b-2 transform hover:scale-[1.02] ${
                            activeTab === 'faq'
                              ? 'border-primary text-primary bg-primary/5 scale-[1.02]'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <RiQuestionLine className="h-4 w-4" />
                          FAQ
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('public');
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 ease-in-out border-b-2 transform hover:scale-[1.02] ${
                            activeTab === 'public'
                              ? 'border-primary text-primary bg-primary/5 scale-[1.02]'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <RiGlobalLine className="h-4 w-4" />
                          Public Q&A
                        </button>
                        {user && (
                          <button
                            onClick={() => {
                              setActiveTab('user');
                              setSearchQuery('');
                              setSelectedCategory('all');
                            }}
                            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 ease-in-out border-b-2 transform hover:scale-[1.02] ${
                              activeTab === 'user'
                                ? 'border-primary text-primary bg-primary/5 scale-[1.02]'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <RiUserLine className="h-4 w-4" />
                            Your Q&A
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('ask');
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-300 ease-in-out border-b-2 transform hover:scale-[1.02] ${
                            activeTab === 'ask'
                              ? 'border-primary text-primary bg-primary/5 scale-[1.02]'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <RiEditLine className="h-4 w-4" />
                          Ask Question
                        </button>
                      </div>
                    </div>

                    {/* Search and Filter */}
                    {activeTab !== 'ask' && (
                      <div className="p-6 border-b border-border/30">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="relative flex-1">
                            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70" size={16} />
                            <Input
                              placeholder="Search questions..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                              <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {(activeTab === 'faq' ? getFAQCategories() :
                                  activeTab === 'public' ? getPublicCategories() :
                                  getUserCategories()).map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'votes' | 'alphabetical') => setSortBy(value)}>
                              <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Sort by" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="oldest">Oldest</SelectItem>
                                <SelectItem value="votes">Most Votes</SelectItem>
                                <SelectItem value="alphabetical">A-Z</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content Based on Active Tab */}
                    <div className="p-6">
                      {activeTab === 'faq' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-6">
                            <RiBookOpenLine className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
                          </div>
                          {filterAndSortItems(faqData, searchQuery, selectedCategory, sortBy).map((faq) => (
                            <div 
                              key={faq.id} 
                              className="border border-border/30 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/50"
                              onMouseEnter={() => handleItemHover(`faq-${faq.id}`, true)}
                              onMouseLeave={() => handleItemHover(`faq-${faq.id}`, false)}
                            >
                              <button
                                onClick={() => toggleExpanded(`faq-${faq.id}`)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-all duration-200"
                              >
                                <div className="flex items-start gap-3">
                                  <RiLightbulbLine className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                  <span className="font-medium">{faq.question}</span>
                                </div>
                                <RiArrowDownSLine className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-all duration-500 ease-out ${isItemExpanded(`faq-${faq.id}`) ? 'rotate-180' : ''}`} />
                              </button>
                              <div className={`transition-all duration-500 ease-out overflow-hidden ${
                                isItemExpanded(`faq-${faq.id}`) 
                                  ? 'max-h-[500px] opacity-100 transform translate-y-0' 
                                  : 'max-h-0 opacity-0 transform -translate-y-2'
                              }`}>
                                <div className={`px-4 pb-4 border-t border-border/20 transition-all duration-500 ease-out delay-75 ${
                                  isItemExpanded(`faq-${faq.id}`) ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-2 opacity-0'
                                }`}>
                                  <div className="pt-3 text-muted-foreground">
                                    {faq.answer}
                                  </div>
                                  <div className="mt-3 flex items-center gap-4">
                                    <Badge variant="secondary" className="text-xs">
                                      {faq.category}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <RiThumbUpLine className="h-3 w-3" />
                                      <span>{faq.votes || 0} votes</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'public' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-6">
                            <RiGlobalLine className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Public Questions & Answers</h2>
                            <Badge variant="outline" className="text-xs">
                              Community
                            </Badge>
                          </div>
                          
                          <div className="text-center py-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                            <p className="text-sm text-muted-foreground mb-2">
                              Want to ask a question? Visit the <strong>Ask Question</strong> tab to submit your inquiry.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveTab('ask')}
                              className="text-xs"
                            >
                              <RiEditLine className="mr-1 h-3 w-3" />
                              Ask Question
                            </Button>
                          </div>

                          {isLoadingQuestions ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-muted-foreground">Loading questions...</p>
                            </div>
                          ) : (
                            filterAndSortItems(publicQuestions, searchQuery, selectedCategory, sortBy).map((qna) => (
                              <div 
                                key={qna.id} 
                                className="border border-border/30 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/50"
                                onMouseEnter={() => handleItemHover(`public-${qna.id}`, true)}
                                onMouseLeave={() => handleItemHover(`public-${qna.id}`, false)}
                              >
                                <button
                                  onClick={() => toggleExpanded(`public-${qna.id}`)}
                                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-all duration-200"
                                >
                                  <div className="flex items-start gap-3">
                                    <RiMessageLine className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                      <span className="font-medium block">{qna.question}</span>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          by {qna.author}
                                          {qna.isAnonymous && <RiEyeOffLine className="h-3 w-3" />}
                                        </span>
                                        <span>•</span>
                                        <span>{qna.timestamp ? new Date(qna.timestamp).toLocaleDateString() : 'Unknown date'}</span>
                                        <span>•</span>
                                        <span>{qna.votes || 0} votes</span>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-xs">
                                          {qna.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <RiArrowDownSLine className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${isItemExpanded(`public-${qna.id}`) ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`transition-all duration-500 ease-out overflow-hidden ${
                                  isItemExpanded(`public-${qna.id}`) 
                                    ? 'max-h-[500px] opacity-100 transform translate-y-0' 
                                    : 'max-h-0 opacity-0 transform translate-y-2'
                                }`}>
                                  <div className="px-4 pb-4 border-t border-border/20 transition-opacity duration-500 delay-75">
                                    {qna.description && (
                                      <div className="pt-1 text-sm text-muted-foreground border-b border-border/10 pb-3 mb-3">
                                        <strong>Details:</strong> {qna.description}
                                      </div>
                                    )}
                                    {qna.answer ? (
                                      <div className="pt-1">
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-1 mb-1">
                                          <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Answer:</div>
                                          <div className="text-sm text-green-700 dark:text-green-300">{qna.answer}</div>
                                          {qna.answeredBy && qna.answeredAt && (
                                            <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                                              Answered by {qna.answeredBy} on {new Date(qna.answeredAt).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="pt-1 text-sm text-muted-foreground italic">
                                        This question is pending an answer from our team.
                                      </div>
                                    )}
                                    <div className="mt-3 flex items-center gap-4">
                                      <Badge variant="secondary" className="text-xs">
                                        {qna.category}
                                      </Badge>
                                      <div className="flex items-center gap-2">
                                        <Button 
                                          variant={userVotes.has(String(qna.id)) ? "default" : "ghost"}
                                          size="sm"
                                          onClick={() => handleVote(String(qna.id), !userVotes.has(String(qna.id)))}
                                          className={`text-xs px-2 py-1 h-auto transition-all duration-200 ${
                                            userVotes.has(String(qna.id)) 
                                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                              : 'hover:bg-blue-50 hover:text-blue-600'
                                          }`}
                                          disabled={!user}
                                        >
                                          <RiThumbUpLine className="h-3 w-3 mr-1" />
                                          {userVotes.has(String(qna.id)) ? 'Voted' : 'Vote Up'}
                                        </Button>
                                        <span className="text-xs text-muted-foreground font-medium">{qna.votes || 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeTab === 'user' && user && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-6">
                            <RiShieldCheckLine className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Your Questions & Answers</h2>
                            <Badge variant="outline" className="text-xs">
                              Private
                            </Badge>
                          </div>
                          
                          <div className="text-center py-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                            <p className="text-sm text-muted-foreground mb-2">
                              Want to ask a private question? Visit the <strong>Ask Question</strong> tab to submit your inquiry.
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveTab('ask')}
                              className="text-xs"
                            >
                              <RiEditLine className="mr-1 h-3 w-3" />
                              Ask Question
                            </Button>
                          </div>

                          {isLoadingQuestions ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-muted-foreground">Loading your questions...</p>
                            </div>
                          ) : (
                            filterAndSortItems(privateQuestions, searchQuery, selectedCategory, sortBy).map((qna) => (
                              <div 
                                key={qna.id} 
                                className="border border-border/30 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/50"
                                onMouseEnter={() => handleItemHover(`user-${qna.id}`, true)}
                                onMouseLeave={() => handleItemHover(`user-${qna.id}`, false)}
                              >
                                <button
                                  onClick={() => toggleExpanded(`user-${qna.id}`)}
                                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-all duration-200"
                                >
                                  <div className="flex items-start gap-3">
                                    <RiUserLine className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                      <span className="font-medium block">{qna.question}</span>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span>{qna.timestamp ? new Date(qna.timestamp).toLocaleDateString() : 'Unknown date'}</span>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-xs">
                                          {qna.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <RiArrowDownSLine className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${isItemExpanded(`user-${qna.id}`) ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`transition-all duration-500 ease-out overflow-hidden ${
                                  isItemExpanded(`user-${qna.id}`) 
                                    ? 'max-h-[500px] opacity-100 transform translate-y-0' 
                                    : 'max-h-0 opacity-0 transform translate-y-2'
                                }`}>
                                  <div className="px-4 pb-4 border-t border-border/20 transition-opacity duration-500 delay-75">
                                    {qna.description && (
                                      <div className="pt-3 text-sm text-muted-foreground border-b border-border/10 pb-3 mb-3">
                                        <strong>Details:</strong> {qna.description}
                                      </div>
                                    )}
                                    {qna.answer ? (
                                      <div className="pt-1">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-1">
                                          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Answer:</div>
                                          <div className="text-sm text-black-700 dark:text-blue-300">{qna.answer}</div>
                                          {qna.answeredBy && qna.answeredAt && (
                                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                              Answered by {qna.answeredBy} on {new Date(qna.answeredAt).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="pt-3 text-sm text-muted-foreground italic">
                                        Your question is being reviewed by our support team. You&apos;ll receive a private response soon.
                                      </div>
                                    )}
                                    <div className="mt-3">
                                      <Badge variant="secondary" className="text-xs">
                                        {qna.category}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeTab === 'ask' && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-6">
                            <RiEditLine className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Ask a Question</h2>
                          </div>
                          
                          {/* Single Form */}
                          <div className="max-w-2xl mx-auto">
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmitQuestion(questionForm.isPublic);
                              }}
                              className="space-y-6"
                            >
                              {/* Question Type Radio Buttons */}
                              <div>
                                <label className="block text-sm font-medium mb-3">
                                  Question Type
                                </label>
                                <div className="space-y-3">
                                  <div className="flex items-start space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => setQuestionForm(prev => ({ ...prev, isPublic: true }))}
                                      className="flex items-center space-x-2 p-3 border rounded-lg transition-colors hover:bg-muted/50 w-full text-left"
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        questionForm.isPublic ? 'border-primary bg-primary' : 'border-muted-foreground'
                                      }`}>
                                        {questionForm.isPublic && <div className="w-2 h-2 rounded-full bg-background"></div>}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <RiGlobalLine className="h-4 w-4" />
                                          <span className="font-medium">Public Question</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          Visible to all users. Great for general questions that might help others.
                                        </p>
                                      </div>
                                    </button>
                                  </div>
                                  
                                  <div className="flex items-start space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => setQuestionForm(prev => ({ ...prev, isPublic: false }))}
                                      className="flex items-center space-x-2 p-3 border rounded-lg transition-colors hover:bg-muted/50 w-full text-left"
                                      disabled={!user}
                                    >
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        !questionForm.isPublic ? 'border-primary bg-primary' : 'border-muted-foreground'
                                      }`}>
                                        {!questionForm.isPublic && <div className="w-2 h-2 rounded-full bg-background"></div>}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <RiShieldCheckLine className="h-4 w-4" />
                                          <span className="font-medium">Private Question</span>
                                          {!user && (
                                            <Badge variant="outline" className="text-xs">
                                              Login Required
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          Only visible to you and our support team. Perfect for account-specific inquiries.
                                        </p>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Question Input */}
                              <div>
                                <label htmlFor="question" className="block text-sm font-medium mb-2">
                                  Question
                                </label>
                                <Input
                                  id="question"
                                  value={questionForm.question}
                                  onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                                  placeholder="What would you like to ask?"
                                  required
                                />
                              </div>

                              {/* Description Input */}
                              <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-2">
                                  Description (optional)
                                </label>
                                <Textarea
                                  id="description"
                                  value={questionForm.description}
                                  onChange={(e) => setQuestionForm(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Provide more details about your question..."
                                  rows={3}
                                />
                              </div>

                              {/* Category Select */}
                              <div>
                                <label htmlFor="category" className="block text-sm font-medium mb-2">
                                  Category
                                </label>
                                <Select
                                  value={questionForm.category}
                                  onValueChange={(value) => setQuestionForm(prev => ({ ...prev, category: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="features">Features</SelectItem>
                                    <SelectItem value="pricing">Pricing</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="feedback">Feedback</SelectItem>
                                    {!questionForm.isPublic && (
                                      <>
                                        <SelectItem value="account">Account</SelectItem>
                                        <SelectItem value="billing">Billing</SelectItem>
                                        <SelectItem value="privacy">Privacy</SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Anonymous Option (only for public questions) */}
                              {questionForm.isPublic && (
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id="anonymous-toggle"
                                    checked={!isLoaded || !user || questionForm.isAnonymous}
                                    onCheckedChange={(checked) => {
                                      if (isLoaded && user) {
                                        setQuestionForm(prev => ({ ...prev, isAnonymous: !!checked }));
                                      }
                                    }}
                                    disabled={!isLoaded || !user}
                                  />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <label htmlFor="anonymous-toggle" className={`flex items-center text-sm cursor-pointer transition-colors duration-200 ${
                                          !isLoaded || !user 
                                            ? 'text-muted-foreground cursor-not-allowed' 
                                            : 'hover:text-foreground'
                                        }`}>
                                          <RiEyeOffLine className="w-4 h-4 mr-1" />
                                          Post anonymously
                                          {(!isLoaded || !user) && <span className="ml-1 text-xs">(Required)</span>}
                                        </label>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p>
                                          {!isLoaded || !user 
                                            ? 'Sign in to post with your name, or continue posting anonymously' 
                                            : 'Your name and profile will not be visible to other users'
                                          }
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}

                              {/* Submit Button */}
                              {(!questionForm.isPublic && !user) ? (
                                <div className="text-center py-4">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Please sign in to ask private questions
                                  </p>
                                  <Button 
                                    type="button"
                                    onClick={() => window.location.href = '/login'}
                                    variant="outline"
                                  >
                                    <RiLoginBoxLine className="mr-2 h-4 w-4" />
                                    Sign In
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  type="submit"
                                  disabled={isSubmitting || !questionForm.question.trim()}
                                  className="w-full"
                                >
                                  <RiSendPlaneLine className="mr-2 h-4 w-4" />
                                  {isSubmitting ? 'Submitting...' : `Submit ${questionForm.isPublic ? 'Public' : 'Private'} Question`}
                                </Button>
                              )}
                            </form>
                          </div>
                        </div>
                      )}

                      {/* Empty States */}
                      {!isLoadingQuestions && activeTab !== 'ask' && (
                        ((activeTab === 'faq' && filterAndSortItems(faqData, searchQuery, selectedCategory, sortBy).length === 0) ||
                        (activeTab === 'public' && filterAndSortItems(publicQuestions, searchQuery, selectedCategory, sortBy).length === 0) ||
                        (activeTab === 'user' && filterAndSortItems(privateQuestions, searchQuery, selectedCategory, sortBy).length === 0)) && (
                        <div className="text-center py-12">
                          <div className="mx-auto w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center mb-4">
                            <RiSearchLine className="h-6 w-6 text-muted-foreground/70" />
                          </div>
                          <h4 className="text-sm font-medium mb-2">No results found</h4>
                          <p className="text-sm text-muted-foreground">
                            {activeTab === 'user' && privateQuestions.length === 0 && searchQuery === '' && selectedCategory === 'all'
                              ? "You haven't asked any questions yet. Visit the Ask Question tab to submit your first question!"
                              : "Try adjusting your search or filter criteria"
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Support */}
                  <div className="bg-card rounded-xl border shadow-sm p-6">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <RiCustomerService2Line className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
                      <p className="text-muted-foreground mb-4">
                        Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                      </p>
                      <Button>
                        <RiMessageLine className="mr-2 h-4 w-4" />
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}