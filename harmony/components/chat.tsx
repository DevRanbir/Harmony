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
} from "@remixicon/react";
import { ChatMessage } from "@/components/chat-message";
import { FormattedMessage } from "@/components/formatted-message";
import { useRef, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthContext();
  const { messages, sendMessage, editMessage, isLoading, isSending, isThinking, currentDate } = useChat();
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
  const [lastChatDate, setLastChatDate] = useState(currentDate);
  const [inputValue, setInputValue] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
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

  const handleSendMessage = async () => {
    if (isSending) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    
    await sendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleUserMessageClick = (messageId: string, content: string) => {
    if (isSending) return; // Don't allow editing while sending
    
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleEditSubmit = async () => {
    if (!editingMessageId || !editingContent.trim() || isSending) return;
    
    await editMessage(editingMessageId, editingContent.trim());
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleEditCancel = () => {
    console.log("Cancel clicked"); // Debug log
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
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
              <ChatMessage 
                key={message.id} 
                isUser={message.isUser} 
                userProfileImage={message.userProfileImage || user?.imageUrl}
                messageId={message.id}
                messageContent={message.content}
                messageTimestamp={message.timestamp}
                onUserMessageClick={handleUserMessageClick}
                isSelected={editingMessageId === message.id}
              >
                {editingMessageId === message.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onKeyDown={handleEditKeyPress}
                      className="w-full min-h-[60px] p-2 border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Edit your message..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditSubmit();
                        }}
                        disabled={!editingContent.trim() || isSending}
                      >
                        {isSending ? "Updating..." : "Update"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditCancel();
                        }}
                        disabled={isSending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : message.isUser ? (
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                ) : (
                  <FormattedMessage content={message.content} />
                )}
              </ChatMessage>
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
