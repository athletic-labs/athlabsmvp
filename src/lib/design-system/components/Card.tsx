'use client';

import React, { forwardRef, memo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined';
  interactive?: boolean;
  asChild?: boolean;
}

const Card = memo(forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'elevated',
      interactive = false,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';
    
    const baseClasses = [
      'rounded-xl overflow-hidden',
      'transition-all duration-300 ease-out'
    ];

    const variantClasses = {
      elevated: [
        'md3-card-elevated',
        'bg-[var(--md-sys-color-surface-container-low)]',
        'text-[var(--md-sys-color-on-surface)]',
        'md-elevation-1'
      ],
      filled: [
        'md3-card-filled',
        'bg-[var(--md-sys-color-surface-container-highest)]',
        'text-[var(--md-sys-color-on-surface)]'
      ],
      outlined: [
        'md3-card-outlined',
        'bg-[var(--md-sys-color-surface)]',
        'text-[var(--md-sys-color-on-surface)]',
        'border border-[var(--md-sys-color-outline-variant)]'
      ]
    };

    const interactiveClasses = interactive ? [
      'cursor-pointer',
      'hover:md-elevation-2',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-[var(--md-sys-color-primary)]',
      'focus-visible:ring-offset-2'
    ] : [];

    return (
      <Comp
        className={cn(
          ...baseClasses,
          ...variantClasses[variant],
          ...interactiveClasses,
          className
        )}
        ref={ref}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </Comp>
    );
  }
));

Card.displayName = 'Card';

// Card Sub-components
const CardHeader = memo(forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
)));
CardHeader.displayName = 'CardHeader';

const CardTitle = memo(forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('md3-title-large font-semibold leading-none tracking-tight', className)}
    {...props}
  />
)));
CardTitle.displayName = 'CardTitle';

const CardDescription = memo(forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('md3-body-medium text-[var(--md-sys-color-on-surface-variant)]', className)}
    {...props}
  />
)));
CardDescription.displayName = 'CardDescription';

const CardContent = memo(forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
)));
CardContent.displayName = 'CardContent';

const CardFooter = memo(forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
)));
CardFooter.displayName = 'CardFooter';

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
};