import { Inter } from 'next/font/google'

// Optimized Google Fonts loading with next/font
export const inter = Inter({
  // Specify exact subsets needed to reduce bundle size
  subsets: ['latin'],
  
  // Preload the most commonly used weights to improve LCP
  weight: ['300', '400', '500', '600', '700'],
  
  // Enable font display swap for better loading performance
  display: 'swap',
  
  // Fallback fonts for better FOUT handling
  fallback: [
    'system-ui', 
    '-apple-system', 
    'BlinkMacSystemFont', 
    'Segoe UI', 
    'Roboto', 
    'Oxygen', 
    'Ubuntu', 
    'Cantarell', 
    'sans-serif'
  ],
  
  // Optimize for performance
  adjustFontFallback: true,
  
  // Variable name for CSS custom property
  variable: '--font-inter',
  
  // Preload critical font files
  preload: true,
})

// Font configuration for design system
export const fontConfig = {
  primary: inter,
  // CSS variable that can be used throughout the app
  cssVariable: '--font-inter',
  // Weights available for the design system
  availableWeights: {
    light: '300',
    regular: '400', 
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

// Helper function to get font class names
export function getFontClassName(includeVariable = true) {
  return includeVariable 
    ? `${inter.className} ${inter.variable}`
    : inter.className
}

// CSS custom property value for direct CSS usage
export const interCssVar = `var(${fontConfig.cssVariable}, ${inter.style.fontFamily})`