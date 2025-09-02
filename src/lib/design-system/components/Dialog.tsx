'use client';

import React, { forwardRef, ReactNode, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fullScreen?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const Dialog = memo(forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open,
      onClose,
      title,
      children,
      actions,
      maxWidth = 'sm',
      fullScreen = false,
      closeOnBackdrop = true,
      showCloseButton = true,
      className,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
      }
    }, [open]);

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && open) {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [open, onClose]);

    if (!open) return null;

    const maxWidthClasses = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full'
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnBackdrop) {
        onClose();
      }
    };

    const dialogContent = (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-[var(--md-sys-color-scrim)]/50 transition-opacity duration-300"
          aria-hidden="true"
        />
        
        {/* Dialog */}
        <div
          ref={ref}
          className={cn(
            'relative w-full bg-[var(--md-sys-color-surface-container-high)] rounded-[var(--md-sys-shape-corner-extra-large)] shadow-[var(--md-sys-elevation-level3)] transition-all duration-300',
            fullScreen ? 'h-full max-w-full' : maxWidthClasses[maxWidth],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy || (title ? 'dialog-title' : undefined)}
          aria-describedby={ariaDescribedBy}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-[var(--md-sys-color-outline-variant)]">
              {title && (
                <h2 
                  id="dialog-title"
                  className="md3-headline-small font-semibold text-[var(--md-sys-color-on-surface)]"
                >
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <IconButton
                  icon={<X className="w-5 h-5" />}
                  onClick={onClose}
                  variant="standard"
                  aria-label="Close dialog"
                  className="ml-auto"
                />
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 text-[var(--md-sys-color-on-surface)]">
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex justify-end gap-2 p-6 pt-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    );

    return typeof window !== 'undefined' 
      ? createPortal(dialogContent, document.body)
      : null;
  }
));

Dialog.displayName = 'Dialog';

export { Dialog };