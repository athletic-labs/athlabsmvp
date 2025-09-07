'use client';

import { useEffect } from 'react';
import { preloadCriticalImages } from '@/lib/utils/image-preloader';
import { useMaterial3Theme } from '@/lib/design-system/theme/ThemeProvider';

/**
 * Component to preload critical images for performance
 */
export function ImagePreloader() {
  const { colorScheme } = useMaterial3Theme();

  useEffect(() => {
    // Preload critical images based on current theme
    preloadCriticalImages(colorScheme).catch((error) => {
      console.warn('Failed to preload some critical images:', error);
    });
  }, [colorScheme]);

  // This component renders nothing
  return null;
}