/**
 * Bundle Optimization Utilities
 * Tools for optimizing Material 3 component bundle size
 */

/**
 * Dynamic imports for code splitting
 */
export const LazyComponents = {
  // Heavy components that can be lazy loaded
  DataTable: () => import('../components/DataTable').then(mod => mod.DataTable),
  NavigationRailExpanded: () => import('../components/NavigationRail').then(mod => mod.NavigationRailExpanded),
  FocusTrap: () => import('../accessibility/FocusTrap').then(mod => mod.FocusTrap)
};

/**
 * Tree-shakable icon imports
 */
export function createTreeShakableIcons(iconNames: string[]) {
  const iconPromises = iconNames.map(name => 
    import('lucide-react').then(mod => ({
      name,
      component: mod[name as keyof typeof mod]
    }))
  );
  
  return Promise.all(iconPromises).then(icons => 
    icons.reduce((acc, { name, component }) => {
      acc[name] = component;
      return acc;
    }, {} as Record<string, any>)
  );
}

/**
 * Code splitting utilities for page components
 */
export function createPageComponent(pagePath: string) {
  return () => import(pagePath);
}

/**
 * Preload critical Material 3 components
 */
export function preloadCriticalComponents() {
  // Preload components that are likely to be used immediately
  if (typeof window !== 'undefined') {
    import('../components/Button');
    import('../components/Card');
    import('../components/TextField');
  }
}

/**
 * Performance monitoring for component load times
 */
export function trackComponentLoad(componentName: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${componentName}-load-start`);
    
    return () => {
      performance.mark(`${componentName}-load-end`);
      performance.measure(
        `${componentName}-load-time`,
        `${componentName}-load-start`,
        `${componentName}-load-end`
      );
    };
  }
  
  return () => {};
}