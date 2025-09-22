"use client";

import { SettingsPanelTrigger } from "@/components/settings-panel";
import { SidebarToggle } from "@/components/sidebar-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/breadcrumb";
import { Button } from "@/components/button";
import { ScrollArea } from "@/components/scroll-area";
import {
  RiCodeSSlashLine,
  RiShareLine,
  RiShareCircleLine,
  RiShining2Line,
  RiAttachment2,
  RiMicLine,
  RiLeafLine,
  RiCloseLine,
} from "@remixicon/react";
import { ChatMessage } from "@/components/chat-message";
import { FormattedMessage } from "@/components/formatted-message";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { useSettings } from "@/contexts/settings-context";

export default function Chat() {
// Helper: detect if user is asking for a location (very basic, can be improved)
function extractLocationQuery(text: string): string | null {
  console.log("Checking location query for:", text); // Debug log
  
  // Enhanced patterns to catch more location queries
  const patterns = [
    // "where is mohali", "show me mohali", "location of mohali"
    /(?:where\s+is|show\s+me|location\s+of|find\s+me|directions\s+to|navigate\s+to|route\s+to|go\s+to)\s+([a-zA-Z\s,.-]+?)(?:\?|$)/i,
    // "mohali location", "mohali map", "mohali where"
    /([a-zA-Z\s,.-]+)\s+(?:location|map|where|directions|navigate|route)(?:\?|$)/i,
    // "map of mohali", "directions for mohali"
    /(?:map\s+of|directions\s+for|route\s+for)\s+([a-zA-Z\s,.-]+?)(?:\?|$)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      console.log("Found potential location:", location); // Debug log
      // Filter out very short or common words that might not be locations
      if (location.length > 2 && !['me', 'you', 'it', 'this', 'that', 'here', 'there'].includes(location.toLowerCase())) {
        console.log("Location validated:", location); // Debug log
        return location;
      }
    }
  }
  console.log("No location found"); // Debug log
  return null;
}

// Helper: fetch lat/lng from Google Maps Geocoding API
async function fetchLatLng(location: string): Promise<{lat: number, lng: number, description: string} | null> {
  try {
    console.log("Fetching coordinates for:", location); // Debug log
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.log("No Google Maps API key found"); // Debug log
      return null;
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
    console.log("Making request to:", url); // Debug log
    const res = await fetch(url);
    const data = await res.json();
    console.log("API response:", data); // Debug log
    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      const description = data.results[0].formatted_address;
      console.log("Found coordinates:", { lat, lng, description }); // Debug log
      return { lat, lng, description };
    }
    console.log("No valid results found"); // Debug log
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error); // Debug log
    return null;
  }
}
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthContext();
  const { messages, sendMessage, editMessage, isLoading, isSending, isThinking, currentDate, replyContext, clearReplyContext, removeReplyContext } = useChat();
  const { settings } = useSettings();
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
  const [lastChatDate, setLastChatDate] = useState(currentDate);
  const [inputValue, setInputValue] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const router = useRouter();

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      // Remove highlight after 2 seconds
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  // Reset scroll state when chat changes
  useEffect(() => {
    if (currentDate !== lastChatDate) {
      setHasInitiallyScrolled(false);
      setLastChatDate(currentDate);
    }
  }, [currentDate, lastChatDate]);

  // Only scroll when messages change, but instantly for initial load
  useEffect(() => {
    if (messages.length > 0) {
      if (!hasInitiallyScrolled) {
        // First load - scroll instantly to bottom
        scrollToBottom('auto');
        setHasInitiallyScrolled(true);
      } else {
        // Subsequent messages - smooth scroll
        scrollToBottom('smooth');
      }
    }
  }, [messages, hasInitiallyScrolled]);

  const handleSendMessage = useCallback(async () => {
    if (isSending) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    
    // Only check for location queries if writing style is set to "map-searches"
    if (settings?.writingStyle === 'map-searches') {
      const locationQuery = extractLocationQuery(messageContent);
      if (locationQuery) {
        // Try to get coordinates for the location
        const locationData = await fetchLatLng(locationQuery);
        if (locationData) {
          // Redirect to map page with location parameters
          const mapUrl = `/map?lat=${locationData.lat}&lng=${locationData.lng}&location=${encodeURIComponent(locationData.description)}`;
          router.push(mapUrl);
          return;
        } else {
          // If location lookup fails, send as regular message to AI
          await sendMessage(`I couldn't find the location "${locationQuery}" on the map. ${messageContent}`);
          return;
        }
      }
    }
    
    if (messageContent) {
      await sendMessage(messageContent);
    }
  }, [isSending, inputValue, settings?.writingStyle, router, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue !== inputValue) {
      setInputValue(newValue);
    }
  }, [inputValue]);

  const handleUserMessageClick = (messageId: string, content: string) => {
    if (isSending) return; // Don't allow editing while sending
    
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  return (
    <ScrollArea className="flex-1 [&>div>div]:h-full w-full shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
      <div className="h-full flex flex-col px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="py-5 bg-background sticky top-0 z-10 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <SidebarToggle />
              <Breadcrumb>
                <BreadcrumbList className="sm:gap-1.5">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Harmony</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chat</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-1 -my-2 -me-2">
              <Button variant="ghost" className="px-2">
                <RiShareLine
                  className="text-muted-foreground sm:text-muted-foreground/70 size-5"
                  size={20}
                  aria-hidden="true"
                />
                <span className="max-sm:sr-only">Share</span>
              </Button>
              <SettingsPanelTrigger />
            </div>
          </div>
        </div>
        {/* Chat */}
        <div className="relative grow">
          <div className="max-w-3xl mx-auto mt-6 space-y-6">
            <div className="text-center my-8">
              <div className="inline-flex items-center bg-white rounded-full border border-black/[0.08] shadow-xs text-xs font-medium py-1 px-3 text-foreground/80 dark:bg-sidebar dark:border-white/[0.08] dark:text-foreground/70">
                <RiShining2Line
                  className="me-1.5 text-muted-foreground/70 -ms-1"
                  size={14}
                  aria-hidden="true"
                />
                A New Day
              </div>
            </div>
            
            {messages.map((message) => (
              <div key={message.id} data-message-id={message.id}>
                <ChatMessage 
                  isUser={message.isUser} 
                  userProfileImage={message.userProfileImage || user?.imageUrl}
                  messageId={message.id}
                  messageContent={message.content}
                  messageTimestamp={message.timestamp}
                  onUserMessageClick={handleUserMessageClick}
                  isSelected={false}
                  isHighlighted={highlightedMessageId === message.id}
                  isEditing={editingMessageId === message.id}
                  onEdit={async (messageId: string, newContent: string) => {
                    await editMessage(messageId, newContent);
                    setEditingMessageId(null);
                    setEditingContent("");
                  }}
                  onCancelEdit={handleEditCancel}
                >
                  {/* For AI messages, render with FormattedMessage */}
                  {!message.isUser && <FormattedMessage content={message.content} />}
                </ChatMessage>
              </div>
            ))}
            
            {isLoading && (
              <div className="transition-opacity duration-300 ease-out">
                <ChatMessage isUser={false}>
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-muted-foreground/30 border-t-foreground"></div>
                    <p>Loading chat history...</p>
                  </div>
                </ChatMessage>
              </div>
            )}
            
            {isThinking && (
              <div className="transition-opacity duration-300 ease-out">
                <ChatMessage isUser={false}>
                    <p>Thinking...</p>
                </ChatMessage>
              </div>
            )}
            
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        </div>
        {/* Footer */}
        <div className="sticky bottom-0 pt-4 md:pt-8 z-50">
          <div className="max-w-3xl mx-auto bg-background rounded-[20px] pb-4 md:pb-8">
            {/* Reply tabs - attached to top border of form */}
            {replyContext.length > 0 && (
              <div className="flex gap-1 mb-2 px-2">
                {replyContext.map((reply, index) => (
                  <div 
                    key={reply.messageId}
                    className="group flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-t-lg border-t border-l border-r border-blue-200 dark:border-blue-800 text-sm cursor-pointer hover:bg-blue-150 dark:hover:bg-blue-900/50"
                    onClick={() => scrollToMessage(reply.messageId)}
                  >
                    <span className="truncate max-w-32">
                      {reply.content.length > 30 ? reply.content.substring(0, 30) + '...' : reply.content}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReplyContext(reply.messageId);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full p-1 transition-opacity"
                    >
                      <RiCloseLine className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative rounded-[20px] border focus-within:border-input has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 [&:has(input:is(:disabled))_*]:pointer-events-none">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyPress}
                disabled={isSending || editingMessageId !== null}
                className="flex sm:min-h-[84px] w-full bg-transparent px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none [resize:none]"
                placeholder={editingMessageId ? "Finish editing the message above..." : "Ask me anything..."}
                aria-label="Enter your prompt"
              />
              {/* Textarea buttons */}
              <div className="flex items-center justify-between gap-2 p-3">
                {/* Left buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full size-8 border-none hover:bg-background hover:shadow-md transition-[box-shadow]"
                  >
                    <RiAttachment2
                      className="text-muted-foreground/70 size-5"
                      size={20}
                      aria-hidden="true"
                    />
                    <span className="sr-only">Attach</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full size-8 border-none hover:bg-background hover:shadow-md transition-[box-shadow]"
                  >
                    <RiMicLine
                      className="text-muted-foreground/70 size-5"
                      size={20}
                      aria-hidden="true"
                    />
                    <span className="sr-only">Audio</span>
                  </Button>
                </div>
                {/* Right buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full size-8 border-none hover:bg-background hover:shadow-md transition-[box-shadow]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                    >
                      <g clipPath="url(#icon-a)">
                        <path
                          fill="url(#icon-b)"
                          d="m8 .333 2.667 5 5 2.667-5 2.667-2.667 5-2.667-5L.333 8l5-2.667L8 .333Z"
                        />
                        <path
                          stroke="#451A03"
                          strokeOpacity=".04"
                          d="m8 1.396 2.225 4.173.072.134.134.071L14.604 8l-4.173 2.226-.134.071-.072.134L8 14.604l-2.226-4.173-.071-.134-.134-.072L1.396 8l4.173-2.226.134-.071.071-.134L8 1.396Z"
                        />
                      </g>
                      <defs>
                        <linearGradient
                          id="icon-b"
                          x1="8"
                          x2="8"
                          y1=".333"
                          y2="15.667"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#FDE68A" />
                          <stop offset="1" stopColor="#F59E0B" />
                        </linearGradient>
                        <clipPath id="icon-a">
                          <path fill="#fff" d="M0 0h16v16H0z" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="sr-only">Generate</span>
                  </Button>
                  <Button 
                    className="rounded-full h-8"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isSending || editingMessageId !== null}
                  >
                    {isSending ? "Sending..." : "Ask Harmony"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
