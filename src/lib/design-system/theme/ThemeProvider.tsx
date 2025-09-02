'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { generateMaterial3Colors } from './colorGenerator';
import { applyThemeTokens } from './themeTokens';

export type ColorScheme = 'light' | 'dark';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface Material3Theme {
  id: string;
  name: string;
  seedColor: string;
  description?: string;
  workspaceId?: string;
}

export interface ThemeContextType {
  // Current theme state
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
  currentTheme: Material3Theme;
  
  // Theme controls
  setThemeMode: (mode: ThemeMode) => void;
  setTheme: (theme: Material3Theme) => void;
  
  // Workspace themes
  workspaceThemes: Material3Theme[];
  setWorkspaceThemes: (themes: Material3Theme[]) => void;
  
  // Dynamic color generation
  generateThemeFromColor: (seedColor: string, name?: string) => Material3Theme;
  applyTheme: (theme: Material3Theme, scheme: ColorScheme) => void;
}

const defaultTheme: Material3Theme = {
  id: 'default',
  name: 'Athletic Labs',
  seedColor: '#00697b', // Teal primary from existing tokens
  description: 'Default Athletic Labs theme'
};

const presetThemes: Material3Theme[] = [
  defaultTheme,
  {
    id: 'blue-sports',
    name: 'Blue Sports',
    seedColor: '#1976d2',
    description: 'Classic sports blue theme'
  },
  {
    id: 'energy-orange',
    name: 'Energy Orange',
    seedColor: '#ff5722',
    description: 'High-energy orange theme'
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    seedColor: '#4caf50',
    description: 'Natural green theme'
  },
  {
    id: 'premium-purple',
    name: 'Premium Purple',
    seedColor: '#9c27b0',
    description: 'Premium purple theme'
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Material3Theme;
  storageKey?: string;
}

export function Material3ThemeProvider({ 
  children, 
  defaultTheme: propDefaultTheme = defaultTheme,
  storageKey = 'athletic-labs-theme'
}: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [currentTheme, setCurrentTheme] = useState<Material3Theme>(propDefaultTheme);
  const [workspaceThemes, setWorkspaceThemes] = useState<Material3Theme[]>(presetThemes);

  // Detect system color scheme
  const getSystemColorScheme = (): ColorScheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve actual color scheme based on mode
  const resolveColorScheme = (mode: ThemeMode): ColorScheme => {
    return mode === 'system' ? getSystemColorScheme() : mode as ColorScheme;
  };

  // Generate theme from seed color
  const generateThemeFromColor = (seedColor: string, name = 'Custom Theme'): Material3Theme => {
    return {
      id: `custom-${Date.now()}`,
      name,
      seedColor,
      description: `Custom theme generated from ${seedColor}`
    };
  };

  // Apply theme to CSS custom properties
  const applyTheme = (theme: Material3Theme, scheme: ColorScheme) => {
    if (typeof window === 'undefined') return;

    const colors = generateMaterial3Colors(theme.seedColor);
    applyThemeTokens(colors, scheme);
    
    // Store theme preference
    const themeData = {
      mode: themeMode,
      theme: theme,
      timestamp: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(themeData));
  };

  // Set theme mode and persist
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    const newScheme = resolveColorScheme(mode);
    setColorScheme(newScheme);
    applyTheme(currentTheme, newScheme);
  };

  // Set theme and apply
  const setTheme = (theme: Material3Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme, colorScheme);
  };

  // Initialize theme from storage and system
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load saved theme
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { mode, theme } = JSON.parse(saved);
        if (mode) setThemeModeState(mode);
        if (theme) setCurrentTheme(theme);
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
    }

    // Set initial color scheme
    const initialScheme = resolveColorScheme(themeMode);
    setColorScheme(initialScheme);

    // Listen for system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'system') {
        const newScheme = getSystemColorScheme();
        setColorScheme(newScheme);
        applyTheme(currentTheme, newScheme);
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Apply theme when dependencies change
  useEffect(() => {
    applyTheme(currentTheme, colorScheme);
  }, [currentTheme, colorScheme]);

  const contextValue: ThemeContextType = {
    colorScheme,
    themeMode,
    currentTheme,
    setThemeMode,
    setTheme,
    workspaceThemes,
    setWorkspaceThemes,
    generateThemeFromColor,
    applyTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useMaterial3Theme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useMaterial3Theme must be used within a Material3ThemeProvider');
  }
  return context;
}

// Convenience hooks
export function useColorScheme(): ColorScheme {
  return useMaterial3Theme().colorScheme;
}

export function useCurrentTheme(): Material3Theme {
  return useMaterial3Theme().currentTheme;
}

export function useThemeMode(): [ThemeMode, (mode: ThemeMode) => void] {
  const { themeMode, setThemeMode } = useMaterial3Theme();
  return [themeMode, setThemeMode];
}