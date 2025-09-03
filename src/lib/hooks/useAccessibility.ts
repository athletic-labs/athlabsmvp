import { useEffect, useRef, useCallback, useState } from 'react';
import React from 'react';

export interface AccessibilityOptions {
  announcePageChanges?: boolean;
  manageFocus?: boolean;
  trapFocus?: boolean;
  enableKeyboardShortcuts?: boolean;
}

// Keyboard navigation hook for dashboard
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Dashboard-specific keyboard shortcuts
      if (event.altKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            window.location.href = '/dashboard';
            break;
          case '2':
            event.preventDefault();
            window.location.href = '/new-order';
            break;
          case '3':
            event.preventDefault();
            window.location.href = '/calendar';
            break;
          case '4':
            event.preventDefault();
            window.location.href = '/order-history';
            break;
          case 'c':
            event.preventDefault();
            // Focus on cart if it exists
            const cartButton = document.querySelector('[aria-label*="cart" i]') as HTMLElement;
            cartButton?.click();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

// Live region announcements for dynamic content
export function useLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) return;
    
    // Clear previous announcement
    liveRegionRef.current.textContent = '';
    
    // Set new announcement
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.setAttribute('aria-live', priority);
        liveRegionRef.current.textContent = message;
      }
    }, 100);
  }, []);

  const LiveRegion = useCallback(() => {
    return React.createElement('div', {
      ref: liveRegionRef,
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only'
    });
  }, []);

  return { announce, LiveRegion };
}

// Focus management for modal and drawer interactions
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return { saveFocus, restoreFocus, trapFocus };
}

// Screen reader optimization for complex data
export function useScreenReaderOptimization() {
  const announceDataUpdate = useCallback((
    dataType: string, 
    newValue: string | number, 
    context?: string
  ) => {
    const message = context 
      ? `${dataType} updated to ${newValue} in ${context}`
      : `${dataType} updated to ${newValue}`;
    
    // Create temporary live region for announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const createDataTable = useCallback((
    data: Array<Record<string, any>>,
    caption: string
  ) => {
    if (data.length === 0) return null;
    
    const headers = Object.keys(data[0]);
    
    return {
      caption,
      headers,
      rows: data.map(row => headers.map(header => row[header]))
    };
  }, []);

  return { announceDataUpdate, createDataTable };
}

// High contrast mode detection
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      if (typeof window === 'undefined') return;
      
      // Check for Windows high contrast mode
      const isWindows = navigator.platform.toLowerCase().includes('win');
      if (isWindows) {
        const testDiv = document.createElement('div');
        testDiv.style.borderColor = 'rgb(31, 31, 31)';
        testDiv.style.borderStyle = 'solid';
        testDiv.style.borderWidth = '1px';
        testDiv.style.position = 'absolute';
        testDiv.style.left = '-9999px';
        document.body.appendChild(testDiv);
        
        const computedBorderColor = window.getComputedStyle(testDiv).borderColor;
        setIsHighContrast(computedBorderColor !== 'rgb(31, 31, 31)');
        
        document.body.removeChild(testDiv);
      }
      
      // Check for CSS media query
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      setIsHighContrast(prev => prev || highContrastQuery.matches);
    };

    checkHighContrast();
    
    // Listen for changes
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    highContrastQuery.addEventListener('change', checkHighContrast);
    
    return () => {
      highContrastQuery.removeEventListener('change', checkHighContrast);
    };
  }, []);

  return isHighContrast;
}