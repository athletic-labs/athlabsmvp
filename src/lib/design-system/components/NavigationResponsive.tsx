'use client';

/**
 * Material Design 3 Responsive Navigation System
 * Implements adaptive navigation patterns based on device width classes:
 * 
 * Width Classes:
 * - Compact (0-599dp): Bottom navigation, modal drawer
 * - Medium (600-839dp): Navigation rail, bottom navigation  
 * - Expanded (840dp+): Navigation rail, permanent drawer
 * 
 * Following Material Design 3 guidelines for responsive navigation
 */

import React, { ReactNode, memo, useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Menu, X } from 'lucide-react';
import { useResponsiveLayout } from '@/lib/hooks/useResponsiveLayout';

export interface NavigationItem {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: number | string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface NavigationConfig {
  items: NavigationItem[];
  activeKey?: string;
  header?: ReactNode;
  footer?: ReactNode;
  fabAction?: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
  };
  onItemClick?: (key: string) => void;
}

// MD3 Device Width Classes (in dp, 1dp ≈ 1px at 160dpi)
const MD3_BREAKPOINTS = {
  compact: 600,  // 0-599dp: Phone portrait, small tablets
  medium: 840,   // 600-839dp: Phone landscape, small tablets, foldables
  expanded: 1200 // 840dp+: Large tablets, desktop, foldables unfolded
};

/**
 * Compact Width Navigation (0-599dp)
 * Uses bottom navigation bar + modal navigation drawer
 */
const CompactNavigation = memo(function CompactNavigation({
  items,
  activeKey,
  header,
  footer,
  fabAction,
  onItemClick
}: NavigationConfig) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Show only top 4 items in bottom navigation, rest go to drawer
  const bottomNavItems = items.slice(0, 4);
  const drawerItems = items.slice(4);
  
  return (
    <>
      {/* Modal Navigation Drawer */}
      {drawerOpen && (
        <>
          {/* Scrim */}
          <div 
            className="fixed inset-0 bg-[var(--md-sys-color-scrim)]/50 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-[var(--md-sys-color-surface-container-low)] md-elevation-1">
            <div className="flex flex-col h-full">
              {/* Header */}
              {header && (
                <div className="p-6 border-b border-[var(--md-sys-color-outline-variant)]">
                  <div className="flex items-center justify-between">
                    {header}
                    <IconButton
                      icon={<X className="w-6 h-6" />}
                      onClick={() => setDrawerOpen(false)}
                      variant="standard"
                      size="small"
                      aria-label="Close navigation menu"
                    />
                  </div>
                </div>
              )}
              
              {/* All Navigation Items */}
              <div className="flex-1 py-4">
                <nav role="navigation" aria-label="Main navigation">
                  <div className="space-y-1 px-3">
                    {items.map((item) => (
                      <CompactDrawerItem
                        key={item.key}
                        item={item}
                        isActive={activeKey === item.key}
                        onItemClick={(key) => {
                          onItemClick?.(key);
                          setDrawerOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </nav>
              </div>
              
              {/* Footer */}
              {footer && (
                <div className="p-6 border-t border-[var(--md-sys-color-outline-variant)]">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)] md-elevation-2">
        <nav className="flex items-center justify-around px-2 py-2 max-w-screen-sm mx-auto">
          {bottomNavItems.map((item) => (
            <BottomNavItem
              key={item.key}
              item={item}
              isActive={activeKey === item.key}
              onItemClick={onItemClick}
            />
          ))}
          
          {/* More button if there are additional items */}
          {drawerItems.length > 0 && (
            <button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-h-[64px] min-w-[64px] px-3 py-2',
                'text-[var(--md-sys-color-on-surface-variant)]',
                'hover:bg-[var(--md-sys-color-on-surface)]/8',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]',
                'rounded-2xl transition-all duration-200'
              )}
              aria-label="More navigation options"
            >
              <Menu className="w-6 h-6" />
              <span className="md3-label-small mt-1">More</span>
            </button>
          )}
        </nav>
      </div>
    </>
  );
});

/**
 * Medium Width Navigation (600-839dp)
 * Uses navigation rail + bottom navigation for secondary actions
 */
const MediumNavigation = memo(function MediumNavigation({
  items,
  activeKey,
  header,
  footer,
  fabAction,
  onItemClick
}: NavigationConfig) {
  return (
    <nav 
      className="flex flex-col h-full bg-[var(--md-sys-color-surface)]"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      {header && (
        <div className="p-3 border-b border-[var(--md-sys-color-outline-variant)]">
          <div className="flex justify-center">
            {header}
          </div>
        </div>
      )}
      
      {/* FAB Action */}
      {fabAction && (
        <div className="p-3">
          <IconButton
            icon={fabAction.icon}
            onClick={fabAction.onClick}
            variant="filled"
            size="large"
            className="w-14 h-14 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] md-elevation-3"
            aria-label={fabAction.label}
          />
        </div>
      )}
      
      {/* Navigation Items */}
      <div className="flex-1 py-3">
        <div className="space-y-1">
          {items.map((item) => (
            <MediumNavItem
              key={item.key}
              item={item}
              isActive={activeKey === item.key}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="p-3 border-t border-[var(--md-sys-color-outline-variant)]">
          {footer}
        </div>
      )}
    </nav>
  );
});

/**
 * Expanded Width Navigation (840dp+)
 * Uses expanded navigation rail with labels
 */
const ExpandedNavigation = memo(function ExpandedNavigation({
  items,
  activeKey,
  header,
  footer,
  fabAction,
  onItemClick
}: NavigationConfig) {
  return (
    <nav 
      className="flex flex-col h-full bg-[var(--md-sys-color-surface-container)]"
      role="navigation"
      aria-label="Main navigation"
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
            className="w-full justify-start gap-3 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] md-elevation-3"
            leftIcon={fabAction.icon}
            onClick={fabAction.onClick}
          >
            {fabAction.label}
          </Button>
        </div>
      )}
      
      {/* Navigation Items */}
      <div className="flex-1 py-2">
        <div className="space-y-1">
          {items.map((item) => (
            <ExpandedNavItem
              key={item.key}
              item={item}
              isActive={activeKey === item.key}
              onItemClick={onItemClick}
            />
          ))}
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
});

// Navigation Item Components
const BottomNavItem = memo(function BottomNavItem({
  item,
  isActive,
  onItemClick
}: {
  item: NavigationItem;
  isActive: boolean;
  onItemClick?: (key: string) => void;
}) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      'min-h-[64px] min-w-[64px] px-3 py-2',
      'rounded-2xl transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]',
      item.disabled && 'opacity-50 pointer-events-none',
      isActive
        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8'
    )}>
      <div className="relative">
        {item.icon}
        {item.badge && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-xs font-medium rounded-full flex items-center justify-center">
            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>
      <span className="md3-label-small mt-1 text-center leading-tight">{item.label}</span>
    </div>
  );

  return item.href ? (
    <Link 
      href={item.href}
      onClick={() => onItemClick?.(item.key)}
      aria-label={item.label}
    >
      {content}
    </Link>
  ) : (
    <button 
      onClick={() => {
        item.onClick?.();
        onItemClick?.(item.key);
      }}
      aria-label={item.label}
    >
      {content}
    </button>
  );
});

const MediumNavItem = memo(function MediumNavItem({
  item,
  isActive,
  onItemClick
}: {
  item: NavigationItem;
  isActive: boolean;
  onItemClick?: (key: string) => void;
}) {
  const content = (
    <div className={cn(
      'relative flex flex-col items-center gap-1 p-3 mx-3',
      'rounded-2xl min-h-[56px] transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2',
      item.disabled && 'opacity-50 pointer-events-none',
      isActive
        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8'
    )}>
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--md-sys-color-primary)] rounded-r-full" />
      )}
      
      <div className="relative">
        {item.icon}
        {item.badge && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-xs font-medium rounded-full flex items-center justify-center">
            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>
      
      <span className="md3-label-small text-center leading-tight">{item.label}</span>
    </div>
  );

  return item.href ? (
    <Link 
      href={item.href}
      onClick={() => onItemClick?.(item.key)}
      aria-label={item.label}
    >
      {content}
    </Link>
  ) : (
    <button 
      onClick={() => {
        item.onClick?.();
        onItemClick?.(item.key);
      }}
      aria-label={item.label}
    >
      {content}
    </button>
  );
});

const ExpandedNavItem = memo(function ExpandedNavItem({
  item,
  isActive,
  onItemClick
}: {
  item: NavigationItem;
  isActive: boolean;
  onItemClick?: (key: string) => void;
}) {
  const content = (
    <div className={cn(
      'flex items-center gap-3 px-6 py-3 mx-3',
      'rounded-full transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2',
      item.disabled && 'opacity-50 pointer-events-none',
      isActive
        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8'
    )}>
      <div className="relative flex-shrink-0">
        {item.icon}
      </div>
      
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className="md3-label-large font-medium truncate">{item.label}</span>
        
        {item.badge && (
          <div className="ml-2 min-w-[20px] h-5 px-2 bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-xs font-medium rounded-full flex items-center justify-center">
            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>
    </div>
  );

  return item.href ? (
    <Link 
      href={item.href}
      onClick={() => onItemClick?.(item.key)}
      aria-label={item.label}
    >
      {content}
    </Link>
  ) : (
    <button 
      onClick={() => {
        item.onClick?.();
        onItemClick?.(item.key);
      }}
      aria-label={item.label}
      className="w-full text-left"
    >
      {content}
    </button>
  );
});

const CompactDrawerItem = memo(function CompactDrawerItem({
  item,
  isActive,
  onItemClick
}: {
  item: NavigationItem;
  isActive: boolean;
  onItemClick?: (key: string) => void;
}) {
  const content = (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3',
      'rounded-full transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] focus-visible:ring-offset-2',
      item.disabled && 'opacity-50 pointer-events-none',
      isActive
        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8'
    )}>
      <div className="relative flex-shrink-0">
        {item.icon}
      </div>
      
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className="md3-label-large font-medium truncate">{item.label}</span>
        
        {item.badge && (
          <div className="ml-2 min-w-[20px] h-5 px-2 bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-xs font-medium rounded-full flex items-center justify-center">
            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
          </div>
        )}
      </div>
    </div>
  );

  return item.href ? (
    <Link 
      href={item.href}
      onClick={() => onItemClick?.(item.key)}
      aria-label={item.label}
    >
      {content}
    </Link>
  ) : (
    <button 
      onClick={() => {
        item.onClick?.();
        onItemClick?.(item.key);
      }}
      aria-label={item.label}
      className="w-full text-left"
    >
      {content}
    </button>
  );
});

/**
 * Main Responsive Navigation Component
 * Automatically adapts based on Material Design 3 device width classes
 */
export const NavigationResponsive = memo(function NavigationResponsive(props: NavigationConfig) {
  const { width } = useResponsiveLayout();
  
  // Determine navigation pattern based on MD3 width classes
  if (width < MD3_BREAKPOINTS.compact) {
    return <CompactNavigation {...props} />;
  } else if (width < MD3_BREAKPOINTS.medium) {
    return <MediumNavigation {...props} />;
  } else {
    return <ExpandedNavigation {...props} />;
  }
});

export default NavigationResponsive;