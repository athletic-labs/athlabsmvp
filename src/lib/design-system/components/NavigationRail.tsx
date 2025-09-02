'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface NavigationItem {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: number | string;
  disabled?: boolean;
}

export interface NavigationRailProps {
  items: NavigationItem[];
  activeKey?: string;
  header?: ReactNode;
  footer?: ReactNode;
  fabAction?: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
  };
  width?: number;
  className?: string;
  onItemClick?: (key: string) => void;
}

export function NavigationRail({
  items,
  activeKey,
  header,
  footer,
  fabAction,
  width = 80,
  className,
  onItemClick
}: NavigationRailProps) {
  return (
    <nav
      className={cn(
        'flex flex-col',
        'bg-[var(--md-sys-color-surface)]',
        'border-r border-[var(--md-sys-color-outline-variant)]',
        'min-h-screen',
        className
      )}
      style={{ width }}
    >
      {/* Header */}
      {header && (
        <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)]">
          {header}
        </div>
      )}
      
      {/* FAB Action */}
      {fabAction && (
        <div className="p-4">
          <Button
            variant="filled"
            className={cn(
              'w-14 h-14 rounded-2xl',
              'bg-[var(--md-sys-color-primary-container)]',
              'text-[var(--md-sys-color-on-primary-container)]',
              'hover:bg-[var(--md-sys-color-primary-container)]',
              'md-elevation-3'
            )}
            onClick={fabAction.onClick}
            aria-label={fabAction.label}
          >
            {fabAction.icon}
          </Button>
        </div>
      )}
      
      {/* Navigation Items */}
      <div className="flex-1 py-4">
        <div className="space-y-2">
          {items.map((item) => {
            const isActive = activeKey === item.key;
            
            return (
              <div key={item.key} className="px-3">
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex flex-col items-center gap-1 p-3 rounded-2xl',
                    'min-h-[56px] w-14',
                    'transition-all duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2',
                    item.disabled && 'pointer-events-none opacity-50',
                    isActive 
                      ? [
                          'bg-[var(--md-sys-color-secondary-container)]',
                          'text-[var(--md-sys-color-on-secondary-container)]'
                        ]
                      : [
                          'text-[var(--md-sys-color-on-surface-variant)]',
                          'hover:bg-[var(--md-sys-color-on-surface)]/8',
                          'hover:text-[var(--md-sys-color-on-surface)]'
                        ]
                  )}
                  onClick={() => onItemClick?.(item.key)}
                  aria-label={item.label}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--md-sys-color-primary)] rounded-r-full" />
                  )}
                  
                  {/* Icon */}
                  <div className="relative flex items-center justify-center w-6 h-6">
                    {item.icon}
                    
                    {/* Badge */}
                    {item.badge && (
                      <div className={cn(
                        'absolute -top-1 -right-1',
                        'min-w-[16px] h-4 px-1',
                        'bg-[var(--md-saas-color-error)]',
                        'text-[var(--md-saas-color-on-error)]',
                        'text-xs font-medium',
                        'rounded-full',
                        'flex items-center justify-center'
                      )}>
                        {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className="md3-label-small text-center leading-tight max-w-full break-words">
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-[var(--md-sys-color-outline-variant)]">
          {footer}
        </div>
      )}
    </nav>
  );
}

// Wider Navigation Rail variant for more complex applications
export interface NavigationRailExpandedProps extends Omit<NavigationRailProps, 'width'> {
  width?: number;
  showLabels?: boolean;
}

export function NavigationRailExpanded({
  items,
  activeKey,
  header,
  footer,
  fabAction,
  width = 256,
  showLabels = true,
  className,
  onItemClick
}: NavigationRailExpandedProps) {
  return (
    <nav
      className={cn(
        'flex flex-col',
        'bg-[var(--md-sys-color-surface-container)]',
        'border-r border-[var(--md-sys-color-outline-variant)]',
        'min-h-screen',
        className
      )}
      style={{ width }}
    >
      {/* Header */}
      {header && (
        <div className="p-6 border-b border-[var(--md-sys-color-outline-variant)]">
          {header}
        </div>
      )}
      
      {/* FAB Action */}
      {fabAction && (
        <div className="p-6">
          <Button
            variant="filled"
            className={cn(
              showLabels ? 'w-full justify-start gap-3' : 'w-14 h-14 rounded-2xl',
              'bg-[var(--md-sys-color-primary)]',
              'text-[var(--md-sys-color-on-primary)]',
              'md-elevation-3'
            )}
            leftIcon={showLabels ? fabAction.icon : undefined}
            onClick={fabAction.onClick}
          >
            {showLabels ? fabAction.label : fabAction.icon}
          </Button>
        </div>
      )}
      
      {/* Navigation Items */}
      <div className="flex-1 py-2">
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = activeKey === item.key;
            
            return (
              <div key={item.key} className="px-3">
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-4 py-3 rounded-full',
                    'transition-all duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2',
                    item.disabled && 'pointer-events-none opacity-50',
                    isActive 
                      ? [
                          'bg-[var(--md-sys-color-secondary-container)]',
                          'text-[var(--md-sys-color-on-secondary-container)]'
                        ]
                      : [
                          'text-[var(--md-sys-color-on-surface-variant)]',
                          'hover:bg-[var(--md-sys-color-on-surface)]/8',
                          'hover:text-[var(--md-sys-color-on-surface)]'
                        ]
                  )}
                  onClick={() => onItemClick?.(item.key)}
                >
                  {/* Icon */}
                  <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
                    {item.icon}
                    
                    {/* Badge */}
                    {item.badge && !showLabels && (
                      <div className={cn(
                        'absolute -top-1 -right-1',
                        'min-w-[16px] h-4 px-1',
                        'bg-[var(--md-saas-color-error)]',
                        'text-[var(--md-saas-color-on-error)]',
                        'text-xs font-medium',
                        'rounded-full',
                        'flex items-center justify-center'
                      )}>
                        {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </div>
                  
                  {/* Label and Badge */}
                  {showLabels && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="md3-label-large font-medium truncate">
                        {item.label}
                      </span>
                      
                      {item.badge && (
                        <div className={cn(
                          'ml-2 min-w-[20px] h-5 px-2',
                          'bg-[var(--md-saas-color-error)]',
                          'text-[var(--md-saas-color-on-error)]',
                          'text-xs font-medium',
                          'rounded-full',
                          'flex items-center justify-center'
                        )}>
                          {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="p-6 border-t border-[var(--md-sys-color-outline-variant)]">
          {footer}
        </div>
      )}
    </nav>
  );
}