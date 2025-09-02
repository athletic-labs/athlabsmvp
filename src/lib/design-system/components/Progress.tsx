'use client';

import React, { forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0-100
  buffer?: number; // 0-100 for buffered progress
  indeterminate?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning';
  label?: string;
}

const LinearProgress = memo(forwardRef<HTMLDivElement, LinearProgressProps>(
  (
    {
      className,
      value = 0,
      buffer,
      indeterminate = false,
      size = 'medium',
      color = 'primary',
      label,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      small: 'h-1',
      medium: 'h-2',
      large: 'h-3'
    };

    const colorClasses = {
      primary: {
        track: 'bg-[var(--md-sys-color-primary-container)]',
        progress: 'bg-[var(--md-sys-color-primary)]',
        buffer: 'bg-[var(--md-sys-color-primary)]/40'
      },
      secondary: {
        track: 'bg-[var(--md-sys-color-secondary-container)]',
        progress: 'bg-[var(--md-sys-color-secondary)]',
        buffer: 'bg-[var(--md-sys-color-secondary)]/40'
      },
      error: {
        track: 'bg-[var(--md-sys-color-error-container)]',
        progress: 'bg-[var(--md-sys-color-error)]',
        buffer: 'bg-[var(--md-sys-color-error)]/40'
      },
      success: {
        track: 'bg-[var(--md-saas-color-success-container)]',
        progress: 'bg-[var(--md-saas-color-success)]',
        buffer: 'bg-[var(--md-saas-color-success)]/40'
      },
      warning: {
        track: 'bg-[var(--md-saas-color-warning-container)]',
        progress: 'bg-[var(--md-saas-color-warning)]',
        buffer: 'bg-[var(--md-saas-color-warning)]/40'
      }
    };

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <span className="md3-body-small text-[var(--md-sys-color-on-surface)]">
              {label}
            </span>
            {!indeterminate && (
              <span className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                {Math.round(value)}%
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(
            'relative w-full rounded-full overflow-hidden',
            sizeClasses[size],
            colorClasses[color].track,
            className
          )}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={indeterminate ? undefined : value}
          aria-label={label}
          {...props}
        >
          {/* Buffer progress */}
          {buffer !== undefined && !indeterminate && (
            <div
              className={cn(
                'absolute top-0 left-0 h-full transition-all duration-300 ease-out',
                colorClasses[color].buffer
              )}
              style={{ width: `${Math.min(100, Math.max(0, buffer))}%` }}
            />
          )}
          
          {/* Main progress */}
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              colorClasses[color].progress,
              indeterminate && 'animate-pulse'
            )}
            style={{
              width: indeterminate ? '100%' : `${Math.min(100, Math.max(0, value))}%`,
              ...(indeterminate && {
                animation: 'md-progress-indeterminate 2s infinite linear'
              })
            }}
          />
        </div>
      </div>
    );
  }
));

LinearProgress.displayName = 'LinearProgress';

// Circular Progress Component
export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0-100
  indeterminate?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning';
  thickness?: number;
  label?: string;
}

const CircularProgress = memo(forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      className,
      value = 0,
      indeterminate = false,
      size = 'medium',
      color = 'primary',
      thickness = 4,
      label,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      small: 'w-6 h-6',
      medium: 'w-8 h-8',
      large: 'w-12 h-12'
    };

    const colorClasses = {
      primary: 'stroke-[var(--md-sys-color-primary)]',
      secondary: 'stroke-[var(--md-sys-color-secondary)]',
      error: 'stroke-[var(--md-sys-color-error)]',
      success: 'stroke-[var(--md-saas-color-success)]',
      warning: 'stroke-[var(--md-saas-color-warning)]'
    };

    const circumference = 2 * Math.PI * 16; // r = 16
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="inline-flex flex-col items-center gap-2">
        <div
          ref={ref}
          className={cn(
            'relative',
            sizeClasses[size],
            className
          )}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={indeterminate ? undefined : value}
          aria-label={label}
          {...props}
        >
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 36 36"
          >
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth={thickness}
              className="text-[var(--md-sys-color-surface-container-highest)] opacity-20"
            />
            
            {/* Progress circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth={thickness}
              strokeLinecap="round"
              className={cn(
                'transition-all duration-300 ease-out',
                colorClasses[color],
                indeterminate && 'animate-spin'
              )}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: indeterminate ? circumference * 0.75 : offset
              }}
            />
          </svg>
          
          {/* Center text */}
          {!indeterminate && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[var(--md-sys-color-on-surface)]">
              {Math.round(value)}%
            </span>
          )}
        </div>
        
        {label && (
          <span className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
            {label}
          </span>
        )}
      </div>
    );
  }
));

CircularProgress.displayName = 'CircularProgress';

export { LinearProgress, CircularProgress };