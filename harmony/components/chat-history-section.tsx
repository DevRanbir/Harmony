"use client";

import React, { useState } from 'react';
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { 
  RiAddLine, 
  RiEdit2Line, 
  RiDeleteBin6Line, 
  RiCheckLine, 
  RiCloseLine,
  RiChat3Line 
} from "@remixicon/react";
import { useChatHistory } from '@/contexts/chat-history-context';
import { useChat } from '@/contexts/chat-context';
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

export function ChatHistorySection() {
  const { chatHistory, isLoading, updateChatTitle, deleteChatSession } = useChatHistory();
  const { loadMessagesForDate, createNewChat, currentDate } = useChat();
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleNewChat = () => {
    createNewChat();
  };

  const handleChatClick = (date: string) => {
    loadMessagesForDate(date);
  };

  const handleEditStart = (date: string, currentTitle: string) => {
    setEditingChat(date);
    setEditTitle(currentTitle);
  };

  const handleEditSave = async () => {
    if (editingChat && editTitle.trim()) {
      await updateChatTitle(editingChat, editTitle.trim());
      setEditingChat(null);
      setEditTitle('');
    }
  };

  const handleEditCancel = () => {
    setEditingChat(null);
    setEditTitle('');
  };

  const handleDelete = async (date: string) => {
    const wasCurrentChat = currentDate === date;
    await deleteChatSession(date);
    
    // If we're currently viewing the deleted chat, find another chat to switch to
    if (wasCurrentChat) {
      // Get the remaining chats after deletion (need to wait for state update)
      setTimeout(() => {
        const remainingChats = chatHistory.filter(chat => chat.date !== date);
        
        if (remainingChats.length > 0) {
          // Switch to the most recent remaining chat
          handleChatClick(remainingChats[0].date);
        } else {
          // Only create a new chat if there are no other chats left
          handleNewChat();
        }
      }, 100); // Small delay to ensure state is updated
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle both regular dates (YYYY-MM-DD) and timestamped dates (YYYY-MM-DD-timestamp)
      const datePart = dateString.split('-').slice(0, 3).join('-'); // Take only YYYY-MM-DD part
      const date = new Date(datePart);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if can't parse
      }
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayString = today.toISOString().split('T')[0];
      const yesterdayString = yesterday.toISOString().split('T')[0];

      if (datePart === todayString) {
        return 'Today';
      } else if (datePart === yesterdayString) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if error
    }
  };

  const truncateMessage = (message: string, maxLength: number = 40) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="py-5 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-black/[0.06] before:via-black/10 before:to-black/[0.06]">
      <h3 className="text-xs font-medium uppercase text-muted-foreground/80 mb-4">
        Chat History
      </h3>
      
      {/* New Chat Button */}
      <div className="mb-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNewChat}
          className="w-full justify-start gap-2 h-8 text-xs"
        >
          <RiAddLine size={14} />
          New Chat
        </Button>
      </div>

      {/* Chat History List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
            <RiChat3Line size={24} className="mx-auto mb-2 opacity-50" />
            No chat history yet
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div
              key={chat.date}
              className={`group relative border rounded-lg p-2 transition-colors hover:bg-muted/50 ${
                currentDate === chat.date ? 'bg-muted border-primary/20' : 'border-border'
              }`}
            >
              {editingChat === chat.date ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-6 text-xs"
                    placeholder="Chat title"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave();
                      if (e.key === 'Escape') handleEditCancel();
                    }}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditSave}
                      className="h-5 w-5 p-0"
                    >
                      <RiCheckLine size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditCancel}
                      className="h-5 w-5 p-0"
                    >
                      <RiCloseLine size={12} />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleChatClick(chat.date)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-medium truncate pr-2">
                        {chat.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDate(chat.date)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {truncateMessage(chat.lastMessage || 'No messages')}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground">
                        {chat.messageCount} messages
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(chat.date, chat.title);
                      }}
                      className="h-5 w-5 p-0 hover:bg-background"
                    >
                      <RiEdit2Line size={10} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                          className="h-5 w-5 p-0 hover:bg-background hover:text-destructive"
                        >
                          <RiDeleteBin6Line size={10} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{chat.title}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(chat.date)}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
