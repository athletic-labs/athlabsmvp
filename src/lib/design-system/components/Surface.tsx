'use client';

/**
 * Surface Component - Material Design 3 Surface Tinting
 * 
 * Provides a simple way to apply MD3 surface tinting and elevation
 * to any component with proper semantic meaning and accessibility.
 */

import React, { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  getComponentElevation, 
  getComponentElevationClass, 
  COMPONENT_ELEVATIONS,
  SURFACE_TINT_LEVELS 
} from '../theme/surface-tinting';

export type SurfaceComponent = keyof typeof COMPONENT_ELEVATIONS;
export type SurfaceElevation = 0 | 1 | 2 | 3 | 4 | 5;

export interface SurfaceProps {
  /** Child elements */
  children: ReactNode;
  
  /** Surface component type (auto-applies appropriate elevation) */
  component?: SurfaceComponent;
  
  /** Manual elevation override (0-5) */
  elevation?: SurfaceElevation;
  
  /** Enable state layer for interactive surfaces */
  interactive?: boolean;
  
  /** State layer variant */
  stateLayer?: 'surface' | 'primary';
  
  /** Enable elevation transition on hover */
  elevationTransition?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Element type to render */
  as?: keyof JSX.IntrinsicElements;
  
  /** ARIA role for semantic meaning */
  role?: string;
  
  /** Additional props passed to the element */
  [key: string]: any;
}

/**
 * Surface component with Material Design 3 surface tinting
 */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(({
  children,
  component,
  elevation,
  interactive = false,
  stateLayer = 'surface',
  elevationTransition = false,
  className,
  as: Element = 'div',
  role,
  ...props
}, ref) => {
  // Determine elevation level
  const effectiveElevation = elevation !== undefined 
    ? elevation 
    : component 
    ? getComponentElevation(component) 
    : 0;
  
  // Build CSS classes
  const classes = cn(
    // Base elevation class
    `md-elevation-${effectiveElevation}`,
    
    // Component-specific class if specified
    component && getComponentElevationClass(component),
    
    // Interactive state layers
    interactive && 'md-state-layer',
    interactive && stateLayer === 'primary' && 'md-state-layer-primary',
    interactive && stateLayer === 'surface' && 'md-state-layer-surface',
    
    // Elevation transition
    elevationTransition && 'md-elevation-transition',
    
    // Focus ring for accessibility
    interactive && 'md-focus-ring',
    
    // Additional classes
    className
  );
  
  // Determine semantic role
  const effectiveRole = role || (interactive ? 'button' : undefined);
  
  // Add keyboard interaction for interactive surfaces
  const interactionProps = interactive ? {
    tabIndex: 0,
    role: effectiveRole,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        (e.target as HTMLElement).click();
      }
      props.onKeyDown?.(e);
    }
  } : {};
  
  return React.createElement(
    Element,
    {
      ref,
      className: classes,
      ...interactionProps,
      ...props
    },
    children
  );
});

Surface.displayName = 'Surface';

/**
 * Pre-configured surface components for common use cases
 */

export const Card = forwardRef<HTMLElement, Omit<SurfaceProps, 'component'>>(
  (props, ref) => (
    <Surface
      {...props}
      ref={ref}
      component="card"
      elevationTransition
    />
  )
);
Card.displayName = 'Card';

export const AppBar = forwardRef<HTMLElement, Omit<SurfaceProps, 'component'>>(
  (props, ref) => (
    <Surface
      {...props}
      ref={ref}
      component="appBar"
      role="banner"
    />
  )
);
AppBar.displayName = 'AppBar';

export const NavigationRail = forwardRef<HTMLElement, Omit<SurfaceProps, 'component'>>(
  (props, ref) => (
    <Surface
      {...props}
      ref={ref}
      component="navigationRail"
      as="nav"
      role="navigation"
    />
  )
);
NavigationRail.displayName = 'NavigationRail';

export const Dialog = forwardRef<HTMLElement, Omit<SurfaceProps, 'component'>>(
  (props, ref) => (
    <Surface
      {...props}
      ref={ref}
      component="dialog"
      role="dialog"
    />
  )
);
Dialog.displayName = 'Dialog';

export const BottomSheet = forwardRef<HTMLElement, Omit<SurfaceProps, 'component'>>(
  (props, ref) => (
    <Surface
      {...props}
      ref={ref}
      component="bottomSheet"
      role="dialog"
    />
  )
);
BottomSheet.displayName = 'BottomSheet';

/**
 * Utility hooks for surface tinting
 */

/**
 * Get surface tint information for a component
 */
export function useSurfaceTint(component?: SurfaceComponent, elevation?: SurfaceElevation) {
  const effectiveElevation = elevation !== undefined 
    ? elevation 
    : component 
    ? getComponentElevation(component) 
    : 0;
  
  const config = SURFACE_TINT_LEVELS[effectiveElevation];
  
  return {
    elevation: effectiveElevation,
    tintOpacity: config.tintOpacity,
    shadowOpacity: config.shadowOpacity,
    baseContainer: config.baseContainer,
    className: `md-elevation-${effectiveElevation}`,
    componentClassName: component ? getComponentElevationClass(component) : undefined
  };
}

/**
 * Get CSS custom property names for surface tinting
 */
export function getSurfaceTintTokens(elevation: SurfaceElevation) {
  return {
    surfaceColor: `var(--md-sys-color-surface-tint-${elevation})`,
    elevation: `var(--md-elevation-${elevation})`,
    hoverOpacity: `var(--md-sys-state-hover-state-layer-opacity)`,
    focusOpacity: `var(--md-sys-state-focus-state-layer-opacity)`,
    pressedOpacity: `var(--md-sys-state-pressed-state-layer-opacity)`,
  };
}