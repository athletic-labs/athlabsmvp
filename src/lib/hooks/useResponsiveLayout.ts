import { useState, useEffect } from 'react';
import { useDebounce } from '@/lib/design-system/performance/performance-utils';

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface LayoutState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
}

const defaultBreakpoints: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
  wide: 1920
};

export function useResponsiveLayout(customBreakpoints?: Partial<BreakpointConfig>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [layoutState, setLayoutState] = useState<LayoutState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isWide: false,
        width: 1440,
        height: 800,
        orientation: 'landscape',
        touchEnabled: false
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < breakpoints.mobile,
      isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
      isDesktop: width >= breakpoints.tablet && width < breakpoints.desktop,
      isWide: width >= breakpoints.desktop,
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
      touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
  });

  // Debounce resize events for performance
  const debouncedWidth = useDebounce(layoutState.width, 150);
  const debouncedHeight = useDebounce(layoutState.height, 150);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setLayoutState({
        isMobile: width < breakpoints.mobile,
        isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
        isDesktop: width >= breakpoints.tablet && width < breakpoints.desktop,
        isWide: width >= breakpoints.desktop,
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
        touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      });
    };

    // Use ResizeObserver for better performance than window resize
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, [breakpoints]);

  // Helper functions for responsive design
  const getGridColumns = (mobile: number, tablet: number, desktop: number, wide?: number) => {
    if (layoutState.isMobile) return mobile;
    if (layoutState.isTablet) return tablet;
    if (layoutState.isDesktop) return desktop;
    return wide || desktop;
  };

  const getSpacing = (mobile: string, tablet: string, desktop: string) => {
    if (layoutState.isMobile) return mobile;
    if (layoutState.isTablet) return tablet;
    return desktop;
  };

  const shouldStackVertically = () => layoutState.isMobile || layoutState.isTablet;
  
  const getContainerPadding = () => {
    if (layoutState.isMobile) return 'p-4';
    if (layoutState.isTablet) return 'p-6';
    return 'p-8';
  };

  const getCardSpacing = () => {
    if (layoutState.isMobile) return 'gap-4';
    if (layoutState.isTablet) return 'gap-6';
    return 'gap-8';
  };

  // Touch-optimized sizing for interactive elements
  const getMinTouchTarget = () => layoutState.touchEnabled ? 'min-h-[44px] min-w-[44px]' : '';

  return {
    ...layoutState,
    debouncedWidth,
    debouncedHeight,
    helpers: {
      getGridColumns,
      getSpacing,
      shouldStackVertically,
      getContainerPadding,
      getCardSpacing,
      getMinTouchTarget
    }
  };
}