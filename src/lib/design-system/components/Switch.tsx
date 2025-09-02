'use client';

import React, { forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'small' | 'medium' | 'large';
  label?: string;
  description?: string;
  error?: boolean;
  errorMessage?: string;
  icons?: {
    checked?: React.ReactNode;
    unchecked?: React.ReactNode;
  };
}

const Switch = memo(forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      size = 'medium',
      label,
      description,
      error = false,
      errorMessage,
      icons,
      checked,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      small: {
        track: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: 'translate-x-4'
      },
      medium: {
        track: 'w-12 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-6'
      },
      large: {
        track: 'w-14 h-7',
        thumb: 'w-6 h-6',
        translate: 'translate-x-7'
      }
    };

    const trackClasses = [
      'relative inline-flex items-center rounded-full',
      'transition-all duration-200 ease-out',
      'cursor-pointer',
      disabled && 'cursor-not-allowed opacity-50',
      sizeClasses[size].track,
      checked 
        ? error
          ? 'bg-[var(--md-sys-color-error)]'
          : 'bg-[var(--md-sys-color-primary)]'
        : 'bg-[var(--md-sys-color-surface-container-highest)] border-2 border-[var(--md-sys-color-outline)]'
    ].filter(Boolean);

    const thumbClasses = [
      'absolute left-0.5 rounded-full',
      'transition-all duration-200 ease-out',
      'flex items-center justify-center',
      'shadow-md',
      sizeClasses[size].thumb,
      checked 
        ? [
            sizeClasses[size].translate,
            error 
              ? 'bg-[var(--md-sys-color-on-error)]'
              : 'bg-[var(--md-sys-color-on-primary)]'
          ]
        : [
            'translate-x-0',
            'bg-[var(--md-sys-color-outline)]'
          ]
    ].flat();

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center gap-3">
          <label
            htmlFor={inputId}
            className="relative flex items-center cursor-pointer"
          >
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              className="sr-only"
              checked={checked}
              disabled={disabled}
              aria-describedby={description ? `${inputId}-description` : undefined}
              aria-invalid={error}
              {...props}
            />
            
            <div className={cn(...trackClasses)}>
              <div className={cn(...thumbClasses)}>
                {icons && (
                  <span className="text-xs">
                    {checked ? icons.checked : icons.unchecked}
                  </span>
                )}
              </div>
            </div>
          </label>

          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'md3-body-large font-medium cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                error ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface)]'
              )}
            >
              {label}
            </label>
          )}
        </div>

        {description && (
          <p
            id={`${inputId}-description`}
            className={cn(
              'md3-body-small',
              error 
                ? 'text-[var(--md-sys-color-error)]' 
                : 'text-[var(--md-sys-color-on-surface-variant)]'
            )}
          >
            {error && errorMessage ? errorMessage : description}
          </p>
        )}
      </div>
    );
  }
));

Switch.displayName = 'Switch';

export { Switch };