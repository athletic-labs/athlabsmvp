'use client';

import { useEffect } from 'react';
import { 
  loadNonCriticalCSS, 
  measureCSSLoadingPerformance, 
  optimizeFontLoading,
  injectCriticalCSS 
} from '@/lib/utils/css-loader';

// Critical CSS content - inlined for immediate loading
const CRITICAL_CSS = `
/* Critical CSS - Inlined for optimal performance */
*,*::before,*::after{box-sizing:border-box}html{line-height:1.15;-webkit-text-size-adjust:100%;tab-size:4}body{margin:0;font-family:var(--font-inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;background-color:var(--md-sys-color-surface,#fefbff);color:var(--md-sys-color-on-surface,#1d1b20)}:root{--md-sys-color-primary:#6750a4;--md-sys-color-on-primary:#ffffff;--md-sys-color-surface:#fefbff;--md-sys-color-on-surface:#1d1b20;--md-sys-color-surface-container:#f3edf7;--md-sys-color-outline:#79747e;--md-sys-color-outline-variant:#cac4d0;--md-sys-typescale-body-large-font:var(--font-inter);--md-sys-typescale-body-large-size:16px;--md-sys-typescale-body-large-weight:400;--md-sys-typescale-body-large-line-height:24px;--md-sys-typescale-body-large-tracking:0.5px;--md-sys-typescale-headline-medium-size:28px;--md-sys-typescale-headline-medium-line-height:36px;--md-sys-typescale-headline-medium-weight:400;--md-sys-shape-corner-small:8px;--md-sys-shape-corner-medium:12px}@media (prefers-color-scheme:dark){:root{--md-sys-color-primary:#d0bcff;--md-sys-color-on-primary:#381e72;--md-sys-color-surface:#141218;--md-sys-color-on-surface:#e6e0e9;--md-sys-color-surface-container:#211f26;--md-sys-color-outline:#938f99;--md-sys-color-outline-variant:#49454f}}.critical-header{position:sticky;top:0;z-index:50;background-color:var(--md-sys-color-surface);border-bottom:1px solid var(--md-sys-color-outline-variant)}.critical-nav{display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px}.critical-button{display:inline-flex;align-items:center;justify-content:center;padding:10px 24px;border-radius:var(--md-sys-shape-corner-medium);font-size:var(--md-sys-typescale-body-large-size);font-weight:500;line-height:var(--md-sys-typescale-body-large-line-height);text-decoration:none;border:none;cursor:pointer;transition:all 0.2s ease}.critical-button--primary{background-color:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)}.critical-button--primary:hover{box-shadow:0 1px 3px 1px rgba(103,80,164,0.15)}.critical-headline{font-size:var(--md-sys-typescale-headline-medium-size);line-height:var(--md-sys-typescale-headline-medium-line-height);font-weight:var(--md-sys-typescale-headline-medium-weight);color:var(--md-sys-color-on-surface);margin:0 0 16px 0}.critical-body{font-size:var(--md-sys-typescale-body-large-size);line-height:var(--md-sys-typescale-body-large-line-height);font-weight:var(--md-sys-typescale-body-large-weight);letter-spacing:var(--md-sys-typescale-body-large-tracking);color:var(--md-sys-color-on-surface)}.critical-skeleton{background:linear-gradient(90deg,var(--md-sys-color-surface-container) 25%,var(--md-sys-color-outline-variant) 50%,var(--md-sys-color-surface-container) 75%);background-size:200% 100%;animation:loading 1.5s infinite}@keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}*:focus-visible{outline:2px solid var(--md-sys-color-primary);outline-offset:2px;border-radius:var(--md-sys-shape-corner-small)}@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important}}.critical-container{max-width:1200px;margin:0 auto;padding:0 24px}@media (max-width:768px){.critical-container{padding:0 16px}.critical-nav{padding:0 16px}}
`;

interface CSSOptimizerProps {
  /**
   * Whether to enable performance monitoring
   */
  enableMonitoring?: boolean;
  
  /**
   * Custom critical CSS to inject
   */
  customCriticalCSS?: string;
  
  /**
   * Features to preload CSS for
   */
  preloadFeatures?: string[];
}

/**
 * CSS Optimizer Component
 * Manages critical CSS injection and non-critical CSS loading
 */
export function CSSOptimizer({ 
  enableMonitoring = true,
  customCriticalCSS,
  preloadFeatures = []
}: CSSOptimizerProps) {
  
  useEffect(() => {
    let mounted = true;
    
    const initializeCSS = async () => {
      try {
        // 1. Inject critical CSS immediately
        const criticalCSS = customCriticalCSS || CRITICAL_CSS;
        injectCriticalCSS(criticalCSS, 'critical-styles');
        
        // 2. Optimize font loading
        optimizeFontLoading();
        
        // 3. Start performance monitoring
        if (enableMonitoring) {
          measureCSSLoadingPerformance();
        }
        
        // 4. Load non-critical CSS after a short delay
        // This prevents blocking critical rendering
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (mounted) {
          loadNonCriticalCSS();
        }
        
        // 5. Preload feature-specific CSS
        if (preloadFeatures.length > 0) {
          const { DynamicCSSLoader } = await import('@/lib/utils/css-loader');
          preloadFeatures.forEach(feature => {
            DynamicCSSLoader.preloadFeatureCSS(feature);
          });
        }
        
      } catch (error) {
        console.error('CSS optimization initialization failed:', error);
      }
    };
    
    initializeCSS();
    
    return () => {
      mounted = false;
    };
  }, [enableMonitoring, customCriticalCSS, preloadFeatures]);
  
  // This component doesn't render anything visible
  return null;
}

/**
 * CSS Loading Status Indicator (development only)
 */
export function CSSLoadingIndicator() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    let indicator: HTMLElement | null = null;
    
    const showIndicator = () => {
      indicator = document.createElement('div');
      indicator.id = 'css-loading-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff9800;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        z-index: 9999;
        opacity: 0.8;
        transition: opacity 0.3s ease;
      `;
      indicator.textContent = 'Loading CSS...';
      document.body.appendChild(indicator);
    };
    
    const hideIndicator = () => {
      if (indicator && indicator.parentNode) {
        indicator.style.opacity = '0';
        setTimeout(() => {
          indicator?.remove();
          indicator = null;
        }, 300);
      }
    };
    
    // Show indicator when CSS is loading
    showIndicator();
    
    // Hide when non-critical CSS is loaded
    const checkCSSLoaded = () => {
      if (performance.getEntriesByName('non-critical-css-loaded').length > 0) {
        hideIndicator();
      } else {
        requestAnimationFrame(checkCSSLoaded);
      }
    };
    
    requestAnimationFrame(checkCSSLoaded);
    
    // Cleanup
    return () => {
      hideIndicator();
    };
  }, []);
  
  return null;
}

/**
 * Critical CSS Hook for manual control
 */
export function useCriticalCSS(css: string, id?: string) {
  useEffect(() => {
    const styleElement = injectCriticalCSS(css, id);
    
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.remove();
      }
    };
  }, [css, id]);
}

/**
 * Feature CSS Hook for component-specific styles
 */
export function useFeatureCSS(feature: string) {
  useEffect(() => {
    let mounted = true;
    
    const loadFeatureCSS = async () => {
      try {
        const { DynamicCSSLoader } = await import('@/lib/utils/css-loader');
        if (mounted) {
          await DynamicCSSLoader.loadFeatureCSS(feature);
        }
      } catch (error) {
        console.warn(`Failed to load CSS for feature: ${feature}`, error);
      }
    };
    
    loadFeatureCSS();
    
    return () => {
      mounted = false;
    };
  }, [feature]);
}

export default CSSOptimizer;