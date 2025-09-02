'use client';

import React, { forwardRef, useState, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  size?: 'small' | 'medium' | 'large';
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeCommitted?: (value: number) => void;
  marks?: Array<{ value: number; label?: string }>;
  disabled?: boolean;
  color?: 'primary' | 'secondary';
  valueLabelDisplay?: 'auto' | 'on' | 'off';
  formatValue?: (value: number) => string;
}

const Slider = memo(forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      size = 'medium',
      label,
      min = 0,
      max = 100,
      step = 1,
      value: controlledValue,
      defaultValue = min,
      onChange,
      onChangeCommitted,
      marks = [],
      disabled = false,
      color = 'primary',
      valueLabelDisplay = 'auto',
      formatValue = (val) => val.toString(),
      id,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isDragging, setIsDragging] = useState(false);
    
    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const percentage = ((currentValue - min) / (max - min)) * 100;
    
    const inputId = id || `slider-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = useCallback((newValue: number) => {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      const steppedValue = Math.round(clampedValue / step) * step;
      
      if (controlledValue === undefined) {
        setInternalValue(steppedValue);
      }
      onChange?.(steppedValue);
    }, [min, max, step, controlledValue, onChange]);

    const handleCommit = useCallback(() => {
      setIsDragging(false);
      onChangeCommitted?.(currentValue);
    }, [currentValue, onChangeCommitted]);

    const sizeClasses = {
      small: {
        track: 'h-1',
        thumb: 'w-4 h-4',
        label: 'text-xs'
      },
      medium: {
        track: 'h-2',
        thumb: 'w-5 h-5',
        label: 'text-sm'
      },
      large: {
        track: 'h-3',
        thumb: 'w-6 h-6',
        label: 'text-base'
      }
    };

    const colorClasses = {
      primary: {
        track: 'bg-[var(--md-sys-color-primary)]',
        thumb: 'bg-[var(--md-sys-color-primary)]'
      },
      secondary: {
        track: 'bg-[var(--md-sys-color-secondary)]',
        thumb: 'bg-[var(--md-sys-color-secondary)]'
      }
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block mb-4 md3-body-medium font-medium',
              disabled 
                ? 'text-[var(--md-sys-color-on-surface)]/38' 
                : 'text-[var(--md-sys-color-on-surface)]'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative px-3 py-4">
          {/* Track */}
          <div
            className={cn(
              'relative w-full rounded-full',
              sizeClasses[size].track,
              'bg-[var(--md-sys-color-surface-container-highest)]'
            )}
          >
            {/* Active track */}
            <div
              className={cn(
                'absolute top-0 left-0 h-full rounded-full transition-all duration-200',
                colorClasses[color].track,
                disabled && 'opacity-38'
              )}
              style={{ width: `${percentage}%` }}
            />

            {/* Marks */}
            {marks.map((mark) => {
              const markPercentage = ((mark.value - min) / (max - min)) * 100;
              const isActive = mark.value <= currentValue;
              
              return (
                <div
                  key={mark.value}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${markPercentage}%` }}
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isActive
                        ? colorClasses[color].track
                        : 'bg-[var(--md-sys-color-on-surface-variant)]',
                      disabled && 'opacity-38'
                    )}
                  />
                  {mark.label && (
                    <span
                      className={cn(
                        'absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap',
                        sizeClasses[size].label,
                        'text-[var(--md-sys-color-on-surface-variant)]',
                        disabled && 'opacity-38'
                      )}
                    >
                      {mark.label}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Thumb */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${percentage}%` }}
            >
              <div
                className={cn(
                  'rounded-full border-2 border-white shadow-lg transition-all duration-200',
                  sizeClasses[size].thumb,
                  colorClasses[color].thumb,
                  disabled && 'opacity-38',
                  isDragging && 'scale-110'
                )}
              />
              
              {/* Value label */}
              {(valueLabelDisplay === 'on' || (valueLabelDisplay === 'auto' && isDragging)) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                  <div
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      'bg-[var(--md-sys-color-inverse-surface)]',
                      'text-[var(--md-sys-color-inverse-on-surface)]',
                      'shadow-lg'
                    )}
                  >
                    {formatValue(currentValue)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hidden input */}
          <input
            ref={ref}
            type="range"
            id={inputId}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            disabled={disabled}
            onChange={(e) => handleChange(Number(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={handleCommit}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={handleCommit}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue}
            aria-valuetext={formatValue(currentValue)}
            {...props}
          />
        </div>

        {/* Min/Max labels */}
        <div className="flex justify-between mt-2">
          <span
            className={cn(
              sizeClasses[size].label,
              'text-[var(--md-sys-color-on-surface-variant)]',
              disabled && 'opacity-38'
            )}
          >
            {formatValue(min)}
          </span>
          <span
            className={cn(
              sizeClasses[size].label,
              'text-[var(--md-sys-color-on-surface-variant)]',
              disabled && 'opacity-38'
            )}
          >
            {formatValue(max)}
          </span>
        </div>
      </div>
    );
  }
));

Slider.displayName = 'Slider';

export { Slider };