'use client';

import React, { forwardRef, ReactNode, memo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'standard' | 'filled' | 'outlined' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
  asChild?: boolean;
  icon: ReactNode;
  'aria-label': string; // Required for accessibility
}

const IconButton = memo(forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'standard',
      size = 'medium',
      selected = false,
      asChild = false,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    const baseClasses = [
      'inline-flex items-center justify-center',
      'rounded-full',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden'
    ];

    const sizeClasses = {
      small: ['w-8 h-8 md3-label-large'],
      medium: ['w-10 h-10 md3-title-medium'],
      large: ['w-12 h-12 md3-title-large']
    };

    const variantClasses = {
      standard: [
        'text-[var(--md-sys-color-on-surface-variant)]',
        'hover:bg-[var(--md-sys-color-on-surface-variant)]/8',
        'active:bg-[var(--md-sys-color-on-surface-variant)]/12',
        selected && [
          'text-[var(--md-sys-color-primary)]',
          'bg-[var(--md-sys-color-primary)]/12'
        ]
      ].flat(),
      filled: [
        selected 
          ? [
              'bg-[var(--md-sys-color-primary)]',
              'text-[var(--md-sys-color-on-primary)]',
              'hover:bg-[var(--md-sys-color-primary)]',
              'shadow-md'
            ]
          : [
              'bg-[var(--md-sys-color-surface-container-highest)]',
              'text-[var(--md-sys-color-primary)]',
              'hover:bg-[var(--md-sys-color-surface-container-highest)]',
              'shadow-sm'
            ]
      ].flat(),
      outlined: [
        'border',
        'border-[var(--md-sys-color-outline)]',
        selected 
          ? [
              'bg-[var(--md-sys-color-inverse-surface)]',
              'text-[var(--md-sys-color-inverse-on-surface)]',
              'border-transparent'
            ]
          : [
              'text-[var(--md-sys-color-on-surface-variant)]',
              'hover:bg-[var(--md-sys-color-on-surface-variant)]/8'
            ]
      ].flat(),
      tonal: [
        selected
          ? [
              'bg-[var(--md-sys-color-secondary-container)]',
              'text-[var(--md-sys-color-on-secondary-container)]'
            ]
          : [
              'bg-[var(--md-sys-color-surface-container-highest)]',
              'text-[var(--md-sys-color-on-surface-variant)]',
              'hover:bg-[var(--md-sys-color-secondary-container)]/12'
            ]
      ].flat()
    };

    return (
      <Comp
        className={cn(
          ...baseClasses,
          ...sizeClasses[size],
          ...variantClasses[variant],
          'focus-visible:ring-[var(--md-sys-color-primary)]',
          className
        )}
        ref={ref}
        disabled={disabled}
        aria-pressed={selected}
        {...props}
      >
        <span className="relative z-10">
          {icon}
        </span>
        
        {/* State layer */}
        <span className="absolute inset-0 rounded-full transition-opacity duration-200 opacity-0 hover:opacity-100 bg-current/8" />
      </Comp>
    );
  }
));

IconButton.displayName = 'IconButton';

export { IconButton };