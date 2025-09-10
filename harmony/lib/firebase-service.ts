import { ref, push, set, get, remove, onValue, off, query, orderByChild, DatabaseReference } from 'firebase/database';
import { database, isFirebaseConfigured } from './firebase';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  userProfileImage?: string;
}

export interface BookmarkData {
  id: string;
  content: string;
  timestamp: number;
  isUser: boolean;
  userProfileImage?: string;
  bookmarkedAt: number;
}

// Helper function to check if Firebase is available
const isFirebaseAvailable = (): boolean => {
  return isFirebaseConfigured && database !== null;
};

// LocalStorage fallback functions
const saveToLocalStorage = (type: 'chat' | 'bookmark', username: string, data: any, date?: string): string => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  if (type === 'chat' && date) {
    // For chat messages, use date-specific storage
    const key = `harmony_chat_${username}_${date}`;
    
    let existing = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        existing = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
    
    const newItem = { ...data, id };
    existing.push(newItem);
    
    try {
      localStorage.setItem(key, JSON.stringify(existing));
      
      // Also update the general history
      updateLocalStorageHistory(username, date, data.content);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    return id;
  } else {
    // For bookmarks and general items
    const key = `harmony_${type}_${username}`;
    
    let existing = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        existing = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
    
    const newItem = { ...data, id };
    existing.push(newItem);
    
    try {
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    return id;
  }
};

const updateLocalStorageHistory = (username: string, date: string, lastMessage: string) => {
  const historyKey = `harmony-chat-history-${username}`;
  
  try {
    let history = [];
    const stored = localStorage.getItem(historyKey);
    if (stored) {
      history = JSON.parse(stored);
    }
    
    const existingIndex = history.findIndex((item: any) => item.date === date);
    if (existingIndex >= 0) {
      history[existingIndex].lastMessage = lastMessage;
      history[existingIndex].lastTimestamp = Date.now();
      history[existingIndex].messageCount = (history[existingIndex].messageCount || 0) + 1;
    } else {
      history.push({
        date,
        title: `Chat ${date}`,
        messageCount: 1,
        lastMessage,
        lastTimestamp: Date.now()
      });
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (error) {
    console.error('Error updating localStorage history:', error);
  }
};

const getFromLocalStorage = (type: 'chat' | 'bookmark', username: string, date?: string): any[] => {
  if (type === 'chat' && date) {
    // For chat messages, get from date-specific storage
    const key = `harmony_chat_${username}_${date}`;
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
    
    return [];
  } else {
    // For bookmarks and general items
    const key = `harmony_${type}_${username}`;
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
    
    return [];
  }
};

const removeFromLocalStorage = (type: 'chat' | 'bookmark', username: string, id: string, date?: string): boolean => {
  if (type === 'chat' && date) {
    // For chat messages, remove from date-specific storage
    const key = `harmony_chat_${username}_${date}`;
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const existing = JSON.parse(stored);
        const filtered = existing.filter((item: any) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
    
    return false;
  } else {
    // For bookmarks and general items
    const key = `harmony_${type}_${username}`;
    
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const existing = JSON.parse(stored);
        const filtered = existing.filter((item: any) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
    
    return false;
  }
};

// Chat functions
export const saveChatMessage = async (username: string, message: Omit<ChatMessage, 'id'>, date?: string): Promise<string | null> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    return saveToLocalStorage('chat', username, message, date);
  }

  try {
    const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Ensure chat session metadata exists
    await ensureChatSession(username, targetDate);
    
    const chatRef = ref(database!, `${username}/data/chat/${targetDate}`);
    const newMessageRef = push(chatRef);
    
    const messageWithId: ChatMessage = {
      ...message,
      id: newMessageRef.key || '',
    };
    
    await set(newMessageRef, messageWithId);
    
    // Update chat metadata with the new message
    await updateChatMetadata(username, targetDate, message.content);
    
    return newMessageRef.key;
  } catch (error) {
    console.error('Error saving chat message:', error);
    return saveToLocalStorage('chat', username, message, date);
  }
};

export const getChatMessages = async (username: string, date?: string): Promise<ChatMessage[]> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    return getFromLocalStorage('chat', username, date);
  }

  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const chatRef = ref(database!, `${username}/data/chat/${targetDate}`);
    const snapshot = await get(chatRef);
    
    if (snapshot.exists()) {
      const messages = snapshot.val();
      return Object.values(messages) as ChatMessage[];
    }
    return [];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return getFromLocalStorage('chat', username, date);
  }
};

export const subscribeToChatMessages = (
  username: string, 
  date: string, 
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    // For localStorage, we'll just call the callback once with current data
    const messages = getFromLocalStorage('chat', username, date);
    callback(messages);
    
    // Return a no-op unsubscribe function
    return () => {};
  }

  const chatRef = ref(database!, `${username}/data/chat/${date}`);
  
  const handleValue = (snapshot: any) => {
    if (snapshot.exists()) {
      const messages = snapshot.val();
      const messageList = Object.values(messages) as ChatMessage[];
      // Sort by timestamp
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      callback(messageList);
    } else {
      callback([]);
    }
  };
  
  onValue(chatRef, handleValue);
  
  // Return unsubscribe function
  return () => off(chatRef, 'value', handleValue);
};

export const deleteChatMessage = async (username: string, date: string, messageId: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    return removeFromLocalStorage('chat', username, messageId, date);
  }

  try {
    const messageRef = ref(database!, `${username}/data/chat/${date}/${messageId}`);
    await remove(messageRef);
    return true;
  } catch (error) {
    console.error('Error deleting chat message:', error);
    return false;
  }
};

// Bookmark functions
export const saveBookmark = async (username: string, bookmark: BookmarkData): Promise<string | null> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    return saveToLocalStorage('bookmark', username, bookmark, undefined);
  }

  try {
    // Use the bookmark's id (which is the message ID) as the key instead of push()
    const bookmarkRef = ref(database!, `${username}/data/bookmark/${bookmark.id}`);
    
    await set(bookmarkRef, bookmark);
    return bookmark.id;
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return saveToLocalStorage('bookmark', username, bookmark, undefined);
  }
};

export const getBookmarks = async (username: string): Promise<BookmarkData[]> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    const bookmarks = getFromLocalStorage('bookmark', username, undefined);
    return bookmarks.sort((a: any, b: any) => b.bookmarkedAt - a.bookmarkedAt);
  }

  try {
    const bookmarksRef = ref(database!, `${username}/data/bookmark`);
    const snapshot = await get(bookmarksRef);
    
    if (snapshot.exists()) {
      const bookmarks = snapshot.val();
      const bookmarkList = Object.values(bookmarks) as BookmarkData[];
      // Sort by bookmarkedAt timestamp (newest first)
      bookmarkList.sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
      return bookmarkList;
    }
    return [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return getFromLocalStorage('bookmark', username, undefined);
  }
};

export const subscribeToBookmarks = (
  username: string, 
  callback: (bookmarks: BookmarkData[]) => void
): (() => void) => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    // For localStorage, we'll just call the callback once with current data
    const bookmarks = getFromLocalStorage('bookmark', username, undefined);
    callback(bookmarks.sort((a: any, b: any) => b.bookmarkedAt - a.bookmarkedAt));
    
    // Return a no-op unsubscribe function
    return () => {};
  }

  const bookmarksRef = ref(database!, `${username}/data/bookmark`);
  
  const handleValue = (snapshot: any) => {
    if (snapshot.exists()) {
      const bookmarks = snapshot.val();
      const bookmarkList = Object.values(bookmarks) as BookmarkData[];
      // Sort by bookmarkedAt timestamp (newest first)
      bookmarkList.sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
      callback(bookmarkList);
    } else {
      callback([]);
    }
  };
  
  onValue(bookmarksRef, handleValue);
  
  // Return unsubscribe function
  return () => off(bookmarksRef, 'value', handleValue);
};

export const removeBookmark = async (username: string, bookmarkId: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    return removeFromLocalStorage('bookmark', username, bookmarkId, undefined);
  }

  try {
    const bookmarkRef = ref(database!, `${username}/data/bookmark/${bookmarkId}`);
    await remove(bookmarkRef);
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

// Utility functions
export const getAllChatDates = async (username: string): Promise<string[]> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    const messages = getFromLocalStorage('chat', username);
    const dates = new Set(messages.map((msg: any) => 
      new Date(msg.timestamp).toISOString().split('T')[0]
    ));
    return Array.from(dates).sort().reverse();
  }

  try {
    const chatRef = ref(database!, `${username}/data/chat`);
    const snapshot = await get(chatRef);
    
    if (snapshot.exists()) {
      const dates = Object.keys(snapshot.val());
      return dates.sort().reverse(); // Most recent first
    }
    return [];
  } catch (error) {
    console.error('Error getting chat dates:', error);
    return [];
  }
};

export const getChatMessagesCount = async (username: string, date: string): Promise<number> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    const messages = getFromLocalStorage('chat', username);
    return messages.filter((msg: any) => {
      const msgDate = new Date(msg.timestamp).toISOString().split('T')[0];
      return msgDate === date;
    }).length;
  }

  try {
    const chatRef = ref(database!, `${username}/data/chat/${date}`);
    const snapshot = await get(chatRef);
    
    if (snapshot.exists()) {
      return Object.keys(snapshot.val()).length;
    }
    return 0;
  } catch (error) {
    console.error('Error getting chat messages count:', error);
    return 0;
  }
};

// Chat history management
export interface ChatHistory {
  date: string;
  title: string;
  messageCount: number;
  lastMessage?: string;
  lastTimestamp: number;
}

export const getChatHistory = async (username: string): Promise<ChatHistory[]> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    const localHistory = localStorage.getItem(`harmony-chat-history-${username}`);
    return localHistory ? JSON.parse(localHistory) : [];
  }

  try {
    const chatRef = ref(database!, `${username}/data/chat`);
    const snapshot = await get(chatRef);
    
    if (snapshot.exists()) {
      const chatData = snapshot.val();
      const historyPromises = Object.keys(chatData).map(async (date) => {
        const messages = Object.values(chatData[date]) as ChatMessage[];
        const lastMessage = messages.sort((a, b) => b.timestamp - a.timestamp)[0];
        
        // Get custom title from metadata or generate default
        const metadataRef = ref(database!, `${username}/data/metadata/chats/${date}`);
        const metadataSnapshot = await get(metadataRef);
        const customTitle = metadataSnapshot.exists() ? metadataSnapshot.val().title : null;
        
        // Extract base date for title generation
        const baseDatePart = date.split('-').slice(0, 3).join('-'); // Get YYYY-MM-DD part
        const fallbackDate = new Date(baseDatePart);
        const defaultTitle = isNaN(fallbackDate.getTime()) 
          ? `Chat ${date}` 
          : `Chat ${fallbackDate.toLocaleDateString()}`;
        
        return {
          date,
          title: customTitle || defaultTitle,
          messageCount: messages.length,
          lastMessage: lastMessage?.content || '',
          lastTimestamp: lastMessage?.timestamp || 0,
        } as ChatHistory;
      });
      
      const history = await Promise.all(historyPromises);
      return history.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    }
    return [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

export const updateChatTitle = async (username: string, date: string, title: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    const localHistory = localStorage.getItem(`harmony-chat-history-${username}`) || '[]';
    const history = JSON.parse(localHistory) as ChatHistory[];
    const updatedHistory = history.map(chat => 
      chat.date === date ? { ...chat, title } : chat
    );
    localStorage.setItem(`harmony-chat-history-${username}`, JSON.stringify(updatedHistory));
    return true;
  }

  try {
    const metadataRef = ref(database!, `${username}/data/metadata/chats/${date}`);
    await set(metadataRef, { title, updatedAt: Date.now() });
    return true;
  } catch (error) {
    console.error('Error updating chat title:', error);
    return false;
  }
};

export const deleteChatHistory = async (username: string, date: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    const localHistory = localStorage.getItem(`harmony-chat-history-${username}`) || '[]';
    const history = JSON.parse(localHistory) as ChatHistory[];
    const updatedHistory = history.filter(chat => chat.date !== date);
    localStorage.setItem(`harmony-chat-history-${username}`, JSON.stringify(updatedHistory));
    return true;
  }

  try {
    const chatRef = ref(database!, `${username}/data/chat/${date}`);
    const metadataRef = ref(database!, `${username}/data/metadata/chats/${date}`);
    
    await Promise.all([
      remove(chatRef),
      remove(metadataRef)
    ]);
    return true;
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return false;
  }
};

// Create a new chat session with metadata
export const createChatSession = async (username: string, date: string, title: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, using localStorage fallback');
    return true; // Just return true for localStorage fallback
  }

  try {
    const metadataRef = ref(database!, `${username}/data/metadata/chats/${date}`);
    
    // Check if metadata already exists
    const existingSnapshot = await get(metadataRef);
    if (existingSnapshot.exists()) {
      return true; // Already exists, no need to create
    }
    
    const metadata = {
      title,
      createdAt: Date.now(),
      lastMessage: '',
      messageCount: 0
    };
    
    await set(metadataRef, metadata);
    return true;
  } catch (error) {
    console.error('Error creating chat session:', error);
    return false;
  }
};

// Ensure chat session metadata exists
export const ensureChatSession = async (username: string, date: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    return true;
  }

  try {
    const metadataRef = ref(database!, `${username}/data/metadata/chats/${date}`);
    const existingSnapshot = await get(metadataRef);
    
    if (!existingSnapshot.exists()) {
      // Create default metadata if it doesn't exist
      const baseDatePart = date.split('-').slice(0, 3).join('-');
      const fallbackDate = new Date(baseDatePart);
      const defaultTitle = isNaN(fallbackDate.getTime()) 
        ? `Chat ${date}` 
        : `Chat ${fallbackDate.toLocaleDateString()}`;
      
      return await createChatSession(username, date, defaultTitle);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring chat session:', error);
    return false;
  }
};

// Update chat metadata when new messages are added
export const updateChatMetadata = async (username: string, date: string, lastMessage: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, updating localStorage fallback');
    updateLocalStorageHistory(username, date, lastMessage);
    return true;
  }

  try {
    const metadataRef = ref(database!, `${username}/data/metadata/chats/${date}`);
    const chatRef = ref(database!, `${username}/data/chat/${date}`);
    
    // Get current metadata and message count
    const [metadataSnapshot, chatSnapshot] = await Promise.all([
      get(metadataRef),
      get(chatRef)
    ]);
    
    const existingMetadata = metadataSnapshot.exists() ? metadataSnapshot.val() : {};
    const messageCount = chatSnapshot.exists() ? Object.keys(chatSnapshot.val()).length : 0;
    
    // Update metadata while preserving existing fields
    const updates = {
      ...existingMetadata,
      lastMessage,
      lastTimestamp: Date.now(),
      messageCount,
      updatedAt: Date.now()
    };
    
    await set(metadataRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating chat metadata:', error);
    return false;
  }
};

// Check if user has any existing chats
export const hasExistingChats = async (username: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    console.warn('Firebase not available, checking localStorage');
    // Check localStorage for any existing chats
    if (typeof window !== 'undefined') {
      const key = `harmony_chat_${username}`;
      const historyKey = `harmony-chat-history-${username}`;
      const existing = localStorage.getItem(key);
      const existingHistory = localStorage.getItem(historyKey);
      return !!(existing || existingHistory);
    }
    return false;
  }

  try {
    // Check both chat messages and metadata
    const chatRef = ref(database!, `${username}/data/chat`);
    const metadataRef = ref(database!, `${username}/data/metadata/chats`);
    
    const [chatSnapshot, metadataSnapshot] = await Promise.all([
      get(chatRef),
      get(metadataRef)
    ]);
    
    return (chatSnapshot.exists() && Object.keys(chatSnapshot.val()).length > 0) ||
           (metadataSnapshot.exists() && Object.keys(metadataSnapshot.val()).length > 0);
  } catch (error) {
    console.error('Error checking existing chats:', error);
    return false;
  }
};
