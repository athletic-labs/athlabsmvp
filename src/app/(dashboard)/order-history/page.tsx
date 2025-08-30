'use client';

import { useState } from 'react';
import { Search, Filter, Package } from 'lucide-react';

export default function OrderHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-white">Order History</h1>
        <p className="text-navy/60 dark:text-white/60 mt-1">
          View and track your past orders
        </p>
      </div>

      <div className="md-card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/50 dark:text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md-text-field pl-10"
            />
          </div>
          
          <button className="md-outlined-button flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-electric-blue" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
        <p className="text-navy/60 dark:text-white/60 mb-6">
          Your order history will appear here once you place your first order
        </p>
        <button className="md-filled-button">Place Your First Order</button>
      </div>
    </div>
  );
}