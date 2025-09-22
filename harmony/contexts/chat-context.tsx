"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSettings } from '@/contexts/settings-context';
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
  updateChatTitle,
  ChatMessage as FirebaseChatMessage 
} from '@/lib/firebase-service';
import { initializeUserChat } from '@/lib/chat-utils';
import { geminiService } from '@/lib/gemini-service';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  userProfileImage?: string;
}

export interface ReplyContext {
  messageId: string;
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  loadMessagesForDate: (date: string) => Promise<void>;
  createNewChat: () => Promise<void>;
  currentDate: string;
  isLoading: boolean;
  isSending: boolean;
  replyContext: ReplyContext[];
  addReplyContext: (messageId: string, content: string, timestamp: Date) => void;
  removeReplyContext: (messageId: string) => void;
  clearReplyContext: () => void;
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
  const [replyContext, setReplyContext] = useState<ReplyContext[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(() => 
    new Date().toISOString().split('T')[0]
  );
  const [dataSessionMemory, setDataSessionMemory] = useState<string[]>([]); // Store important data snippets
  const { user } = useUser();
  const { getSystemPrompt, settings } = useSettings();
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

  // Reply context management functions
  const addReplyContext = (messageId: string, content: string, timestamp: Date) => {
    setReplyContext(prev => {
      // Remove if already exists
      const filtered = prev.filter(ctx => ctx.messageId !== messageId);
      // Add new context, keep only last 3
      const updated = [...filtered, { messageId, content, timestamp }];
      return updated.slice(-3); // Keep only last 3
    });
  };

  const removeReplyContext = (messageId: string) => {
    setReplyContext(prev => prev.filter(ctx => ctx.messageId !== messageId));
  };

  const clearReplyContext = () => {
    setReplyContext([]);
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
          
          // Extract data from new messages for session memory (mathematical mode only)
          if (settings.writingStyle === 'mathematical') {
            const newDataSnippets: string[] = [];
            convertedMessages.forEach(msg => {
              const dataFromMessage = extractDataForSessionMemory(msg.content);
              newDataSnippets.push(...dataFromMessage);
            });
            
            if (newDataSnippets.length > 0) {
              updateDataSessionMemory(newDataSnippets);
            }
          }
          
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

  // Helper function to detect if a message contains mathematical data
  const containsMathematicalData = (content: string): boolean => {
    // Check for JSON code blocks that might contain chart data
    const jsonCodeBlockRegex = /```(?:json|data|chart)?\s*\n?(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/gi;
    return jsonCodeBlockRegex.test(content);
  };

  // Helper function to extract and store important data for session memory
  const extractDataForSessionMemory = (content: string): string[] => {
    const dataSnippets: string[] = [];
    const jsonCodeBlockRegex = /```(?:json|data|chart)?\s*\n?([\s\S]*?)\s*```/gi;
    let match;
    
    while ((match = jsonCodeBlockRegex.exec(content)) !== null) {
      const jsonContent = match[1].trim();
      // Store the JSON data with a reasonable size limit
      if (jsonContent.length > 0 && jsonContent.length < 2000) {
        dataSnippets.push(jsonContent);
      }
    }
    
    return dataSnippets;
  };

  // Helper function to update data session memory
  const updateDataSessionMemory = (newData: string[]) => {
    if (newData.length > 0 && settings.writingStyle === 'mathematical') {
      setDataSessionMemory(prev => {
        const updated = [...prev, ...newData];
        // Keep only the last 10 data snippets to avoid memory bloat
        return updated.slice(-10);
      });
    }
  };

  // Enhanced helper function to get context messages based on writing style
  const getRecentMessages = (allMessages: ChatMessage[], writingStyle?: string): { sender: string; text: string }[] => {
    // For mathematical mode, preserve more context including data-containing messages
    if (writingStyle === 'mathematical') {
      // Get last 6 messages + any earlier messages with mathematical data
      const lastSixMessages = allMessages.slice(-6);
      const earlierDataMessages = allMessages
        .slice(0, -6)
        .filter(msg => containsMathematicalData(msg.content))
        .slice(-4); // Keep last 4 data messages from earlier conversation
      
      const contextMessages = [...earlierDataMessages, ...lastSixMessages];
      const messageContext = contextMessages.map(msg => ({ 
        sender: msg.isUser ? 'user' : 'ai', 
        text: msg.content 
      }));

      // If we have session memory data and recent messages don't contain enough data context,
      // prepend a summary of important data
      if (dataSessionMemory.length > 0 && earlierDataMessages.length === 0) {
        const dataContext = {
          sender: 'system' as const,
          text: `[Previous Data Context]: Here's important data from earlier in our conversation:\n${dataSessionMemory.slice(-3).map((data, i) => `Data ${i + 1}: \`\`\`json\n${data}\n\`\`\``).join('\n\n')}`
        };
        return [dataContext, ...messageContext];
      }

      return messageContext;
    }
    
    // For other modes, keep the original behavior (last 4 messages)
    const recentMessages = allMessages.slice(-4);
    return recentMessages.map(msg => ({ 
      sender: msg.isUser ? 'user' : 'ai', 
      text: msg.content 
    }));
  };

  // Helper function to format user message with reply context
  const formatMessageWithReplyContext = (content: string): string => {
    if (replyContext.length === 0) {
      return content;
    }

    // For mathematical mode, include more data context
    if (settings.writingStyle === 'mathematical') {
      // Find any data-containing messages in reply context
      const dataReplies = replyContext.filter(ctx => containsMathematicalData(ctx.content));
      const nonDataReplies = replyContext.filter(ctx => !containsMathematicalData(ctx.content));
      
      const replyParts: string[] = [];
      
      // Include data messages with more context (first 500 chars instead of 200)
      if (dataReplies.length > 0) {
        dataReplies.forEach((ctx, index) => {
          replyParts.push(`[Data Reference ${index + 1}]: "${ctx.content.slice(0, 500)}${ctx.content.length > 500 ? '...' : ''}"`);
        });
      }
      
      // Include non-data messages with standard context
      if (nonDataReplies.length > 0) {
        nonDataReplies.forEach((ctx, index) => {
          replyParts.push(`[Reply ${index + 1}]: "${ctx.content.slice(0, 200)}${ctx.content.length > 200 ? '...' : ''}"`);
        });
      }

      const replyPart = replyParts.join('\n');
      return `${replyPart}\n\n[New Question]: ${content}`;
    }

    // Standard reply context for other modes
    const replyPart = replyContext
      .map((ctx, index) => `[Reply ${index + 1}]: "${ctx.content.slice(0, 200)}${ctx.content.length > 200 ? '...' : ''}"`)
      .join('\n');

    return `${replyPart}\n\n[New Question]: ${content}`;
  };

  const sendMessage = async (content: string) => {
    if (!user?.username || !content.trim() || isSendingRef.current) return;

    const resetSendingState = () => {
      if (sendingTimeoutRef.current) clearTimeout(sendingTimeoutRef.current);
      setIsSending(false);
      isSendingRef.current = false;
      
      // Fade out thinking state with shorter delay for faster UI
      setTimeout(() => {
        setIsThinking(false);
      }, 150);
    };

    const startSendingState = () => {
      setIsSending(true);
      setIsThinking(true);
      isSendingRef.current = true;

      // Safety timeout (prevents stuck "sending" state) - reduced for faster responses
      if (sendingTimeoutRef.current) clearTimeout(sendingTimeoutRef.current);
      sendingTimeoutRef.current = setTimeout(() => {
        console.warn("Force clearing isSending state after timeout");
        resetSendingState();
      }, 10000); // Reduced to 10 seconds
    };

    try {
      startSendingState();

      // Check if this is the first user message in the chat
      const isFirstUserMessage = messages.filter(msg => msg.isUser).length === 0;

      // Create user message
      const userMessage = convertToFirebase({
        content: content.trim(),
        isUser: true,
        userProfileImage: user.imageUrl,
      });

      await saveChatMessage(user.username, userMessage, currentDate);

      // Get AI response from Gemini immediately (no setTimeout delay)
      try {
        // Get AI response with enhanced chat history for mathematical mode and user settings
        const recentMessages = getRecentMessages(messages, settings.writingStyle);
        const messageWithContext = formatMessageWithReplyContext(content.trim());
        const aiResponse = await geminiService.sendMessage(
          user.username!,
          currentDate,
          messageWithContext,
          recentMessages, // Only send last 4 messages instead of entire chat history
          getSystemPrompt() // Pass the system prompt based on user settings
        );

        const aiMessage = convertToFirebase({
          content: aiResponse,
          isUser: false,
        });

        // Reset sending state BEFORE saving AI message to prevent double thinking
        resetSendingState();
        
        await saveChatMessage(user.username!, aiMessage, currentDate);

        // Clear reply context after successful message
        if (replyContext.length > 0) {
          clearReplyContext();
        }

        // If this was the first user message, generate a chat title
        if (isFirstUserMessage) {
          try {
            const titleResponse = await fetch('/api/chat/generate-title', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: content.trim() }),
            });

            if (titleResponse.ok) {
              const { title } = await titleResponse.json();
              
              // Update the chat title using the proper service function
              await updateChatTitle(user.username!, currentDate, title);
              
              // Trigger history update to refresh the UI with new title
              setTimeout(() => {
                debouncedHistoryUpdate();
              }, 200);
            }
          } catch (error) {
            console.error('Failed to generate chat title:', error);
            // Don't throw, just log the error since the main functionality works
          }
        }
        
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

  const regenerateMessage = async (messageId: string) => {
    if (!user?.username || isSendingRef.current) {
      return;
    }

    const resetSendingState = () => {
      if (sendingTimeoutRef.current) clearTimeout(sendingTimeoutRef.current);
      setIsSending(false);
      isSendingRef.current = false;
      
      // Fade out thinking state with shorter delay for faster UI
      setTimeout(() => {
        setIsThinking(false);
      }, 150);
    };

    const startSendingState = () => {
      setIsSending(true);
      setIsThinking(true);
      isSendingRef.current = true;

      // Safety timeout (prevents stuck "sending" state) - reduced for faster responses
      if (sendingTimeoutRef.current) clearTimeout(sendingTimeoutRef.current);
      sendingTimeoutRef.current = setTimeout(() => {
        console.warn("Force clearing isSending state after timeout");
        resetSendingState();
      }, 10000); // Reduced to 10 seconds
    };

    try {
      startSendingState();

      // Find the message to regenerate and the previous user message
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1 || messageIndex === 0) {
        resetSendingState();
        return;
      }

      const messageToRegenerate = messages[messageIndex];
      if (messageToRegenerate.isUser) {
        resetSendingState();
        return; // Can't regenerate user messages
      }

      // Find the previous user message
      let userMessage = null;
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (messages[i].isUser) {
          userMessage = messages[i];
          break;
        }
      }

      if (!userMessage) {
        resetSendingState();
        return;
      }

      // Delete the current AI message
      await deleteMessage(messageId);

      // Generate new response with the same user input
      try {
        // Get recent messages up to the point we're regenerating with enhanced context for mathematical mode
        const messagesUpToRegeneration = messages.slice(0, messageIndex);
        const recentMessages = getRecentMessages(messagesUpToRegeneration, settings.writingStyle);
        const aiResponse = await geminiService.sendMessage(
          user.username!,
          currentDate,
          userMessage.content,
          recentMessages, // Only send recent messages instead of entire history
          getSystemPrompt() // Pass the system prompt based on user settings
        );

        const aiMessage = convertToFirebase({
          content: aiResponse,
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
        console.error("Failed to regenerate message:", error);
        resetSendingState();
      }

    } catch (error) {
      console.error('Failed to regenerate message:', error);
      resetSendingState();
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user?.username || isSendingRef.current) {
      return;
    }

    const resetSendingState = () => {
      if (sendingTimeoutRef.current) clearTimeout(sendingTimeoutRef.current);
      setIsSending(false);
      isSendingRef.current = false;
      
      setTimeout(() => {
        setIsThinking(false);
      }, 150);
    };

    const startSendingState = () => {
      setIsSending(true);
      setIsThinking(true);
      isSendingRef.current = true;

      if (sendingTimeoutRef.current) clearTimeout(sendingTimeoutRef.current);
      sendingTimeoutRef.current = setTimeout(() => {
        console.warn("Force clearing isSending state after timeout");
        resetSendingState();
      }, 10000);
    };

    try {
      startSendingState();

      // Find the message to edit
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) {
        resetSendingState();
        return;
      }

      const messageToEdit = messages[messageIndex];
      if (!messageToEdit.isUser) {
        resetSendingState();
        return; // Can only edit user messages
      }

      // First, generate the new AI response with the edited content
      const messagesUpToEdit = messages.slice(0, messageIndex);
      const recentMessages = getRecentMessages(messagesUpToEdit, settings.writingStyle);
      const aiResponse = await geminiService.sendMessage(
        user.username!,
        currentDate,
        newContent.trim(),
        recentMessages // Only send recent messages instead of entire history
      );

      // Only after we have the new response, delete messages and update
      const messagesToDelete = messages.slice(messageIndex);
      for (const msg of messagesToDelete) {
        await deleteMessage(msg.id);
      }

      // Wait a bit for deletions to process
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create the edited user message
      const editedUserMessage = convertToFirebase({
        content: newContent.trim(),
        isUser: true,
        userProfileImage: user.imageUrl,
      });

      await saveChatMessage(user.username, editedUserMessage, currentDate);

      // Save the AI response
      const aiMessage = convertToFirebase({
        content: aiResponse,
        isUser: false,
      });

      resetSendingState();
      
      await saveChatMessage(user.username!, aiMessage, currentDate);
      
      setTimeout(() => {
        if (!isSendingRef.current) {
          debouncedHistoryUpdate();
        }
      }, 300);

    } catch (error) {
      console.error('Failed to edit message:', error);
      resetSendingState();
    }
  };

  const loadMessagesForDate = async (date: string) => {
    if (!user?.username) {
      return;
    }

    // Clear data session memory when switching chats
    setDataSessionMemory([]);

    // Reset scroll state when switching chats
    setCurrentDate(date);
    // Reset subscription tracking when manually switching dates
    currentSubscriptionDateRef.current = '';
  };

  const createNewChat = async () => {
    if (!user?.username) {
      return;
    }

    // Clear data session memory when creating new chat
    setDataSessionMemory([]);

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
      regenerateMessage,
      editMessage,
      loadMessagesForDate,
      createNewChat,
      currentDate,
      isLoading,
      isSending,
      isThinking,
      replyContext,
      addReplyContext,
      removeReplyContext,
      clearReplyContext,
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
