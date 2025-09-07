'use client';

import { Card } from '@/lib/design-system/components';

// Order History Loading Component
function OrderHistoryLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      <Card className="p-6">
        <p>Order history functionality with bundle optimization coming soon...</p>
      </Card>
    </div>
  );
}