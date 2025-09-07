/**
 * Athletic Labs Unified Design System
 * Material Design 3 Implementation with Navy/Electric Blue Brand Colors
 * 
 * This is the single source of truth for ALL design decisions.
 * Every component MUST use these tokens - no exceptions.
 */

export const DesignSystem = {
  // TYPOGRAPHY - Material Design 3 Type Scale
  typography: {
    display: {
      large: { 
        tag: 'h1' as const, 
        size: '57px', 
        lineHeight: '64px', 
        weight: 400, 
        tracking: '-0.25px',
        className: 'md3-display-large'
      },
      medium: { 
        tag: 'h1' as const, 
        size: '45px', 
        lineHeight: '52px', 
        weight: 400, 
        tracking: '0px',
        className: 'md3-display-medium'
      },
      small: { 
        tag: 'h2' as const, 
        size: '36px', 
        lineHeight: '44px', 
        weight: 400, 
        tracking: '0px',
        className: 'md3-display-small'
      }
    },
    headline: {
      large: { 
        tag: 'h2' as const, 
        size: '32px', 
        lineHeight: '40px', 
        weight: 400, 
        tracking: '0px',
        className: 'md3-headline-large'
      },
      medium: { 
        tag: 'h3' as const, 
        size: '28px', 
        lineHeight: '36px', 
        weight: 400, 
        tracking: '0px',
        className: 'md3-headline-medium'
      },
      small: { 
        tag: 'h4' as const, 
        size: '24px', 
        lineHeight: '32px', 
        weight: 400, 
        tracking: '0px',
        className: 'md3-headline-small'
      }
    },
    title: {
      large: { 
        tag: 'h3' as const, 
        size: '22px', 
        lineHeight: '28px', 
        weight: 500, 
        tracking: '0px',
        className: 'md3-title-large'
      },
      medium: { 
        tag: 'h4' as const, 
        size: '16px', 
        lineHeight: '24px', 
        weight: 500, 
        tracking: '0.15px',
        className: 'md3-title-medium'
      },
      small: { 
        tag: 'h5' as const, 
        size: '14px', 
        lineHeight: '20px', 
        weight: 500, 
        tracking: '0.1px',
        className: 'md3-title-small'
      }
    },
    body: {
      large: { 
        size: '16px', 
        lineHeight: '24px', 
        weight: 400, 
        tracking: '0.5px',
        className: 'md3-body-large'
      },
      medium: { 
        size: '14px', 
        lineHeight: '20px', 
        weight: 400, 
        tracking: '0.25px',
        className: 'md3-body-medium'
      },
      small: { 
        size: '12px', 
        lineHeight: '16px', 
        weight: 400, 
        tracking: '0.4px',
        className: 'md3-body-small'
      }
    },
    label: {
      large: { 
        size: '14px', 
        lineHeight: '20px', 
        weight: 500, 
        tracking: '0.1px',
        className: 'md3-label-large'
      },
      medium: { 
        size: '12px', 
        lineHeight: '16px', 
        weight: 500, 
        tracking: '0.5px',
        className: 'md3-label-medium'
      },
      small: { 
        size: '11px', 
        lineHeight: '16px', 
        weight: 500, 
        tracking: '0.5px',
        className: 'md3-label-small'
      }
    }
  },
  
  // SPACING - 4dp Grid System (STRICTLY ENFORCED)
  spacing: {
    // Page-level spacing
    page: {
      mobile: { padding: '16px', maxWidth: '100%' },
      tablet: { padding: '24px', maxWidth: '840px' },
      desktop: { padding: '32px', maxWidth: '1280px' }
    },
    
    // Section spacing (between major page sections)
    section: {
      gap: '48px',        // 12 × 4dp
      padding: '32px',    // 8 × 4dp
      marginBottom: '32px' // 8 × 4dp
    },
    
    // Component spacing (between components)
    component: {
      gap: '16px',        // 4 × 4dp
      padding: '16px',    // 4 × 4dp  
      marginBottom: '16px' // 4 × 4dp
    },
    
    // Element spacing (between UI elements)
    element: {
      gap: '8px',         // 2 × 4dp
      padding: '8px',     // 2 × 4dp
      marginBottom: '8px' // 2 × 4dp
    },
    
    // Standard spacing scale (ONLY use these values)
    scale: {
      xs: '4px',   // 1 × 4dp
      sm: '8px',   // 2 × 4dp
      md: '16px',  // 4 × 4dp
      lg: '24px',  // 6 × 4dp
      xl: '32px',  // 8 × 4dp
      '2xl': '48px', // 12 × 4dp
      '3xl': '64px', // 16 × 4dp
      '4xl': '80px'  // 20 × 4dp
    }
  },
  
  // ELEVATION - Material Design 3 Levels
  elevation: {
    level0: { 
      boxShadow: 'none', 
      zIndex: 0,
      className: 'elevation-0'
    },
    level1: { 
      boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', 
      zIndex: 10,
      light: '#ffffff',
      dark: '#1f2937',
      className: 'elevation-1'
    },
    level2: { 
      boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.1)', 
      zIndex: 20,
      light: '#f9fafb',
      dark: '#374151',
      className: 'elevation-2'
    },
    level3: { 
      boxShadow: '0 4px 6px -2px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1)', 
      zIndex: 30,
      light: '#f3f4f6',
      dark: '#4b5563',
      className: 'elevation-3'
    },
    level4: { 
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 20px 25px -5px rgba(0,0,0,0.04)', 
      zIndex: 40,
      light: '#e5e7eb',
      dark: '#6b7280',
      className: 'elevation-4'
    },
    level5: { 
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 25px 50px -12px rgba(0,0,0,0.25)', 
      zIndex: 50,
      light: '#e5e7eb',
      dark: '#9ca3af',
      className: 'elevation-5'
    }
  },
  
  // COMPONENT STANDARDS (EXACT specifications)
  components: {
    button: {
      height: { 
        small: '32px',   // 8 × 4dp
        medium: '40px',  // 10 × 4dp  
        large: '48px'    // 12 × 4dp
      },
      padding: { 
        small: '0 12px',   // 3 × 4dp horizontal
        medium: '0 16px',  // 4 × 4dp horizontal
        large: '0 24px'    // 6 × 4dp horizontal
      },
      borderRadius: '20px', // MD3 pill shape
      fontSize: { 
        small: '13px', 
        medium: '14px', 
        large: '15px' 
      },
      fontWeight: 500,
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    card: {
      borderRadius: '12px', // MD3 medium corner
      padding: { 
        small: '16px',  // 4 × 4dp
        medium: '20px', // 5 × 4dp
        large: '24px'   // 6 × 4dp
      },
      gap: '16px' // 4 × 4dp
    },
    
    input: {
      height: '56px',     // MD3 text field height
      padding: '16px',    // 4 × 4dp
      borderRadius: '4px 4px 0 0', // MD3 filled text field
      fontSize: '16px',
      borderWidth: '1px 1px 2px 1px'
    },
    
    modal: {
      borderRadius: '28px', // MD3 large radius
      padding: '24px',      // 6 × 4dp
      maxWidth: '560px',
      minWidth: '280px'
    }
  },
  
  // BREAKPOINTS - Material Design 3 Device Classes
  breakpoints: {
    compact: '0px',      // Mobile (0-599dp)
    medium: '600px',     // Tablet (600-839dp)
    expanded: '840px',   // Desktop (840-1199dp)  
    large: '1240px',     // Large desktop (1200-1599dp)
    extraLarge: '1600px' // Extra large (1600dp+)
  },
  
  // ANIMATION - Material Design 3 Motion Tokens
  motion: {
    duration: {
      short1: '50ms',
      short2: '100ms',
      short3: '150ms',
      short4: '200ms',
      medium1: '250ms',
      medium2: '300ms',
      medium3: '350ms',
      medium4: '400ms',
      long1: '450ms',
      long2: '500ms',
      long3: '550ms',
      long4: '600ms'
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Most common
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',      // Entering elements
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',      // Exiting elements
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'          // Temporary elements
    }
  },
  
  // COLOR SYSTEM - Navy/Electric Blue Brand Colors
  colors: {
    // Brand core colors
    brand: {
      navy: '#1a2332',        // Dual-purpose: Light text / Dark background
      electricBlue: '#3b82f6', // Primary brand color
      lightBlue: '#60a5fa',    // Accessible variant for dark mode
      smoke: '#e5e7eb',        // Light gray for surfaces
      darkGray: '#374151',     // Mid-tone for dark theme surfaces
      white: '#ffffff'         // Pure white
    },
    
    // Semantic colors (consistent across themes)
    semantic: {
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6'
    }
  }
};

// TYPE DEFINITIONS for TypeScript enforcement
export type TypographyScale = keyof typeof DesignSystem.typography;
export type TypographyLevel = keyof typeof DesignSystem.typography.display;
export type SpacingScale = keyof typeof DesignSystem.spacing.scale;
export type ElevationLevel = keyof typeof DesignSystem.elevation;
export type ComponentSize = 'small' | 'medium' | 'large';
export type MotionDuration = keyof typeof DesignSystem.motion.duration;
export type MotionEasing = keyof typeof DesignSystem.motion.easing;

// HELPER FUNCTIONS for component usage
export const getTypographyStyles = (scale: TypographyScale, level: TypographyLevel) => {
  const typography = DesignSystem.typography[scale][level];
  return {
    fontSize: typography.size,
    lineHeight: typography.lineHeight,
    fontWeight: typography.weight,
    letterSpacing: typography.tracking
  };
};

export const getSpacing = (size: SpacingScale) => {
  return DesignSystem.spacing.scale[size];
};

export const getElevation = (level: ElevationLevel) => {
  return DesignSystem.elevation[level];
};

export default DesignSystem;