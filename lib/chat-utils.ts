import { getChatMessages, saveChatMessage } from './firebase-service';
import { isFirebaseConfigured } from './firebase';

export const initializeUserChat = async (username: string, date?: string, skipWelcome?: boolean): Promise<void> => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const existingMessages = await getChatMessages(username, targetDate);
    
    // Only add welcome message for new chats if skipWelcome is not true
    if (existingMessages.length === 0 && !skipWelcome) {
      const welcomeMessage = {
        content: "Welcome to Harmony! How can I assist you today?",
        isUser: false,
        timestamp: Date.now(),
      };
      
      await saveChatMessage(username, welcomeMessage, targetDate);
    }
  } catch (error) {
    console.error('Failed to initialize user chat:', error);
    
    // Fallback: check localStorage for existing messages
    if (typeof window !== 'undefined') {
      const key = `harmony_chat_${username}_${date || new Date().toISOString().split('T')[0]}`;
      const existing = localStorage.getItem(key);
      
      if (!existing && !skipWelcome) {
        // Add welcome message to localStorage
        const welcomeMessage = {
          id: 'welcome-' + Date.now(),
          content: "Welcome to Harmony! How can I assist you today?",
          isUser: false,
          timestamp: Date.now(),
        };
        
        localStorage.setItem(key, JSON.stringify([welcomeMessage]));
      }
    }
  }
};

export const formatChatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getChatDateFromTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toISOString().split('T')[0];
};

export const getFirebaseStatus = (): { isConfigured: boolean; message: string } => {
  if (isFirebaseConfigured) {
    return {
      isConfigured: true,
      message: '✅ Firebase is configured and ready'
    };
  } else {
    return {
      isConfigured: false,
      message: '⚠️ Firebase not configured - using localStorage fallback'
    };
  }
};
