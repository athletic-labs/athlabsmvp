'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicCSSLoader } from '@/lib/utils/css-loader';

interface CSSPrefetcherProps {
  /**
   * Route to feature mapping for CSS prefetching
   */
  routeFeatureMap?: Record<string, string[]>;
}

/**
 * CSS Prefetcher Component
 * Preloads CSS for likely next routes based on current route
 */
export function CSSPrefetcher({ 
  routeFeatureMap = {
    '/dashboard': ['dashboard'],
    '/saved-templates': ['templates'],
    '/checkout': ['orders'],
    '/orders': ['orders'],
    '/calendar': ['calendar'],
    '/settings': ['settings'],
  }
}: CSSPrefetcherProps) {
  const router = useRouter();

  useEffect(() => {
    // Preload CSS based on current route
    const currentPath = window.location.pathname;
    
    // Find matching route patterns
    const matchingFeatures: string[] = [];
    
    Object.entries(routeFeatureMap).forEach(([route, features]) => {
      if (currentPath.startsWith(route)) {
        matchingFeatures.push(...features);
      }
    });

    // Preload likely next routes based on current route
    const preloadMap: Record<string, string[]> = {
      '/dashboard': ['templates', 'orders'],
      '/saved-templates': ['orders', 'dashboard'],
      '/checkout': ['templates', 'dashboard'],
      '/orders': ['templates', 'dashboard'],
      '/calendar': ['orders', 'templates'],
    };

    const routesToPreload = preloadMap[currentPath] || [];
    
    // Combine current features and likely next features
    const allFeaturesToPreload = [...matchingFeatures, ...routesToPreload];
    
    // Remove duplicates
    const uniqueFeatures = Array.from(new Set(allFeaturesToPreload));
    
    // Preload CSS for these features
    uniqueFeatures.forEach(feature => {
      DynamicCSSLoader.preloadFeatureCSS(feature);
    });

    // Also preload CSS for routes user might navigate to
    const prefetchRoutes = async () => {
      // Use requestIdleCallback to avoid blocking critical tasks
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          routesToPreload.forEach(feature => {
            DynamicCSSLoader.preloadFeatureCSS(feature);
          });
        });
      }
    };

    prefetchRoutes();
  }, [routeFeatureMap]);

  return null;
}

export default CSSPrefetcher;