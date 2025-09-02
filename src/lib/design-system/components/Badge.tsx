'use client';

import React, { forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'standard' | 'small';
  color?: 'error' | 'primary' | 'secondary' | 'success' | 'warning';
  invisible?: boolean;
  max?: number;
  showZero?: boolean;
  children?: React.ReactNode;
  badgeContent?: string | number;
}

const Badge = memo(forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'standard', 
      color = 'error',
      invisible = false,
      max = 99,
      showZero = false,
      children,
      badgeContent,
      ...props
    },
    ref
  ) => {
    const shouldShow = !invisible && 
      (badgeContent !== undefined && badgeContent !== null) &&
      (badgeContent !== 0 || showZero);

    const displayContent = typeof badgeContent === 'number' && badgeContent > max 
      ? `${max}+` 
      : badgeContent;

    const baseClasses = [
      'relative inline-flex'
    ];

    const badgeClasses = [
      'absolute rounded-full flex items-center justify-center',
      'text-xs font-medium leading-none',
      'transition-all duration-200 ease-out',
      'min-w-[20px] px-1.5 py-0.5',
      variant === 'small' ? 'min-w-[16px] w-4 h-4 p-0' : 'min-h-[20px]',
      shouldShow ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
    ];

    const colorClasses = {
      error: [
        'bg-[var(--md-sys-color-error)]',
        'text-[var(--md-sys-color-on-error)]'
      ],
      primary: [
        'bg-[var(--md-sys-color-primary)]',
        'text-[var(--md-sys-color-on-primary)]'
      ],
      secondary: [
        'bg-[var(--md-sys-color-secondary)]',
        'text-[var(--md-sys-color-on-secondary)]'
      ],
      success: [
        'bg-[var(--md-saas-color-success)]',
        'text-[var(--md-saas-color-on-success)]'
      ],
      warning: [
        'bg-[var(--md-saas-color-warning)]',
        'text-[var(--md-saas-color-on-warning)]'
      ]
    };

    const positionClasses = variant === 'small' 
      ? ['-top-1 -right-1']
      : ['-top-2 -right-2'];

    return (
      <span
        ref={ref}
        className={cn(...baseClasses, className)}
        {...props}
      >
        {children}
        <span
          className={cn(
            ...badgeClasses,
            ...colorClasses[color],
            ...positionClasses
          )}
          role="status"
          aria-live="polite"
          aria-label={typeof displayContent === 'number' 
            ? `${displayContent} notification${displayContent !== 1 ? 's' : ''}` 
            : `${displayContent} notification`
          }
        >
          {displayContent}
        </span>
      </span>
    );
  }
));

Badge.displayName = 'Badge';

export { Badge };