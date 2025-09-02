/**
 * Material Design 3 Theme Token Application
 * Applies generated colors to CSS custom properties
 */

import type { Material3Colors } from './colorGenerator';

export function applyThemeTokens(colors: Material3Colors, scheme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const colorSet = colors[scheme];

  // Apply Material 3 system colors
  Object.entries(colorSet).forEach(([key, value]) => {
    // Handle SaaS colors
    if (['success', 'warning', 'info'].some(prefix => key.startsWith(prefix))) {
      root.style.setProperty(`--md-saas-color-${key}`, value);
    } else {
      root.style.setProperty(`--md-sys-color-${key}`, value);
    }
  });

  // Apply scheme-specific class to enable CSS-based theme switching
  root.classList.remove('light', 'dark');
  root.classList.add(scheme);

  // Set data attribute for theme detection
  root.setAttribute('data-theme', scheme);
}

// Preset theme configurations for quick switching
export const PRESET_THEMES = {
  'athletic-labs': {
    name: 'Athletic Labs',
    seedColor: '#00697b',
    description: 'Default Athletic Labs theme'
  },
  'blue-sports': {
    name: 'Blue Sports',
    seedColor: '#1976d2',
    description: 'Classic sports blue'
  },
  'energy-orange': {
    name: 'Energy Orange',
    seedColor: '#ff5722',
    description: 'High-energy orange'
  },
  'nature-green': {
    name: 'Nature Green',
    seedColor: '#4caf50',
    description: 'Natural green'
  },
  'premium-purple': {
    name: 'Premium Purple',
    seedColor: '#9c27b0',
    description: 'Premium purple'
  },
  'sunset-red': {
    name: 'Sunset Red',
    seedColor: '#d32f2f',
    description: 'Vibrant sunset red'
  }
} as const;

// Workspace-specific theme configurations
export interface WorkspaceTheme {
  id: string;
  name: string;
  seedColor: string;
  workspaceId: string;
  createdAt?: Date;
  isActive?: boolean;
}

// Theme persistence utilities
export const THEME_STORAGE_KEY = 'athletic-labs-material3-theme';

export interface ThemePreference {
  mode: 'light' | 'dark' | 'system';
  currentTheme: string;
  workspaceThemes: WorkspaceTheme[];
  lastUpdated: number;
}

export function saveThemePreference(preference: ThemePreference) {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preference));
  } catch (error) {
    console.warn('Failed to save theme preference:', error);
  }
}

export function loadThemePreference(): ThemePreference | null {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) return null;
    
    const preference = JSON.parse(stored);
    
    // Validate structure
    if (
      typeof preference === 'object' &&
      ['light', 'dark', 'system'].includes(preference.mode) &&
      typeof preference.currentTheme === 'string'
    ) {
      return preference;
    }
  } catch (error) {
    console.warn('Failed to load theme preference:', error);
  }
  
  return null;
}

// System color scheme detection
export function getSystemColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Color accessibility utilities
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In production, use a proper color contrast library
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Validate WCAG accessibility compliance
export function isWCAGCompliant(contrastRatio: number, level: 'AA' | 'AAA' = 'AA'): boolean {
  const thresholds = {
    'AA': 4.5,
    'AAA': 7
  };
  
  return contrastRatio >= thresholds[level];
}

// Generate accessible color pairs
export function ensureAccessibleContrast(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): { foreground: string; background: string; contrastRatio: number } {
  let contrastRatio = getContrastRatio(foreground, background);
  
  if (isWCAGCompliant(contrastRatio, level)) {
    return { foreground, background, contrastRatio };
  }
  
  // If not compliant, suggest using surface variants or fallback colors
  // This is a simplified implementation - in production, use proper color adjustment algorithms
  const fallbackPairs = [
    { fg: '#000000', bg: '#ffffff' }, // Black on white
    { fg: '#ffffff', bg: '#000000' }, // White on black
    { fg: '#1a1a1a', bg: '#f5f5f5' }, // Dark gray on light gray
  ];
  
  for (const pair of fallbackPairs) {
    contrastRatio = getContrastRatio(pair.fg, pair.bg);
    if (isWCAGCompliant(contrastRatio, level)) {
      return { 
        foreground: pair.fg, 
        background: pair.bg, 
        contrastRatio 
      };
    }
  }
  
  // Return original if no suitable pair found
  return { foreground, background, contrastRatio: getContrastRatio(foreground, background) };
}