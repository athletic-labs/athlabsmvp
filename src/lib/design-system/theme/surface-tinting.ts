/**
 * Material Design 3 Advanced Surface Tinting System
 * Implements color-aware elevation through primary color tinting
 * 
 * Material 3 uses surface tinting to create depth through color relationships
 * rather than shadow-based elevation alone. This creates more vibrant and
 * cohesive interfaces that respond to the user's color theme.
 * 
 * Reference: https://m3.material.io/styles/color/the-color-system/color-roles
 */

import { Material3ColorScheme } from './material3-colors';

/**
 * Surface tint configuration for different elevation levels
 * Each elevation level receives a specific amount of primary color tinting
 */
export interface SurfaceTintConfig {
  /** Elevation level (0-5 for MD3) */
  elevation: number;
  /** Primary color tint opacity (0-1) */
  tintOpacity: number;
  /** Shadow opacity for depth perception */
  shadowOpacity: number;
  /** Surface container variant to use as base */
  baseContainer: keyof Pick<Material3ColorScheme, 
    | 'surface' 
    | 'surfaceContainerLowest' 
    | 'surfaceContainerLow' 
    | 'surfaceContainer' 
    | 'surfaceContainerHigh' 
    | 'surfaceContainerHighest'
  >;
}

/**
 * Material Design 3 elevation levels with surface tinting
 * Based on official MD3 elevation specifications
 */
export const SURFACE_TINT_LEVELS: Record<number, SurfaceTintConfig> = {
  0: {
    elevation: 0,
    tintOpacity: 0,
    shadowOpacity: 0,
    baseContainer: 'surface'
  },
  1: {
    elevation: 1,
    tintOpacity: 0.05,
    shadowOpacity: 0.05,
    baseContainer: 'surfaceContainerLow'
  },
  2: {
    elevation: 2,
    tintOpacity: 0.08,
    shadowOpacity: 0.08,
    baseContainer: 'surfaceContainer'
  },
  3: {
    elevation: 3,
    tintOpacity: 0.11,
    shadowOpacity: 0.11,
    baseContainer: 'surfaceContainerHigh'
  },
  4: {
    elevation: 4,
    tintOpacity: 0.12,
    shadowOpacity: 0.12,
    baseContainer: 'surfaceContainerHigh'
  },
  5: {
    elevation: 5,
    tintOpacity: 0.14,
    shadowOpacity: 0.14,
    baseContainer: 'surfaceContainerHighest'
  }
};

/**
 * Component-specific elevation mappings
 * Maps UI components to their appropriate elevation levels
 */
export const COMPONENT_ELEVATIONS = {
  // Level 0 - No elevation
  surface: 0,
  background: 0,
  
  // Level 1 - Subtle elevation
  card: 1,
  listItem: 1,
  switch: 1,
  
  // Level 2 - Standard elevation
  button: 2,
  fab: 2,
  chip: 2,
  
  // Level 3 - Elevated elements
  appBar: 3,
  bottomSheet: 3,
  navigationRail: 3,
  
  // Level 4 - Modal elements
  dialog: 4,
  menu: 4,
  tooltip: 4,
  
  // Level 5 - Top-most elements
  snackbar: 5,
  floatingActionButton: 5,
} as const;

/**
 * Color utility functions for surface tinting calculations
 */
export class SurfaceTintUtils {
  /**
   * Convert hex color to RGB values
   */
  static hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ];
  }

  /**
   * Convert RGB to hex color
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  }

  /**
   * Blend two colors with specified opacity
   */
  static blendColors(baseColor: string, tintColor: string, opacity: number): string {
    const [baseR, baseG, baseB] = this.hexToRgb(baseColor);
    const [tintR, tintG, tintB] = this.hexToRgb(tintColor);
    
    const blendedR = baseR + (tintR - baseR) * opacity;
    const blendedG = baseG + (tintG - baseG) * opacity;
    const blendedB = baseB + (tintB - baseB) * opacity;
    
    return this.rgbToHex(blendedR, blendedG, blendedB);
  }

  /**
   * Calculate surface tint for given elevation
   */
  static calculateSurfaceTint(
    baseColor: string, 
    primaryColor: string, 
    elevation: number
  ): string {
    const config = SURFACE_TINT_LEVELS[elevation] || SURFACE_TINT_LEVELS[0];
    
    if (config.tintOpacity === 0) {
      return baseColor;
    }
    
    return this.blendColors(baseColor, primaryColor, config.tintOpacity);
  }

  /**
   * Generate box-shadow for Material 3 elevation
   */
  static generateElevationShadow(elevation: number, colorScheme: 'light' | 'dark' = 'light'): string {
    if (elevation === 0) return 'none';
    
    const config = SURFACE_TINT_LEVELS[elevation];
    const shadowOpacity = config.shadowOpacity;
    
    // Different shadow intensities for light vs dark mode
    const shadowColor = colorScheme === 'light' 
      ? `rgba(0, 0, 0, ${shadowOpacity})` 
      : `rgba(0, 0, 0, ${shadowOpacity * 1.5})`;
    
    // Create layered shadows for depth
    const shadows: string[] = [];
    
    // Key light shadow (sharp, smaller)
    const keyBlur = elevation * 2;
    const keyOffset = Math.ceil(elevation / 2);
    shadows.push(`0 ${keyOffset}px ${keyBlur}px ${shadowColor}`);
    
    // Ambient light shadow (soft, larger)
    const ambientBlur = elevation * 4;
    const ambientOpacity = shadowOpacity * 0.4;
    const ambientColor = colorScheme === 'light' 
      ? `rgba(0, 0, 0, ${ambientOpacity})` 
      : `rgba(0, 0, 0, ${ambientOpacity * 1.3})`;
    shadows.push(`0 ${elevation}px ${ambientBlur}px ${ambientColor}`);
    
    return shadows.join(', ');
  }
}

/**
 * Generate comprehensive surface tint tokens for CSS custom properties
 */
export function generateSurfaceTintTokens(
  theme: Material3ColorScheme, 
  colorScheme: 'light' | 'dark'
): Record<string, string> {
  const tokens: Record<string, string> = {};
  
  // Generate tinted surfaces for each elevation level
  Object.entries(SURFACE_TINT_LEVELS).forEach(([level, config]) => {
    const elevation = parseInt(level);
    const baseColor = theme[config.baseContainer];
    const tintedColor = SurfaceTintUtils.calculateSurfaceTint(
      baseColor, 
      theme.primary, 
      elevation
    );
    
    tokens[`--md-sys-color-surface-tint-${elevation}`] = tintedColor;
    tokens[`--md-elevation-${elevation}`] = SurfaceTintUtils.generateElevationShadow(elevation, colorScheme);
  });
  
  // Generate component-specific surface tokens
  Object.entries(COMPONENT_ELEVATIONS).forEach(([component, elevation]) => {
    const config = SURFACE_TINT_LEVELS[elevation];
    const baseColor = theme[config.baseContainer];
    const tintedColor = SurfaceTintUtils.calculateSurfaceTint(
      baseColor, 
      theme.primary, 
      elevation
    );
    
    tokens[`--md-comp-${component.replace(/([A-Z])/g, '-$1').toLowerCase()}-container`] = tintedColor;
    tokens[`--md-comp-${component.replace(/([A-Z])/g, '-$1').toLowerCase()}-elevation`] = 
      SurfaceTintUtils.generateElevationShadow(elevation, colorScheme);
  });
  
  // Generate state layer tints (for hover, focus, press)
  const stateLayerOpacities = {
    hover: 0.08,
    focus: 0.12,
    pressed: 0.12,
    dragged: 0.16,
  };
  
  Object.entries(stateLayerOpacities).forEach(([state, opacity]) => {
    tokens[`--md-sys-state-${state}-state-layer-opacity`] = opacity.toString();
    
    // Primary state layers
    tokens[`--md-sys-color-primary-${state}`] = `color-mix(in srgb, ${theme.primary} ${opacity * 100}%, transparent)`;
    
    // Surface state layers  
    tokens[`--md-sys-color-on-surface-${state}`] = `color-mix(in srgb, ${theme.onSurface} ${opacity * 100}%, transparent)`;
  });
  
  return tokens;
}

/**
 * CSS class generator for surface tinting
 */
export function generateSurfaceTintClasses(): string {
  const classes: string[] = [];
  
  // Generate elevation utility classes
  Object.keys(SURFACE_TINT_LEVELS).forEach(level => {
    classes.push(`
.md-elevation-${level} {
  background-color: var(--md-sys-color-surface-tint-${level});
  box-shadow: var(--md-elevation-${level});
  position: relative;
}
`);
  });
  
  // Generate component utility classes
  Object.entries(COMPONENT_ELEVATIONS).forEach(([component, elevation]) => {
    const cssClass = component.replace(/([A-Z])/g, '-$1').toLowerCase();
    classes.push(`
.md-comp-${cssClass} {
  background-color: var(--md-comp-${cssClass}-container);
  box-shadow: var(--md-comp-${cssClass}-elevation);
}
`);
  });
  
  // Generate interaction state classes
  classes.push(`
.md-state-layer {
  position: relative;
  overflow: hidden;
}

.md-state-layer::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: transparent;
  transition: background-color 200ms cubic-bezier(0.2, 0.0, 0, 1.0);
  pointer-events: none;
}

.md-state-layer:hover::before {
  background-color: var(--md-sys-color-on-surface-hover);
}

.md-state-layer:focus-visible::before {
  background-color: var(--md-sys-color-on-surface-focus);
}

.md-state-layer:active::before {
  background-color: var(--md-sys-color-on-surface-pressed);
}

.md-state-layer-primary:hover::before {
  background-color: var(--md-sys-color-primary-hover);
}

.md-state-layer-primary:focus-visible::before {
  background-color: var(--md-sys-color-primary-focus);
}

.md-state-layer-primary:active::before {
  background-color: var(--md-sys-color-primary-pressed);
}
`);
  
  return classes.join('\n');
}

/**
 * Utility function to get component elevation
 */
export function getComponentElevation(component: keyof typeof COMPONENT_ELEVATIONS): number {
  return COMPONENT_ELEVATIONS[component];
}

/**
 * Utility function to get CSS class for component elevation
 */
export function getComponentElevationClass(component: keyof typeof COMPONENT_ELEVATIONS): string {
  const cssClass = component.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `md-comp-${cssClass}`;
}