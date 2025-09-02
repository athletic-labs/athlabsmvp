/**
 * Material Design 3 Design Tokens for Athletic Labs SaaS Platform
 * Following Material 3 token architecture: Reference → System → Component
 */

// Reference Tokens (Base Color Palette)
export const referenceTokens = {
  palette: {
    primary: {
      '0': '#000000',
      '10': '#001f24',
      '20': '#003640',
      '25': '#00424f',
      '30': '#004f5d',
      '35': '#005c6c',
      '40': '#00697b',
      '50': '#008599',
      '60': '#24a2b8',
      '70': '#4fbfd6',
      '80': '#74dcf5',
      '90': '#b6f0ff',
      '95': '#dff7ff',
      '98': '#f6fcff',
      '99': '#fbfeff',
      '100': '#ffffff'
    },
    secondary: {
      '0': '#000000',
      '10': '#0f1c1f',
      '20': '#253134',
      '25': '#30373a',
      '30': '#3c4346',
      '35': '#484f52',
      '40': '#545b5e',
      '50': '#6d7377',
      '60': '#878d91',
      '70': '#a1a7ab',
      '80': '#bdc3c7',
      '90': '#d9dfe3',
      '95': '#e7edf1',
      '98': '#f0f6fa',
      '99': '#f8fafc',
      '100': '#ffffff'
    },
    tertiary: {
      '0': '#000000',
      '10': '#1f1a00',
      '20': '#342f00',
      '25': '#403a00',
      '30': '#4c4600',
      '35': '#595200',
      '40': '#655e00',
      '50': '#7f7700',
      '60': '#9a9200',
      '70': '#b6ad17',
      '80': '#d2c934',
      '90': '#efe54f',
      '95': '#fdf25e',
      '98': '#fffbab',
      '99': '#fffde7',
      '100': '#ffffff'
    },
    neutral: {
      '0': '#000000',
      '4': '#0f0f0f',
      '6': '#161616',
      '10': '#1f1f1f',
      '12': '#202020',
      '17': '#2b2b2b',
      '20': '#313131',
      '22': '#363636',
      '24': '#393939',
      '25': '#3a3a3a',
      '30': '#464646',
      '35': '#525252',
      '40': '#5e5e5e',
      '50': '#787878',
      '60': '#929292',
      '70': '#acacac',
      '80': '#c7c7c7',
      '87': '#dddddd',
      '90': '#e3e3e3',
      '92': '#e8e8e8',
      '94': '#eeeeee',
      '95': '#f1f1f1',
      '96': '#f4f4f4',
      '98': '#fafafa',
      '99': '#fcfcfc',
      '100': '#ffffff'
    },
    neutralVariant: {
      '0': '#000000',
      '10': '#191c1d',
      '20': '#2e3133',
      '25': '#39373c',
      '30': '#454348',
      '35': '#514f54',
      '40': '#5d5b60',
      '50': '#767379',
      '60': '#908d93',
      '70': '#aba7ae',
      '80': '#c7c3ca',
      '90': '#e3dfe6',
      '95': '#f1edf4',
      '98': '#f9f5fc',
      '99': '#fdfaff',
      '100': '#ffffff'
    },
    error: {
      '0': '#000000',
      '10': '#410002',
      '20': '#690005',
      '25': '#7e0007',
      '30': '#93000a',
      '35': '#a80710',
      '40': '#ba1a1a',
      '50': '#de3730',
      '60': '#ff5449',
      '70': '#ff897d',
      '80': '#ffb4ab',
      '90': '#ffdad6',
      '95': '#ffedea',
      '98': '#fff8f7',
      '99': '#fffbff',
      '100': '#ffffff'
    }
  }
} as const;

// System Tokens (Semantic Color Roles)
export const systemTokens = {
  color: {
    // Primary colors
    primary: 'var(--md-sys-color-primary)',
    onPrimary: 'var(--md-sys-color-on-primary)',
    primaryContainer: 'var(--md-sys-color-primary-container)',
    onPrimaryContainer: 'var(--md-sys-color-on-primary-container)',
    
    // Secondary colors
    secondary: 'var(--md-sys-color-secondary)',
    onSecondary: 'var(--md-sys-color-on-secondary)',
    secondaryContainer: 'var(--md-sys-color-secondary-container)',
    onSecondaryContainer: 'var(--md-sys-color-on-secondary-container)',
    
    // Tertiary colors
    tertiary: 'var(--md-sys-color-tertiary)',
    onTertiary: 'var(--md-sys-color-on-tertiary)',
    tertiaryContainer: 'var(--md-sys-color-tertiary-container)',
    onTertiaryContainer: 'var(--md-sys-color-on-tertiary-container)',
    
    // Error colors
    error: 'var(--md-sys-color-error)',
    onError: 'var(--md-sys-color-on-error)',
    errorContainer: 'var(--md-sys-color-error-container)',
    onErrorContainer: 'var(--md-sys-color-on-error-container)',
    
    // Surface colors
    surface: 'var(--md-sys-color-surface)',
    onSurface: 'var(--md-sys-color-on-surface)',
    surfaceVariant: 'var(--md-sys-color-surface-variant)',
    onSurfaceVariant: 'var(--md-sys-color-on-surface-variant)',
    surfaceDim: 'var(--md-sys-color-surface-dim)',
    surfaceBright: 'var(--md-sys-color-surface-bright)',
    surfaceContainerLowest: 'var(--md-sys-color-surface-container-lowest)',
    surfaceContainerLow: 'var(--md-sys-color-surface-container-low)',
    surfaceContainer: 'var(--md-sys-color-surface-container)',
    surfaceContainerHigh: 'var(--md-sys-color-surface-container-high)',
    surfaceContainerHighest: 'var(--md-sys-color-surface-container-highest)',
    
    // Outline colors
    outline: 'var(--md-sys-color-outline)',
    outlineVariant: 'var(--md-sys-color-outline-variant)',
    
    // Inverse colors
    inverseSurface: 'var(--md-sys-color-inverse-surface)',
    onInverseSurface: 'var(--md-sys-color-on-inverse-surface)',
    inversePrimary: 'var(--md-sys-color-inverse-primary)',
    
    // Shadow
    shadow: 'var(--md-sys-color-shadow)',
    scrim: 'var(--md-sys-color-scrim)'
  },
  
  // Typography scale
  typography: {
    displayLarge: {
      fontFamily: 'var(--md-sys-typescale-display-large-font)',
      fontSize: 'var(--md-sys-typescale-display-large-size)',
      fontWeight: 'var(--md-sys-typescale-display-large-weight)',
      lineHeight: 'var(--md-sys-typescale-display-large-line-height)',
      letterSpacing: 'var(--md-sys-typescale-display-large-tracking)'
    },
    displayMedium: {
      fontFamily: 'var(--md-sys-typescale-display-medium-font)',
      fontSize: 'var(--md-sys-typescale-display-medium-size)',
      fontWeight: 'var(--md-sys-typescale-display-medium-weight)',
      lineHeight: 'var(--md-sys-typescale-display-medium-line-height)',
      letterSpacing: 'var(--md-sys-typescale-display-medium-tracking)'
    },
    displaySmall: {
      fontFamily: 'var(--md-sys-typescale-display-small-font)',
      fontSize: 'var(--md-sys-typescale-display-small-size)',
      fontWeight: 'var(--md-sys-typescale-display-small-weight)',
      lineHeight: 'var(--md-sys-typescale-display-small-line-height)',
      letterSpacing: 'var(--md-sys-typescale-display-small-tracking)'
    },
    headlineLarge: {
      fontFamily: 'var(--md-sys-typescale-headline-large-font)',
      fontSize: 'var(--md-sys-typescale-headline-large-size)',
      fontWeight: 'var(--md-sys-typescale-headline-large-weight)',
      lineHeight: 'var(--md-sys-typescale-headline-large-line-height)',
      letterSpacing: 'var(--md-sys-typescale-headline-large-tracking)'
    },
    headlineMedium: {
      fontFamily: 'var(--md-sys-typescale-headline-medium-font)',
      fontSize: 'var(--md-sys-typescale-headline-medium-size)',
      fontWeight: 'var(--md-sys-typescale-headline-medium-weight)',
      lineHeight: 'var(--md-sys-typescale-headline-medium-line-height)',
      letterSpacing: 'var(--md-sys-typescale-headline-medium-tracking)'
    },
    headlineSmall: {
      fontFamily: 'var(--md-sys-typescale-headline-small-font)',
      fontSize: 'var(--md-sys-typescale-headline-small-size)',
      fontWeight: 'var(--md-sys-typescale-headline-small-weight)',
      lineHeight: 'var(--md-sys-typescale-headline-small-line-height)',
      letterSpacing: 'var(--md-sys-typescale-headline-small-tracking)'
    },
    titleLarge: {
      fontFamily: 'var(--md-sys-typescale-title-large-font)',
      fontSize: 'var(--md-sys-typescale-title-large-size)',
      fontWeight: 'var(--md-sys-typescale-title-large-weight)',
      lineHeight: 'var(--md-sys-typescale-title-large-line-height)',
      letterSpacing: 'var(--md-sys-typescale-title-large-tracking)'
    },
    titleMedium: {
      fontFamily: 'var(--md-sys-typescale-title-medium-font)',
      fontSize: 'var(--md-sys-typescale-title-medium-size)',
      fontWeight: 'var(--md-sys-typescale-title-medium-weight)',
      lineHeight: 'var(--md-sys-typescale-title-medium-line-height)',
      letterSpacing: 'var(--md-sys-typescale-title-medium-tracking)'
    },
    titleSmall: {
      fontFamily: 'var(--md-sys-typescale-title-small-font)',
      fontSize: 'var(--md-sys-typescale-title-small-size)',
      fontWeight: 'var(--md-sys-typescale-title-small-weight)',
      lineHeight: 'var(--md-sys-typescale-title-small-line-height)',
      letterSpacing: 'var(--md-sys-typescale-title-small-tracking)'
    },
    bodyLarge: {
      fontFamily: 'var(--md-sys-typescale-body-large-font)',
      fontSize: 'var(--md-sys-typescale-body-large-size)',
      fontWeight: 'var(--md-sys-typescale-body-large-weight)',
      lineHeight: 'var(--md-sys-typescale-body-large-line-height)',
      letterSpacing: 'var(--md-sys-typescale-body-large-tracking)'
    },
    bodyMedium: {
      fontFamily: 'var(--md-sys-typescale-body-medium-font)',
      fontSize: 'var(--md-sys-typescale-body-medium-size)',
      fontWeight: 'var(--md-sys-typescale-body-medium-weight)',
      lineHeight: 'var(--md-sys-typescale-body-medium-line-height)',
      letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)'
    },
    bodySmall: {
      fontFamily: 'var(--md-sys-typescale-body-small-font)',
      fontSize: 'var(--md-sys-typescale-body-small-size)',
      fontWeight: 'var(--md-sys-typescale-body-small-weight)',
      lineHeight: 'var(--md-sys-typescale-body-small-line-height)',
      letterSpacing: 'var(--md-sys-typescale-body-small-tracking)'
    },
    labelLarge: {
      fontFamily: 'var(--md-sys-typescale-label-large-font)',
      fontSize: 'var(--md-sys-typescale-label-large-size)',
      fontWeight: 'var(--md-sys-typescale-label-large-weight)',
      lineHeight: 'var(--md-sys-typescale-label-large-line-height)',
      letterSpacing: 'var(--md-sys-typescale-label-large-tracking)'
    },
    labelMedium: {
      fontFamily: 'var(--md-sys-typescale-label-medium-font)',
      fontSize: 'var(--md-sys-typescale-label-medium-size)',
      fontWeight: 'var(--md-sys-typescale-label-medium-weight)',
      lineHeight: 'var(--md-sys-typescale-label-medium-line-height)',
      letterSpacing: 'var(--md-sys-typescale-label-medium-tracking)'
    },
    labelSmall: {
      fontFamily: 'var(--md-sys-typescale-label-small-font)',
      fontSize: 'var(--md-sys-typescale-label-small-size)',
      fontWeight: 'var(--md-sys-typescale-label-small-weight)',
      lineHeight: 'var(--md-sys-typescale-label-small-line-height)',
      letterSpacing: 'var(--md-sys-typescale-label-small-tracking)'
    }
  },
  
  // Elevation tokens
  elevation: {
    level0: 'var(--md-sys-elevation-level0)',
    level1: 'var(--md-sys-elevation-level1)',
    level2: 'var(--md-sys-elevation-level2)',
    level3: 'var(--md-sys-elevation-level3)',
    level4: 'var(--md-sys-elevation-level4)',
    level5: 'var(--md-sys-elevation-level5)'
  },
  
  // Shape tokens
  shape: {
    cornerNone: 'var(--md-sys-shape-corner-none)',
    cornerExtraSmall: 'var(--md-sys-shape-corner-extra-small)',
    cornerSmall: 'var(--md-sys-shape-corner-small)',
    cornerMedium: 'var(--md-sys-shape-corner-medium)',
    cornerLarge: 'var(--md-sys-shape-corner-large)',
    cornerExtraLarge: 'var(--md-sys-shape-corner-extra-large)',
    cornerFull: 'var(--md-sys-shape-corner-full)'
  },
  
  // Motion tokens
  motion: {
    durationShort1: 'var(--md-sys-motion-duration-short1)',
    durationShort2: 'var(--md-sys-motion-duration-short2)',
    durationShort3: 'var(--md-sys-motion-duration-short3)',
    durationShort4: 'var(--md-sys-motion-duration-short4)',
    durationMedium1: 'var(--md-sys-motion-duration-medium1)',
    durationMedium2: 'var(--md-sys-motion-duration-medium2)',
    durationMedium3: 'var(--md-sys-motion-duration-medium3)',
    durationMedium4: 'var(--md-sys-motion-duration-medium4)',
    durationLong1: 'var(--md-sys-motion-duration-long1)',
    durationLong2: 'var(--md-sys-motion-duration-long2)',
    durationLong3: 'var(--md-sys-motion-duration-long3)',
    durationLong4: 'var(--md-sys-motion-duration-long4)',
    easingStandard: 'var(--md-sys-motion-easing-standard)',
    easingStandardDecelerate: 'var(--md-sys-motion-easing-standard-decelerate)',
    easingStandardAccelerate: 'var(--md-sys-motion-easing-standard-accelerate)',
    easingEmphasized: 'var(--md-sys-motion-easing-emphasized)',
    easingEmphasizedDecelerate: 'var(--md-sys-motion-easing-emphasized-decelerate)',
    easingEmphasizedAccelerate: 'var(--md-sys-motion-easing-emphasized-accelerate)'
  }
} as const;

// SaaS-specific semantic tokens
export const saasTokens = {
  // Status colors for SaaS applications
  status: {
    success: 'var(--md-saas-color-success)',
    onSuccess: 'var(--md-saas-color-on-success)',
    successContainer: 'var(--md-saas-color-success-container)',
    onSuccessContainer: 'var(--md-saas-color-on-success-container)',
    
    warning: 'var(--md-saas-color-warning)',
    onWarning: 'var(--md-saas-color-on-warning)',
    warningContainer: 'var(--md-saas-color-warning-container)',
    onWarningContainer: 'var(--md-saas-color-on-warning-container)',
    
    info: 'var(--md-saas-color-info)',
    onInfo: 'var(--md-saas-color-on-info)',
    infoContainer: 'var(--md-saas-color-info-container)',
    onInfoContainer: 'var(--md-saas-color-on-info-container)'
  },
  
  // Data visualization colors
  dataViz: {
    primary: 'var(--md-saas-data-primary)',
    secondary: 'var(--md-saas-data-secondary)',
    tertiary: 'var(--md-saas-data-tertiary)',
    quaternary: 'var(--md-saas-data-quaternary)',
    quinary: 'var(--md-saas-data-quinary)'
  },
  
  // Density variants
  density: {
    comfortable: {
      spacing: 'var(--md-saas-density-comfortable-spacing)',
      minHeight: 'var(--md-saas-density-comfortable-min-height)'
    },
    compact: {
      spacing: 'var(--md-saas-density-compact-spacing)',
      minHeight: 'var(--md-saas-density-compact-min-height)'
    },
    spacious: {
      spacing: 'var(--md-saas-density-spacious-spacing)',
      minHeight: 'var(--md-saas-density-spacious-min-height)'
    }
  }
} as const;

// Component tokens will be defined per component
export const componentTokens = {} as const;

// Utility functions for token usage
export const tokens = {
  ref: referenceTokens,
  sys: systemTokens,
  saas: saasTokens,
  comp: componentTokens
} as const;

// Type definitions for TypeScript support
export type ReferenceTokens = typeof referenceTokens;
export type SystemTokens = typeof systemTokens;
export type SaasTokens = typeof saasTokens;
export type ComponentTokens = typeof componentTokens;

export default tokens;