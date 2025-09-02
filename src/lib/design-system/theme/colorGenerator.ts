/**
 * Material Design 3 Dynamic Color Generation
 * Based on Material Color Utilities
 */

interface HCT {
  hue: number;
  chroma: number;
  tone: number;
}

export interface Material3Colors {
  light: Record<string, string>;
  dark: Record<string, string>;
}

// Convert hex to HCT (simplified implementation)
function hexToHCT(hex: string): HCT {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  // Convert RGB to HSL for hue calculation
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let hue = 0;
  if (diff !== 0) {
    switch (max) {
      case r:
        hue = ((g - b) / diff) % 6;
        break;
      case g:
        hue = (b - r) / diff + 2;
        break;
      case b:
        hue = (r - g) / diff + 4;
        break;
    }
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  
  // Calculate chroma (simplified)
  const chroma = diff * 100;
  
  // Calculate tone (lightness)
  const tone = ((max + min) / 2) * 100;
  
  return { hue, chroma: Math.min(chroma, 100), tone };
}

// Convert HCT to hex (simplified implementation)
function hctToHex(hct: HCT): string {
  const { hue, chroma, tone } = hct;
  
  // Simplified conversion - in production, use proper HCT to RGB conversion
  const saturation = chroma / 100;
  const lightness = tone / 100;
  
  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (hue < 60) {
    r = c; g = x; b = 0;
  } else if (hue < 120) {
    r = x; g = c; b = 0;
  } else if (hue < 180) {
    r = 0; g = c; b = x;
  } else if (hue < 240) {
    r = 0; g = x; b = c;
  } else if (hue < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Generate tonal palette from HCT
function generateTonalPalette(hct: HCT): Record<number, string> {
  const tones = [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
  const palette: Record<number, string> = {};
  
  tones.forEach(tone => {
    palette[tone] = hctToHex({ ...hct, tone });
  });
  
  return palette;
}

// Generate neutral palette (reduced chroma)
function generateNeutralPalette(hct: HCT): Record<number, string> {
  const neutralHct = { ...hct, chroma: Math.min(hct.chroma * 0.16, 8) };
  return generateTonalPalette(neutralHct);
}

// Generate neutral variant palette
function generateNeutralVariantPalette(hct: HCT): Record<number, string> {
  const neutralVariantHct = { ...hct, chroma: Math.min(hct.chroma * 0.32, 16) };
  return generateTonalPalette(neutralVariantHct);
}

// Generate error palette (fixed red hue)
function generateErrorPalette(): Record<number, string> {
  const errorHct: HCT = { hue: 25, chroma: 84, tone: 50 };
  return generateTonalPalette(errorHct);
}

// Generate success palette (green)
function generateSuccessPalette(): Record<number, string> {
  const successHct: HCT = { hue: 122, chroma: 39, tone: 50 };
  return generateTonalPalette(successHct);
}

// Generate warning palette (amber)
function generateWarningPalette(): Record<number, string> {
  const warningHct: HCT = { hue: 45, chroma: 74, tone: 50 };
  return generateTonalPalette(warningHct);
}

// Generate info palette (blue)
function generateInfoPalette(): Record<number, string> {
  const infoHct: HCT = { hue: 207, chroma: 78, tone: 50 };
  return generateTonalPalette(infoHct);
}

export function generateMaterial3Colors(seedColor: string): Material3Colors {
  const seedHCT = hexToHCT(seedColor);
  
  // Generate palettes
  const primaryPalette = generateTonalPalette(seedHCT);
  const secondaryPalette = generateTonalPalette({ ...seedHCT, chroma: Math.max(seedHCT.chroma * 0.33, 16) });
  const tertiaryPalette = generateTonalPalette({ 
    hue: (seedHCT.hue + 60) % 360, 
    chroma: Math.max(seedHCT.chroma * 0.5, 24), 
    tone: seedHCT.tone 
  });
  const neutralPalette = generateNeutralPalette(seedHCT);
  const neutralVariantPalette = generateNeutralVariantPalette(seedHCT);
  const errorPalette = generateErrorPalette();
  const successPalette = generateSuccessPalette();
  const warningPalette = generateWarningPalette();
  const infoPalette = generateInfoPalette();

  // Light theme colors
  const light = {
    // Primary
    'primary': primaryPalette[40],
    'on-primary': primaryPalette[100],
    'primary-container': primaryPalette[90],
    'on-primary-container': primaryPalette[10],
    
    // Secondary
    'secondary': secondaryPalette[40],
    'on-secondary': secondaryPalette[100],
    'secondary-container': secondaryPalette[90],
    'on-secondary-container': secondaryPalette[10],
    
    // Tertiary
    'tertiary': tertiaryPalette[40],
    'on-tertiary': tertiaryPalette[100],
    'tertiary-container': tertiaryPalette[90],
    'on-tertiary-container': tertiaryPalette[10],
    
    // Error
    'error': errorPalette[40],
    'on-error': errorPalette[100],
    'error-container': errorPalette[90],
    'on-error-container': errorPalette[10],
    
    // Surface
    'surface': neutralPalette[98],
    'on-surface': neutralPalette[10],
    'surface-variant': neutralVariantPalette[90],
    'on-surface-variant': neutralVariantPalette[30],
    'surface-dim': neutralPalette[87],
    'surface-bright': neutralPalette[98],
    'surface-container-lowest': neutralPalette[100],
    'surface-container-low': neutralPalette[96],
    'surface-container': neutralPalette[94],
    'surface-container-high': neutralPalette[92],
    'surface-container-highest': neutralPalette[90],
    
    // Outline
    'outline': neutralVariantPalette[50],
    'outline-variant': neutralVariantPalette[80],
    
    // Inverse
    'inverse-surface': neutralPalette[20],
    'on-inverse-surface': neutralPalette[95],
    'inverse-primary': primaryPalette[80],
    
    // Shadow and scrim
    'shadow': neutralPalette[0],
    'scrim': neutralPalette[0],
    
    // SaaS-specific colors
    'success': successPalette[40],
    'on-success': successPalette[100],
    'success-container': successPalette[90],
    'on-success-container': successPalette[10],
    
    'warning': warningPalette[40],
    'on-warning': warningPalette[100],
    'warning-container': warningPalette[90],
    'on-warning-container': warningPalette[10],
    
    'info': infoPalette[40],
    'on-info': infoPalette[100],
    'info-container': infoPalette[90],
    'on-info-container': infoPalette[10]
  };

  // Dark theme colors
  const dark = {
    // Primary
    'primary': primaryPalette[80],
    'on-primary': primaryPalette[20],
    'primary-container': primaryPalette[30],
    'on-primary-container': primaryPalette[90],
    
    // Secondary
    'secondary': secondaryPalette[80],
    'on-secondary': secondaryPalette[20],
    'secondary-container': secondaryPalette[30],
    'on-secondary-container': secondaryPalette[90],
    
    // Tertiary
    'tertiary': tertiaryPalette[80],
    'on-tertiary': tertiaryPalette[20],
    'tertiary-container': tertiaryPalette[30],
    'on-tertiary-container': tertiaryPalette[90],
    
    // Error
    'error': errorPalette[80],
    'on-error': errorPalette[20],
    'error-container': errorPalette[30],
    'on-error-container': errorPalette[90],
    
    // Surface
    'surface': neutralPalette[6],
    'on-surface': neutralPalette[90],
    'surface-variant': neutralVariantPalette[30],
    'on-surface-variant': neutralVariantPalette[80],
    'surface-dim': neutralPalette[6],
    'surface-bright': neutralPalette[24],
    'surface-container-lowest': neutralPalette[4],
    'surface-container-low': neutralPalette[10],
    'surface-container': neutralPalette[12],
    'surface-container-high': neutralPalette[17],
    'surface-container-highest': neutralPalette[22],
    
    // Outline
    'outline': neutralVariantPalette[60],
    'outline-variant': neutralVariantPalette[30],
    
    // Inverse
    'inverse-surface': neutralPalette[90],
    'on-inverse-surface': neutralPalette[20],
    'inverse-primary': primaryPalette[40],
    
    // Shadow and scrim
    'shadow': neutralPalette[0],
    'scrim': neutralPalette[0],
    
    // SaaS-specific colors
    'success': successPalette[80],
    'on-success': successPalette[20],
    'success-container': successPalette[30],
    'on-success-container': successPalette[90],
    
    'warning': warningPalette[80],
    'on-warning': warningPalette[20],
    'warning-container': warningPalette[30],
    'on-warning-container': warningPalette[90],
    
    'info': infoPalette[80],
    'on-info': infoPalette[20],
    'info-container': infoPalette[30],
    'on-info-container': infoPalette[90]
  };

  return { light, dark };
}