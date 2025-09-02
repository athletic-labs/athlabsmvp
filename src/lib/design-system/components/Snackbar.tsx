'use client';

import React, { forwardRef, ReactNode, memo, useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  autoHideDuration?: number;
  onClose?: () => void;
  severity?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  closable?: boolean;
  position?: 'top' | 'bottom';
}

const Snackbar = memo(forwardRef<HTMLDivElement, SnackbarProps>(
  (
    {
      className,
      open,
      autoHideDuration = 6000,
      onClose,
      severity,
      message,
      action,
      closable = true,
      position = 'bottom',
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(open);

    useEffect(() => {
      setVisible(open);
    }, [open]);

    useEffect(() => {
      if (open && autoHideDuration > 0) {
        const timer = setTimeout(() => {
          onClose?.();
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    }, [open, autoHideDuration, onClose]);

    const handleClose = () => {
      setVisible(false);
      setTimeout(() => onClose?.(), 150); // Allow exit animation
    };

    const icons = {
      success: CheckCircle,
      error: XCircle,
      warning: AlertCircle,
      info: Info
    };

    const colorClasses = {
      success: {
        bg: 'bg-[var(--md-saas-color-success)]',
        text: 'text-[var(--md-saas-color-on-success)]',
        icon: 'text-[var(--md-saas-color-on-success)]'
      },
      error: {
        bg: 'bg-[var(--md-sys-color-error)]',
        text: 'text-[var(--md-sys-color-on-error)]',
        icon: 'text-[var(--md-sys-color-on-error)]'
      },
      warning: {
        bg: 'bg-[var(--md-saas-color-warning)]',
        text: 'text-[var(--md-saas-color-on-warning)]',
        icon: 'text-[var(--md-saas-color-on-warning)]'
      },
      info: {
        bg: 'bg-[var(--md-saas-color-info)]',
        text: 'text-[var(--md-saas-color-on-info)]',
        icon: 'text-[var(--md-saas-color-on-info)]'
      }
    };

    const defaultColors = {
      bg: 'bg-[var(--md-sys-color-inverse-surface)]',
      text: 'text-[var(--md-sys-color-inverse-on-surface)]',
      icon: 'text-[var(--md-sys-color-inverse-on-surface)]'
    };

    const colors = severity ? colorClasses[severity] : defaultColors;
    const IconComponent = severity ? icons[severity] : null;

    if (!visible && !open) return null;

    return (
      <div
        className={cn(
          'fixed left-1/2 transform -translate-x-1/2 z-50',
          'transition-all duration-300 ease-out',
          position === 'top' ? 'top-6' : 'bottom-6',
          visible ? 'translate-y-0 opacity-100' : 
            position === 'top' ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'
        )}
      >
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-3 px-4 py-3',
            'rounded-lg shadow-lg',
            'min-w-[320px] max-w-[560px]',
            colors.bg,
            colors.text,
            className
          )}
          role="alert"
          aria-live="polite"
          {...props}
        >
          {IconComponent && (
            <IconComponent className={cn('w-5 h-5 flex-shrink-0', colors.icon)} />
          )}
          
          <span className="md3-body-medium flex-1">
            {message}
          </span>
          
          {action && (
            <Button
              variant="text"
              size="small"
              onClick={action.onClick}
              className={cn(
                'text-current hover:bg-current/12',
                'ml-2'
              )}
            >
              {action.label}
            </Button>
          )}
          
          {closable && (
            <button
              onClick={handleClose}
              className={cn(
                'flex-shrink-0 p-1 rounded-full',
                'hover:bg-current/12 transition-colors',
                colors.icon
              )}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
));

Snackbar.displayName = 'Snackbar';

// Snackbar Hook for easier usage
export function useSnackbar() {
  const [snackbars, setSnackbars] = useState<Array<{
    id: string;
    message: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
    action?: { label: string; onClick: () => void };
    autoHideDuration?: number;
  }>>([]);

  const showSnackbar = (
    message: string,
    options?: {
      severity?: 'success' | 'error' | 'warning' | 'info';
      action?: { label: string; onClick: () => void };
      autoHideDuration?: number;
    }
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const snackbar = { id, message, ...options };
    
    setSnackbars(prev => [...prev, snackbar]);
    
    // Auto remove after duration
    setTimeout(() => {
      setSnackbars(prev => prev.filter(s => s.id !== id));
    }, options?.autoHideDuration || 6000);
    
    return id;
  };

  const hideSnackbar = (id: string) => {
    setSnackbars(prev => prev.filter(s => s.id !== id));
  };

  const SnackbarContainer = memo(() => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          message={snackbar.message}
          severity={snackbar.severity}
          action={snackbar.action}
          autoHideDuration={0} // Handle timing in hook
          onClose={() => hideSnackbar(snackbar.id)}
          style={{
            bottom: `${24 + (index * 72)}px`, // Stack multiple snackbars
            pointerEvents: 'auto'
          }}
        />
      ))}
    </div>
  ));

  return {
    showSnackbar,
    hideSnackbar,
    SnackbarContainer
  };
}

export { Snackbar };