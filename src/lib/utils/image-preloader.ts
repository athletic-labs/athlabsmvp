/**
 * Image preloading utilities for performance optimization
 */

interface PreloadImageOptions {
  priority?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials';
  sizes?: string;
  media?: string;
}

/**
 * Preloads an image for faster loading
 */
export function preloadImage(src: string, options: PreloadImageOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }
    
    if (options.sizes) {
      link.setAttribute('imagesizes', options.sizes);
    }
    
    if (options.media) {
      link.media = options.media;
    }

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));

    document.head.appendChild(link);
  });
}

/**
 * Preloads multiple images in parallel
 */
export function preloadImages(sources: Array<{
  src: string;
  options?: PreloadImageOptions;
}>): Promise<void[]> {
  const promises = sources.map(({ src, options }) => 
    preloadImage(src, options).catch(console.warn)
  );
  
  return Promise.all(promises);
}

/**
 * Critical images that should be preloaded immediately
 */
export const CRITICAL_IMAGES = {
  logo: {
    light: '/athletic-labs-logo.png',
    dark: '/athletic-labs-logo-white.png',
  },
  placeholders: {
    avatar: '/images/avatar-placeholder.svg',
    product: '/images/product-placeholder.svg',
    hero: '/images/hero-placeholder.svg',
  },
} as const;

/**
 * Preloads critical images based on theme
 */
export function preloadCriticalImages(colorScheme: 'light' | 'dark' = 'light'): Promise<void[]> {
  const criticalSources = [
    { src: CRITICAL_IMAGES.logo[colorScheme], options: { priority: true } },
    { src: CRITICAL_IMAGES.placeholders.avatar },
    { src: CRITICAL_IMAGES.placeholders.product },
  ];

  return preloadImages(criticalSources);
}

/**
 * Lazy image loading utility with intersection observer
 */
export class LazyImageLoader {
  private static instance: LazyImageLoader;
  private observer: IntersectionObserver;
  private imageMap = new Map<Element, () => void>();

  private constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.imageMap.get(entry.target);
            if (callback) {
              callback();
              this.observer.unobserve(entry.target);
              this.imageMap.delete(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
  }

  static getInstance(): LazyImageLoader {
    if (!LazyImageLoader.instance) {
      LazyImageLoader.instance = new LazyImageLoader();
    }
    return LazyImageLoader.instance;
  }

  observe(element: Element, loadCallback: () => void): void {
    this.imageMap.set(element, loadCallback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    this.observer.unobserve(element);
    this.imageMap.delete(element);
  }

  disconnect(): void {
    this.observer.disconnect();
    this.imageMap.clear();
  }
}

/**
 * Hook for lazy loading images
 */
export function useLazyImage(src: string, options: PreloadImageOptions = {}) {
  const loader = LazyImageLoader.getInstance();
  
  return {
    observe: (element: Element) => {
      loader.observe(element, () => preloadImage(src, options));
    },
    unobserve: (element: Element) => {
      loader.unobserve(element);
    },
  };
}

/**
 * Image format detection and optimization
 */
export function getOptimalImageFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg';

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  // Check for AVIF support
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }

  // Check for WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }

  return 'jpeg';
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  baseSrc: string,
  sizes: number[] = [640, 828, 1200, 1920]
): string {
  return sizes
    .map((size) => `${baseSrc}?w=${size}&q=75 ${size}w`)
    .join(', ');
}

/**
 * Image performance metrics
 */
export class ImageMetrics {
  private static metrics = new Map<string, {
    loadTime: number;
    size: number;
    format: string;
  }>();

  static recordLoad(src: string, startTime: number, size?: number, format?: string): void {
    const loadTime = performance.now() - startTime;
    this.metrics.set(src, {
      loadTime,
      size: size || 0,
      format: format || 'unknown',
    });
  }

  static getMetrics(src?: string): Map<string, any> | any {
    if (src) {
      return this.metrics.get(src);
    }
    return this.metrics;
  }

  static getAverageLoadTime(): number {
    const times = Array.from(this.metrics.values()).map(m => m.loadTime);
    return times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }
}