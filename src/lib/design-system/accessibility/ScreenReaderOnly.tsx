/**
 * Screen Reader Only Component
 * Content visible only to screen readers
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: any; // Allow any additional props for the element
}

export function ScreenReaderOnly({ 
  children, 
  className,
  as: Component = 'span',
  ...props
}: ScreenReaderOnlyProps) {
  return (
    <Component 
      className={cn(
        'sr-only',
        // Accessible when focused (for skip links)
        'focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'focus:px-4 focus:py-2 focus:bg-[var(--md-sys-color-primary)]',
        'focus:text-[var(--md-sys-color-on-primary)] focus:rounded-lg',
        'focus:no-underline focus:outline-none focus:ring-2',
        'focus:ring-[var(--md-sys-color-primary)] focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}