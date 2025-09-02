'use client';

import React, { forwardRef, ReactNode, memo, useState, useRef, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Menu, MenuItem } from './Menu';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  variant?: 'filled' | 'outlined';
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  leadingIcon?: ReactNode;
  multiple?: boolean;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  maxHeight?: number;
}

const Select = memo(forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant = 'filled',
      label,
      helperText,
      error = false,
      errorMessage,
      fullWidth = false,
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = 'Select an option...',
      leadingIcon,
      multiple = false,
      placement = 'bottom-start',
      maxHeight = 300,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string | number | (string | number)[]>(
      multiple ? [] : (defaultValue || '')
    );
    const [focused, setFocused] = useState(false);
    
    const triggerRef = useRef<HTMLButtonElement>(null);
    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const hasValue = multiple 
      ? Array.isArray(currentValue) && currentValue.length > 0
      : currentValue !== '' && currentValue !== undefined;

    const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const selectedOption = useMemo(() => {
      if (multiple) return null;
      return options.find(option => option.value === currentValue);
    }, [options, currentValue, multiple]);

    const selectedOptions = useMemo(() => {
      if (!multiple) return [];
      return options.filter(option => 
        Array.isArray(currentValue) && currentValue.includes(option.value)
      );
    }, [options, currentValue, multiple]);

    const handleSelect = (optionValue: string | number) => {
      if (multiple) {
        const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
        const index = newValue.indexOf(optionValue);
        
        if (index > -1) {
          newValue.splice(index, 1);
        } else {
          newValue.push(optionValue);
        }
        
        if (controlledValue === undefined) {
          setInternalValue(newValue);
        }
        onChange?.(newValue as any);
      } else {
        if (controlledValue === undefined) {
          setInternalValue(optionValue);
        }
        onChange?.(optionValue);
        setOpen(false);
      }
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

    const triggerClasses = useMemo(() => [
      'w-full flex items-center justify-between gap-2',
      'bg-transparent border-none outline-none cursor-pointer',
      'md3-body-large text-[var(--md-sys-color-on-surface)]',
      variant === 'filled' ? 'px-4 pt-6 pb-2' : 'px-4 py-4',
      leadingIcon ? 'pl-12' : '',
      disabled && 'cursor-not-allowed opacity-50'
    ], [variant, leadingIcon, disabled]);

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

    const displayText = useMemo(() => {
      if (multiple && selectedOptions.length > 0) {
        return selectedOptions.length === 1 
          ? selectedOptions[0].label 
          : `${selectedOptions.length} selected`;
      }
      return selectedOption?.label || '';
    }, [multiple, selectedOptions, selectedOption]);

    return (
      <div className={cn(...baseClasses, className)}>
        <div className={cn(...containerClasses)}>
          {leadingIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)]">
              {leadingIcon}
            </div>
          )}
          
          <button
            ref={triggerRef}
            type="button"
            className={cn(...triggerClasses)}
            onClick={() => !disabled && setOpen(!open)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-labelledby={label ? `${inputId}-label` : undefined}
            aria-describedby={helperText || errorMessage ? `${inputId}-helper` : undefined}
            id={inputId}
          >
            <span className={!hasValue ? 'text-[var(--md-sys-color-on-surface-variant)]' : ''}>
              {displayText || placeholder}
            </span>
            <ChevronDown 
              className={cn(
                'w-5 h-5 text-[var(--md-sys-color-on-surface-variant)] transition-transform duration-200',
                open && 'rotate-180'
              )} 
              aria-hidden="true"
            />
          </button>
          
          {label && (
            <label
              id={`${inputId}-label`}
              htmlFor={inputId}
              className={cn(...labelClasses)}
            >
              {label}
            </label>
          )}
        </div>

        {/* Hidden native select for form integration */}
        <select
          ref={ref}
          className="sr-only"
          value={Array.isArray(currentValue) ? currentValue[0] || '' : currentValue}
          multiple={multiple}
          disabled={disabled}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <Menu
          open={open}
          onClose={() => setOpen(false)}
          anchorEl={triggerRef.current}
          placement={placement}
          maxHeight={maxHeight}
        >
          {options.map((option) => {
            const isSelected = multiple
              ? Array.isArray(currentValue) && currentValue.includes(option.value)
              : currentValue === option.value;

            return (
              <MenuItem
                key={option.value}
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                selected={isSelected}
                leadingIcon={option.icon}
                role={multiple ? 'menuitemcheckbox' : 'menuitem'}
              >
                {option.label}
              </MenuItem>
            );
          })}
        </Menu>
        
        {(helperText || errorMessage) && (
          <div 
            id={`${inputId}-helper`}
            className={cn(...supportingTextClasses)}
          >
            {error && errorMessage ? errorMessage : helperText}
          </div>
        )}
      </div>
    );
  }
));

Select.displayName = 'Select';

export { Select, MenuItem };