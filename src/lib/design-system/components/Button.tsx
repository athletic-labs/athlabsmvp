'use client';

import React, { forwardRef, ReactNode, memo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  loadingText?: string;
}

const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'filled',
      size = 'medium',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      disabled,
      loadingText = 'Loading...',
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    const baseClasses = [
      'inline-flex items-center justify-center gap-2',
      'font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden'
    ];

    const variantClasses = {
      filled: [
        'md3-button-filled',
        'focus-visible:ring-[var(--md-sys-color-primary)]'
      ],
      outlined: [
        'md3-button-outlined',
        'focus-visible:ring-[var(--md-sys-color-primary)]'
      ],
      text: [
        'md3-button-text',
        'focus-visible:ring-[var(--md-sys-color-primary)]'
      ],
      elevated: [
        'md3-button-filled md-elevation-1',
        'bg-[var(--md-sys-color-surface-container-low)]',
        'text-[var(--md-sys-color-primary)]',
        'hover:md-elevation-2',
        'focus-visible:ring-[var(--md-sys-color-primary)]'
      ],
      tonal: [
        'md3-button-filled',
        'bg-[var(--md-sys-color-secondary-container)]',
        'text-[var(--md-sys-color-on-secondary-container)]',
        'hover:bg-[var(--md-sys-color-secondary-container)]',
        'focus-visible:ring-[var(--md-sys-color-secondary)]'
      ]
    };

    const sizeClasses = {
      small: ['h-8 px-3 md3-label-large whitespace-nowrap'],
      medium: ['h-10 px-6 whitespace-nowrap'],
      large: ['h-12 px-8 md3-title-medium whitespace-nowrap']
    };

    const widthClasses = fullWidth ? ['w-full'] : [];

    if (asChild) {
      return (
        <Comp
          className={cn(
            ...baseClasses,
            ...variantClasses[variant],
            ...sizeClasses[size],
            ...widthClasses,
            className
          )}
          ref={ref}
          disabled={disabled || loading}
          aria-disabled={disabled || loading}
          aria-busy={loading}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(
          ...baseClasses,
          ...variantClasses[variant],
          ...sizeClasses[size],
          ...widthClasses,
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <>
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">{loadingText}</span>
          </>
        )}
        {!loading && leftIcon && (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
        {!loading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
));

Button.displayName = 'Button';

export { Button };