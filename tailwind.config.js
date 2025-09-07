module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/design-system/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 System Colors (CSS Custom Properties)
        'md-primary': 'var(--md-sys-color-primary)',
        'md-on-primary': 'var(--md-sys-color-on-primary)',
        'md-primary-container': 'var(--md-sys-color-primary-container)',
        'md-on-primary-container': 'var(--md-sys-color-on-primary-container)',
        
        'md-secondary': 'var(--md-sys-color-secondary)',
        'md-on-secondary': 'var(--md-sys-color-on-secondary)',
        'md-secondary-container': 'var(--md-sys-color-secondary-container)',
        'md-on-secondary-container': 'var(--md-sys-color-on-secondary-container)',
        
        'md-tertiary': 'var(--md-sys-color-tertiary)',
        'md-on-tertiary': 'var(--md-sys-color-on-tertiary)',
        'md-tertiary-container': 'var(--md-sys-color-tertiary-container)',
        'md-on-tertiary-container': 'var(--md-sys-color-on-tertiary-container)',
        
        'md-error': 'var(--md-sys-color-error)',
        'md-on-error': 'var(--md-sys-color-on-error)',
        'md-error-container': 'var(--md-sys-color-error-container)',
        'md-on-error-container': 'var(--md-sys-color-on-error-container)',
        
        'md-surface': 'var(--md-sys-color-surface)',
        'md-on-surface': 'var(--md-sys-color-on-surface)',
        'md-surface-variant': 'var(--md-sys-color-surface-variant)',
        'md-on-surface-variant': 'var(--md-sys-color-on-surface-variant)',
        'md-surface-dim': 'var(--md-sys-color-surface-dim)',
        'md-surface-bright': 'var(--md-sys-color-surface-bright)',
        
        'md-surface-container-lowest': 'var(--md-sys-color-surface-container-lowest)',
        'md-surface-container-low': 'var(--md-sys-color-surface-container-low)',
        'md-surface-container': 'var(--md-sys-color-surface-container)',
        'md-surface-container-high': 'var(--md-sys-color-surface-container-high)',
        'md-surface-container-highest': 'var(--md-sys-color-surface-container-highest)',
        
        'md-outline': 'var(--md-sys-color-outline)',
        'md-outline-variant': 'var(--md-sys-color-outline-variant)',
        
        'md-inverse-surface': 'var(--md-sys-color-inverse-surface)',
        'md-on-inverse-surface': 'var(--md-sys-color-on-inverse-surface)',
        'md-inverse-primary': 'var(--md-sys-color-inverse-primary)',
        
        'md-shadow': 'var(--md-sys-color-shadow)',
        'md-scrim': 'var(--md-sys-color-scrim)',
        
        // SaaS-specific colors
        'md-success': 'var(--md-saas-color-success)',
        'md-on-success': 'var(--md-saas-color-on-success)',
        'md-success-container': 'var(--md-saas-color-success-container)',
        'md-on-success-container': 'var(--md-saas-color-on-success-container)',
        
        'md-warning': 'var(--md-saas-color-warning)',
        'md-on-warning': 'var(--md-saas-color-on-warning)',
        'md-warning-container': 'var(--md-saas-color-warning-container)',
        'md-on-warning-container': 'var(--md-saas-color-on-warning-container)',
        
        'md-info': 'var(--md-saas-color-info)',
        'md-on-info': 'var(--md-saas-color-on-info)',
        'md-info-container': 'var(--md-saas-color-info-container)',
        'md-on-info-container': 'var(--md-saas-color-on-info-container)',

        // Legacy colors for backward compatibility
        navy: {
          50: '#f8fafc',
          500: '#64748b', 
          800: '#1e293b',
          900: '#0f172a',
          DEFAULT: '#1a2332',
          dark: '#0f1722',
        },
        smoke: {
          DEFAULT: '#e5e7eb',
          dark: '#374151',
        },
        'electric-blue': {
          DEFAULT: '#3b82f6',
          dark: '#60a5fa',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Material 3 Typography Scale
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px' }],
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
      },
      borderRadius: {
        // Material 3 Shape Scale
        'none': '0px',
        'extra-small': '4px',
        'small': '8px',
        'medium': '12px',
        'large': '16px',
        'extra-large': '28px',
        'full': '9999px',
      },
      boxShadow: {
        // Material 3 Elevation System
        'md-elevation-0': '0px 0px 0px 0px rgba(0, 0, 0, 0.0)',
        'md-elevation-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'md-elevation-2': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'md-elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
        'md-elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',
        'md-elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
      },
      transitionTimingFunction: {
        // Material 3 Motion System
        'standard': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        'standard-decelerate': 'cubic-bezier(0.0, 0.0, 0, 1.0)',
        'standard-accelerate': 'cubic-bezier(0.3, 0.0, 1, 1.0)',
        'emphasized': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
        'emphasized-accelerate': 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
      },
      transitionDuration: {
        // Material 3 Motion Duration
        'short-1': '50ms',
        'short-2': '100ms',
        'short-3': '150ms',
        'short-4': '200ms',
        'medium-1': '250ms',
        'medium-2': '300ms',
        'medium-3': '350ms',
        'medium-4': '400ms',
        'long-1': '450ms',
        'long-2': '500ms',
        'long-3': '550ms',
        'long-4': '600ms',
      },
      spacing: {
        // Material 3 Density System
        'density-comfortable': '16px',
        'density-compact': '12px',
        'density-spacious': '24px',
      },
      minHeight: {
        // Material 3 Touch Targets
        'touch-target': '48px',
        'density-comfortable': '48px',
        'density-compact': '40px',
        'density-spacious': '56px',
      }
    },
  },
  plugins: [],
};