'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * PageTemplate Component - STANDARDIZES ALL PAGE LAYOUTS
 * 
 * This component enforces 100% consistency across every page in the application.
 * ALL pages must use this template - no exceptions.
 * 
 * Features:
 * - Consistent heading hierarchy and typography
 * - Standardized spacing using 4dp grid system
 * - Uniform breadcrumb implementation
 * - Responsive layout across all breakpoints
 * - Material Design 3 compliance
 */

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface PageTemplateProps {
  /** Main page title (always h1, md3-headline-large) */
  title: string;
  
  /** Optional subtitle (md3-body-large) */
  subtitle?: string;
  
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  
  /** Action buttons/components in the header (right-aligned) */
  actions?: React.ReactNode;
  
  /** Page content */
  children: React.ReactNode;
  
  /** Whether to use full width or contained layout */
  fullWidth?: boolean;
  
  /** Custom class name for additional styling */
  className?: string;
  
  /** Whether to show the back button */
  showBackButton?: boolean;
  
  /** Custom back button href */
  backHref?: string;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({ 
  title, 
  subtitle, 
  breadcrumbs, 
  actions, 
  children,
  fullWidth = false,
  className = '',
  showBackButton = false,
  backHref
}) => {
  return (
    <div className={`page-container ${className}`}>
      {/* Breadcrumbs - Always in same position when present */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumbs component-spacing" role="navigation" aria-label="Breadcrumb">
          <ol className="flex items-center gap-sm md3-label-medium" style={{ 
            color: 'var(--md-sys-color-on-surface-variant)',
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight 
                    className="mx-xs" 
                    size={16} 
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  />
                )}
                {index === breadcrumbs.length - 1 ? (
                  // Current page - not a link
                  <span style={{ color: 'var(--md-sys-color-on-surface)' }}>
                    {crumb.label}
                  </span>
                ) : (
                  // Link to parent pages
                  <Link 
                    href={crumb.href}
                    className="transition-standard hover:underline"
                    style={{ color: 'var(--md-sys-color-primary)' }}
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      {/* Page Header - Consistent across ALL pages */}
      <header className="page-header">
        <div className="flex items-start justify-between">
          <div className="header-content">
            {/* Back Button - When present, always in same position */}
            {showBackButton && (
              <div className="element-spacing">
                <Link 
                  href={backHref || '/dashboard'}
                  className="inline-flex items-center gap-sm md3-label-large transition-standard"
                  style={{ 
                    color: 'var(--md-sys-color-primary)',
                    textDecoration: 'none'
                  }}
                >
                  <ChevronRight size={20} className="rotate-180" />
                  Back
                </Link>
              </div>
            )}
            
            {/* Main Title - Always h1, always md3-headline-large */}
            <h1 
              className="md3-headline-large"
              style={{
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: subtitle ? 'var(--spacing-sm)' : '0'
              }}
            >
              {title}
            </h1>
            
            {/* Subtitle - When present, always md3-body-large */}
            {subtitle && (
              <p 
                className="md3-body-large"
                style={{
                  color: 'var(--md-sys-color-on-surface-variant)',
                  margin: 0
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Header Actions - Always right-aligned when present */}
          {actions && (
            <div className="header-actions flex items-center gap-md">
              {actions}
            </div>
          )}
        </div>
      </header>
      
      {/* Page Content - Consistent spacing */}
      <main className={`page-content ${fullWidth ? 'full-width' : 'contained'}`}>
        {children}
      </main>
    </div>
  );
};

/**
 * PageSection Component - For consistent section spacing within pages
 */
interface PageSectionProps {
  /** Section content */
  children: React.ReactNode;
  
  /** Optional section title */
  title?: string;
  
  /** Optional section description */
  description?: string;
  
  /** Custom class name */
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  title,
  description,
  className = ''
}) => {
  return (
    <section className={`section-spacing ${className}`}>
      {/* Section Header */}
      {(title || description) && (
        <div className="component-spacing">
          {title && (
            <h2 
              className="md3-title-large"
              style={{ 
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: description ? 'var(--spacing-sm)' : '0'
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p 
              className="md3-body-medium"
              style={{ 
                color: 'var(--md-sys-color-on-surface-variant)',
                margin: 0 
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Section Content */}
      <div>
        {children}
      </div>
    </section>
  );
};

/**
 * ComponentGrid - Standard grid layout for components
 */
interface ComponentGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ComponentGrid: React.FC<ComponentGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}) => {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `var(--spacing-${gap})`,
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr'
    },
    '@media (min-width: 600px) and (max-width: 839px)': {
      gridTemplateColumns: columns > 2 ? 'repeat(2, 1fr)' : `repeat(${columns}, 1fr)`
    }
  };

  return (
    <div 
      className={`component-grid ${className}`}
      style={gridStyles}
    >
      {children}
    </div>
  );
};

export default PageTemplate;