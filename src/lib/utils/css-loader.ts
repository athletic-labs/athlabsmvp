'use client';

/**
 * CSS Loading Utilities - Critical CSS Management
 * Optimizes CSS loading by prioritizing critical styles and deferring non-critical ones
 */

export interface CSSLoadOptions {
  href: string;
  media?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Load CSS file asynchronously without blocking initial render
 */
export function loadCSS({ href, media = 'all', onLoad, onError }: CSSLoadOptions): HTMLLinkElement {
  // Check if already loaded
  const existing = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement;
  if (existing) {
    onLoad?.();
    return existing;
  }

  // Create link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print'; // Load as print stylesheet initially (non-blocking)
  
  // Handle load event
  const handleLoad = () => {
    link.media = media; // Switch to actual media query
    onLoad?.();
  };

  // Handle error event
  const handleError = () => {
    const error = new Error(`Failed to load CSS: ${href}`);
    onError?.(error);
    console.error('CSS loading failed:', error);
  };

  link.onload = handleLoad;
  link.onerror = handleError;

  // Insert into head
  document.head.appendChild(link);

  // Fallback for browsers that don't support onload
  setTimeout(() => {
    if (link.media === 'print') {
      link.media = media;
    }
  }, 100);

  return link;
}

/**
 * Preload CSS for faster loading
 */
export function preloadCSS(href: string): HTMLLinkElement {
  // Check if already preloaded
  const existing = document.querySelector(`link[href="${href}"][rel="preload"]`) as HTMLLinkElement;
  if (existing) {
    return existing;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  
  document.head.appendChild(link);
  return link;
}

/**
 * Critical CSS injection - inlines CSS directly in document head
 */
export function injectCriticalCSS(css: string, id?: string): HTMLStyleElement {
  // Check if already injected
  if (id) {
    const existing = document.getElementById(id) as HTMLStyleElement;
    if (existing) {
      return existing;
    }
  }

  const style = document.createElement('style');
  if (id) {
    style.id = id;
  }
  style.textContent = css;
  
  // Insert at beginning of head for higher priority
  if (document.head.firstChild) {
    document.head.insertBefore(style, document.head.firstChild);
  } else {
    document.head.appendChild(style);
  }
  
  return style;
}

/**
 * Load non-critical CSS after page load
 */
export function loadNonCriticalCSS(): void {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
    return;
  }

  // Use requestIdleCallback for better performance
  const loadStyles = () => {
    try {
      // Load non-critical styles
      loadCSS({
        href: '/styles/non-critical.css',
        onLoad: () => {
          console.log('Non-critical CSS loaded successfully');
          // Mark as loaded for analytics
          if (typeof window !== 'undefined' && 'performance' in window) {
            performance.mark('non-critical-css-loaded');
          }
        },
        onError: (error) => {
          console.warn('Non-critical CSS failed to load:', error);
        }
      });

      // Load design system CSS asynchronously
      loadCSS({
        href: '/styles/design-system.css',
        onLoad: () => {
          console.log('Design system CSS loaded');
        },
        onError: (error) => {
          console.warn('Design system CSS failed to load:', error);
        }
      });

    } catch (error) {
      console.error('Error loading non-critical CSS:', error);
    }
  };

  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadStyles, { timeout: 2000 });
  } else {
    setTimeout(loadStyles, 100);
  }
}

/**
 * CSS loading performance metrics
 */
export function measureCSSLoadingPerformance(): void {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return;
  }

  // Measure when critical CSS is ready
  performance.mark('critical-css-ready');
  
  // Measure total CSS loading time
  requestIdleCallback(() => {
    try {
      const criticalMark = performance.getEntriesByName('critical-css-ready')[0];
      const nonCriticalMark = performance.getEntriesByName('non-critical-css-loaded')[0];
      
      if (criticalMark) {
        console.log(`Critical CSS ready in ${criticalMark.startTime}ms`);
      }
      
      if (nonCriticalMark && criticalMark) {
        const totalTime = nonCriticalMark.startTime - criticalMark.startTime;
        console.log(`Non-critical CSS loaded ${totalTime}ms after critical CSS`);
      }
    } catch (error) {
      console.warn('CSS performance measurement failed:', error);
    }
  });
}

/**
 * Dynamic CSS loading based on route/component needs
 */
export class DynamicCSSLoader {
  private static loadedStyles = new Set<string>();
  private static pendingLoads = new Map<string, Promise<void>>();

  /**
   * Load CSS for specific feature/component
   */
  static async loadFeatureCSS(feature: string): Promise<void> {
    const href = `/styles/features/${feature}.css`;
    
    if (this.loadedStyles.has(href)) {
      return Promise.resolve();
    }

    if (this.pendingLoads.has(href)) {
      return this.pendingLoads.get(href)!;
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      loadCSS({
        href,
        onLoad: () => {
          this.loadedStyles.add(href);
          this.pendingLoads.delete(href);
          resolve();
        },
        onError: (error) => {
          this.pendingLoads.delete(href);
          reject(error);
        }
      });
    });

    this.pendingLoads.set(href, loadPromise);
    return loadPromise;
  }

  /**
   * Preload CSS for upcoming route
   */
  static preloadFeatureCSS(feature: string): void {
    const href = `/styles/features/${feature}.css`;
    
    if (!this.loadedStyles.has(href)) {
      preloadCSS(href);
    }
  }

  /**
   * Clear loaded styles cache (for hot reloading)
   */
  static clearCache(): void {
    this.loadedStyles.clear();
    this.pendingLoads.clear();
  }
}

/**
 * Theme-based CSS loading
 */
export function loadThemeCSS(theme: 'light' | 'dark' | 'auto' = 'auto'): void {
  // Remove existing theme stylesheets
  const existingThemes = document.querySelectorAll('link[data-theme]');
  existingThemes.forEach(link => link.remove());

  if (theme === 'auto') {
    // Let CSS media queries handle theme switching
    return;
  }

  // Load specific theme CSS
  const link = loadCSS({
    href: `/styles/themes/${theme}.css`,
    onLoad: () => {
      console.log(`${theme} theme CSS loaded`);
    }
  });
  
  link.setAttribute('data-theme', theme);
}

/**
 * Font loading optimization
 */
export function optimizeFontLoading(): void {
  if (typeof window === 'undefined') return;

  // Preconnect to Google Fonts
  const preconnectLink = document.createElement('link');
  preconnectLink.rel = 'preconnect';
  preconnectLink.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnectLink);

  const preconnectGstaticLink = document.createElement('link');
  preconnectGstaticLink.rel = 'preconnect';
  preconnectGstaticLink.href = 'https://fonts.gstatic.com';
  preconnectGstaticLink.crossOrigin = 'anonymous';
  document.head.appendChild(preconnectGstaticLink);

  // Use font-display: swap for better performance
  const fontDisplayStyle = injectCriticalCSS(`
    @font-face {
      font-family: 'Inter';
      font-display: swap;
    }
  `, 'font-display-optimization');
}