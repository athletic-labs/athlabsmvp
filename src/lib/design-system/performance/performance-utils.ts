/**
 * Performance Utilities for Material 3 Components
 * Utilities for optimizing React component performance
 */

import { useCallback, useMemo, useEffect, useState, useRef } from 'react';

/**
 * Creates a stable callback that only updates when dependencies change
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Creates a stable object reference for className arrays
 */
export function useStableClasses(classes: (string | boolean | undefined | null)[]): string[] {
  return useMemo(() => classes.filter(Boolean) as string[], [classes.join(' ')]);
}

/**
 * Performance measurement hook for development
 */
export function usePerformanceMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const markStart = useCallback(() => {
    if (!enabled || typeof performance === 'undefined') return;
    performance.mark(`${componentName}-start`);
  }, [componentName, enabled]);

  const markEnd = useCallback(() => {
    if (!enabled || typeof performance === 'undefined') return;
    performance.mark(`${componentName}-end`);
    performance.measure(`${componentName}-render`, `${componentName}-start`, `${componentName}-end`);
  }, [componentName, enabled]);

  return { markStart, markEnd };
}

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for frequent events
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    }
  }, [callback, delay]) as T;
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling({
  itemCount,
  itemHeight,
  containerHeight,
  scrollTop = 0
}: {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  scrollTop?: number;
}) {
  return useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + 1
    );
    
    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push(i);
    }
    
    return {
      startIndex,
      endIndex,
      visibleItems,
      totalHeight: itemCount * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [itemCount, itemHeight, containerHeight, scrollTop]);
}