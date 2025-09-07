/**
 * Athletic Labs Material Design 3 Color System
 * Implementation of Navy/Electric Blue brand colors with full MD3 compliance
 * 
 * Brand Colors:
 * - Navy: #1a2332 (Dual-purpose: Light text / Dark background)
 * - Electric Blue: #3b82f6 (Primary brand color)
 * - Light Blue: #60a5fa (Accessible variant for dark mode)
 * - Smoke: #e5e7eb (Light gray for surfaces)
 * - White: #ffffff (Pure white)
 */

export interface Material3ColorScheme {
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  
  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  // Tertiary colors
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  // Error colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  // Background and surface colors
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  
  // Surface hierarchy
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  
  // Outline colors
  outline: string;
  outlineVariant: string;
  
  // Special colors
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  
  // State layers (for hover, pressed states)
  primaryStateLayer: string;
  secondaryStateLayer: string;
  errorStateLayer: string;
}

/**
 * Athletic Labs Light Theme
 * Navy as text, Electric Blue as primary, white backgrounds
 */
export const athleticLabsLightTheme: Material3ColorScheme = {
  // Primary - Electric Blue
  primary: '#3b82f6',
  onPrimary: '#ffffff',
  primaryContainer: '#dbeafe',
  onPrimaryContainer: '#1e3a8a',
  
  // Secondary - Navy derivatives
  secondary: '#1a2332',
  onSecondary: '#ffffff', 
  secondaryContainer: '#e2e8f0',
  onSecondaryContainer: '#1a2332',
  
  // Tertiary - Balanced grays
  tertiary: '#64748b',
  onTertiary: '#ffffff',
  tertiaryContainer: '#f1f5f9',
  onTertiaryContainer: '#334155',
  
  // Error - Material Red
  error: '#ef4444',
  onError: '#ffffff',
  errorContainer: '#fef2f2',
  onErrorContainer: '#dc2626',
  
  // Background and surfaces
  background: '#ffffff',
  onBackground: '#1a2332',
  surface: '#ffffff',
  onSurface: '#1a2332',
  surfaceVariant: '#f8fafc',
  onSurfaceVariant: '#475569',
  
  // Surface hierarchy (lightest to darkest)
  surfaceDim: '#f8fafc',
  surfaceBright: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f9fafb',
  surfaceContainer: '#e5e7eb',  // Smoke
  surfaceContainerHigh: '#e2e8f0',
  surfaceContainerHighest: '#d1d5db',
  
  // Outlines
  outline: '#e5e7eb',
  outlineVariant: '#d1d5db',
  
  // Special
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#1a2332',
  inverseOnSurface: '#ffffff',
  inversePrimary: '#60a5fa',
  
  // State layers (with opacity for hover/press)
  primaryStateLayer: 'rgba(59, 130, 246, 0.12)',
  secondaryStateLayer: 'rgba(26, 35, 50, 0.12)', 
  errorStateLayer: 'rgba(239, 68, 68, 0.12)',
};

/**
 * Athletic Labs Dark Theme
 * White as text, Light Blue as primary, navy backgrounds
 */
export const athleticLabsDarkTheme: Material3ColorScheme = {
  // Primary - Light Blue (better contrast in dark mode)
  primary: '#60a5fa',
  onPrimary: '#1a2332',
  primaryContainer: '#1e3a8a',
  onPrimaryContainer: '#93c5fd',
  
  // Secondary - Light blue derivatives
  secondary: '#93c5fd',
  onSecondary: '#1a2332',
  secondaryContainer: '#374151',
  onSecondaryContainer: '#e0e7ff',
  
  // Tertiary - Warm grays
  tertiary: '#94a3b8',
  onTertiary: '#1e293b',
  tertiaryContainer: '#334155',
  onTertiaryContainer: '#cbd5e1',
  
  // Error - Material Red (adjusted for dark)
  error: '#f87171',
  onError: '#1a2332',
  errorContainer: '#7f1d1d',
  onErrorContainer: '#fecaca',
  
  // Background and surfaces
  background: '#1a2332',
  onBackground: '#ffffff',
  surface: '#1a2332',
  onSurface: '#ffffff',
  surfaceVariant: '#1f2937',
  onSurfaceVariant: '#d1d5db',
  
  // Surface hierarchy (darkest to lightest)
  surfaceDim: '#0f1419',
  surfaceBright: '#374151',
  surfaceContainerLowest: '#1a2332',
  surfaceContainerLow: '#1f2937',
  surfaceContainer: '#374151',  // Dark Gray
  surfaceContainerHigh: '#4b5563',
  surfaceContainerHighest: '#6b7280',
  
  // Outlines
  outline: '#4b5563',
  outlineVariant: '#374151',
  
  // Special
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#e5e7eb',
  inverseOnSurface: '#1a2332', 
  inversePrimary: '#3b82f6',
  
  // State layers
  primaryStateLayer: 'rgba(96, 165, 250, 0.16)',
  secondaryStateLayer: 'rgba(147, 197, 253, 0.16)',
  errorStateLayer: 'rgba(248, 113, 113, 0.16)',
};

/**
 * Semantic color tokens for consistent usage
 */
export const semanticColors = {
  success: {
    light: '#10b981',
    dark: '#34d399',
  },
  warning: {
    light: '#f59e0b', 
    dark: '#fbbf24',
  },
  info: {
    light: '#3b82f6',
    dark: '#60a5fa',
  },
  neutral: {
    light: '#6b7280',
    dark: '#9ca3af',
  },
} as const;

/**
 * Elevation tokens for Material 3 surfaces
 */
export const elevationTokens = {
  level0: {
    light: { shadow: 'none', surfaceTint: 'transparent' },
    dark: { shadow: 'none', surfaceTint: 'transparent' },
  },
  level1: {
    light: { 
      shadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
      surfaceTint: 'rgba(59, 130, 246, 0.05)'
    },
    dark: { 
      shadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px rgba(0, 0, 0, 0.3)',
      surfaceTint: 'rgba(96, 165, 250, 0.05)'
    },
  },
  level2: {
    light: {
      shadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
      surfaceTint: 'rgba(59, 130, 246, 0.08)'
    },
    dark: {
      shadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px rgba(0, 0, 0, 0.3)', 
      surfaceTint: 'rgba(96, 165, 250, 0.08)'
    },
  },
  level3: {
    light: {
      shadow: '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
      surfaceTint: 'rgba(59, 130, 246, 0.11)'
    },
    dark: {
      shadow: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
      surfaceTint: 'rgba(96, 165, 250, 0.11)'
    },
  },
  level4: {
    light: {
      shadow: '0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
      surfaceTint: 'rgba(59, 130, 246, 0.12)'
    },
    dark: {
      shadow: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
      surfaceTint: 'rgba(96, 165, 250, 0.12)'
    },
  },
  level5: {
    light: {
      shadow: '0px 4px 4px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
      surfaceTint: 'rgba(59, 130, 246, 0.14)'
    },
    dark: {
      shadow: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
      surfaceTint: 'rgba(96, 165, 250, 0.14)'
    },
  },
} as const;

/**
 * Typography scale tokens
 */
export const typographyTokens = {
  displayLarge: { size: '57px', lineHeight: '64px', weight: '400', tracking: '-0.25px' },
  displayMedium: { size: '45px', lineHeight: '52px', weight: '400', tracking: '0px' },
  displaySmall: { size: '36px', lineHeight: '44px', weight: '400', tracking: '0px' },
  headlineLarge: { size: '32px', lineHeight: '40px', weight: '400', tracking: '0px' },
  headlineMedium: { size: '28px', lineHeight: '36px', weight: '400', tracking: '0px' },
  headlineSmall: { size: '24px', lineHeight: '32px', weight: '400', tracking: '0px' },
  titleLarge: { size: '22px', lineHeight: '28px', weight: '400', tracking: '0px' },
  titleMedium: { size: '16px', lineHeight: '24px', weight: '500', tracking: '0.15px' },
  titleSmall: { size: '14px', lineHeight: '20px', weight: '500', tracking: '0.1px' },
  bodyLarge: { size: '16px', lineHeight: '24px', weight: '400', tracking: '0.15px' },
  bodyMedium: { size: '14px', lineHeight: '20px', weight: '400', tracking: '0.25px' },
  bodySmall: { size: '12px', lineHeight: '16px', weight: '400', tracking: '0.4px' },
  labelLarge: { size: '14px', lineHeight: '20px', weight: '500', tracking: '0.1px' },
  labelMedium: { size: '12px', lineHeight: '16px', weight: '500', tracking: '0.5px' },
  labelSmall: { size: '11px', lineHeight: '16px', weight: '500', tracking: '0.5px' },
} as const;