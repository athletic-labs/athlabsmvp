// Material Design 3 Theme System
export { 
  Material3ThemeProvider, 
  useMaterial3Theme,
  useColorScheme,
  useCurrentTheme,
  useThemeMode
} from './ThemeProvider';

export type { 
  ThemeMode,
  Material3Theme,
  ThemeContextType
} from './ThemeProvider';

export type { ColorScheme } from './apply-material3-theme';

export { generateMaterial3Colors } from './colorGenerator';
export type { Material3Colors } from './colorGenerator';

export {
  applyThemeTokens,
  saveThemePreference,
  loadThemePreference,
  getSystemColorScheme,
  getContrastRatio,
  isWCAGCompliant,
  ensureAccessibleContrast,
  PRESET_THEMES,
  THEME_STORAGE_KEY
} from './themeTokens';

export type {
  WorkspaceTheme,
  ThemePreference
} from './themeTokens';