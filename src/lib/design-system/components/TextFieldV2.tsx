'use client';

import React, { forwardRef, ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';

export interface TextFieldV2Props extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'filled' | 'outlined';
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  supportingText?: string;
  characterCount?: boolean;
  maxLength?: number;
  fullWidth?: boolean;
}

const TextFieldV2 = memo(forwardRef<HTMLInputElement, TextFieldV2Props>(
  (
    {
      className,
      variant = 'filled',
      label,
      helperText,
      error = false,
      errorMessage,
      leadingIcon,
      trailingIcon,
      supportingText,
      characterCount = false,
      maxLength,
      fullWidth = false,
      id,
      value,
      placeholder,
      ...props
    },
    ref
  ) => {
    const inputId = id || `textfield-${Math.random().toString(36).substr(2, 9)}`;
    const hasValue = value !== undefined && value !== '' && value !== null;
    const hasLabelOrPlaceholder = label || placeholder;

    const baseClasses = [
      'relative',
      fullWidth ? 'w-full' : 'min-w-[200px]'
    ];

    const containerClasses = variant === 'filled' 
      ? [
          'relative',
          'bg-[var(--md-sys-color-surface-container-highest)]',
          'rounded-t-[var(--md-sys-shape-corner-extra-small)]',
          'border-b',
          error ? 'border-[var(--md-sys-color-error)] border-b-2' : 'border-[var(--md-sys-color-outline)]',
          'focus-within:border-[var(--md-sys-color-primary)] focus-within:border-b-2',
          'transition-all duration-200'
        ]
      : [
          'relative',
          'bg-[var(--md-sys-color-surface)]',
          'rounded-[var(--md-sys-shape-corner-extra-small)]',
          'border',
          error ? 'border-[var(--md-sys-color-error)] border-2' : 'border-[var(--md-sys-color-outline)]',
          'focus-within:border-[var(--md-sys-color-primary)] focus-within:border-2',
          'transition-all duration-200'
        ];

    const inputClasses = [
      'w-full bg-transparent border-none outline-none',
      'md3-body-large text-[var(--md-sys-color-on-surface)]',
      'placeholder:text-[var(--md-sys-color-on-surface-variant)]',
      variant === 'filled' 
        ? (hasLabelOrPlaceholder ? 'px-4 pt-6 pb-2' : 'px-4 py-4')
        : 'px-4 py-4',
      leadingIcon ? 'pl-12' : '',
      trailingIcon ? 'pr-12' : '',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ];

    const labelClasses = [
      'absolute left-4 pointer-events-none',
      'transition-all duration-200 ease-out origin-top-left',
      error 
        ? 'text-[var(--md-sys-color-error)]' 
        : 'focus-within:text-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-surface-variant)]',
      hasValue || placeholder
        ? [
            variant === 'filled' ? 'top-2' : 'top-2',
            'md3-body-small scale-75'
          ]
        : [
            variant === 'filled' ? 'top-4' : 'top-4',
            'md3-body-large scale-100'
          ],
      leadingIcon && !hasValue && !placeholder ? 'left-12' : 'left-4'
    ];

    const supportingTextClasses = [
      'mt-1 px-4',
      'md3-body-small',
      error ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
    ];

    const currentLength = String(value || '').length;

    return (
      <div className={cn(...baseClasses, className)}>
        <div className={cn(...containerClasses)}>
          {leadingIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]">
              {leadingIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(...inputClasses)}
            placeholder={label ? undefined : placeholder}
            maxLength={maxLength}
            value={value}
            {...props}
          />
          
          {label && (
            <label
              htmlFor={inputId}
              className={cn(...labelClasses)}
            >
              {label}
            </label>
          )}
          
          {trailingIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]">
              {trailingIcon}
            </div>
          )}
        </div>
        
        {(supportingText || errorMessage || characterCount) && (
          <div className="flex justify-between items-start">
            <div className={cn(...supportingTextClasses)}>
              {error && errorMessage ? errorMessage : supportingText || helperText}
            </div>
            {characterCount && maxLength && (
              <div className={cn(
                'mt-1 px-4 md3-body-small', 
                error && currentLength > maxLength 
                  ? 'text-[var(--md-sys-color-error)]' 
                  : 'text-[var(--md-sys-color-on-surface-variant)]'
              )}>
                {currentLength}/{maxLength}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
));

TextFieldV2.displayName = 'TextFieldV2';

export { TextFieldV2 };