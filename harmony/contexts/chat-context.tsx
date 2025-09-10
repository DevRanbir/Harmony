"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  saveChatMessage, 
  getChatMessages, 
  subscribeToChatMessages,
  deleteChatMessage,
  createChatSession,
  ensureChatSession,
  hasExistingChats,
  getChatHistory,
  updateChatMetadata,
  ChatMessage as FirebaseChatMessage 
} from '@/lib/firebase-service';
import { initializeUserChat } from '@/lib/chat-utils';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  userProfileImage?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMessagesForDate: (date: string) => Promise<void>;
  createNewChat: () => Promise<void>;
  currentDate: string;
  isLoading: boolean;
  isSending: boolean;
  isThinking: boolean;
  onHistoryUpdate?: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children, onHistoryUpdate }: { 
  children: React.ReactNode; 
  onHistoryUpdate?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // Separate thinking state for smoother transitions
  const [currentDate, setCurrentDate] = useState<string>(() => 
    new Date().toISOString().split('T')[0]
  );
  const { user } = useUser();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);
  const currentSubscriptionDateRef = useRef<string>('');
  const historyUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSendingRef = useRef(false);
  const sendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced history update to prevent multiple rapid calls
  const debouncedHistoryUpdate = React.useCallback(() => {
    if (!onHistoryUpdate || isSendingRef.current) return; // Don't update while sending
    
    // Clear any existing timeout
    if (historyUpdateTimeoutRef.current) {
      clearTimeout(historyUpdateTimeoutRef.current);
    }
    
    // Set a new timeout
    historyUpdateTimeoutRef.current = setTimeout(() => {
      if (!isSendingRef.current) { // Double check we're not sending
        onHistoryUpdate();
      }
    }, 500); // Increased debounce to 500ms for better stability
  }, [onHistoryUpdate]);

  // Convert Firebase message data to component format
  const convertFromFirebase = (firebaseMessages: FirebaseChatMessage[]): ChatMessage[] => {
    return firebaseMessages.map(message => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  };

  // Convert component message to Firebase format
  const convertToFirebase = (message: Omit<ChatMessage, 'id' | 'timestamp'>): Omit<FirebaseChatMessage, 'id'> => {
    return {
      ...message,
      timestamp: Date.now(),
    };
  };

  // Single effect to handle both initial load and date changes
  useEffect(() => {
    if (!user?.username) {
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        
        let targetDate = currentDate;
        
        // Only do initial setup logic on first load
        if (!isInitializedRef.current) {
          // For initial load, always try to load the most recent chat if available
          const hasChats = await hasExistingChats(user.username!);
          
          if (hasChats) {
            // Get chat history and load the most recent one
            try {
              const history = await getChatHistory(user.username!);
              if (history.length > 0) {
                // Load the most recent chat
                const mostRecentChat = history[0]; // Already sorted by lastTimestamp desc
                targetDate = mostRecentChat.date;
                if (targetDate !== currentDate) {
                  setCurrentDate(mostRecentChat.date);
                  // Return early to let the effect run again with the new date
                  setIsLoading(false);
                  return;
                }
              }
            } catch (error) {
              console.error('Failed to load chat history:', error);
              // If we can't load history but have chats, stay with current date
            }
          } else {
            // Only create a new chat if there are genuinely no existing chats
            // and we're on today's date (initial load scenario)
            if (targetDate === new Date().toISOString().split('T')[0]) {
              // Initialize with welcome message for new users
              await initializeUserChat(user.username!, targetDate);
              
              // Create chat session metadata
              const title = `Welcome Chat`;
              await createChatSession(user.username!, targetDate, title);
              
              // Use debounced history update
              debouncedHistoryUpdate();
            }
          }
          isInitializedRef.current = true;
        }
        
        // Always set up subscription for the target date (skip only if same date and already subscribed)
        if (currentSubscriptionDateRef.current === targetDate) {
          setIsLoading(false);
          return;
        }
        
        // Clean up any existing subscription
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        
        // Subscribe to real-time updates for the target date
        unsubscribeRef.current = subscribeToChatMessages(user.username!, targetDate, (firebaseMessages) => {
          const convertedMessages = convertFromFirebase(firebaseMessages);
          setMessages(convertedMessages);
          setIsLoading(false);
        });
        
        currentSubscriptionDateRef.current = targetDate;
      } catch (error) {
        console.error('Failed to load chat messages:', error);
        setIsLoading(false);
      }
    };

    loadMessages();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      // Clear any pending history update timeout
      if (historyUpdateTimeoutRef.current) {
        clearTimeout(historyUpdateTimeoutRef.current);
      }
      // Clear any pending sending timeout
      if (sendingTimeoutRef.current) {
        clearTimeout(sendingTimeoutRef.current);
      }
    };
  }, [user?.username, currentDate]);

  const sendMessage = async (content: string) => {
    if (!user?.username || !content.trim() || isSendingRef.current) return;

    const resetSendingState = () => {
      if (sendingTimeoutRef.current) clearTimeout(sendingTimeoutRef.current);
      setIsSending(false);
      isSendingRef.current = false;
      
      // Fade out thinking state with delay for smooth transition
      setTimeout(() => {
        setIsThinking(false);
      }, 300);
    };

    const startSendingState = () => {
      setIsSending(true);
      setIsThinking(true);
      isSendingRef.current = true;

      // Safety timeout (prevents stuck "sending" state)
      if (sendingTimeoutRef.current) clearTimeout(sendingTimeoutRef.current);
      sendingTimeoutRef.current = setTimeout(() => {
        console.warn("Force clearing isSending state after timeout");
        resetSendingState();
      }, 15000); // Increased to 15 seconds for safety
    };

    try {
      startSendingState();

      // Create user message
      const userMessage = convertToFirebase({
        content: content.trim(),
        isUser: true,
        userProfileImage: user.imageUrl,
      });

      await saveChatMessage(user.username, userMessage, currentDate);

      // Simulate AI response
      setTimeout(async () => {
        try {
          const aiMessage = convertToFirebase({
            content: "Not connected", // TODO: Replace with actual AI integration
            isUser: false,
          });

          // Reset sending state BEFORE saving AI message to prevent double thinking
          resetSendingState();
          
          await saveChatMessage(user.username!, aiMessage, currentDate);
          
          // Update history with a delay to ensure UI has settled
          setTimeout(() => {
            if (!isSendingRef.current) {
              debouncedHistoryUpdate();
            }
          }, 300);
          
        } catch (error) {
          console.error("Failed to send AI response:", error);
          resetSendingState();
        }
      }, 1500); // Slightly increased thinking time
      
    } catch (error) {
      console.error("Failed to send message:", error);
      resetSendingState();
    }
  };


  const deleteMessage = async (messageId: string) => {
    if (!user?.username) {
      return;
    }

    try {
      await deleteChatMessage(user.username, currentDate, messageId);
      // The real-time subscription will update the local state
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const loadMessagesForDate = async (date: string) => {
    if (!user?.username) {
      return;
    }

    // Reset scroll state when switching chats
    setCurrentDate(date);
    // Reset subscription tracking when manually switching dates
    currentSubscriptionDateRef.current = '';
  };

  const createNewChat = async () => {
    if (!user?.username) {
      return;
    }

    // Generate a unique date identifier for the new chat session
    const now = new Date();
    const baseDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = now.getTime();
    const newChatDate = `${baseDate}-${timestamp}`;
    
    // Set the new chat date
    setCurrentDate(newChatDate);
    
    // Initialize with welcome message
    try {
      await initializeUserChat(user.username, newChatDate);
      
      // Create a title for this chat session
      const title = `New Chat ${now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
      await createChatSession(user.username, newChatDate, title);
      
      // Use debounced history update
      debouncedHistoryUpdate();
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  return (
    <ChatContext.Provider value={{
      messages,
      sendMessage,
      deleteMessage,
      loadMessagesForDate,
      createNewChat,
      currentDate,
      isLoading,
      isSending,
      isThinking,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
