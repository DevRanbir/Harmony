"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface UserSettings {
  writingStyle: 'concise' | 'formal' | 'technical' | 'creative' | 'tabular' | 'graphs' | 'algorithm' | 'map-searches' | 'joking' | 'auto';
  language: 'hinglish' | 'english' | 'punjabi' | 'marathi' | 'hindi';
  maxLength: number;
}

interface SettingsContextType {
  settings: UserSettings;
  updateWritingStyle: (style: UserSettings['writingStyle']) => void;
  updateLanguage: (language: UserSettings['language']) => void;
  updateMaxLength: (length: number) => void;
  getSystemPrompt: () => string;
  getSystemPromptForMessage: (message: string) => Promise<string>;
  temporarySwitchMode: (targetMode: UserSettings['writingStyle'], message: string) => void;
  revertToAuto: () => void;
}

const defaultSettings: UserSettings = {
  writingStyle: 'auto',
  language: 'hinglish',
  maxLength: 512 // Reduced from 2048 to 512 for much shorter responses
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [wasAutoMode, setWasAutoMode] = useState(false);
  const [currentActiveMode, setCurrentActiveMode] = useState<UserSettings['writingStyle']>('auto');

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('harmony-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        const newSettings = { ...defaultSettings, ...parsedSettings };
        setSettings(newSettings);
        setCurrentActiveMode(newSettings.writingStyle);
      } catch (error) {
        console.error('Error loading settings:', error);
        setCurrentActiveMode(defaultSettings.writingStyle);
      }
    } else {
      setCurrentActiveMode(defaultSettings.writingStyle);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('harmony-settings', JSON.stringify(settings));
  }, [settings]);

  const updateWritingStyle = useMemo(() => (writingStyle: UserSettings['writingStyle']) => {
    setSettings(prev => ({ ...prev, writingStyle }));
    if (!wasAutoMode) {
      setCurrentActiveMode(writingStyle);
    }
  }, [wasAutoMode]);

  const updateLanguage = useMemo(() => (language: UserSettings['language']) => {
    setSettings(prev => ({ ...prev, language }));
  }, []);

  const updateMaxLength = useMemo(() => (maxLength: number) => {
    setSettings(prev => ({ ...prev, maxLength }));
  }, []);

  // Function to detect and temporarily switch mode based on user query
  const temporarySwitchMode = useMemo(() => (targetMode: UserSettings['writingStyle'], message: string) => {
    console.log('temporarySwitchMode called with:', { currentStyle: settings.writingStyle, message, wasAutoMode }); // Debug
    
    if (settings.writingStyle === 'auto') {
      console.log('Detecting mode for message:', message); // Debug
      setWasAutoMode(true);
      
      // Detect what mode to switch to based on message content
      const msg = message.toLowerCase();
      let detectedMode: UserSettings['writingStyle'] = 'concise';
      
      if (msg.includes('chart') || msg.includes('graph') || msg.includes('plot') || msg.includes('visualiz')) {
        detectedMode = 'graphs';
      } else if (msg.includes('algorithm') || msg.includes('step') || msg.includes('implement') || msg.includes('sort') || msg.includes('search')) {
        detectedMode = 'algorithm';
      } else if (msg.includes('table') || msg.includes('compare') || msg.includes('data')) {
        detectedMode = 'tabular';
      } else if (msg.includes('where') || msg.includes('location') || msg.includes('address') || msg.includes('directions')) {
        detectedMode = 'map-searches';
      } else if (msg.includes('technical') || msg.includes('api') || msg.includes('documentation')) {
        detectedMode = 'technical';
      } else if (msg.includes('story') || msg.includes('creative') || msg.includes('write')) {
        detectedMode = 'creative';
      } else if (msg.includes('joke') || msg.includes('funny') || msg.includes('humor')) {
        detectedMode = 'joking';
      } else if (msg.includes('formal') || msg.includes('business') || msg.includes('professional')) {
        detectedMode = 'formal';
      }
      
      console.log('Auto mode detected:', detectedMode, 'for message:', message); // Debug log
      
      // Set both the display setting and the active mode for system prompt
      setCurrentActiveMode(detectedMode);
      setSettings(prev => ({ ...prev, writingStyle: detectedMode }));
    }
  }, [settings.writingStyle, wasAutoMode]);

  // Function to revert back to auto mode
  const revertToAuto = useMemo(() => () => {
    if (wasAutoMode) {
      setSettings(prev => ({ ...prev, writingStyle: 'auto' }));
      setCurrentActiveMode('auto');
      setWasAutoMode(false);
    }
  }, [wasAutoMode]);

  const getSystemPrompt = useMemo(() => () => {
    const styleMap = {
      concise: "Ultra-brief. 1-2 sentences max.",
      formal: "Professional, minimal. Key points only.", 
      technical: "Technical facts only. No verbose explanations.",
      creative: "Creative but short.",
      tabular: "Simple tables only.",
      graphs: "MANDATORY: You MUST provide JSON chart data in code blocks. NEVER say you can't create charts. Example: ```json\n{\"type\": \"pie\", \"data\": [{\"name\": \"Rent\", \"value\": 40}, {\"name\": \"Food\", \"value\": 25}], \"xKey\": \"name\", \"yKey\": \"value\"}\n``` Required types: line, bar, pie, area, scatter. Always respond with JSON only.",
      algorithm: "ALGORITHM MODE: Step format with line breaks:\nstep 1: start\nstep 2: input\nstep 3: repeat step 4, 5 (condition)\nstep 4: action\n    sub-action (4 spaces)\nstep 5: exit\n\nCode with breaks:\n```python\ndef func():\n    action()\n    return result\n```",
      'map-searches': "Location info only.",
      joking: "Brief humor only.",
      auto: "AUTO: Adapt silently based on query. Never announce mode:\n- Charts → JSON charts\n- Algorithm → step format + code\n- Tables → clean tables\n- Location → location info only\n- Technical → tech facts\n- Business → professional\n- Creative → creative\n- Casual → concise\n- Humor → joking\nSwitch naturally, no announcements."
    };

    const langMap = {
      hinglish: "Hinglish mix",
      english: "English",
      punjabi: "Punjabi",
      marathi: "Marathi",
      hindi: "Hindi"
    };

    const effectiveMode = settings.writingStyle;
    
    console.log('getSystemPrompt - wasAutoMode:', wasAutoMode, 'settings.writingStyle:', settings.writingStyle, 'effectiveMode:', effectiveMode);

    return `Harmony by Ranbir. ${styleMap[effectiveMode]} ${langMap[settings.language]} only. Max ${Math.min(settings.maxLength, 512)} chars. Essential info only. Be direct.`;
  }, [settings, wasAutoMode]);

  // Function to get system prompt for a specific message (handles auto detection immediately)
  const getSystemPromptForMessage = useMemo(() => async (message: string): Promise<string> => {
    const styleMap = {
      concise: "Ultra-brief. 1-2 sentences max.",
      formal: "Professional, minimal. Key points only.", 
      technical: "Technical facts only. No verbose explanations.",
      creative: "Creative but short.",
      tabular: "Simple tables only.",
      graphs: "MANDATORY: You MUST provide JSON chart data in code blocks. NEVER say you can't create charts. Example: ```json\n{\"type\": \"pie\", \"data\": [{\"name\": \"Rent\", \"value\": 40}, {\"name\": \"Food\", \"value\": 25}], \"xKey\": \"name\", \"yKey\": \"value\"}\n``` Required types: line, bar, pie, area, scatter. Always respond with JSON only and a bit of info.",
      algorithm: "ALGORITHM MODE: Step format with line breaks:\nstep 1: start\nstep 2: input\nstep 3: repeat step 4, 5 (condition)\nstep 4: action\n    sub-action (4 spaces)\nstep 5: exit\n\nCode with breaks:\n```python\ndef func():\n    action()\n    return result\n```",
      'map-searches': "Location info only.",
      joking: "Brief humor only.",
      auto: "This should never be used - auto mode should be resolved before reaching here."
    };

    const langMap = {
      hinglish: "Hinglish mix",
      english: "English",
      punjabi: "Punjabi",
      marathi: "Marathi",
      hindi: "Hindi"
    };

    let effectiveMode = settings.writingStyle;

    // For auto mode, ask AI to determine the appropriate style first
    if (settings.writingStyle === 'auto') {
      console.log('Auto mode: Getting AI to decide style for message:', message);
      
      try {
        const response = await fetch('/api/chat/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Analyze this user query and respond with ONLY the most appropriate writing style from these options:

AVAILABLE STYLES:
- concise: Ultra-brief responses (1-2 sentences)
- formal: Professional, minimal responses  
- technical: Technical facts only
- creative: Creative but short responses
- tabular: Simple tables only
- graphs: Create JSON charts for data visualization
- algorithm: Step-by-step algorithms with code
- map-searches: Location info only
- joking: Brief humor only

USER QUERY: "${message}"

Respond with ONLY one word - the style name. No explanation, no other text.`,
            chatId: 'style-detection',
            userId: 'system',
            systemPrompt: 'You are a writing style classifier. Respond with ONLY the style name that best matches the user query. No explanations.'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const detectedStyle = data.response?.trim().toLowerCase();
          
          // Validate the detected style
          const validStyles: UserSettings['writingStyle'][] = ['concise', 'formal', 'technical', 'creative', 'tabular', 'graphs', 'algorithm', 'map-searches', 'joking'];
          
          if (validStyles.includes(detectedStyle as UserSettings['writingStyle'])) {
            effectiveMode = detectedStyle as UserSettings['writingStyle'];
            
            // Update the UI to show the detected mode temporarily
            setWasAutoMode(true);
            setCurrentActiveMode(effectiveMode);
            setSettings(prev => ({ ...prev, writingStyle: effectiveMode }));
            
            console.log('AI detected style:', effectiveMode, 'for message:', message);
          } else {
            console.warn('Invalid style detected:', detectedStyle, 'falling back to concise');
            effectiveMode = 'concise';
          }
        } else {
          console.error('Failed to detect style, falling back to concise');
          effectiveMode = 'concise';
        }
      } catch (error) {
        console.error('Error detecting style:', error, 'falling back to concise');
        effectiveMode = 'concise';
      }
    }

    console.log('getSystemPromptForMessage final mode:', effectiveMode, 'for message:', message);

    return `Harmony by Ranbir. ${styleMap[effectiveMode]} ${langMap[settings.language]} only. Max ${Math.min(settings.maxLength, 512)} chars. Essential info only. Be direct.`;
  }, [settings]);

  const contextValue = useMemo(() => ({
    settings,
    updateWritingStyle,
    updateLanguage,
    updateMaxLength,
    getSystemPrompt,
    getSystemPromptForMessage,
    temporarySwitchMode,
    revertToAuto
  }), [settings, updateWritingStyle, updateLanguage, updateMaxLength, getSystemPrompt, getSystemPromptForMessage, temporarySwitchMode, revertToAuto]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}
