// Accessibility Components and Utilities
export { ScreenReaderOnly } from './ScreenReaderOnly';
export { FocusTrap } from './FocusTrap';
export { LiveRegion, GlobalLiveAnnouncer, useLiveAnnouncer } from './LiveRegion';

export {
  announceToScreenReader,
  trapFocus,
  createSkipLink,
  isHighContrastMode,
  prefersReducedMotion,
  validateColorContrast,
  KEYBOARD_KEYS,
  handleKeyboardNavigation,
  generateId,
  getAriaDescribedBy,
  createLiveRegion,
  validateTouchTarget,
  validateFormAccessibility
} from './a11y-utils';

export type { ValidationResult } from './a11y-utils';