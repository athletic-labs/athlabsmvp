import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  team_id?: string;
  properties: Record<string, any>;
  timestamp: string;
  session_id?: string;
}

export interface PageViewEvent {
  page_path: string;
  page_title: string;
  referrer?: string;
  user_agent: string;
  duration_ms?: number;
}

export interface UserActionEvent {
  action: string;
  target: string;
  value?: string | number;
  metadata?: Record<string, any>;
}

export interface OrderEvent {
  order_id: string;
  event_type: 'created' | 'updated' | 'cancelled' | 'completed';
  order_value?: number;
  items_count?: number;
  delivery_date?: string;
}

export interface PerformanceMetric {
  metric_name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export class AnalyticsService {
  private static supabase = createClientComponentClient();
  private static sessionId = this.generateSessionId();
  private static pageStartTime = Date.now();

  // Event tracking
  static async trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    context?: { userId?: string; teamId?: string }
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        event_name: eventName,
        user_id: context?.userId,
        team_id: context?.teamId,
        properties: {
          ...properties,
          user_agent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
      };

      // Log to local storage for offline resilience
      this.bufferEvent(event);

      // Send to analytics endpoint
      await this.sendEvent(event);

      // Track in database for internal analytics
      await this.logToDatabase(event);
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  // Page view tracking
  static async trackPageView(pageData: Partial<PageViewEvent>): Promise<void> {
    const pageView: PageViewEvent = {
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      duration_ms: Date.now() - this.pageStartTime,
      ...pageData,
    };

    await this.trackEvent('page_view', pageView);
    this.pageStartTime = Date.now(); // Reset for next page
  }

  // User action tracking
  static async trackUserAction(action: UserActionEvent, context?: { userId?: string; teamId?: string }): Promise<void> {
    await this.trackEvent('user_action', action, context);
  }

  // Order-specific tracking
  static async trackOrderEvent(orderEvent: OrderEvent, context?: { userId?: string; teamId?: string }): Promise<void> {
    await this.trackEvent('order_event', orderEvent, context);
  }

  // Performance monitoring
  static async trackPerformance(metric: PerformanceMetric): Promise<void> {
    await this.trackEvent('performance_metric', metric);
  }

  // Error tracking
  static async trackError(
    error: Error,
    context?: {
      userId?: string;
      teamId?: string;
      component?: string;
      action?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      component: context?.component,
      action: context?.action,
      metadata: context?.metadata,
    }, context);
  }

  // Conversion tracking
  static async trackConversion(
    event: string,
    value?: number,
    context?: { userId?: string; teamId?: string }
  ): Promise<void> {
    await this.trackEvent('conversion', {
      conversion_event: event,
      conversion_value: value,
    }, context);
  }

  // Feature usage tracking
  static async trackFeatureUsage(
    feature: string,
    action: string,
    context?: { userId?: string; teamId?: string }
  ): Promise<void> {
    await this.trackEvent('feature_usage', {
      feature_name: feature,
      feature_action: action,
    }, context);
  }

  // A/B testing support
  static async trackExperiment(
    experimentName: string,
    variant: string,
    context?: { userId?: string; teamId?: string }
  ): Promise<void> {
    await this.trackEvent('experiment_exposure', {
      experiment_name: experimentName,
      variant,
    }, context);
  }

  // Business metrics
  static async getOrderAnalytics(
    teamId: string,
    dateRange: { start: string; end: string }
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    popularItems: Array<{ name: string; count: number }>;
    ordersByStatus: Record<string, number>;
  }> {
    try {
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          order_items (
            menu_items (name),
            menu_templates (name)
          )
        `)
        .eq('team_id', teamId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      if (error) throw error;

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Count orders by status
      const ordersByStatus = orders.reduce((acc: Record<string, number>, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count popular items (simplified)
      const itemCounts: Record<string, number> = {};
      orders.forEach((order: any) => {
        order.order_items?.forEach((item: any) => {
          const itemName = item.menu_items?.name || item.menu_templates?.name;
          if (itemName) {
            itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
          }
        });
      });

      const popularItems = Object.entries(itemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        popularItems,
        ordersByStatus,
      };
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        popularItems: [],
        ordersByStatus: {},
      };
    }
  }

  // Real-time metrics
  static async getRealtimeMetrics(teamId?: string): Promise<{
    activeUsers: number;
    ordersToday: number;
    revenueToday: number;
    systemHealth: 'healthy' | 'warning' | 'error';
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's orders
      let ordersQuery = this.supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`);

      if (teamId) {
        ordersQuery = ordersQuery.eq('team_id', teamId);
      }

      const { data: todayOrders, error } = await ordersQuery;
      if (error) throw error;

      const ordersToday = todayOrders.length;
      const revenueToday = todayOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0);

      // Get active users (simplified - users with activity in last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: activeSessions } = await this.supabase
        .from('user_sessions')
        .select('user_id')
        .eq('status', 'active')
        .gte('last_activity', oneHourAgo);

      const activeUsers = activeSessions?.length || 0;

      // Simple system health check
      const systemHealth = this.assessSystemHealth(ordersToday, activeUsers);

      return {
        activeUsers,
        ordersToday,
        revenueToday,
        systemHealth,
      };
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);
      return {
        activeUsers: 0,
        ordersToday: 0,
        revenueToday: 0,
        systemHealth: 'error',
      };
    }
  }

  // Private utility methods
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static bufferEvent(event: AnalyticsEvent): void {
    try {
      const buffered = JSON.parse(localStorage.getItem('analytics_buffer') || '[]');
      buffered.push(event);
      
      // Keep only last 100 events
      if (buffered.length > 100) {
        buffered.splice(0, buffered.length - 100);
      }
      
      localStorage.setItem('analytics_buffer', JSON.stringify(buffered));
    } catch (error) {
      console.error('Error buffering analytics event:', error);
    }
  }

  private static async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }
  }

  private static async logToDatabase(event: AnalyticsEvent): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: event.user_id,
          team_id: event.team_id,
          action: 'analytics',
          resource_type: 'event',
          metadata: {
            event_name: event.event_name,
            properties: event.properties,
            session_id: event.session_id,
          },
        });
    } catch (error) {
      console.error('Error logging event to database:', error);
    }
  }

  private static assessSystemHealth(
    ordersToday: number, 
    activeUsers: number
  ): 'healthy' | 'warning' | 'error' {
    // Simple health assessment logic
    if (activeUsers === 0 && ordersToday === 0) {
      return 'warning';
    }
    
    return 'healthy';
  }
}