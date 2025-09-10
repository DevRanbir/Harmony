"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  getChatHistory, 
  updateChatTitle, 
  deleteChatHistory,
  ChatHistory 
} from '@/lib/firebase-service';

interface ChatHistoryContextType {
  chatHistory: ChatHistory[];
  isLoading: boolean;
  refreshHistory: () => Promise<void>;
  updateChatTitle: (date: string, title: string) => Promise<boolean>;
  deleteChatSession: (date: string) => Promise<boolean>;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const refreshHistory = async () => {
    if (!user?.username) return;
    
    setIsLoading(true);
    try {
      const history = await getChatHistory(user.username);
      setChatHistory(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTitle = async (date: string, title: string): Promise<boolean> => {
    if (!user?.username) return false;
    
    try {
      const success = await updateChatTitle(user.username, date, title);
      if (success) {
        setChatHistory(prev => 
          prev.map(chat => 
            chat.date === date ? { ...chat, title } : chat
          )
        );
      }
      return success;
    } catch (error) {
      console.error('Failed to update chat title:', error);
      return false;
    }
  };

  const deleteChatSession = async (date: string): Promise<boolean> => {
    if (!user?.username) return false;
    
    try {
      const success = await deleteChatHistory(user.username, date);
      if (success) {
        setChatHistory(prev => prev.filter(chat => chat.date !== date));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete chat session:', error);
      return false;
    }
  };

  // Load chat history when user is available
  useEffect(() => {
    if (user?.username) {
      refreshHistory();
    } else {
      setIsLoading(false);
    }
  }, [user?.username]);

  return (
    <ChatHistoryContext.Provider value={{
      chatHistory,
      isLoading,
      refreshHistory,
      updateChatTitle: updateTitle,
      deleteChatSession,
    }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}
