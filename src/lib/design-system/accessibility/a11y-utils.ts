/**
 * Accessibility Utilities for Material Design 3
 * WCAG 2.1 AA/AAA Compliance Helpers
 */

// Screen reader utilities
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  
  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

// Skip link for keyboard navigation
export function createSkipLink(targetId: string, text = 'Skip to main content') {
  if (typeof window === 'undefined') return null;

  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--md-sys-color-primary)] focus:text-[var(--md-sys-color-on-primary)] focus:rounded-lg focus:no-underline';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  return skipLink;
}

// High contrast mode detection
export function isHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Color contrast validation
export function validateColorContrast(foreground: string, background: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  const ratio = getContrastRatio(foreground, background);
  
  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7
  };
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End'
} as const;

export function handleKeyboardNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onSelect?: (index: number) => void
): number {
  let newIndex = currentIndex;

  switch (event.key) {
    case KEYBOARD_KEYS.ARROW_UP:
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      break;
    case KEYBOARD_KEYS.ARROW_DOWN:
      event.preventDefault();
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      break;
    case KEYBOARD_KEYS.HOME:
      event.preventDefault();
      newIndex = 0;
      break;
    case KEYBOARD_KEYS.END:
      event.preventDefault();
      newIndex = items.length - 1;
      break;
    case KEYBOARD_KEYS.ENTER:
    case KEYBOARD_KEYS.SPACE:
      event.preventDefault();
      onSelect?.(currentIndex);
      return currentIndex;
  }

  if (newIndex !== currentIndex) {
    items[newIndex]?.focus();
  }

  return newIndex;
}

// ARIA helpers
export function generateId(prefix = 'md3'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getAriaDescribedBy(ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

// Live region for dynamic content
export function createLiveRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  
  document.body.appendChild(liveRegion);
  
  return liveRegion;
}

// Touch target size validation (Material 3 minimum 48x48dp)
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const minSize = 48; // 48dp minimum touch target
  
  return rect.width >= minSize && rect.height >= minSize;
}

// Accessible form validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFormAccessibility(form: HTMLFormElement): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for labels
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') || 
                    form.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel) {
      errors.push(`Input ${input.getAttribute('name') || 'unnamed'} missing label`);
    }
  });

  // Check for required field indicators
  const requiredInputs = form.querySelectorAll('[required]');
  requiredInputs.forEach((input) => {
    const hasRequiredIndicator = input.getAttribute('aria-required') === 'true' ||
                                 input.parentElement?.querySelector('[aria-label*="required"]');
    
    if (!hasRequiredIndicator) {
      warnings.push(`Required field ${input.getAttribute('name') || 'unnamed'} should indicate required status`);
    }
  });

  // Check for error messages
  const invalidInputs = form.querySelectorAll('[aria-invalid="true"]');
  invalidInputs.forEach((input) => {
    const hasErrorMessage = input.getAttribute('aria-describedby');
    
    if (!hasErrorMessage) {
      errors.push(`Invalid field ${input.getAttribute('name') || 'unnamed'} missing error message`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}