'use client';

import React, { forwardRef, ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  icon: ReactNode;
  extended?: boolean;
  label?: string;
  loading?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'static';
}

const FloatingActionButton = memo(forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'medium',
      icon,
      extended = false,
      label,
      loading = false,
      position = 'bottom-right',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center gap-2',
      'font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2 focus-visible:ring-[var(--md-sys-color-primary)]',
      'disabled:pointer-events-none disabled:opacity-38',
      'relative overflow-hidden',
      'shadow-[var(--md-sys-elevation-level3)]',
      'hover:shadow-[var(--md-sys-elevation-level4)]',
      'active:shadow-[var(--md-sys-elevation-level3)]',
      extended ? 'rounded-[var(--md-sys-shape-corner-large)]' : 'rounded-full'
    ];

    const variantClasses = {
      surface: [
        'bg-[var(--md-sys-color-surface-container-high)]',
        'text-[var(--md-sys-color-primary)]',
        'hover:bg-[var(--md-sys-color-surface-container-high)]',
        'hover:shadow-[var(--md-sys-elevation-level4)]'
      ],
      primary: [
        'bg-[var(--md-sys-color-primary-container)]',
        'text-[var(--md-sys-color-on-primary-container)]',
        'hover:bg-[var(--md-sys-color-primary-container)]',
        'hover:shadow-[var(--md-sys-elevation-level4)]'
      ],
      secondary: [
        'bg-[var(--md-sys-color-secondary-container)]',
        'text-[var(--md-sys-color-on-secondary-container)]',
        'hover:bg-[var(--md-sys-color-secondary-container)]',
        'hover:shadow-[var(--md-sys-elevation-level4)]'
      ],
      tertiary: [
        'bg-[var(--md-sys-color-tertiary-container)]',
        'text-[var(--md-sys-color-on-tertiary-container)]',
        'hover:bg-[var(--md-sys-color-tertiary-container)]',
        'hover:shadow-[var(--md-sys-elevation-level4)]'
      ]
    };

    const sizeClasses = {
      small: extended ? ['h-10 px-4'] : ['h-10 w-10'],
      medium: extended ? ['h-14 px-6'] : ['h-14 w-14'],
      large: extended ? ['h-16 px-8'] : ['h-16 w-16']
    };

    const iconSizeClasses = {
      small: 'w-5 h-5',
      medium: 'w-6 h-6',
      large: 'w-7 h-7'
    };

    const positionClasses = position !== 'static' ? {
      'bottom-right': 'fixed bottom-6 right-6 z-50',
      'bottom-left': 'fixed bottom-6 left-6 z-50',
      'top-right': 'fixed top-6 right-6 z-50',
      'top-left': 'fixed top-6 left-6 z-50'
    }[position] : '';

    const widthClasses = extended ? ['min-w-[80px]'] : [];

    return (
      <button
        ref={ref}
        className={cn(
          ...baseClasses,
          ...variantClasses[variant],
          ...sizeClasses[size],
          ...widthClasses,
          positionClasses,
          className
        )}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        aria-label={label || (typeof icon === 'string' ? icon : 'Floating action button')}
        {...props}
      >
        {/* State layer */}
        <div 
          className="absolute inset-0 rounded-inherit transition-opacity duration-200 opacity-0 hover:opacity-8 focus-visible:opacity-12 active:opacity-16 bg-[var(--md-sys-color-on-surface)]"
          aria-hidden="true"
        />
        
        {loading ? (
          <svg
            className={cn('animate-spin', iconSizeClasses[size])}
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
        ) : (
          <span className={cn('shrink-0', iconSizeClasses[size])} aria-hidden="true">
            {icon}
          </span>
        )}
        
        {extended && label && (
          <span className="md3-label-large">{label}</span>
        )}
      </button>
    );
  }
));

FloatingActionButton.displayName = 'FloatingActionButton';

export { FloatingActionButton };