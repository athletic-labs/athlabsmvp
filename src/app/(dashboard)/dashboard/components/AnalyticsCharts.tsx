'use client';

import { memo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/lib/design-system/components';
import { motion } from 'framer-motion';
import { AnalyticsData } from '@/lib/hooks/useDashboardData';
import { usePerformanceMonitor } from '@/lib/design-system/performance/performance-utils';

interface AnalyticsChartsProps {
  data: AnalyticsData;
  loading: boolean;
}

const AnalyticsCharts = memo(function AnalyticsCharts({ data, loading }: AnalyticsChartsProps) {
  const { markStart, markEnd } = usePerformanceMonitor('AnalyticsCharts');
  
  markStart();

  if (loading) {
    markEnd();
    return (
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4" aria-hidden="true">
            <div className="h-6 bg-[var(--md-sys-color-surface-container)] rounded w-1/2"></div>
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-8 bg-[var(--md-sys-color-surface-container)] rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  markEnd();

  return (
    <Card variant="elevated">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="md3-title-large font-semibold text-[var(--md-sys-color-on-surface)]">
            Weekly Activity
          </h3>
          <div className="flex items-center gap-1 text-[var(--md-saas-color-success)]">
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
            <span className="md3-body-small font-medium">+{data.monthlyTrend}%</span>
          </div>
        </div>
        
        <div className="space-y-3" role="img" aria-labelledby="chart-description">
          <div id="chart-description" className="sr-only">
            Weekly order trends chart showing daily order counts from Monday to Sunday
          </div>
          {data.weeklyOrderTrends.map((day, index) => {
            const maxOrders = Math.max(...data.weeklyOrderTrends.map(d => d.orders));
            const percentage = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
            
            return (
              <div key={day.day} className="flex items-center justify-between">
                <span className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] w-8">
                  {day.day}
                </span>
                <div className="flex items-center gap-2 flex-1 mx-3">
                  <div 
                    className="flex-1 h-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden"
                    role="progressbar"
                    aria-label={`${day.day}: ${day.orders} orders`}
                    aria-valuenow={day.orders}
                    aria-valuemin={0}
                    aria-valuemax={maxOrders}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-[var(--md-sys-color-primary)]"
                    />
                  </div>
                  <span className="md3-body-small font-medium w-6 text-[var(--md-sys-color-on-surface)] text-right">
                    {day.orders}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Accessible data table for screen readers */}
        <table className="sr-only" aria-label="Weekly order data">
          <thead>
            <tr>
              <th>Day</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {data.weeklyOrderTrends.map(day => (
              <tr key={`table-${day.day}`}>
                <td>{day.day}</td>
                <td>{day.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
});

export default AnalyticsCharts;