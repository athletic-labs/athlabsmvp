'use client';

import { Suspense, lazy } from 'react';
import { Card } from '@/lib/design-system/components';

// Dynamically import the heavy dashboard components
const DashboardCore = lazy(() => import('./components/DashboardCore'));

// Dashboard Loading Component
function DashboardLoading() {
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

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardCore />
    </Suspense>
  );
}