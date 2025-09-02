'use client';

import React, { forwardRef, ReactNode, memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  title: string;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  arrow?: boolean;
  className?: string;
}

const Tooltip = memo(forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      title,
      children,
      placement = 'top',
      delay = 700,
      disabled = false,
      arrow = true,
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      if (open && triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top = 0;
        let left = 0;

        switch (placement) {
          case 'top':
            top = triggerRect.top + scrollY - tooltipRect.height - 8;
            left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case 'bottom':
            top = triggerRect.bottom + scrollY + 8;
            left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case 'left':
            top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
            left = triggerRect.left + scrollX - tooltipRect.width - 8;
            break;
          case 'right':
            top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
            left = triggerRect.right + scrollX + 8;
            break;
        }

        // Keep tooltip within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < 8) left = 8;
        if (left + tooltipRect.width > viewportWidth - 8) {
          left = viewportWidth - tooltipRect.width - 8;
        }
        if (top < 8) top = 8;
        if (top + tooltipRect.height > viewportHeight - 8) {
          top = viewportHeight - tooltipRect.height - 8;
        }

        setPosition({ top, left });
      }
    }, [open, placement]);

    const handleMouseEnter = () => {
      if (disabled) return;
      
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setOpen(true);
      }, delay);
    };

    const handleMouseLeave = () => {
      clearTimeout(timeoutRef.current);
      setOpen(false);
    };

    const handleFocus = () => {
      if (disabled) return;
      setOpen(true);
    };

    const handleBlur = () => {
      setOpen(false);
    };

    const clonedChild = React.cloneElement(children as React.ReactElement, {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      'aria-describedby': open ? 'tooltip' : undefined
    });

    const tooltipContent = open && !disabled && (
      <div
        ref={tooltipRef}
        className={cn(
          'absolute z-50 px-2 py-1 max-w-xs',
          'bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)]',
          'md3-body-small font-medium',
          'rounded-[var(--md-sys-shape-corner-extra-small)]',
          'shadow-[var(--md-sys-elevation-level2)]',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          'whitespace-nowrap',
          className
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
        role="tooltip"
        id="tooltip"
        {...props}
      >
        {title}
        
        {arrow && (
          <div
            className={cn(
              'absolute w-2 h-2 bg-[var(--md-sys-color-inverse-surface)] rotate-45',
              {
                'top-full left-1/2 -translate-x-1/2 -translate-y-1/2': placement === 'top',
                'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2': placement === 'bottom',
                'top-1/2 left-full -translate-y-1/2 -translate-x-1/2': placement === 'left',
                'top-1/2 right-full -translate-y-1/2 translate-x-1/2': placement === 'right'
              }
            )}
            aria-hidden="true"
          />
        )}
      </div>
    );

    return (
      <div ref={ref} className="inline-block">
        {clonedChild}
        {typeof window !== 'undefined' && tooltipContent && createPortal(tooltipContent, document.body)}
      </div>
    );
  }
));

Tooltip.displayName = 'Tooltip';

export { Tooltip };