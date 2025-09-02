'use client';

import React, { forwardRef, ReactNode, memo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
  role?: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
}

const MenuItem = memo(forwardRef<HTMLDivElement, MenuItemProps>(
  (
    {
      children,
      onClick,
      disabled = false,
      selected = false,
      leadingIcon,
      trailingIcon,
      className,
      role = 'menuitem',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 px-3 py-2 min-h-[48px] cursor-pointer',
          'md3-body-large text-[var(--md-sys-color-on-surface)]',
          'hover:bg-[var(--md-sys-color-on-surface)]/8',
          'focus-visible:bg-[var(--md-sys-color-on-surface)]/12',
          'active:bg-[var(--md-sys-color-on-surface)]/16',
          'transition-colors duration-200',
          disabled && 'opacity-38 cursor-not-allowed pointer-events-none',
          selected && 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
          className
        )}
        role={role}
        aria-selected={role.includes('checkbox') || role.includes('radio') ? selected : undefined}
        aria-checked={role.includes('checkbox') || role.includes('radio') ? selected : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {leadingIcon && (
          <span className="shrink-0 text-[var(--md-sys-color-on-surface-variant)]" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        
        <span className="flex-1">{children}</span>
        
        {selected && role.includes('checkbox') && (
          <Check className="w-5 h-5 text-[var(--md-sys-color-primary)]" aria-hidden="true" />
        )}
        
        {trailingIcon && (
          <span className="shrink-0 text-[var(--md-sys-color-on-surface-variant)]" aria-hidden="true">
            {trailingIcon}
          </span>
        )}
      </div>
    );
  }
));

MenuItem.displayName = 'MenuItem';

export interface MenuProps {
  open: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  children: ReactNode;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
  maxHeight?: number;
}

const Menu = memo(forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      open,
      onClose,
      anchorEl,
      children,
      placement = 'bottom-start',
      className,
      maxHeight = 300,
      ...props
    },
    ref
  ) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (open && anchorEl) {
        const rect = anchorEl.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top = 0;
        let left = 0;

        switch (placement) {
          case 'bottom-start':
            top = rect.bottom + scrollY + 4;
            left = rect.left + scrollX;
            break;
          case 'bottom-end':
            top = rect.bottom + scrollY + 4;
            left = rect.right + scrollX;
            break;
          case 'top-start':
            top = rect.top + scrollY - 4;
            left = rect.left + scrollX;
            break;
          case 'top-end':
            top = rect.top + scrollY - 4;
            left = rect.right + scrollX;
            break;
        }

        setPosition({ top, left });
      }
    }, [open, anchorEl, placement]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node) &&
          anchorEl &&
          !anchorEl.contains(event.target as Node)
        ) {
          onClose();
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleEscape);
        };
      }
    }, [open, onClose, anchorEl]);

    if (!open) return null;

    const menuContent = (
      <div
        ref={menuRef}
        className={cn(
          'absolute z-50 min-w-[112px] max-w-[280px]',
          'bg-[var(--md-sys-color-surface-container)] rounded-[var(--md-sys-shape-corner-extra-small)]',
          'shadow-[var(--md-sys-elevation-level2)] border border-[var(--md-sys-color-outline-variant)]',
          'py-2 overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: maxHeight ? 'auto' : 'visible'
        }}
        role="menu"
        aria-orientation="vertical"
        {...props}
      >
        {children}
      </div>
    );

    return typeof window !== 'undefined' 
      ? createPortal(menuContent, document.body)
      : null;
  }
));

Menu.displayName = 'Menu';

export { Menu, MenuItem };