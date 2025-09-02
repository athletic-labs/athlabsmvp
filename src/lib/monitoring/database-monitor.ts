import * as Sentry from '@sentry/nextjs';

interface QueryMetrics {
  query: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

interface ConnectionMetrics {
  activeConnections: number;
  totalConnections: number;
  maxConnections: number;
  timestamp: number;
}

export class DatabaseMonitor {
  private static queryMetrics: QueryMetrics[] = [];
  private static readonly MAX_METRICS = 1000;

  static async trackQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const timestamp = Date.now();

    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;

      // Record successful query
      this.recordQuery({
        query: queryName,
        duration,
        success: true,
        timestamp,
      });

      // Alert on slow queries (>1000ms)
      if (duration > 1000) {
        this.alertSlowQuery(queryName, duration);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Record failed query
      this.recordQuery({
        query: queryName,
        duration,
        success: false,
        error: errorMessage,
        timestamp,
      });

      // Alert on query failure
      this.alertQueryFailure(queryName, errorMessage);

      throw error;
    }
  }

  private static recordQuery(metrics: QueryMetrics): void {
    this.queryMetrics.push(metrics);

    // Keep only recent metrics
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
    }
  }

  private static alertSlowQuery(queryName: string, duration: number): void {
    console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
    
    // Send to monitoring service
    Sentry.addBreadcrumb({
      message: 'Slow database query',
      level: 'warning',
      data: {
        queryName,
        duration,
      },
    });
  }

  private static alertQueryFailure(queryName: string, error: string): void {
    console.error(`Query failed: ${queryName} - ${error}`);
    
    // Send to monitoring service
    Sentry.captureMessage(`Database query failed: ${queryName}`, {
      level: 'error',
      extra: { error },
    });
  }

  static getQueryMetrics(): QueryMetrics[] {
    return [...this.queryMetrics];
  }

  static getAverageQueryTime(queryName?: string): number {
    const metrics = queryName 
      ? this.queryMetrics.filter(m => m.query === queryName && m.success)
      : this.queryMetrics.filter(m => m.success);

    if (metrics.length === 0) return 0;

    const totalTime = metrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / metrics.length;
  }

  static getFailureRate(queryName?: string): number {
    const metrics = queryName 
      ? this.queryMetrics.filter(m => m.query === queryName)
      : this.queryMetrics;

    if (metrics.length === 0) return 0;

    const failures = metrics.filter(m => !m.success).length;
    return failures / metrics.length;
  }

  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      averageQueryTime: number;
      failureRate: number;
      activeQueries: number;
    };
  }> {
    const avgQueryTime = this.getAverageQueryTime();
    const failureRate = this.getFailureRate();
    const recentMetrics = this.queryMetrics.filter(
      m => Date.now() - m.timestamp < 60000 // Last minute
    );

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (failureRate > 0.1 || avgQueryTime > 2000) {
      status = 'unhealthy';
    } else if (failureRate > 0.05 || avgQueryTime > 1000) {
      status = 'degraded';
    }

    return {
      status,
      metrics: {
        averageQueryTime: avgQueryTime,
        failureRate: failureRate,
        activeQueries: recentMetrics.length,
      },
    };
  }
}