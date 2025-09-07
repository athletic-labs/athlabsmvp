'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/hero-placeholder.svg',
  showSkeleton = true,
  skeletonClassName,
  containerClassName,
  className,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div className={cn('relative', containerClassName)}>
      {/* Loading skeleton */}
      {showSkeleton && isLoading && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-gray-200 rounded',
            'dark:bg-gray-700',
            skeletonClassName
          )}
        />
      )}

      {/* Optimized image */}
      <Image
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'filter grayscale',
          className
        )}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Error state indicator */}
      {hasError && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-red-500 rounded-full opacity-60" />
        </div>
      )}
    </div>
  );
}

// Specialized components for common use cases
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  size?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      fallbackSrc="/images/avatar-placeholder.svg"
      {...props}
    />
  );
}

export function LogoImage({
  variant = 'default',
  colorScheme = 'light',
  width = 150,
  height = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'src' | 'width' | 'height'> & {
  variant?: 'default' | 'large' | 'small';
  colorScheme?: 'light' | 'dark';
  width?: number;
  height?: number;
}) {
  const logoSrc = colorScheme === 'light' 
    ? "/athletic-labs-logo.png" 
    : "/athletic-labs-logo-white.png";

  const sizes = {
    small: { width: 100, height: 26 },
    default: { width: 150, height: 40 },
    large: { width: 200, height: 53 },
  };

  const { width: w, height: h } = sizes[variant];

  const { alt: _, ...restProps } = props;
  
  return (
    <OptimizedImage
      src={logoSrc}
      alt="Athletic Labs"
      width={width || w}
      height={height || h}
      className={cn('object-contain', className)}
      priority={true} // Logo is always above the fold
      {...restProps}
    />
  );
}

export function ProductImage({
  src,
  alt,
  width = 300,
  height = 200,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  width?: number;
  height?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-cover rounded-lg', className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      fallbackSrc="/images/product-placeholder.svg"
      {...props}
    />
  );
}