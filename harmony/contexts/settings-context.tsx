"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSettings {
  writingStyle: 'concise' | 'formal' | 'technical' | 'creative' | 'tabular' | 'map-searches' | 'joking';
  language: 'hinglish' | 'english' | 'punjabi' | 'marathi' | 'hindi';
  maxLength: number;
}

interface SettingsContextType {
  settings: UserSettings;
  updateWritingStyle: (style: UserSettings['writingStyle']) => void;
  updateLanguage: (language: UserSettings['language']) => void;
  updateMaxLength: (length: number) => void;
  getSystemPrompt: () => string;
}

const defaultSettings: UserSettings = {
  writingStyle: 'concise',
  language: 'hinglish',
  maxLength: 2048
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

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('harmony-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('harmony-settings', JSON.stringify(settings));
  }, [settings]);

  const updateWritingStyle = (writingStyle: UserSettings['writingStyle']) => {
    setSettings(prev => ({ ...prev, writingStyle }));
  };

  const updateLanguage = (language: UserSettings['language']) => {
    setSettings(prev => ({ ...prev, language }));
  };

  const updateMaxLength = (maxLength: number) => {
    setSettings(prev => ({ ...prev, maxLength }));
  };

  const getSystemPrompt = () => {
    const styleMap = {
      concise: "Brief responses",
      formal: "Professional tone", 
      technical: "Technical detail",
      creative: "Creative language",
      tabular: "use tables only",
      'map-searches': "Geographic context",
      joking: "Humorous tone"
    };

    const langMap = {
      hinglish: "Hinglish mix",
      english: "English",
      punjabi: "Punjabi",
      marathi: "Marathi",
      hindi: "Hindi"
    };

    return `Harmony by Ranbir. ${styleMap[settings.writingStyle]} only, nothing else. ${langMap[settings.language]} only no english. Max ${settings.maxLength} chars. Use markdown. Dont explain words in brackets.`;
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateWritingStyle,
      updateLanguage,
      updateMaxLength,
      getSystemPrompt
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
