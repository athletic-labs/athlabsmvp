import { AnalyticsService } from './analytics';

export interface PerformanceEntry {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  type: 'navigation' | 'resource' | 'measure' | 'paint';
}

export class PerformanceMonitor {
  private static observers: Map<string, PerformanceObserver> = new Map();
  private static measurements: Map<string, number> = new Map();

  // Initialize performance monitoring
  static initialize(): void {
    if (typeof window === 'undefined') return;

    // Monitor page load performance
    this.observeNavigation();
    
    // Monitor resource loading
    this.observeResources();
    
    // Monitor paint events
    this.observePaint();
    
    // Monitor long tasks
    this.observeLongTasks();

    // Report Web Vitals
    this.reportWebVitals();
  }

  // Manual performance measurement
  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }

  static endMeasurement(name: string): number | null {
    const startTime = this.measurements.get(name);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    this.measurements.delete(name);

    // Log performance metric
    AnalyticsService.trackEvent('performance_measure', {
      measurement_name: name,
      duration_ms: duration,
    });

    return duration;
  }

  // Measure async operations
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.startMeasurement(name);
    try {
      const result = await fn();
      this.endMeasurement(name);
      return result;
    } catch (error) {
      this.endMeasurement(name);
      throw error;
    }
  }

  // Monitor API call performance
  static async measureApiCall<T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      AnalyticsService.trackEvent('api_performance', {
        endpoint,
        duration_ms: duration,
        status: 'success',
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      AnalyticsService.trackEvent('api_performance', {
        endpoint,
        duration_ms: duration,
        status: 'error',
        error: (error as Error).message,
      });
      
      throw error;
    }
  }

  // Memory monitoring
  static getMemoryUsage(): Record<string, number> | null {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  static reportMemoryUsage(): void {
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage) {
      AnalyticsService.trackEvent('memory_usage', memoryUsage);
    }
  }

  // Connection monitoring
  static monitorConnection(): void {
    if (typeof window === 'undefined' || !(navigator as any).connection) return;

    const connection = (navigator as any).connection;
    
    AnalyticsService.trackEvent('connection_info', {
      effective_type: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      save_data: connection.saveData,
    });

    // Monitor connection changes
    connection.addEventListener('change', () => {
      AnalyticsService.trackEvent('connection_change', {
        effective_type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });
    });
  }

  // Private methods
  private static observeNavigation(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          AnalyticsService.trackEvent('navigation_performance', {
            dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp_connect: navEntry.connectEnd - navEntry.connectStart,
            request_response: navEntry.responseEnd - navEntry.requestStart,
            dom_interactive: navEntry.domInteractive - navEntry.fetchStart,
            dom_complete: navEntry.domComplete - navEntry.fetchStart,
            load_complete: navEntry.loadEventEnd - navEntry.fetchStart,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.set('navigation', observer);
  }

  private static observeResources(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { // Only report slow resources
          AnalyticsService.trackEvent('slow_resource', {
            name: entry.name,
            duration_ms: entry.duration,
            size: (entry as any).transferSize || 0,
            type: (entry as any).initiatorType,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  private static observePaint(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        AnalyticsService.trackEvent('paint_performance', {
          name: entry.name,
          start_time: entry.startTime,
        });
      });
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.set('paint', observer);
  }

  private static observeLongTasks(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          AnalyticsService.trackEvent('long_task', {
            duration_ms: entry.duration,
            start_time: entry.startTime,
            attribution: (entry as any).attribution,
          });
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    } catch (error) {
      // Long task API not supported
      console.warn('Long task monitoring not supported');
    }
  }

  private static reportWebVitals(): void {
    // Report Largest Contentful Paint (LCP)
    this.observeWebVital('largest-contentful-paint', 'lcp');
    
    // Report First Input Delay (FID) 
    this.observeWebVital('first-input', 'fid');
    
    // Report Cumulative Layout Shift (CLS)
    this.observeWebVital('layout-shift', 'cls');
  }

  private static observeWebVital(entryType: string, vitalName: string): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          AnalyticsService.trackEvent('web_vital', {
            name: vitalName,
            value: entry.startTime || (entry as any).value,
            rating: this.getVitalRating(vitalName, entry.startTime || (entry as any).value),
          });
        });
      });

      observer.observe({ entryTypes: [entryType] });
      this.observers.set(vitalName, observer);
    } catch (error) {
      console.warn(`${vitalName} monitoring not supported`);
    }
  }

  private static getVitalRating(vital: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
    };

    const threshold = thresholds[vital as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Cleanup
  static cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.measurements.clear();
  }
}