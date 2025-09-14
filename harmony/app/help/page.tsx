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

type TabType = 'faq' | 'public' | 'user';

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
  const [showPublicForm, setShowPublicForm] = useState(false);
  const [showPrivateForm, setShowPrivateForm] = useState(false);

  // Load questions from Firebase
  React.useEffect(() => {
    if (!isLoaded) return;

    setIsLoadingQuestions(true);
    
    // Load public questions
    const unsubscribePublic = listenToPublicQuestions((questions) => {
      console.log('Public questions loaded:', questions);
      setPublicQuestions(questions);
      setIsLoadingQuestions(false);
    });

    // Load private questions if user is authenticated
    let unsubscribePrivate: (() => void) | null = null;
    const userIdentifier = getUserIdentifier(user || null);
    if (userIdentifier) {
      console.log('Loading private questions for user:', userIdentifier);
      unsubscribePrivate = listenToPrivateQuestions(userIdentifier, (questions) => {
        console.log('Private questions loaded for', userIdentifier, ':', questions);
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
      console.log('Submitting question. isPublic:', isPublicQuestion, 'questionForm.isPublic:', questionForm.isPublic);
      
      if (isPublicQuestion) {
        console.log('Submitting as public question');
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
        console.log('Submitting as private question');
        const userIdentifier = getUserIdentifier(user || null);
        if (!userIdentifier) {
          throw new Error('Must be logged in to submit private questions');
        }
        
        console.log('Private question user identifier:', userIdentifier);
        await submitPrivateQuestion(userIdentifier, {
          question: questionForm.question,
          description: questionForm.description || undefined,
          category: questionForm.category
        });
      }
      
      // Reset form and close dropdowns
      setQuestionForm({
        question: '',
        description: '',
        category: 'general',
        isPublic: true,
        isAnonymous: false
      });
      setShowPublicForm(false);
      setShowPrivateForm(false);
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
                            User Q&A
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search and Filter */}
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

                    {/* Content Based on Active Tab */}
                    <div className="p-6">
                      {activeTab === 'faq' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-6">
                            <RiBookOpenLine className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
                          </div>
                          {filterAndSortItems(faqData, searchQuery, selectedCategory, sortBy).map((faq) => (
                            <div key={faq.id} className="border border-border/30 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
                              <button
                                onClick={() => toggleExpanded(`faq-${faq.id}`)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-all duration-200"
                              >
                                <div className="flex items-start gap-3">
                                  <RiLightbulbLine className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                  <span className="font-medium">{faq.question}</span>
                                </div>
                                <RiArrowDownSLine className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${expandedItems.has(`faq-${faq.id}`) ? 'rotate-180' : ''}`} />
                              </button>
                              {expandedItems.has(`faq-${faq.id}`) && (
                                <div className="px-4 pb-4 border-t border-border/20 animate-in slide-in-from-top-2 duration-300">
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
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'public' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-6">
                            <RiGlobalLine className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Public Questions & Answers</h2>
                          </div>
                          
                          {/* Ask Public Question Form */}
                          <div className="bg-gradient-to-l from-white-50 to-emerald-50 p-2 pl-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">Ask a Public Question</h3>
                              <button
                                onClick={() => setShowPublicForm(!showPublicForm)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white-600 text-black rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                              >
                                {showPublicForm ? <RiSubtractLine className="w-4 h-4" /> : <RiAddLine className="w-4 h-4" />}
                                <span>{showPublicForm ? 'Cancel' : 'Add Question'}</span>
                              </button>
                            </div>
                            
                            {showPublicForm && (
                              <div className="animate-in slide-in-from-top-2 duration-300">
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmitQuestion(true);
                                  }}
                                  className="space-y-4 mt-4 p-4 dark:bg-neutral-800/30 rounded-lg dark:border-neutral-700/50"
                                >
                                <div>
                                  <label htmlFor="public-question" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Question
                                  </label>
                                  <Input
                                    id="public-question"
                                    value={questionForm.question}
                                    onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                                    placeholder="What would you like to ask?"
                                    required
                                  />
                                </div>

                                <div>
                                  <label htmlFor="public-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Description (optional)
                                  </label>
                                  <Textarea
                                    id="public-description"
                                    value={questionForm.description}
                                    onChange={(e) => setQuestionForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Provide more details about your question..."
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <label htmlFor="public-category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Category
                                  </label>
                                  <Select
                                    value={questionForm.category}
                                    onValueChange={(value) => setQuestionForm(prev => ({ ...prev, category: value }))}
                                  >
                                    <SelectTrigger className="h-10 border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-colors duration-200">
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-lg">
                                      <SelectItem value="general" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">General</SelectItem>
                                      <SelectItem value="features" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Features</SelectItem>
                                      <SelectItem value="pricing" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Pricing</SelectItem>
                                      <SelectItem value="technical" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Technical</SelectItem>
                                      <SelectItem value="feedback" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Feedback</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id="anonymous-toggle"
                                    checked={!isLoaded || !user || questionForm.isAnonymous}
                                    onCheckedChange={(checked) => {
                                      // Only allow changing if user is signed in
                                      if (isLoaded && user) {
                                        setQuestionForm(prev => ({ ...prev, isAnonymous: !!checked }));
                                      }
                                    }}
                                    disabled={!isLoaded || !user}
                                    className="border-neutral-300 dark:border-neutral-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 disabled:opacity-50"
                                  />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <label htmlFor="anonymous-toggle" className={`flex items-center text-sm cursor-pointer transition-colors duration-200 ${
                                          !isLoaded || !user 
                                            ? 'text-neutral-400 dark:text-neutral-500 cursor-not-allowed' 
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                                        }`}>
                                          <RiEyeOffLine className="w-4 h-4 mr-1" />
                                          Post anonymously
                                          {(!isLoaded || !user) && <span className="ml-1 text-xs">(Required)</span>}
                                        </label>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs px-2 py-1">
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

                                <Button
                                  type="submit"
                                  disabled={isSubmitting || !questionForm.question.trim()}
                                  className="w-full bg-white-600 border border-black-300 hover:bg-white-700 disabled:bg-neutral-300 text-black disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                                >
                                  <RiSendPlaneLine className="mr-2 h-4 w-4" />
                                  {isSubmitting ? 'Submitting...' : 'Submit Question'}
                                </Button>
                              </form>
                              </div>
                            )}
                          </div>

                          {isLoadingQuestions ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-muted-foreground">Loading questions...</p>
                            </div>
                          ) : (
                            filterAndSortItems(publicQuestions, searchQuery, selectedCategory, sortBy).map((qna) => (
                              <div key={qna.id} className="border border-border/30 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
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
                                  <RiArrowDownSLine className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${expandedItems.has(`public-${qna.id}`) ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedItems.has(`public-${qna.id}`) && (
                                  <div className="px-4 pb-4 border-t border-border/20 animate-in slide-in-from-top-2 duration-300">
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
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {activeTab === 'user' && user && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-6">
                            <RiShieldCheckLine className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">User Questions & Answers</h2>
                            <Badge variant="outline" className="text-xs">
                              Authenticated Users Only
                            </Badge>
                          </div>
                          
                          {/* Ask Private Question Form */}
                          <div className="bg-gradient-to-l from-white-50 to-emerald-50 p-2 pl-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">Ask a Private Question</h3>
                              <button
                                onClick={() => setShowPrivateForm(!showPrivateForm)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white-600 text-black rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                              >
                                {showPrivateForm ? <RiSubtractLine className="w-4 h-4" /> : <RiAddLine className="w-4 h-4" />}
                                <span>{showPrivateForm ? 'Cancel' : 'Add Question'}</span>
                              </button>
                            </div>
                            
                            {showPrivateForm && (
                              <div className="animate-in slide-in-from-top-2 duration-300">
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmitQuestion(false);
                                  }}
                                  className="space-y-4 mt-4 p-4 dark:bg-neutral-800/30 rounded-lg dark:border-neutral-700/50"
                                >
                                <div>
                                  <label htmlFor="private-question" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Question
                                  </label>
                                  <Input
                                    id="private-question"
                                    value={questionForm.question}
                                    onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                                    placeholder="What would you like to ask?"
                                    required
                                  />
                                </div>

                                <div>
                                  <label htmlFor="private-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Description (optional)
                                  </label>
                                  <Textarea
                                    id="private-description"
                                    value={questionForm.description}
                                    onChange={(e) => setQuestionForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Provide more details about your question..."
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <label htmlFor="private-category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Category
                                  </label>
                                  <Select
                                    value={questionForm.category}
                                    onValueChange={(value) => setQuestionForm(prev => ({ ...prev, category: value }))}
                                  >
                                    <SelectTrigger className="h-10 border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-colors duration-200">
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-lg">
                                      <SelectItem value="general" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">General</SelectItem>
                                      <SelectItem value="account" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Account</SelectItem>
                                      <SelectItem value="billing" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Billing</SelectItem>
                                      <SelectItem value="features" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Features</SelectItem>
                                      <SelectItem value="technical" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Technical</SelectItem>
                                      <SelectItem value="privacy" className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200">Privacy</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <Button
                                  type="submit"
                                  disabled={isSubmitting || !questionForm.question.trim()}
                                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                                >
                                  <RiSendPlaneLine className="mr-2 h-4 w-4" />
                                  {isSubmitting ? 'Submitting...' : 'Submit Private Question'}
                                </Button>
                              </form>
                              </div>
                            )}
                          </div>

                          {isLoadingQuestions ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-muted-foreground">Loading your questions...</p>
                            </div>
                          ) : (
                            filterAndSortItems(privateQuestions, searchQuery, selectedCategory, sortBy).map((qna) => (
                              <div key={qna.id} className="border border-border/30 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
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
                                  <RiArrowDownSLine className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${expandedItems.has(`user-${qna.id}`) ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedItems.has(`user-${qna.id}`) && (
                                  <div className="px-4 pb-4 border-t border-border/20 animate-in slide-in-from-top-2 duration-300">
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
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Empty States */}
                      {!isLoadingQuestions && (
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
                              ? "You haven't asked any questions yet. Submit your first question above!"
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