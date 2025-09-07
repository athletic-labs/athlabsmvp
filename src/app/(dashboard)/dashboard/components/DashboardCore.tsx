'use client';

import { memo, useEffect } from 'react';
import { AlertTriangle, Package, Clock, MapPin, Activity, ArrowRight, Calendar, TrendingUp, DollarSign, Users, Utensils } from 'lucide-react';
import { Card, CardContent, Button } from '@/lib/design-system/components';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCriticalMetrics, useAnalyticsData, useUpcomingDeliveries, CriticalMetrics } from '@/lib/hooks/useDashboardData';
import { usePerformanceMonitor } from '@/lib/design-system/performance/performance-utils';
import { useResponsiveLayout } from '@/lib/hooks/useResponsiveLayout';
import { useKeyboardNavigation, useLiveRegion } from '@/lib/hooks/useAccessibility';

// RD-FOCUSED DASHBOARD: Professional nutrition management

// Top Metrics Row - Critical nutrition delivery metrics
const TopMetricsRow = memo(function TopMetricsRow({ metrics, analytics }: { metrics: CriticalMetrics; analytics: any }) {
  const budgetUtilization = (analytics.monthlySpend / analytics.monthlySpendBudget) * 100;
  const perAthleteCost = Math.round(analytics.monthlySpend / 28);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md component-spacing">
      {/* Active Nutrition Deliveries */}
      <Card variant="elevated" className="p-lg">
        <div className="flex items-center gap-md element-spacing">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary)] flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="md3-headline-small text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>
              {metrics.activeOrdersCount}
            </div>
            <div className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              Active Deliveries
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              Next: Today 4:30p
            </div>
          </div>
        </div>
      </Card>

      {/* Nutrition Coverage */}
      <Card variant="elevated" className="p-lg">
        <div className="flex items-center gap-md element-spacing">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary)] flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="md3-headline-small text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>
              95%
            </div>
            <div className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              Nutrition Coverage
            </div>
          </div>
          <div className="flex items-center gap-1">
            {95 >= 95 ? (
              <div className="w-2 h-2 bg-[var(--md-sys-color-tertiary)] rounded-full"></div>
            ) : (
              <AlertTriangle className="w-4 h-4 text-[var(--md-sys-color-error)]" />
            )}
          </div>
        </div>
      </Card>

      {/* Monthly Budget Utilization */}
      <Card variant="elevated" className="p-lg">
        <div className="flex items-center gap-md element-spacing">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-tertiary)] flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="md3-headline-small text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>
              {budgetUtilization.toFixed(0)}%
            </div>
            <div className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              Budget Utilization
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              ${perAthleteCost}/athlete
            </div>
          </div>
        </div>
      </Card>

      {/* Team Performance */}
      <Card variant="elevated" className="p-lg">
        <div className="flex items-center gap-md element-spacing">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-error)] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="md3-headline-small text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>
              {metrics.teamReadinessScore}%
            </div>
            <div className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              Performance Index
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-[var(--md-sys-color-tertiary)]" />
          </div>
        </div>
      </Card>
    </div>
  );
});

// Quick Actions Row - Most common tasks for RDs  
const QuickActionsRow = memo(function QuickActionsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md component-spacing">
      <Link href="/new-order">
        <Card variant="elevated" className="p-lg hover:bg-[var(--md-sys-color-surface-variant)] transition-colors cursor-pointer">
          <div className="flex items-center gap-md element-spacing">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary)] flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="md3-body-large font-medium text-[var(--md-sys-color-on-surface)]">
                New Order
              </div>
              <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                Create nutrition delivery
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] ml-auto" />
          </div>
        </Card>
      </Link>

      <Link href="/calendar">
        <Card variant="elevated" className="p-lg hover:bg-[var(--md-sys-color-surface-variant)] transition-colors cursor-pointer">
          <div className="flex items-center gap-md element-spacing">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="md3-body-large font-medium text-[var(--md-sys-color-on-surface)]">
                Team Calendar
              </div>
              <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                Schedule deliveries
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] ml-auto" />
          </div>
        </Card>
      </Link>

      <Link href="/saved-templates">
        <Card variant="elevated" className="p-lg hover:bg-[var(--md-sys-color-surface-variant)] transition-colors cursor-pointer">
          <div className="flex items-center gap-md element-spacing">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-tertiary)] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="md3-body-large font-medium text-[var(--md-sys-color-on-surface)]">
                Saved Templates
              </div>
              <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                Reuse configurations
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] ml-auto" />
          </div>
        </Card>
      </Link>

      <Link href="/order-history">
        <Card variant="elevated" className="p-lg hover:bg-[var(--md-sys-color-surface-variant)] transition-colors cursor-pointer">
          <div className="flex items-center gap-md element-spacing">
            <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-error)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="md3-body-large font-medium text-[var(--md-sys-color-on-surface)]">
                Order History
              </div>
              <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                View past orders
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] ml-auto" />
          </div>
        </Card>
      </Link>
    </div>
  );
});

// Upcoming Deliveries Panel  
const UpcomingDeliveriesPanel = memo(function UpcomingDeliveriesPanel({ deliveries }: { deliveries: any[] }) {
  const { isMobile } = useResponsiveLayout();
  
  return (
    <Card variant="elevated" className="component-spacing">
      <CardContent>
        <div className="flex items-center justify-between mb-lg element-spacing">
          <h2 className="md3-headline-small text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 600 }}>
            Upcoming Deliveries
          </h2>
          <Button variant="text" size="small">
            View All
          </Button>
        </div>

        <div className="space-y-md">
          {deliveries.slice(0, isMobile ? 3 : 5).map((delivery, index) => (
            <div key={index} className="flex items-center gap-md p-md rounded-lg border border-[var(--md-sys-color-outline-variant)]">
              <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                  {delivery.location}
                </div>
                <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                  {delivery.items.length} items • {delivery.recipients} athletes
                </div>
              </div>
              <div className="text-right">
                <div className="md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">
                  {format(new Date(delivery.scheduledTime), 'MMM d')}
                </div>
                <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                  {format(new Date(delivery.scheduledTime), 'h:mm a')}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                delivery.status === 'confirmed' ? 'bg-[var(--md-sys-color-tertiary)]' :
                delivery.status === 'pending' ? 'bg-[var(--md-sys-color-error)]' :
                'bg-[var(--md-sys-color-outline)]'
              }`} />
            </div>
          ))}
        </div>

        {deliveries.length === 0 && (
          <div className="text-center py-xl">
            <Package className="w-12 h-12 text-[var(--md-sys-color-outline)] mx-auto mb-md" />
            <div className="md3-body-large text-[var(--md-sys-color-on-surface-variant)]">
              No upcoming deliveries
            </div>
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mt-sm">
              Create your first nutrition delivery order
            </div>
            <Link href="/new-order">
              <Button variant="tonal" size="small" className="mt-md">
                Create Order
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Recent Activity Feed
const RecentActivityFeed = memo(function RecentActivityFeed({ analytics }: { analytics: any }) {
  const activities = [
    {
      id: 1,
      type: 'delivery_completed',
      message: 'Pre-game nutrition delivered to Field House',
      time: '2 hours ago',
      icon: Package,
      color: 'var(--md-sys-color-tertiary)'
    },
    {
      id: 2,
      type: 'order_created',
      message: 'New recovery meal order created',
      time: '4 hours ago', 
      icon: Clock,
      color: 'var(--md-sys-color-primary)'
    },
    {
      id: 3,
      type: 'template_used',
      message: 'High-protein template used for team dinner',
      time: '6 hours ago',
      icon: Users,
      color: 'var(--md-sys-color-secondary)'
    },
    {
      id: 4,
      type: 'budget_alert',
      message: 'Monthly budget 75% utilized',
      time: '1 day ago',
      icon: AlertTriangle,
      color: 'var(--md-sys-color-error)'
    }
  ];

  return (
    <Card variant="elevated" className="component-spacing">
      <CardContent>
        <div className="flex items-center justify-between mb-lg element-spacing">
          <h2 className="md3-headline-small text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 600 }}>
            Recent Activity
          </h2>
        </div>

        <div className="space-y-md">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-md">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: activity.color }}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="md3-body-medium text-[var(--md-sys-color-on-surface)]">
                    {activity.message}
                  </div>
                  <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mt-xs">
                    {activity.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

// Main Dashboard Component
export default function DashboardCore() {
  const { data: metrics, loading: metricsLoading, error: metricsError } = useCriticalMetrics();
  const { data: analytics, loading: analyticsLoading } = useAnalyticsData();
  const { deliveries, loading: deliveriesLoading } = useUpcomingDeliveries();
  const { isMobile, isTablet } = useResponsiveLayout();
  const performanceMonitor = usePerformanceMonitor('dashboard');
  const { announce, LiveRegion } = useLiveRegion();

  // Keyboard navigation setup
  useKeyboardNavigation();

  useEffect(() => {
    performanceMonitor.markStart();
    
    return () => {
      performanceMonitor.markEnd();
    };
  }, [performanceMonitor]);

  useEffect(() => {
    if (metrics && !metricsLoading) {
      announce(`Dashboard loaded. ${metrics.activeOrdersCount} active orders, ${metrics.teamReadinessScore}% team readiness.`);
    }
  }, [metrics, metricsLoading, announce]);

  if (metricsLoading || analyticsLoading || deliveriesLoading) {
    return (
      <div className="container mx-auto px-4 py-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--md-sys-color-surface-variant)] rounded mb-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--md-sys-color-surface-variant)] rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="h-80 bg-[var(--md-sys-color-surface-variant)] rounded-lg"></div>
            <div className="h-80 bg-[var(--md-sys-color-surface-variant)] rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="container mx-auto px-4 py-lg">
        <Card variant="elevated" className="p-lg text-center">
          <AlertTriangle className="w-12 h-12 text-[var(--md-sys-color-error)] mx-auto mb-md" />
          <h2 className="md3-headline-small text-[var(--md-sys-color-on-surface)] mb-sm">
            Unable to Load Dashboard
          </h2>
          <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mb-md">
            There was an error loading your dashboard data. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="mb-xl element-spacing">
        <h1 className="md3-display-small text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>
          Nutrition Dashboard
        </h1>
        <p className="md3-body-large text-[var(--md-sys-color-on-surface-variant)] mt-sm">
          Real-time insights for optimal athlete nutrition delivery
        </p>
      </div>

      {/* Critical Metrics */}
      <TopMetricsRow metrics={metrics} analytics={analytics} />

      {/* Quick Actions */}
      <QuickActionsRow />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg component-spacing">
        <UpcomingDeliveriesPanel deliveries={deliveries} />
        <RecentActivityFeed analytics={analytics} />
      </div>

      {/* Performance hint for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Dashboard performance: Optimal
      </div>
      
      <LiveRegion />
    </motion.div>
  );
}