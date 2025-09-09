'use client';

import { memo, useEffect } from 'react';
import { AlertTriangle, Package, Clock, MapPin, Activity, Zap, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, Button } from '@/lib/design-system/components';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCriticalMetrics, useAnalyticsData, useUpcomingDeliveries, CriticalMetrics } from '@/lib/hooks/useDashboardData';
import { usePerformanceMonitor } from '@/lib/design-system/performance/performance-utils';
import { useResponsiveLayout } from '@/lib/hooks/useResponsiveLayout';
import { useKeyboardNavigation, useLiveRegion } from '@/lib/hooks/useAccessibility';

// MINIMALIST DASHBOARD: Only what drives ACTION

// Single hero metric - answers "Am I okay?" in 2 seconds
const StatusHero = memo(function StatusHero({ metrics }: { metrics: CriticalMetrics }) {
  const getStatusColor = (score: number) => {
    if (score >= 90) return 'var(--md-saas-color-success)';
    if (score >= 70) return 'var(--md-saas-color-warning)';
    return 'var(--md-sys-color-error)';
  };
  
  const getStatusMessage = (score: number, alerts: number) => {
    if (alerts > 0) return `${alerts} issues need attention`;
    if (score >= 90) return 'All systems optimal';
    if (score >= 70) return 'Minor adjustments needed';
    return 'Critical attention required';
  };

  const hasIssues = metrics.criticalAlerts.length > 0;

  return (
    <Card 
      variant="elevated" 
      className={`p-8 ${hasIssues ? 'border-l-4 border-[var(--md-sys-color-error)]' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getStatusColor(metrics.teamReadinessScore) }}
          >
            {hasIssues ? (
              <AlertTriangle className="w-10 h-10 text-white" />
            ) : (
              <Activity className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h1 className="md3-headline-large font-bold text-[var(--md-sys-color-on-surface)]">
              {getStatusMessage(metrics.teamReadinessScore, metrics.criticalAlerts.length)}
            </h1>
            <p className="md3-body-large text-[var(--md-sys-color-on-surface-variant)] mt-1">
              {metrics.activeOrdersCount} active orders • {metrics.todayDeliveries} deliveries today
              {metrics.nextGameHours && ` • Game in ${Math.round(metrics.nextGameHours/24)} days`}
            </p>
          </div>
        </div>
        
        {/* Single primary action */}
        <Button 
          variant="filled" 
          size="large"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          asChild
        >
          <Link href={hasIssues ? "/issues" : "/new-order"}>
            {hasIssues ? 'Resolve Issues' : 'Place Order'}
          </Link>
        </Button>
      </div>
    </Card>
  );
});

// Actionable alerts only - no "FYI" noise
const ActionableAlerts = memo(function ActionableAlerts({ alerts }: { alerts: any[] }) {
  const actionableAlerts = alerts.filter(alert => alert.actionRequired);
  
  if (actionableAlerts.length === 0) return null;

  return (
    <div className="space-y-3" role="region" aria-label="Action required">
      {actionableAlerts.map((alert) => (
        <Card key={alert.id} variant="outlined" className="p-4 border-[var(--md-sys-color-error)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--md-sys-color-error)]" />
              <span className="md3-body-medium font-medium">{alert.message}</span>
            </div>
            {alert.href && (
              <Button variant="text" size="small" asChild>
                <Link href={alert.href}>Fix Now</Link>
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
});

// Today's critical timeline - only what matters TODAY
const TodaysTimeline = memo(function TodaysTimeline({ deliveries }: { deliveries: any[] }) {
  const todaysDeliveries = deliveries.filter(d => 
    format(d.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  if (todaysDeliveries.length === 0) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="text-center">
          <Clock className="w-8 h-8 text-[var(--md-sys-color-on-surface-variant)] mx-auto mb-2" />
          <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
            No deliveries scheduled today
          </p>
          <Button variant="outlined" size="small" className="mt-3" asChild>
            <Link href="/new-order">Schedule Delivery</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardContent className="p-6">
        <h2 className="md3-title-medium font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">
          Today's Deliveries
        </h2>
        <div className="space-y-3">
          {todaysDeliveries.map((delivery) => (
            <div 
              key={delivery.id} 
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--md-sys-color-surface-container-highest)]"
            >
              <div className={`w-3 h-3 rounded-full ${
                delivery.status === 'confirmed' ? 'bg-[var(--md-saas-color-success)]' :
                delivery.status === 'preparing' ? 'bg-[var(--md-saas-color-warning)]' :
                'bg-[var(--md-sys-color-primary)]'
              }`} />
              <div className="flex-1">
                <p className="md3-body-medium font-medium">
                  {delivery.estimatedTime || format(delivery.date, 'h:mm a')} • {delivery.location}
                </p>
                <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                  {delivery.items.join(', ')}
                </p>
              </div>
              <span className={`px-2 py-1 rounded md3-label-small font-medium ${
                delivery.status === 'confirmed' 
                  ? 'bg-[var(--md-saas-color-success-container)] text-[var(--md-saas-color-on-success-container)]'
                  : 'bg-[var(--md-saas-color-warning-container)] text-[var(--md-saas-color-on-warning-container)]'
              }`}>
                {delivery.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Smart budget alert - only shows when action needed
const SmartBudgetAlert = memo(function SmartBudgetAlert({ budgetData }: { budgetData: any }) {
  const utilization = (budgetData.monthlySpend / budgetData.monthlySpendBudget) * 100;
  
  // Only show if approaching limits or trending dangerously
  if (utilization < 85) return null;

  return (
    <Card variant="outlined" className={`p-4 ${
      utilization > 95 ? 'border-[var(--md-sys-color-error)]' : 'border-[var(--md-saas-color-warning)]'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${
            utilization > 95 ? 'bg-[var(--md-sys-color-error)]' : 'bg-[var(--md-saas-color-warning)]'
          }`} />
          <span className="md3-body-medium font-medium">
            {utilization > 95 ? 'Budget exceeded' : 'Approaching budget limit'}: {utilization.toFixed(0)}%
          </span>
        </div>
        <Button variant="text" size="small" asChild>
          <Link href="/budget">Review Spending</Link>
        </Button>
      </div>
    </Card>
  );
});

// MINIMALIST DASHBOARD - Maximum signal, zero noise
export default function MinimalDashboardPage() {
  const { markStart, markEnd } = usePerformanceMonitor('MinimalDashboard');
  const layout = useResponsiveLayout();
  
  useKeyboardNavigation();
  const { announce, LiveRegion } = useLiveRegion();
  
  const { data: criticalMetrics, loading: criticalLoading, error: criticalError } = useCriticalMetrics();
  const { data: analytics } = useAnalyticsData();
  const { deliveries } = useUpcomingDeliveries();
  
  markStart();

  if (criticalLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-[var(--md-sys-color-surface-container)] rounded-xl animate-pulse" />
        <div className="h-20 bg-[var(--md-sys-color-surface-container)] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (criticalError) {
    return (
      <Card variant="elevated" className="p-8 border-l-4 border-[var(--md-sys-color-error)]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-[var(--md-sys-color-error)] mx-auto mb-4" />
          <h1 className="md3-headline-medium font-bold mb-2">Dashboard Unavailable</h1>
          <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mb-4">
            Critical systems offline. Contact support immediately.
          </p>
          <Button variant="filled" onClick={() => window.location.reload()}>
            Refresh Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  markEnd();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* CORE PRINCIPLE: Only show what requires IMMEDIATE action or decision */}
      
      {/* 1. CRITICAL STATUS - Answers "Am I okay?" */}
      <StatusHero metrics={criticalMetrics} />
      
      {/* 2. ACTIONABLE ALERTS - Only if user must act */}
      <ActionableAlerts alerts={criticalMetrics.criticalAlerts} />
      
      {/* 3. SMART BUDGET WARNING - Only if approaching limits */}
      <SmartBudgetAlert budgetData={analytics} />
      
      {/* 4. TODAY'S TIMELINE - Only today's actionable items */}
      <TodaysTimeline deliveries={deliveries} />
      
      {/* 5. EVERYTHING ELSE: Accessible but not visible */}
      <Card variant="outlined" className="p-6 bg-[var(--md-sys-color-surface-container-lowest)]">
        <div className="text-center">
          <h3 className="md3-title-medium font-medium mb-3">Need more details?</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outlined" size="small" asChild>
              <Link href="/analytics">📊 Full Analytics</Link>
            </Button>
            <Button variant="outlined" size="small" asChild>
              <Link href="/team/nutrition">🥗 Nutrition Goals</Link>
            </Button>
            <Button variant="outlined" size="small" asChild>
              <Link href="/team/achievements">🏆 Achievements</Link>
            </Button>
            <Button variant="outlined" size="small" asChild>
              <Link href="/reports/budget">💰 Budget Reports</Link>
            </Button>
          </div>
        </div>
      </Card>
      
      <LiveRegion />
    </div>
  );
}