/**
 * Material 3 Theme Application Utility
 * Applies Athletic Labs Material 3 colors as CSS custom properties
 */

import { 
  Material3ColorScheme, 
  athleticLabsLightTheme, 
  athleticLabsDarkTheme,
  elevationTokens,
  typographyTokens,
  semanticColors 
} from './material3-colors';
import { 
  generateSurfaceTintTokens,
  generateSurfaceTintClasses,
  SurfaceTintUtils 
} from './surface-tinting';

export type ColorScheme = 'light' | 'dark';

/**
 * Apply Material 3 theme to document root
 */
export function applyMaterial3Theme(scheme: ColorScheme = 'light'): void {
  if (typeof document === 'undefined') return;

  const theme = scheme === 'dark' ? athleticLabsDarkTheme : athleticLabsLightTheme;
  const root = document.documentElement;

  // Apply color tokens
  applyColorTokens(root, theme);
  
  // Apply elevation tokens
  applyElevationTokens(root, scheme);
  
  // Apply typography tokens
  applyTypographyTokens(root);
  
  // Apply semantic colors
  applySemanticColors(root, scheme);
  
  // Apply surface tinting tokens
  applySurfaceTintTokens(root, theme, scheme);
  
  // Set color scheme class
  root.classList.remove('light', 'dark');
  root.classList.add(scheme);
  
  // Set color-scheme CSS property for native form controls
  root.style.colorScheme = scheme;
}

/**
 * Apply color tokens as CSS custom properties
 */
function applyColorTokens(root: HTMLElement, theme: Material3ColorScheme): void {
  // Primary colors
  root.style.setProperty('--md-sys-color-primary', theme.primary);
  root.style.setProperty('--md-sys-color-on-primary', theme.onPrimary);
  root.style.setProperty('--md-sys-color-primary-container', theme.primaryContainer);
  root.style.setProperty('--md-sys-color-on-primary-container', theme.onPrimaryContainer);
  
  // Secondary colors
  root.style.setProperty('--md-sys-color-secondary', theme.secondary);
  root.style.setProperty('--md-sys-color-on-secondary', theme.onSecondary);
  root.style.setProperty('--md-sys-color-secondary-container', theme.secondaryContainer);
  root.style.setProperty('--md-sys-color-on-secondary-container', theme.onSecondaryContainer);
  
  // Tertiary colors
  root.style.setProperty('--md-sys-color-tertiary', theme.tertiary);
  root.style.setProperty('--md-sys-color-on-tertiary', theme.onTertiary);
  root.style.setProperty('--md-sys-color-tertiary-container', theme.tertiaryContainer);
  root.style.setProperty('--md-sys-color-on-tertiary-container', theme.onTertiaryContainer);
  
  // Error colors
  root.style.setProperty('--md-sys-color-error', theme.error);
  root.style.setProperty('--md-sys-color-on-error', theme.onError);
  root.style.setProperty('--md-sys-color-error-container', theme.errorContainer);
  root.style.setProperty('--md-sys-color-on-error-container', theme.onErrorContainer);
  
  // Background and surface colors
  root.style.setProperty('--md-sys-color-background', theme.background);
  root.style.setProperty('--md-sys-color-on-background', theme.onBackground);
  root.style.setProperty('--md-sys-color-surface', theme.surface);
  root.style.setProperty('--md-sys-color-on-surface', theme.onSurface);
  root.style.setProperty('--md-sys-color-surface-variant', theme.surfaceVariant);
  root.style.setProperty('--md-sys-color-on-surface-variant', theme.onSurfaceVariant);
  
  // Surface hierarchy
  root.style.setProperty('--md-sys-color-surface-dim', theme.surfaceDim);
  root.style.setProperty('--md-sys-color-surface-bright', theme.surfaceBright);
  root.style.setProperty('--md-sys-color-surface-container-lowest', theme.surfaceContainerLowest);
  root.style.setProperty('--md-sys-color-surface-container-low', theme.surfaceContainerLow);
  root.style.setProperty('--md-sys-color-surface-container', theme.surfaceContainer);
  root.style.setProperty('--md-sys-color-surface-container-high', theme.surfaceContainerHigh);
  root.style.setProperty('--md-sys-color-surface-container-highest', theme.surfaceContainerHighest);
  
  // Outline colors
  root.style.setProperty('--md-sys-color-outline', theme.outline);
  root.style.setProperty('--md-sys-color-outline-variant', theme.outlineVariant);
  
  // Special colors
  root.style.setProperty('--md-sys-color-shadow', theme.shadow);
  root.style.setProperty('--md-sys-color-scrim', theme.scrim);
  root.style.setProperty('--md-sys-color-inverse-surface', theme.inverseSurface);
  root.style.setProperty('--md-sys-color-inverse-on-surface', theme.inverseOnSurface);
  root.style.setProperty('--md-sys-color-inverse-primary', theme.inversePrimary);
  
  // State layers
  root.style.setProperty('--md-sys-color-primary-state-layer', theme.primaryStateLayer);
  root.style.setProperty('--md-sys-color-secondary-state-layer', theme.secondaryStateLayer);
  root.style.setProperty('--md-sys-color-error-state-layer', theme.errorStateLayer);
}

/**
 * Apply elevation tokens
 */
function applyElevationTokens(root: HTMLElement, scheme: ColorScheme): void {
  const elevations = elevationTokens;
  
  Object.entries(elevations).forEach(([level, tokens]) => {
    const { shadow, surfaceTint } = tokens[scheme];
    root.style.setProperty(`--md-sys-elevation-${level}-shadow`, shadow);
    root.style.setProperty(`--md-sys-elevation-${level}-surface-tint`, surfaceTint);
  });
}

/**
 * Apply typography tokens
 */
function applyTypographyTokens(root: HTMLElement): void {
  Object.entries(typographyTokens).forEach(([name, token]) => {
    root.style.setProperty(`--md-sys-typescale-${kebabCase(name)}-size`, token.size);
    root.style.setProperty(`--md-sys-typescale-${kebabCase(name)}-line-height`, token.lineHeight);
    root.style.setProperty(`--md-sys-typescale-${kebabCase(name)}-weight`, token.weight);
    root.style.setProperty(`--md-sys-typescale-${kebabCase(name)}-tracking`, token.tracking);
  });
}

/**
 * Apply semantic colors
 */
function applySemanticColors(root: HTMLElement, scheme: ColorScheme): void {
  Object.entries(semanticColors).forEach(([name, colors]) => {
    root.style.setProperty(`--color-${name}`, colors[scheme]);
  });
}

/**
 * Apply surface tinting tokens
 */
function applySurfaceTintTokens(root: HTMLElement, theme: Material3ColorScheme, scheme: ColorScheme): void {
  const surfaceTintTokens = generateSurfaceTintTokens(theme, scheme);
  
  Object.entries(surfaceTintTokens).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Convert camelCase to kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/**
 * Get current theme colors as JavaScript object
 */
export function getCurrentThemeColors(scheme: ColorScheme = 'light'): Material3ColorScheme {
  return scheme === 'dark' ? athleticLabsDarkTheme : athleticLabsLightTheme;
}

/**
 * Generate CSS custom property string for a color scheme
 */
export function generateThemeCSS(scheme: ColorScheme = 'light'): string {
  const theme = getCurrentThemeColors(scheme);
  const elevations = elevationTokens;
  const semantic = semanticColors;
  
  let css = `:root {\n`;
  
  // Color tokens
  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = `--md-sys-color-${kebabCase(key)}`;
    css += `  ${cssVar}: ${value};\n`;
  });
  
  // Elevation tokens
  Object.entries(elevations).forEach(([level, tokens]) => {
    const { shadow, surfaceTint } = tokens[scheme];
    css += `  --md-sys-elevation-${level}-shadow: ${shadow};\n`;
    css += `  --md-sys-elevation-${level}-surface-tint: ${surfaceTint};\n`;
  });
  
  // Typography tokens
  Object.entries(typographyTokens).forEach(([name, token]) => {
    css += `  --md-sys-typescale-${kebabCase(name)}-size: ${token.size};\n`;
    css += `  --md-sys-typescale-${kebabCase(name)}-line-height: ${token.lineHeight};\n`;
    css += `  --md-sys-typescale-${kebabCase(name)}-weight: ${token.weight};\n`;
    css += `  --md-sys-typescale-${kebabCase(name)}-tracking: ${token.tracking};\n`;
  });
  
  // Semantic colors
  Object.entries(semantic).forEach(([name, colors]) => {
    css += `  --color-${name}: ${colors[scheme]};\n`;
  });
  
  css += `  color-scheme: ${scheme};\n`;
  css += `}\n`;
  
  return css;
}

/**
 * Validate color contrast ratio (for accessibility)
 */
export function validateColorContrast(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): { ratio: number; passes: boolean } {
  // Simplified contrast calculation
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Apply gamma correction
    const sRGBtoLin = (colorChannel: number): number => {
      if (colorChannel <= 0.03928) {
        return colorChannel / 12.92;
      } else {
        return Math.pow((colorChannel + 0.055) / 1.055, 2.4);
      }
    };
    
    const rLin = sRGBtoLin(r);
    const gLin = sRGBtoLin(g);
    const bLin = sRGBtoLin(b);
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };
  
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  
  const threshold = level === 'AAA' ? 7 : 4.5;
  const passes = ratio >= threshold;
  
  return { ratio, passes };
}

/**
 * Theme detection utilities
 */
export const themeUtils = {
  /**
   * Detect system color scheme preference
   */
  getSystemColorScheme(): ColorScheme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },
  
  /**
   * Watch for system color scheme changes
   */
  watchSystemColorScheme(callback: (scheme: ColorScheme) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  },
  
  /**
   * Get stored theme preference
   */
  getStoredTheme(key = 'athletic-labs-theme-scheme'): ColorScheme | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key) as ColorScheme;
    } catch {
      return null;
    }
  },
  
  /**
   * Store theme preference
   */
  setStoredTheme(scheme: ColorScheme, key = 'athletic-labs-theme-scheme'): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, scheme);
    } catch {
      // Ignore storage errors
    }
  },
};