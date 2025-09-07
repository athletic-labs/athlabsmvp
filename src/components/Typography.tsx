'use client';

import React from 'react';
import { DesignSystem } from '@/styles/design-system';

/**
 * Typography Component - ENFORCES MATERIAL DESIGN 3 TYPE SCALE
 * 
 * This component ensures 100% consistency in typography across the application.
 * Use this instead of raw HTML tags or Tailwind typography classes.
 * 
 * Material Design 3 Type Scale:
 * - Display: 3 sizes for hero content
 * - Headline: 3 sizes for page/section titles  
 * - Title: 3 sizes for component titles
 * - Body: 3 sizes for content text
 * - Label: 3 sizes for labels and captions
 */

// Base typography props
interface BaseTypographyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  color?: 'primary' | 'secondary' | 'surface' | 'surface-variant' | 'error' | 'custom';
  customColor?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semi-bold';
}

// Typography variants
type TypographyVariant = 
  | 'display-large' | 'display-medium' | 'display-small'
  | 'headline-large' | 'headline-medium' | 'headline-small'
  | 'title-large' | 'title-medium' | 'title-small'
  | 'body-large' | 'body-medium' | 'body-small'
  | 'label-large' | 'label-medium' | 'label-small';

interface TypographyProps extends BaseTypographyProps {
  variant: TypographyVariant;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
}

// Color mapping to CSS variables
const getColorVariable = (color: string, customColor?: string): string => {
  if (color === 'custom' && customColor) {
    return customColor;
  }
  
  const colorMap = {
    'primary': 'var(--md-sys-color-on-surface)',
    'secondary': 'var(--md-sys-color-on-surface-variant)', 
    'surface': 'var(--md-sys-color-on-surface)',
    'surface-variant': 'var(--md-sys-color-on-surface-variant)',
    'error': 'var(--md-sys-color-error)'
  };
  
  return colorMap[color as keyof typeof colorMap] || 'var(--md-sys-color-on-surface)';
};

// Get appropriate HTML tag for each variant
const getSemanticTag = (variant: TypographyVariant): keyof JSX.IntrinsicElements => {
  if (variant.startsWith('display')) return 'h1';
  if (variant.startsWith('headline')) {
    if (variant === 'headline-large') return 'h1';
    if (variant === 'headline-medium') return 'h2';
    return 'h3';
  }
  if (variant.startsWith('title')) {
    if (variant === 'title-large') return 'h3';
    if (variant === 'title-medium') return 'h4';
    return 'h5';
  }
  if (variant.startsWith('body')) return 'p';
  if (variant.startsWith('label')) return 'span';
  return 'span';
};

/**
 * Main Typography Component
 */
export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className = '',
  style = {},
  color = 'primary',
  customColor,
  align = 'left',
  weight = 'normal',
  as
}) => {
  // Determine the HTML tag
  const Component = as || getSemanticTag(variant);
  
  // Get CSS class name
  const variantClass = `md3-${variant}`;
  
  // Build styles
  const combinedStyles: React.CSSProperties = {
    color: getColorVariable(color, customColor),
    textAlign: align,
    fontWeight: weight === 'normal' ? 'inherit' : 
                weight === 'medium' ? 500 : 
                weight === 'semi-bold' ? 600 : 'inherit',
    ...style
  };
  
  return (
    <Component 
      className={`${variantClass} ${className}`.trim()}
      style={combinedStyles}
    >
      {children}
    </Component>
  );
};

/**
 * Specialized Typography Components for Common Use Cases
 */

// Page Headings
export const PageHeading: React.FC<Omit<TypographyProps, 'variant'> & { level: 'large' | 'medium' | 'small' }> = ({ 
  level, 
  ...props 
}) => (
  <Typography variant={`headline-${level}` as TypographyVariant} {...props} />
);

// Section Headings  
export const SectionHeading: React.FC<Omit<TypographyProps, 'variant'> & { level: 'large' | 'medium' | 'small' }> = ({ 
  level, 
  ...props 
}) => (
  <Typography variant={`title-${level}` as TypographyVariant} {...props} />
);

// Body Text
export const BodyText: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'large' | 'medium' | 'small' }> = ({ 
  size = 'medium',
  ...props 
}) => (
  <Typography variant={`body-${size}` as TypographyVariant} {...props} />
);

// Label Text
export const LabelText: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'large' | 'medium' | 'small' }> = ({ 
  size = 'medium',
  ...props 
}) => (
  <Typography variant={`label-${size}` as TypographyVariant} {...props} />
);

// Display Text (Hero/Marketing content)
export const DisplayText: React.FC<Omit<TypographyProps, 'variant'> & { level: 'large' | 'medium' | 'small' }> = ({ 
  level, 
  ...props 
}) => (
  <Typography variant={`display-${level}` as TypographyVariant} {...props} />
);

/**
 * Typography Migration Helper
 * 
 * Use this to identify and replace non-standard typography usage
 */
export const validateTypography = () => {
  if (process.env.NODE_ENV === 'development') {
    // Check for problematic typography classes
    const problematicClasses = [
      'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
      'font-bold', 'font-semibold', 'font-medium'
    ];
    
    problematicClasses.forEach(className => {
      const elements = document.querySelectorAll(`.${className}`);
      if (elements.length > 0) {
        console.warn(`⚠️  Found ${elements.length} elements using non-standard class "${className}". Please migrate to Typography component.`);
      }
    });
    
    // Check for inline font styles
    const elementsWithInlineStyles = document.querySelectorAll('[style*="font-size"], [style*="font-weight"], [style*="line-height"]');
    if (elementsWithInlineStyles.length > 0) {
      console.warn(`⚠️  Found ${elementsWithInlineStyles.length} elements with inline font styles. Please use Typography component instead.`);
    }
  }
};

/**
 * Typography Usage Examples (for development reference)
 * 
 * // Page titles
 * <PageHeading level="large">Dashboard</PageHeading>
 * 
 * // Section titles
 * <SectionHeading level="medium">Recent Orders</SectionHeading>
 * 
 * // Body content
 * <BodyText>This is standard body text content.</BodyText>
 * 
 * // Labels and captions
 * <LabelText size="small">Form field label</LabelText>
 * 
 * // Custom usage
 * <Typography variant="title-large" color="primary" as="h2">
 *   Custom component title
 * </Typography>
 */

export default Typography;