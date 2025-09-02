'use client';

import React, { forwardRef, ReactNode, memo } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'assist' | 'filter' | 'input' | 'suggestion';
  size?: 'small' | 'medium';
  selected?: boolean;
  elevated?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  onDelete?: () => void;
  deletable?: boolean;
  children: ReactNode;
}

const Chip = memo(forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      className,
      variant = 'assist',
      size = 'medium',
      selected = false,
      elevated = false,
      leadingIcon,
      trailingIcon,
      onDelete,
      deletable = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center gap-2',
      'rounded-full',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-[var(--md-sys-color-primary)]',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden'
    ];

    const sizeClasses = {
      small: ['h-8 px-3 text-sm'],
      medium: ['h-8 px-4 text-sm']
    };

    const variantClasses = {
      assist: [
        elevated ? 'shadow-sm' : '',
        selected 
          ? [
              'bg-[var(--md-sys-color-secondary-container)]',
              'text-[var(--md-sys-color-on-secondary-container)]'
            ]
          : [
              'bg-[var(--md-sys-color-surface-container-low)]',
              'text-[var(--md-sys-color-on-surface)]',
              'border border-[var(--md-sys-color-outline)]'
            ]
      ].flat(),
      filter: [
        selected
          ? [
              'bg-[var(--md-sys-color-secondary-container)]',
              'text-[var(--md-sys-color-on-secondary-container)]'
            ]
          : [
              'bg-transparent',
              'text-[var(--md-sys-color-on-surface-variant)]',
              'border border-[var(--md-sys-color-outline)]',
              'hover:bg-[var(--md-sys-color-on-surface-variant)]/8'
            ]
      ].flat(),
      input: [
        'bg-[var(--md-sys-color-surface-container-highest)]',
        'text-[var(--md-sys-color-on-surface)]',
        'hover:bg-[var(--md-sys-color-surface-container-high)]'
      ],
      suggestion: [
        'bg-transparent',
        'text-[var(--md-sys-color-on-surface-variant)]',
        'border border-[var(--md-sys-color-outline)]',
        'hover:bg-[var(--md-sys-color-on-surface-variant)]/8'
      ]
    };

    return (
      <button
        ref={ref}
        className={cn(
          ...baseClasses,
          ...sizeClasses[size],
          ...variantClasses[variant],
          className
        )}
        disabled={disabled}
        aria-pressed={variant === 'filter' ? selected : undefined}
        role={variant === 'filter' ? 'switch' : 'button'}
        {...props}
      >
        {leadingIcon && (
          <span className="flex-shrink-0 w-4 h-4">
            {leadingIcon}
          </span>
        )}
        
        <span className="md3-label-large font-medium truncate">
          {children}
        </span>
        
        {trailingIcon && !deletable && (
          <span className="flex-shrink-0 w-4 h-4">
            {trailingIcon}
          </span>
        )}
        
        {deletable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="flex-shrink-0 w-4 h-4 rounded-full hover:bg-[var(--md-sys-color-on-surface)]/12 transition-colors"
            aria-label="Remove"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        
        {/* Material 3 State layer */}
        <span 
          className="absolute inset-0 rounded-full transition-opacity duration-200 opacity-0 hover:opacity-8 focus-visible:opacity-12 active:opacity-16 bg-[var(--md-sys-color-on-surface)]" 
          aria-hidden="true"
        />
      </button>
    );
  }
));

Chip.displayName = 'Chip';

export { Chip };