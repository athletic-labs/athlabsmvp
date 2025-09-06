'use client';

import { memo, useEffect } from 'react';
import { AlertTriangle, Package, Clock, MapPin, Activity, ArrowRight, Calendar, TrendingUp, DollarSign, Users, Utensils, DeliveryDining, Payments, Groups } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Active Nutrition Deliveries */}
      <Card variant="elevated" className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary)] flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">
              {metrics.activeOrdersCount}
            </div>
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              Active Deliveries
            </div>
          </div>
        </div>
        <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
          3 Pre-Training, 2 Recovery, 2 Maintenance
        </div>
      </Card>

      {/* Monthly Spend */}
      <Card variant="elevated" className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[var(--md-saas-color-success)] flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">
              ${analytics.monthlySpend.toLocaleString()}
            </div>
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              / ${analytics.monthlySpendBudget.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
          ${perAthleteCost} per athlete • {Math.round(100 - budgetUtilization)}% under budget
        </div>
      </Card>

      {/* Team Macro Distribution */}
      <Card variant="elevated" className="p-5 md:col-span-2 lg:col-span-1 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/team/macros'}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary)] flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="md3-title-small font-semibold text-[var(--md-sys-color-on-surface)]">
              Team Macros
            </div>
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              Weekly avg per athlete
            </div>
          </div>
        </div>
        <div className="flex h-6 rounded-full overflow-hidden mb-2">
          <div className="flex items-center justify-center text-white text-xs font-medium" style={{ width: '35%', backgroundColor: '#E57373' }}>
            35%
          </div>
          <div className="flex items-center justify-center text-white text-xs font-medium" style={{ width: '45%', backgroundColor: '#FFB74D' }}>
            45%
          </div>
          <div className="flex items-center justify-center text-white text-xs font-medium" style={{ width: '20%', backgroundColor: '#81C784' }}>
            20%
          </div>
        </div>
        <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
          Protein • Starch • Veggie
        </div>
      </Card>

      {/* Athlete Roster Status */}
      <Card variant="elevated" className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-tertiary)] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">
              28
            </div>
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              Active Athletes
            </div>
          </div>
        </div>
        <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
          26 Training • 2 Modified Diet
        </div>
        {metrics.criticalAlerts.some(alert => alert.message.includes('diet')) && (
          <div className="mt-2 text-xs text-[var(--md-saas-color-warning)] font-medium">
            ⚠️ 2 athletes need diet adjustments
          </div>
        )}
      </Card>
    </div>
  );
});

// Dietary Compliance Tracker - High priority alerts
const DietaryComplianceTracker = memo(function DietaryComplianceTracker({ alerts }: { alerts: any[] }) {
  const dietaryAlerts = [
    {
      id: 'compliance_1',
      severity: 'high',
      message: 'Johnson - gluten-free option needed for tomorrow\'s delivery',
      action: 'Update order',
      href: '/order-history?update=johnson'
    },
    {
      id: 'compliance_2', 
      severity: 'high',
      message: 'Martinez - nut allergy, verify Thursday team dinner',
      action: 'Review menu',
      href: '/team-calendar?verify=martinez'
    },
    {
      id: 'compliance_3',
      severity: 'medium',
      message: 'Thompson - vegan protein target not met (25g below)',
      action: 'Adjust portions',
      href: '/athletes/thompson?adjust=protein'
    }
  ];

  const hasHighPriorityIssues = dietaryAlerts.some(alert => alert.severity === 'high');

  if (dietaryAlerts.length === 0) return null;

  return (
    <Card variant="outlined" className={`p-4 mb-6 ${
      hasHighPriorityIssues ? 'border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error-container)]' : 'border-[var(--md-saas-color-warning)]'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className={`w-6 h-6 ${
          hasHighPriorityIssues ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-saas-color-warning)]'
        }`} />
        <div>
          <h3 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">
            Dietary Compliance Status
          </h3>
          <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
            26/28 athletes - all dietary restrictions met
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        {dietaryAlerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between p-3 bg-[var(--md-sys-color-surface)] rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">{alert.severity === 'high' ? '⚠️' : '⚠️'}</span>
              <span className="md3-body-medium text-[var(--md-sys-color-on-surface)]">
                {alert.message}
              </span>
            </div>
            <Button variant="text" size="small" asChild>
              <Link href={alert.href}>{alert.action}</Link>
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
        <div className="text-center">
          <div className="md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">93%</div>
          <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Restrictions met</div>
        </div>
        <div className="text-center">
          <div className="md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">89%</div>
          <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Preferences met</div>
        </div>
        <div className="text-center">
          <div className="md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">5</div>
          <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Special diets</div>
        </div>
      </div>
    </Card>
  );
});

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

// Enhanced Deliveries with meal composition and macro data
const EnhancedDeliveries = memo(function EnhancedDeliveries({ deliveries }: { deliveries: any[] }) {
  const upcomingDeliveries = deliveries.slice(0, 5); // Show next 5 deliveries

  if (upcomingDeliveries.length === 0) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="text-center">
          <Clock className="w-8 h-8 text-[var(--md-sys-color-on-surface-variant)] mx-auto mb-2" />
          <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
            No upcoming deliveries scheduled
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">
            Upcoming Deliveries
          </h2>
          <Button variant="text" size="small" asChild>
            <Link href="/deliveries">View All</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {upcomingDeliveries.map((delivery) => (
            <Card key={delivery.id} variant="outlined" className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-4 h-4 rounded-full mt-2 ${
                  delivery.status === 'confirmed' ? 'bg-[var(--md-saas-color-success)]' :
                  delivery.status === 'preparing' ? 'bg-[var(--md-saas-color-warning)]' :
                  'bg-[var(--md-sys-color-primary)]'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="md3-body-large font-medium text-[var(--md-sys-color-on-surface)]">
                      {delivery.estimatedTime || format(delivery.date, 'MMM d, h:mm a')} • {delivery.location}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      delivery.status === 'confirmed' 
                        ? 'bg-[var(--md-saas-color-success-container)] text-[var(--md-saas-color-on-success-container)]'
                        : 'bg-[var(--md-saas-color-warning-container)] text-[var(--md-saas-color-on-warning-container)]'
                    }`}>
                      {delivery.status}
                    </span>
                  </div>
                  
                  <p className="md3-body-medium text-[var(--md-sys-color-on-surface)] mb-1">
                    {delivery.items.join(', ')}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg">
                    <div>
                      <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mb-1">28 athletes</p>
                      <p className="md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">
                        P: 35g | S: 45g | V: 20g avg
                      </p>
                    </div>
                    <div>
                      <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mb-1">Special notes</p>
                      <p className="md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">
                        2 GF, 1 Vegan, 1 Nut-free
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button variant="text" size="small" asChild>
                      <Link href={`/deliveries/${delivery.id}`}>View Details</Link>
                    </Button>
                    <Button variant="text" size="small" asChild>
                      <Link href={`/orders/${delivery.id}/modify`}>Modify Order</Link>
                    </Button>
                    <Button variant="text" size="small" asChild>
                      <Link href="/contact-kitchen">Contact Kitchen</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Top Performance Foods - transformed from popular items with nutrition focus
const TopPerformanceFoods = memo(function TopPerformanceFoods({ analytics }: { analytics: any }) {
  const performanceFoods = [
    {
      id: '1',
      name: 'Power Smoothie Bowl',
      orderCount: 24,
      adoptionRate: '+12%',
      macros: 'P: 28g | S: 45g | V: 15g',
      athleteFeedback: 4.8,
      consumptionRate: 96,
      category: 'Breakfast'
    },
    {
      id: '2',
      name: 'Protein Recovery Bars',
      orderCount: 18,
      adoptionRate: '+8%',
      macros: 'P: 25g | S: 30g | V: 8g',
      athleteFeedback: 4.6,
      consumptionRate: 89,
      category: 'Snacks'
    },
    {
      id: '3',
      name: 'Pre-Game Fuel Mix',
      orderCount: 15,
      adoptionRate: '+15%',
      macros: 'P: 20g | S: 65g | V: 12g',
      athleteFeedback: 4.9,
      consumptionRate: 94,
      category: 'Pre-Training'
    }
  ];

  return (
    <Card variant="elevated">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">
            Top Performance Foods
          </h2>
          <Button variant="text" size="small" asChild>
            <Link href="/analytics/foods">View All</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {performanceFoods.map((food) => (
            <Card key={food.id} variant="outlined" className="p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => window.location.href = `/foods/${food.id}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="md3-body-large font-medium text-[var(--md-sys-color-on-surface)]">
                    {food.name}
                  </h3>
                  <div className="text-right">
                    <p className="md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">
                      {food.orderCount} orders
                    </p>
                    <p className={`md3-body-small ${food.adoptionRate.startsWith('+') ? 'text-[var(--md-saas-color-success)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
                      {food.adoptionRate}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">Macros</p>
                    <p className="font-medium text-[var(--md-sys-color-on-surface)]">{food.macros}</p>
                  </div>
                  <div>
                    <p className="text-[var(--md-sys-color-on-surface-variant)]">Consumption</p>
                    <p className="font-medium text-[var(--md-sys-color-on-surface)]">{food.consumptionRate}%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                  <span className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                    {food.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">{food.athleteFeedback}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );\n});

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
export default function DashboardPage() {
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* TOP METRICS ROW - Critical RD metrics */}
      <TopMetricsRow metrics={criticalMetrics} analytics={analytics} />
      
      {/* DIETARY COMPLIANCE ALERTS - High priority dietary issues */}
      <DietaryComplianceTracker alerts={criticalMetrics.criticalAlerts} />
      
      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Enhanced Deliveries (2/3 width) */}
        <div className="lg:col-span-2">
          <EnhancedDeliveries deliveries={deliveries} />
        </div>
        
        {/* RIGHT COLUMN - Top Performance Foods (1/3 width) */}
        <div>
          <TopPerformanceFoods analytics={analytics} />
        </div>
      </div>
      
      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-wrap gap-3 pt-6">
        <Button variant="filled" size="large" leftIcon={<Package className="w-5 h-5" />} asChild>
          <Link href="/new-order">Place New Order</Link>
        </Button>
        <Button variant="tonal" leftIcon={<Utensils className="w-5 h-5" />} asChild>
          <Link href="/team/macros">Adjust Macro Targets</Link>
        </Button>
        <Button variant="outlined" leftIcon={<Users className="w-5 h-5" />} asChild>
          <Link href="/athletes">View Athlete Profiles</Link>
        </Button>
        <Button variant="outlined" leftIcon={<Calendar className="w-5 h-5" />} asChild>
          <Link href="/calendar">View Team Calendar</Link>
        </Button>
        <Button variant="text" asChild>
          <Link href="/order-history">Order History</Link>
        </Button>
      </div>
      
      <LiveRegion />
    </div>
  );
}