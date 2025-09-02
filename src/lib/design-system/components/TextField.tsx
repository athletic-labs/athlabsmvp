'use client';

import React, { forwardRef, useState, ReactNode, memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
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

const TextField = memo(forwardRef<HTMLInputElement, TextFieldProps>(
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
      defaultValue,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = String(currentValue).length > 0;

    const inputId = id || `textfield-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      props.onChange?.(e);
    };

    const baseClasses = useMemo(() => [
      'relative',
      fullWidth ? 'w-full' : 'min-w-[200px]'
    ], [fullWidth]);

    const containerClasses = useMemo(() => variant === 'filled' 
      ? [
          'relative',
          'bg-[var(--md-sys-color-surface-container-highest)]',
          'rounded-t-[var(--md-sys-shape-corner-extra-small)]',
          'border-b',
          error ? 'border-[var(--md-sys-color-error)]' : 'border-[var(--md-sys-color-outline)]',
          focused && !error ? 'border-[var(--md-sys-color-primary)] border-b-2' : '',
          'transition-all duration-200'
        ]
      : [
          'relative',
          'bg-[var(--md-sys-color-surface)]',
          'rounded-[var(--md-sys-shape-corner-extra-small)]',
          'border',
          error ? 'border-[var(--md-sys-color-error)]' : 'border-[var(--md-sys-color-outline)]',
          focused && !error ? 'border-[var(--md-sys-color-primary)] border-2' : '',
          'transition-all duration-200'
        ], [variant, error, focused]);

    const inputClasses = useMemo(() => [
      'w-full',
      'bg-transparent',
      'border-none',
      'outline-none',
      'md3-body-large',
      'text-[var(--md-sys-color-on-surface)]',
      'placeholder:text-[var(--md-sys-color-on-surface-variant)]',
      'placeholder:opacity-0',
      variant === 'filled' ? 'px-4 pt-6 pb-2' : 'px-4 py-4',
      leadingIcon ? 'pl-12' : '',
      trailingIcon ? 'pr-12' : ''
    ], [variant, leadingIcon, trailingIcon]);

    const labelClasses = useMemo(() => [
      'absolute left-4 pointer-events-none',
      'md3-body-large',
      error ? 'text-[var(--md-sys-color-error)]' : focused ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]',
      'transition-all duration-200 ease-out',
      'origin-top-left',
      (focused || hasValue) ? [
        variant === 'filled' ? 'top-2' : 'top-2',
        'text-xs',
        'scale-75'
      ] : [
        variant === 'filled' ? 'top-4' : 'top-4',
        'text-base',
        'scale-100'
      ],
      leadingIcon && !focused && !hasValue ? 'left-12' : 'left-4'
    ], [error, focused, hasValue, variant, leadingIcon]);

    const supportingTextClasses = useMemo(() => [
      'mt-1 px-4',
      'md3-body-small',
      error ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface-variant)]'
    ], [error]);

    const currentLength = String(currentValue).length;

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
            value={currentValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            maxLength={maxLength}
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
              {error && errorMessage ? errorMessage : supportingText}
            </div>
            {characterCount && maxLength && (
              <div className={cn('mt-1 px-4 md3-body-small', error && currentLength > maxLength ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface-variant)]')}>
                {currentLength}/{maxLength}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
));

TextField.displayName = 'TextField';

export { TextField };