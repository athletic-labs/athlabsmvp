'use client';

import { memo, Suspense, lazy } from 'react';
import { TrendingUp, AlertTriangle, Package, DollarSign, Calendar, ChevronRight, Clock, MapPin, Users, Trophy, Target, AlertCircle, Star, Utensils, Activity, Zap } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/lib/design-system/components';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCriticalMetrics, useAnalyticsData, useStaticData, useUpcomingDeliveries, CriticalMetrics } from '@/lib/hooks/useDashboardData';
import { usePerformanceMonitor } from '@/lib/design-system/performance/performance-utils';
import { useResponsiveLayout } from '@/lib/hooks/useResponsiveLayout';
import { useKeyboardNavigation, useLiveRegion, useScreenReaderOptimization, useHighContrast } from '@/lib/hooks/useAccessibility';
import { useEffect } from 'react';

// Lazy load heavy components
const AnalyticsCharts = lazy(() => import('./components/AnalyticsCharts'));
const TeamNutritionPanel = lazy(() => import('./components/TeamNutritionPanel'));
const AchievementsSection = lazy(() => import('./components/AchievementsSection'));

// Memoized critical status component for <100ms rendering
const CriticalStatusHero = memo(function CriticalStatusHero({ metrics }: { metrics: CriticalMetrics }) {
  const { markStart, markEnd } = usePerformanceMonitor('CriticalStatusHero');
  
  markStart();
  
  const getReadinessColor = (score: number) => {
    if (score >= 90) return 'var(--md-saas-color-success)';
    if (score >= 70) return 'var(--md-saas-color-warning)';
    return 'var(--md-sys-color-error)';
  };
  
  const getReadinessLabel = (score: number) => {
    if (score >= 90) return 'Optimal';
    if (score >= 70) return 'Good';
    return 'Needs Attention';
  };

  markEnd();

  return (
    <Card 
      variant="elevated" 
      className="p-6 bg-gradient-to-r from-[var(--md-sys-color-primary-container)] to-[var(--md-sys-color-secondary-container)]"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Primary Status */}
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: getReadinessColor(metrics.teamReadinessScore) }}
            role="img"
            aria-label={`Team readiness score: ${metrics.teamReadinessScore} out of 100`}
          >
            <Activity className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="md3-headline-large font-bold text-[var(--md-sys-color-on-surface)]">
              {getReadinessLabel(metrics.teamReadinessScore)}
            </h2>
            <p className="md3-body-large text-[var(--md-sys-color-on-surface-variant)]">
              Team Readiness: {metrics.teamReadinessScore}% 
              {metrics.nextGameHours && `• Next game in ${Math.round(metrics.nextGameHours/24)} days`}
            </p>
          </div>
        </div>
        
        {/* Quick Metrics */}
        <div className="flex gap-6">
          <div className="text-center">
            <div className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">
              {metrics.activeOrdersCount}
            </div>
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              Active Orders
            </div>
          </div>
          <div className="text-center">
            <div className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">
              {metrics.todayDeliveries}
            </div>
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              Today's Deliveries
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

// Memoized quick actions for stable references with responsive design
const QuickActionsPanel = memo(function QuickActionsPanel({ layout }: { layout: any }) {
  const gridCols = layout.helpers.getGridColumns(2, 2, 4, 4);
  const spacing = layout.helpers.getCardSpacing();
  const minTouch = layout.helpers.getMinTouchTarget();
  
  return (
    <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
      <Button 
        variant="filled" 
        fullWidth 
        leftIcon={<Package className="w-5 h-5" />}
        className={`${minTouch} ${layout.isMobile ? 'md3-body-medium' : 'md3-body-large'}`}
        asChild
      >
        <Link href="/new-order">{layout.isMobile ? 'Order' : 'New Order'}</Link>
      </Button>
      <Button 
        variant="outlined" 
        fullWidth
        leftIcon={<Star className="w-5 h-5" />} 
        className={`${minTouch} ${layout.isMobile ? 'md3-body-medium' : 'md3-body-large'}`}
        asChild
      >
        <Link href="/saved-templates">{layout.isMobile ? 'Templates' : 'Templates'}</Link>
      </Button>
      {!layout.isMobile && (
        <>
          <Button 
            variant="outlined" 
            fullWidth
            leftIcon={<Calendar className="w-5 h-5" />}
            className={minTouch}
            asChild
          >
            <Link href="/calendar">Calendar</Link>
          </Button>
          <Button 
            variant="text" 
            fullWidth
            leftIcon={<Clock className="w-5 h-5" />}
            className={minTouch}
            asChild
          >
            <Link href="/order-history">History</Link>
          </Button>
        </>
      )}
      {layout.isMobile && (
        <Button 
          variant="text" 
          fullWidth
          leftIcon={<Clock className="w-5 h-5" />}
          className={`${minTouch} md3-body-medium col-span-2`}
          asChild
        >
          <Link href="/order-history">View Order History</Link>
        </Button>
      )}
    </div>
  );
});

// Main dashboard component with performance monitoring
export default function DashboardPage() {
  const { markStart, markEnd } = usePerformanceMonitor('DashboardPage');
  const layout = useResponsiveLayout();
  
  // Accessibility hooks
  useKeyboardNavigation();
  const { announce, LiveRegion } = useLiveRegion();
  const { announceDataUpdate } = useScreenReaderOptimization();
  const isHighContrast = useHighContrast();
  
  // Split data loading by criticality and update frequency
  const { data: criticalMetrics, loading: criticalLoading, error: criticalError } = useCriticalMetrics();
  const { data: analytics, loading: analyticsLoading, computed } = useAnalyticsData();
  const { data: staticData, loading: staticLoading } = useStaticData();
  const { deliveries, loading: deliveriesLoading } = useUpcomingDeliveries();
  
  // Announce critical updates to screen readers
  useEffect(() => {
    if (!criticalLoading && criticalMetrics.criticalAlerts.length > 0) {
      announce(`${criticalMetrics.criticalAlerts.length} critical alerts require attention`, 'assertive');
    }
  }, [criticalMetrics.criticalAlerts.length, criticalLoading, announce]);
  
  markStart();

  // Show critical data immediately, lazy load secondary content
  if (criticalLoading) {
    return (
      <div className="space-y-6" role="main" aria-label="Loading dashboard">
        <div className="animate-pulse space-y-6" aria-hidden="true">
          <div className="h-32 bg-[var(--md-sys-color-surface-container)] rounded-xl"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-[var(--md-sys-color-surface-container)] rounded-xl"></div>
            <div className="h-20 bg-[var(--md-sys-color-surface-container)] rounded-xl"></div>
          </div>
        </div>
        <div className="sr-only" aria-live="polite">Loading critical dashboard data...</div>
      </div>
    );
  }

  // Handle critical errors gracefully
  if (criticalError) {
    return (
      <div className="space-y-6" role="alert">
        <Card variant="elevated" className="p-6 border-l-4 border-[var(--md-sys-color-error)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-[var(--md-sys-color-error)] flex-shrink-0" aria-hidden="true" />
            <div>
              <h2 className="md3-title-large font-semibold text-[var(--md-sys-color-error)] mb-2">
                Dashboard Unavailable
              </h2>
              <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mb-4">
                Unable to load critical team data. Please refresh or contact support.
              </p>
              <Button variant="filled" onClick={() => window.location.reload()}>
                Refresh Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  markEnd();

  return (
    <div className={`space-y-6 ${layout.helpers.getContainerPadding()}`} role="main" aria-label="Team Dashboard">
      {/* Skip Links for Accessibility */}
      <div className="sr-only">
        <a href="#critical-status" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-2 focus:rounded focus:shadow-lg focus:z-50">Skip to critical status</a>
        <a href="#quick-actions" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-2 focus:rounded focus:shadow-lg focus:z-50">Skip to quick actions</a>
        <a href="#detailed-analytics" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-2 focus:rounded focus:shadow-lg focus:z-50">Skip to detailed analytics</a>
      </div>

      {/* Critical Alerts - Highest Priority */}
      {criticalMetrics.criticalAlerts.length > 0 && (
        <div className="space-y-3" role="region" aria-label="Critical alerts">
          {criticalMetrics.criticalAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl flex items-start gap-3 ${
                alert.type === 'critical'
                  ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)]'
                  : alert.type === 'warning'
                  ? 'bg-[var(--md-saas-color-warning-container)] text-[var(--md-saas-color-on-warning-container)]'
                  : 'bg-[var(--md-saas-color-info-container)] text-[var(--md-saas-color-on-info-container)]'
              }`}
              role="alert"
              aria-live={alert.type === 'critical' ? 'assertive' : 'polite'}
            >
              <AlertTriangle 
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  alert.type === 'critical' ? 'text-[var(--md-sys-color-error)]' : 
                  alert.type === 'warning' ? 'text-[var(--md-saas-color-warning)]' : 
                  'text-[var(--md-saas-color-info)]'
                }`} 
                aria-hidden="true" 
              />
              <div className="flex-1">
                <p className="md3-body-medium font-medium">
                  <span className="sr-only">
                    {alert.type === 'critical' ? 'Critical: ' : alert.type === 'warning' ? 'Warning: ' : 'Information: '}
                  </span>
                  {alert.message}
                </p>
                {alert.actionRequired && alert.href && (
                  <Button 
                    variant="text" 
                    size="small" 
                    className="mt-2 p-0 h-auto text-inherit hover:text-inherit"
                    asChild
                  >
                    <Link href={alert.href}>Take Action →</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hero Status - 3 Second Rule */}
      <section id="critical-status" aria-labelledby="status-heading">
        <h1 id="status-heading" className="sr-only">Critical Team Status</h1>
        <CriticalStatusHero metrics={criticalMetrics} />
      </section>

      {/* Quick Actions - Immediately Accessible */}
      <section id="quick-actions" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="sr-only">Quick Actions</h2>
        <QuickActionsPanel layout={layout} />
      </section>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`grid gap-4`} 
        style={{ 
          gridTemplateColumns: layout.isMobile ? 'repeat(2, 1fr)' : 
                              layout.isTablet ? 'repeat(3, 1fr)' : 
                              'repeat(4, 1fr)' 
        }}
      >
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-sys-color-primary-container)] rounded-lg">
              <Package className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            </div>
            <span className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">{criticalMetrics.activeOrdersCount}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Active Orders</h3>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-saas-color-success-container)] rounded-lg">
              <DollarSign className="w-5 h-5 text-[var(--md-saas-color-success)]" />
            </div>
            <span className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">${analytics.monthlySpend.toLocaleString()}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Monthly Spend</h3>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-[var(--md-saas-color-success)]" />
            <span className="md3-body-small text-[var(--md-saas-color-success)]">+{analytics.monthlyTrend}%</span>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-sys-color-secondary-container)] rounded-lg">
              <Users className="w-5 h-5 text-[var(--md-sys-color-secondary)]" />
            </div>
            <span className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">{staticData.totalTeamMembers}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Team Members</h3>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-saas-color-warning-container)] rounded-lg">
              <Target className="w-5 h-5 text-[var(--md-saas-color-warning)]" />
            </div>
            <span className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">${analytics.averageOrderValue}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Avg Order</h3>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-sys-color-tertiary-container)] rounded-lg">
              <Star className="w-5 h-5 text-[var(--md-sys-color-tertiary)]" />
            </div>
            <span className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">{analytics.customerSatisfaction}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Satisfaction</h3>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-sys-color-error-container)] rounded-lg">
              <Utensils className="w-5 h-5 text-[var(--md-sys-color-error)]" />
            </div>
            <span className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">{deliveries.length}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Recent Orders</h3>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="md3-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Weekly Order Trends</h3>
              <div className="space-y-3">
                {analytics.weeklyOrderTrends.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">{day.day}</span>
                    <div className="flex items-center gap-2 flex-1 mx-3">
                      <div 
                        className="flex-1 h-2 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden"
                        role="progressbar"
                        aria-label={`${day.day} orders`}
                        aria-valuenow={day.orders}
                        aria-valuemin={0}
                        aria-valuemax={7}
                      >
                        <div
                          className="h-full bg-[var(--md-sys-color-primary)] transition-all duration-500"
                          style={{ width: `${(day.orders / 7) * 100}%` }}
                        />
                      </div>
                      <span className="md3-body-small font-medium w-6 text-[var(--md-sys-color-on-surface)]">{day.orders}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Nutrition Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="md3-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Team Nutrition Profile</h3>
              <div className="space-y-4">
                {Object.entries(analytics.teamNutrition).map(([macro, value]) => (
                  <div key={macro}>
                    <div className="flex justify-between md3-body-small mb-2">
                      <span className="capitalize font-medium text-[var(--md-sys-color-on-surface)]">{macro}</span>
                      <span className="font-bold text-[var(--md-sys-color-on-surface)]">{value}%</span>
                    </div>
                    <div 
                      className="h-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label={`${macro} percentage`}
                      aria-valuenow={value}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ delay: 0.5 + Object.keys(analytics.teamNutrition).indexOf(macro) * 0.1, duration: 0.8 }}
                        className={`h-full transition-all ${
                          macro === 'protein' ? 'bg-[var(--md-sys-color-error)]' :
                          macro === 'carbs' ? 'bg-[var(--md-saas-color-success)]' : 'bg-[var(--md-saas-color-warning)]'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="md3-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Most Popular Items</h3>
              <div className="space-y-3">
                {staticData.popularItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg">
                    <div>
                      <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">{item.name}</p>
                      <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">{item.orders} orders</p>
                    </div>
                    <span className="md3-body-small font-medium text-[var(--md-saas-color-success)]">{item.trend}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="md3-title-large font-semibold text-[var(--md-sys-color-on-surface)]">Upcoming Deliveries</h3>
                <Button 
                  variant="text" 
                  size="small" 
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  asChild
                >
                  <Link href="/order-history">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {deliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-start gap-3 p-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg">
                    <div className="p-2 bg-[var(--md-sys-color-primary-container)] rounded-lg">
                      <Clock className="w-4 h-4 text-[var(--md-sys-color-primary)]" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">{format(delivery.date, 'MMM d, h:mm a')}</p>
                      <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mb-1">
                        {delivery.items.join(', ')}
                      </p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[var(--md-sys-color-on-surface-variant)]" aria-hidden="true" />
                        <span className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">{delivery.location}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full md3-label-small font-medium ${
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
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="md3-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Recent Achievements</h3>
              <div className="space-y-3">
                {staticData.achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[var(--md-sys-color-tertiary-container)] rounded-lg">
                      <div className="p-2 bg-[var(--md-saas-color-warning-container)] rounded-lg">
                        <Icon className="w-5 h-5 text-[var(--md-saas-color-warning)]" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="md3-body-medium font-semibold text-[var(--md-sys-color-on-surface)]">{achievement.name}</p>
                        <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Live Region for Screen Reader Announcements */}
      <LiveRegion />
      
      {/* Keyboard Shortcuts Help */}
      <div className="sr-only" aria-label="Keyboard shortcuts">
        <p>Press Alt+1 for Dashboard, Alt+2 for New Order, Alt+3 for Calendar, Alt+4 for History, Alt+C for Cart</p>
      </div>

    </div>
  );
}