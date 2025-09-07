'use client';

/**
 * Navigation state management hook
 * Handles mobile drawer state, active navigation tracking, and responsive behavior
 */

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useResponsiveLayout } from './useResponsiveLayout';

export interface NavigationStateConfig {
  /** Auto-close mobile drawer on navigation */
  autoCloseMobile?: boolean;
  /** Persist drawer state in localStorage */
  persistDrawerState?: boolean;
  /** Storage key for drawer state */
  storageKey?: string;
}

export function useNavigationState(config: NavigationStateConfig = {}) {
  const {
    autoCloseMobile = true,
    persistDrawerState = false,
    storageKey = 'navigation-drawer-state'
  } = config;
  
  const pathname = usePathname();
  const { isMobile, width } = useResponsiveLayout();
  
  // Navigation drawer state (for compact width)
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Load persisted drawer state
  useEffect(() => {
    if (persistDrawerState && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setDrawerOpen(JSON.parse(saved));
      }
    }
  }, [persistDrawerState, storageKey]);
  
  // Persist drawer state changes
  useEffect(() => {
    if (persistDrawerState && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(drawerOpen));
    }
  }, [drawerOpen, persistDrawerState, storageKey]);
  
  // Auto-close mobile drawer on route changes
  useEffect(() => {
    if (autoCloseMobile && isMobile && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [pathname, autoCloseMobile, isMobile, drawerOpen]);
  
  // Auto-close drawer when switching from mobile to larger screen
  useEffect(() => {
    if (!isMobile && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [isMobile, drawerOpen]);
  
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(prev => !prev), []);
  
  // Handle navigation item clicks
  const handleNavigationClick = useCallback((key: string) => {
    // Custom logic can be added here for specific navigation items
    // For now, just auto-close mobile drawer
    if (autoCloseMobile && isMobile) {
      closeDrawer();
    }
  }, [autoCloseMobile, isMobile, closeDrawer]);
  
  // Get active navigation key based on current pathname
  const getActiveNavigationKey = useCallback((navigationItems: Array<{ key: string; href: string }>) => {
    // Find exact match first
    const exactMatch = navigationItems.find(item => item.href === pathname);
    if (exactMatch) return exactMatch.key;
    
    // Find best partial match (longest matching path)
    let bestMatch = '';
    let bestMatchLength = 0;
    
    for (const item of navigationItems) {
      if (pathname.startsWith(item.href) && item.href.length > bestMatchLength) {
        bestMatch = item.key;
        bestMatchLength = item.href.length;
      }
    }
    
    return bestMatch || undefined;
  }, [pathname]);
  
  // Responsive navigation pattern detection
  const getNavigationPattern = useCallback(() => {
    if (width < 600) return 'compact';      // Bottom nav + modal drawer
    if (width < 840) return 'medium';       // Navigation rail
    return 'expanded';                      // Expanded navigation rail
  }, [width]);
  
  return {
    // Drawer state
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    
    // Navigation handlers
    handleNavigationClick,
    getActiveNavigationKey,
    
    // Responsive info
    navigationPattern: getNavigationPattern(),
    isMobile,
    width,
    
    // Utilities
    shouldShowBottomNav: width < 600,
    shouldShowNavigationRail: width >= 600 && width < 1200,
    shouldShowExpandedNav: width >= 1200,
    
    // Spacing adjustments for responsive content
    getContentSpacing: useCallback(() => {
      const pattern = getNavigationPattern();
      if (pattern === 'compact') return 'pb-16'; // Account for bottom nav
      if (pattern === 'medium') return 'pl-20';  // Account for nav rail
      return 'pl-80';                            // Account for expanded nav
    }, [getNavigationPattern])
  };
}